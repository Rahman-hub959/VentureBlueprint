import React from "react";

interface CorpSetuLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  variant?: "full" | "icon" | "horizontal";
}

export const CorpSetuLogo: React.FC<CorpSetuLogoProps> = ({
  className = "",
  size = "md",
  showTagline = true,
  variant = "full",
}) => {
  // Tightly cropped logo dimensions (aspect ratio 830:293 ~ 2.83:1)
  // Scaled up so the emblem and typography are crisp, bold, and clearly readable
  const sizeMap = {
    sm: { imgH: "h-9 sm:h-10", iconH: "h-9 w-9" },
    md: { imgH: "h-11 sm:h-12", iconH: "h-11 w-11" },
    lg: { imgH: "h-14 sm:h-16", iconH: "h-14 w-14" },
    xl: { imgH: "h-20 sm:h-24", iconH: "h-20 w-20" },
  };

  const currentSize = sizeMap[size];

  if (variant === "icon") {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        {/* Light Mode Square Icon */}
        <img
          src="/corpsetu-icon.png"
          alt="CorpSetu"
          className={`${currentSize.iconH} object-contain rounded-lg dark:hidden`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/corpsetu-logo.png";
          }}
        />
        {/* Dark Mode Square Icon */}
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
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Light Mode Full Brand Lockup */}
      <img
        src="/corpsetu-logo.png"
        alt="CorpSetu · Law, CS, CA. One Bridge."
        className={`${currentSize.imgH} w-auto object-contain dark:hidden transition-all`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/corpsetu-logo.jpg";
        }}
      />
      {/* Dark Mode Full Brand Lockup with High-Contrast Typography */}
      <img
        src="/corpsetu-logo-dark.png"
        alt="CorpSetu · Law, CS, CA. One Bridge."
        className={`${currentSize.imgH} w-auto object-contain hidden dark:block transition-all`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/corpsetu-logo.png";
        }}
      />
    </div>
  );
};

export default CorpSetuLogo;
