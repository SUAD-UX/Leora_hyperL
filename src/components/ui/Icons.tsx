import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export const IconOverview = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 13h5v7H4zM10.5 4h3v16h-3zM15 9h5v11h-5z" />
  </svg>
);

export const IconPositions = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="5.5" rx="2" />
    <rect x="3" y="13.5" width="18" height="5.5" rx="2" />
  </svg>
);

export const IconRisk = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3.5 4.5 7v5.2c0 4.3 3.1 7.4 7.5 8.8 4.4-1.4 7.5-4.5 7.5-8.8V7z" />
    <path d="M12 9v4" />
    <path d="M12 16.2h.01" />
  </svg>
);

export const IconHistory = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </svg>
);

export const IconWallet = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3.5 8.5A2.5 2.5 0 0 1 6 6h11a2 2 0 0 1 2 2v1" />
    <rect x="3.5" y="8.5" width="17" height="10" rx="2.5" />
    <path d="M16.5 13.5h.01" />
  </svg>
);

export const IconArrowRight = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </svg>
);

export const IconChevron = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 9.5 12 15l6-5.5" />
  </svg>
);

export const IconClose = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />
  </svg>
);

export const IconRefresh = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M19.5 12a7.5 7.5 0 1 1-2.4-5.5" />
    <path d="M19.8 4.8v4h-4" />
  </svg>
);

export const IconShield = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3.5 5 6.6v5c0 4.2 2.9 7.2 7 8.6 4.1-1.4 7-4.4 7-8.6v-5z" />
    <path d="m9.2 12.2 2 2 3.6-3.9" />
  </svg>
);

export const IconEye = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M2.8 12S6.4 5.8 12 5.8 21.2 12 21.2 12 17.6 18.2 12 18.2 2.8 12 2.8 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
);

export const IconSpark = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 16.5 9 11l3.5 3.2L20 6.5" />
    <path d="M15.5 6.5H20V11" />
  </svg>
);

export const IconPulse = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 12.5h4l2.2-5.5 3.4 11 2.3-5.5H21" />
  </svg>
);

export const IconLayers = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m12 3.8 8 4.2-8 4.2-8-4.2z" />
    <path d="m4 13 8 4.2 8-4.2" />
  </svg>
);

export const IconMenu = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 7.5h16M4 12h16M4 16.5h16" />
  </svg>
);

export const IconCopy = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M15 6.5A2.5 2.5 0 0 0 12.5 4h-6A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15" />
  </svg>
);

export const IconCheck = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const IconAlert = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 4.5 3 19.5h18z" />
    <path d="M12 10v4M12 17h.01" />
  </svg>
);

export const IconLock = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </svg>
);

export const IconBell = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M18 15.5V11a6 6 0 1 0-12 0v4.5L4.5 18h15z" />
    <path d="M10 20.5a2.4 2.4 0 0 0 4 0" />
  </svg>
);

export const IconInbox = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3.5 13.5h4l1.2 2.2h6.6l1.2-2.2h4" />
    <path d="M5.4 5.5h13.2l2.1 8v4a2 2 0 0 1-2 2H5.3a2 2 0 0 1-2-2v-4z" />
  </svg>
);

export const IconCompass = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m14.8 9.2-1.6 4.4-4.4 1.6 1.6-4.4z" />
  </svg>
);
