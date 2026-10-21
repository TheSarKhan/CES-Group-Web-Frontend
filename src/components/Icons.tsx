import type { ReactNode } from "react";

type IconProps = { size?: number; className?: string };

export function ArrowRight({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true" className={className}>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function ArrowUpRight({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true" className={className}>
      <path d="M4 12L12 4M6 4h6v6" />
    </svg>
  );
}

export function MenuIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path d="M3 7h18M3 12h18M3 17h18" />
    </svg>
  );
}

export function CloseIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function Glyph({ size = 24, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} aria-hidden="true" className={className}>
      {children}
    </svg>
  );
}

/** Layihələndirmə: qələm və xətkeş */
export const DesignIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M4 20l1-4L16.5 4.5a2 2 0 013 3L8 19l-4 1z" />
    <path d="M14 7l3 3M3 22h18" />
  </Glyph>
);

/** İcra: tikilən bina */
export const BuildIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M4 21V9l7-4v16M11 21h9V11l-9-2" />
    <path d="M7 11h1M7 14h1M7 17h1M14 14h2M14 17h2" />
    <path d="M2 21h20" />
  </Glyph>
);

/** Texnika təminatı: qüllə krani */
export const CraneIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M8 22V3l-5 3M8 3l13 4v2H5M8 6l11 3" />
    <path d="M17 9v6M15 15h4v3h-4zM5 22h6" />
  </Glyph>
);

/** Kənd təsərrüfatı: sünbül */
export const WheatIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M12 22V9" />
    <path d="M12 9c-3 0-4-2-4-5 3 0 4 2 4 5zM12 9c3 0 4-2 4-5-3 0-4 2-4 5z" />
    <path d="M12 15c-3 0-4-2-4-5M12 15c3 0 4-2 4-5M12 20c-3 0-4-2-4-5M12 20c3 0 4-2 4-5" />
  </Glyph>
);

export const ShieldIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </Glyph>
);

export const HandshakeIcon = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l2.5 2.5L16 9.5" />
  </Glyph>
);

export const EyeIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Glyph>
);

export const MedalIcon = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="12" cy="9" r="5" />
    <path d="M9 13.5L7.5 21l4.5-2.5 4.5 2.5L15 13.5" />
  </Glyph>
);

export const CheckIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Glyph>
);
