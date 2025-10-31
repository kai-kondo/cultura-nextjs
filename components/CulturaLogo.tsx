interface CulturaLogoProps {
  className?: string;
  size?: number;
}

export function CulturaLogo({ className = "", size = 48 }: CulturaLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer circle - represents global connection */}
      <circle
        cx="24"
        cy="24"
        r="22"
        stroke="url(#gradient1)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.3"
      />
      
      {/* Growing plant/flower - left side (Family) */}
      <path
        d="M16 28 Q16 22, 20 18 Q22 16, 23 14"
        stroke="url(#gradient2)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="20" cy="18" r="3.5" fill="url(#gradient2)" opacity="0.8" />
      <circle cx="18" cy="15" r="2.5" fill="url(#gradient3)" opacity="0.7" />
      
      {/* Growing plant/flower - right side (Au Pair) */}
      <path
        d="M32 28 Q32 22, 28 18 Q26 16, 25 14"
        stroke="url(#gradient2)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="28" cy="18" r="3.5" fill="url(#gradient2)" opacity="0.8" />
      <circle cx="30" cy="15" r="2.5" fill="url(#gradient3)" opacity="0.7" />
      
      {/* Center heart - represents care and connection */}
      <path
        d="M24 16 C24 16, 21 13, 18 13 C15 13, 14 15, 14 17 C14 20, 16 22, 24 28 C32 22, 34 20, 34 17 C34 15, 33 13, 30 13 C27 13, 24 16, 24 16 Z"
        fill="url(#gradient4)"
        opacity="0.9"
      />
      
      {/* Base/ground - represents home and foundation */}
      <path
        d="M12 30 Q16 28, 24 28 Q32 28, 36 30"
        stroke="url(#gradient1)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      
      {/* Gradients */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
        
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
        
        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="100%" stopColor="#FDBA74" />
        </linearGradient>
        
        <linearGradient id="gradient4" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>
    </svg>
  );
}
