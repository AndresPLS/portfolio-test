import "server-only";

import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import sharp from "sharp";
import { z } from "zod";

import type { ImageSize } from "@/components/project/image-sizes";

/**
 * Capa de contenido. El frontmatter guarda METADATOS y, opcionalmente, el `layout`
 * (orden + talla de cada foto del detalle). Las imágenes viven en
 * `public/projects/<slug>/` y de cada una leemos sus dimensiones reales con sharp.
 *
 * - Si hay `layout`: define la secuencia del detalle (con tallas y parejas).
 * - Si no: se auto-descubren todas (portada + resto, alfabético) a talla "md".
 * La PORTADA de la home siempre es el archivo `cover*` (o el primero).
 */

const CONTENT_DIR = path.join(process.cwd(), "content/projects");
const PUBLIC_PROJECTS = path.join(process.cwd(), "public/projects");
const IMAGE_RE = /\.(jpe?g|png|webp|avif)$/i;

/** Alto de portada en la home: variado pero determinista por slug (45–70vh). */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
function deterministicCoverVh(slug: string): number {
  // 45, 45.5, … 70 (51 valores), siempre el mismo para cada slug.
  return 45 + (hashString(slug) % 51) * 0.5;
}

const imageSizeSchema = z.enum(["sm", "md", "lg", "full"]);

// Cada entrada de `layout`: una imagen (con talla) o una pareja en fila.
const layoutItemSchema = z.union([
  z.object({
    row: z.array(z.string()).min(2),
    size: imageSizeSchema.default("md"),
  }),
  z.object({
    src: z.string(),
    size: imageSizeSchema.default("md"),
  }),
]);

const projectFrontmatterSchema = z.object({
  title: z.string(),
  year: z.number().int().optional(),
  subtitleText: z.string().optional(),
  summary: z.string().optional(),
  credit: z.string().optional(),
  featured: z.boolean().default(false),
  /** Alto manual de la portada en la home (en vh). Si se omite, se calcula de
   *  forma determinista entre 70 y 75vh a partir del slug. */
  homeCoverHeight: z.number().optional(),
  layout: z.array(layoutItemSchema).optional(),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
});

export type ProjectImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

/** Un "bloque" del detalle: una imagen o una pareja, con su talla. */
export type Block =
  | { kind: "single"; image: ProjectImage; size: ImageSize }
  | { kind: "row"; images: ProjectImage[]; size: ImageSize };

export type Project = z.infer<typeof projectFrontmatterSchema> & {
  slug: string;
  body: string;
  cover: ProjectImage; // para la home
  coverHeightVh: number; // alto de la portada en la home (vh)
  blocks: Block[]; // secuencia del detalle (con tallas)
};

async function readImage(
  slug: string,
  file: string,
  alt: string,
): Promise<ProjectImage> {
  const meta = await sharp(path.join(PUBLIC_PROJECTS, slug, file)).metadata();
  return {
    src: `/projects/${slug}/${file}`,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    alt,
  };
}

async function loadProject(fileName: string): Promise<Project> {
  const slug = fileName.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(CONTENT_DIR, fileName), "utf8");
  const { data, content } = matter(raw);

  const parsed = projectFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map(
        (issue) => `  · ${issue.path.join(".") || "(raíz)"}: ${issue.message}`,
      )
      .join("\n");
    throw new Error(
      `Frontmatter inválido en content/projects/${fileName}:\n${detail}`,
    );
  }
  const fm = parsed.data;
  const title = fm.title;

  const dir = path.join(PUBLIC_PROJECTS, slug);
  const files = fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((file) => IMAGE_RE.test(file))
        .sort((a, b) => a.localeCompare(b))
    : [];

  const coverFile = files.find((file) => /^cover/i.test(file)) ?? files[0];
  if (!coverFile) {
    throw new Error(
      `No hay imágenes en public/projects/${slug}/ para el proyecto "${slug}".`,
    );
  }
  const cover = await readImage(slug, coverFile, title);

  let blocks: Block[];
  if (fm.layout && fm.layout.length > 0) {
    // Secuencia explícita: orden + talla + parejas definidos por el usuario.
    blocks = await Promise.all(
      fm.layout.map(async (item, i): Promise<Block> => {
        if ("row" in item) {
          const images = await Promise.all(
            item.row.map((file, j) =>
              readImage(slug, file, `${title} — ${i + 1}.${j + 1}`),
            ),
          );
          return { kind: "row", images, size: item.size };
        }
        const image = await readImage(slug, item.src, `${title} — ${i + 1}`);
        return { kind: "single", image, size: item.size };
      }),
    );
  } else {
    // Auto: portada + resto, alfabético, todas a "md".
    const galleryFiles = files.filter((file) => file !== coverFile);
    const rest = await Promise.all(
      galleryFiles.map((file, i) =>
        readImage(slug, file, `${title} — ${i + 1}`),
      ),
    );
    blocks = [cover, ...rest].map((image) => ({
      kind: "single",
      image,
      size: "md",
    }));
  }

  const coverHeightVh = fm.homeCoverHeight ?? deterministicCoverVh(slug);
  return { ...fm, slug, body: content.trim(), cover, coverHeightVh, blocks };
}

async function loadProjects(): Promise<Project[]> {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));
  const projects = await Promise.all(files.map(loadProject));
  return projects.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
}

let cached: Promise<Project[]> | null = null;
function all(): Promise<Project[]> {
  if (!cached) cached = loadProjects();
  return cached;
}

export async function getAllProjects(): Promise<Project[]> {
  return all();
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await all()).filter((project) => project.featured);
}

export async function getProjectBySlug(
  slug: string,
): Promise<Project | undefined> {
  return (await all()).find((project) => project.slug === slug);
}

export async function getAllProjectSlugs(): Promise<string[]> {
  return (await all()).map((project) => project.slug);
}
