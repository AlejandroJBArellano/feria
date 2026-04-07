import type { FC } from 'react';

/**
 * Classic full-keyboard silhouette (not phone keypad).
 * Stroke style aligned with Ionic “outline” icons; uses currentColor.
 */
const KeyboardClassicIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    focusable="false"
  >
    <rect
      x="2.5"
      y="5.5"
      width="19"
      height="13"
      rx="2"
      ry="2"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.5 9.5h2M10.5 9.5h2M14.5 9.5h2M17.5 9.5h1M6.5 12.5h1.5M9.5 12.5h2M12.5 12.5h2M15.5 12.5h2M17.5 12.5h1"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
    />
    <path
      d="M8 15.5h8"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
    />
  </svg>
);

export default KeyboardClassicIcon;
