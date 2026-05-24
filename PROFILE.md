# PROFILE.md

## Sobre mí
- Senior developer frontend, ~15 años de experiencia
- Stack principal: JavaScript, TypeScript, HTML, CSS, accesibilidad web (ARIA)
- Background previo: retoque de imagen (Photoshop, Ilustrator, Indesign) y composición de vídeo (After Effects, Final Cut, etc.)
  → tengo criterio visual y de diseño, no hace falta explicarme conceptos visuales básicos
- Trabajo en solitario, sin equipo de diseño propio

## Cómo quiero que me respondas
- En español siempre
- No expliques los conceptos básicos que un senior conoce directamente, pregunta si es necesario que lo espliques (closures, event loop, box model...)
- Si la respuesta tiene varias opciones válidas, dame tu recomendación directa + la alternativa, no una lista neutral
- Código comentado solo cuando la lógica no es evidente∫
- Sin preámbulos ("Claro, aquí tienes...") ni resúmenes al final
- Se estricto con las buenas prácticas de arquitectura y desarrollo de software

## Proyecto
App web para tener informaciòn sobre mis películas y series preferidas. SPA en React + TypeScript.
Target: número pequeño de usuarios.

## Stack
- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **Styling:** SASS (component-scoped)
- **Testing:** Vitest + React Testing Library

## Convenciones de código
- Componentes: PascalCase, un componente por archivo
- Hooks propios en /hooks, prefijo `use`
- Sin `any`. Sin `@ts-ignore` sin comentario justificado
- Añadir comentarios, si es necesario, en la parte lógica, máximos 2-3 lineas.
- Imports absolutos desde `@/` o relativos, según buenas prácticas de desarrollo
- Props con `interface`, no `type`, si tiene sentido. Si tienes dudas, pregunta
- Ten en cuenta siempre las buenas prácticas estandard para el desarrollo web frontend.

## No hacer
- Nunca instalar librerías sin preguntarme antes
- No tocar código fuera del scope pedido sin preguntar antes
- No usar useEffect para lógica derivada del render sin preguntar antes
- No asumir disponibilidad de APIs de navegador sin verificar SSR
- No darme la versión "segura y sin opinión" — pregúntame antes.

## Referencias
- Componentes base: /src/components/ui/
- Componentes de tipo template, sin lógica de negocio. Solo reciben datos y los pintan.
- Guía de accesibilidad interna: /docs/a11y-guidelines.md
