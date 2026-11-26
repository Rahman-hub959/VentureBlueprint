import React from "react";

interface CorpSetuLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  showTagline?: boolean;
  variant?: "full" | "icon" | "horizontal";
}

export const CorpSetuLogo: React.FC<CorpSetuLogoProps> = ({
  className = "",
  size = "md",
  showTagline = true,
  variant = "full",
}) => {
  // Enhanced logo dimensions (aspect ratio ~ 2.83:1 for full brand lockup)
  // Generous height and unconstrained width so emblem, 'CorpSetu', and 'Law. CS, CA. One Bridge.' are boldly visible
  const sizeMap = {
    sm: { imgH: "h-10 sm:h-11", iconH: "h-10 w-10" },
    md: { imgH: "h-13 sm:h-15", iconH: "h-12 w-12" },
    lg: { imgH: "h-16 sm:h-20", iconH: "h-16 w-16" },
    xl: { imgH: "h-22 sm:h-26", iconH: "h-22 w-22" },
    "2xl": { imgH: "h-28 sm:h-32", iconH: "h-28 w-28" },
  };

  const currentSize = sizeMap[size];

  if (variant === "icon") {
    return (
      <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
        {/* Light Mode Square/Circle Emblem Icon */}
        <img
          src="/corpsetu-icon.png"
          alt="CorpSetu"
          className={`${currentSize.iconH} object-contain rounded-lg dark:hidden`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/corpsetu-logo.png";
          }}
        />
        {/* Dark Mode Square/Circle Emblem Icon */}
        <img
          src="/corpsetu-icon-dark.png"
          alt="CorpSetu"
          className={`${currentSize.iconH} object-contain rounded-lg hidden dark:block`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/corpsetu-logo.png";
          }}
        />
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center flex-shrink-0 ${className}`}>
      {/* Light Mode Full Brand Lockup */}
      <img
        src="/corpsetu-logo.png"
        alt="CorpSetu · Law, CS, CA. One Bridge."
        className={`${currentSize.imgH} w-auto max-w-none object-contain dark:hidden transition-all`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/corpsetu-logo.jpg";
        }}
      />
      {/* Dark Mode Full Brand Lockup with High-Contrast Typography */}
      <img
        src="/corpsetu-logo-dark.png"
        alt="CorpSetu · Law, CS, CA. One Bridge."
        className={`${currentSize.imgH} w-auto max-w-none object-contain hidden dark:block transition-all`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/corpsetu-logo.png";
        }}
      />
    </div>
  );
};

export default CorpSetuLogo;
