import type { SVGProps } from 'react';

// Iconos de las secciones del formulario. Decorativos: aria-hidden + focusable=false.
// Usan currentColor para heredar el color de acento de cada `legend`.

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    width: 15,
    height: 15,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
    ...props,
  };
}

/** Portada — marco de imagen. */
export function CoverIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="M21 16l-5-5-5.5 5.5" />
    </svg>
  );
}

/** Datos básicos — líneas de texto. */
export function BasicsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6h16M4 11h16M4 16h9" />
    </svg>
  );
}

/** Géneros — etiqueta. */
export function GenresIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 11.5V4.5A1.5 1.5 0 0 1 4.5 3h7L21 12.5 12.5 21 3 11.5Z" />
      <circle cx="7.8" cy="7.8" r="1.3" />
    </svg>
  );
}

/** Reparto — grupo de personas. */
export function CastIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8.5" r="3.3" />
      <path d="M3.2 19.5a5.8 5.8 0 0 1 11.6 0" />
      <path d="M16.2 6a3.3 3.3 0 0 1 0 6.4" />
      <path d="M17.6 14.6a5.8 5.8 0 0 1 3.2 4.9" />
    </svg>
  );
}

/** Valoración y opinión — estrella. */
export function VerdictIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8Z" />
    </svg>
  );
}
