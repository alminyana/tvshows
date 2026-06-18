import type { SVGProps } from 'react';

// Iconos SVG inline del dashboard. Decorativos: aria-hidden + focusable=false.
// Usan currentColor para heredar el color de acento del contenedor.

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
    ...props,
  };
}

/** Total de series — pila de tarjetas/colección. */
export function CollectionIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M3 9h18M8 4v5" />
    </svg>
  );
}

/** Series destacadas — estrella. */
export function StarIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9z" />
    </svg>
  );
}

/** Miniseries — claqueta. */
export function MiniseriesIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M3 8l3-4h12l3 4M8 4l-1.5 4M13 4l-1.5 4" />
    </svg>
  );
}

/** Multi-temporada — capas apiladas. */
export function LayersIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
    </svg>
  );
}

/** Gráfico de barras. */
export function ChartBarIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 21h18" />
      <rect x="5" y="11" width="3.5" height="7" rx="1" />
      <rect x="10.25" y="7" width="3.5" height="11" rx="1" />
      <rect x="15.5" y="13" width="3.5" height="5" rx="1" />
    </svg>
  );
}

/** Gráfico circular / quesito. */
export function ChartPieIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3a9 9 0 109 9h-9z" />
      <path d="M12 3v9" />
    </svg>
  );
}

/** Distribución por valoración — estrella en marco. */
export function RatingChartIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 21h18" />
      <path d="M12 5l1.6 3.2 3.4.5-2.5 2.4.6 3.4L12 13.3 9 14.9l.6-3.4L7 9.1l3.4-.5z" />
    </svg>
  );
}

/** Distribución por duración — reloj. */
export function ClockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
