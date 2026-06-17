import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * Punto único de configuración de GSAP. Registramos aquí los plugins una sola
 * vez; `registerPlugin` es idempotente. Este módulo solo se importa desde
 * componentes cliente, así que el registro ocurre en el navegador.
 *
 * (Registrar `useGSAP` evita que el bundler lo elimine por tree-shaking.)
 */
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText, useGSAP };
