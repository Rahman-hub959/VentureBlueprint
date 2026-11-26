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
  const sizeMap = {
    sm: { imgH: "h-7", text: "text-base", sub: "text-[9px]" },
    md: { imgH: "h-9", text: "text-lg", sub: "text-[10px]" },
    lg: { imgH: "h-12", text: "text-2xl", sub: "text-xs" },
    xl: { imgH: "h-16", text: "text-3xl", sub: "text-sm" },
  };

  const currentSize = sizeMap[size];

  if (variant === "icon") {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <img
          src="/corpsetu-logo.png"
          alt="CorpSetu"
          className={`${currentSize.imgH} w-auto object-contain rounded-lg`}
          onError={(e) => {
            // Fallback to jpg if png not found
            (e.target as HTMLImageElement).src = "/corpsetu-logo.jpg";
          }}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/corpsetu-logo.png"
        alt="CorpSetu"
        className={`${currentSize.imgH} w-auto object-contain rounded-md`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/corpsetu-logo.jpg";
        }}
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-extrabold tracking-tight text-[#0B2559] dark:text-white ${currentSize.text}`}>
            Corp<span className="text-[#C59B27]">Setu</span>
          </span>
        </div>
        {showTagline && (
          <span className={`font-semibold tracking-wider text-[#C59B27] dark:text-[#E5B842] mt-0.5 uppercase ${currentSize.sub}`}>
            Law. CS, CA. One Bridge.
          </span>
        )}
      </div>
    </div>
  );
};

export default CorpSetuLogo;
