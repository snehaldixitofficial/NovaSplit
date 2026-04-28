type LogoProps = {
  size?: number;
};

export default function Logo({ size = 32 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="url(#logoGrad)" />
      <path d="M7 23V9l7 9V9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 9c2.5 0 4.5 1 4.5 3s-2 2.5-4 3c2 .5 4.5 1.5 4.5 4s-2.5 3-5 3" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="4" x2="16" y2="28" stroke="url(#splitGrad)" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.4" />
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00c8c8" />
          <stop offset="100%" stopColor="#7b2fff" />
        </linearGradient>
        <linearGradient id="splitGrad" x1="16" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00ffff" />
          <stop offset="100%" stopColor="#bf5af2" />
        </linearGradient>
      </defs>
    </svg>
  );
}
