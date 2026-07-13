// components/TournamentEventCard.tsx

'use client';

import { useNavigate } from '@tanstack/react-router';

interface TournamentEventCardProps {
  id: number;
  title: string;
  subtitle: string;
  badgeText: string;
  buttonText: string;
  imageUrl: string;
  imageAlt: string;
  rotateClass?: string;
  route?: string;
}

export const TournamentEventCard = ({
  id,
  title,
  subtitle,
  badgeText,
  buttonText,
  imageUrl,
  imageAlt,
  rotateClass = "rotate-3",
  route = "/rewards"
}: TournamentEventCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({ to: route });
  };

  return (
    <div className="flex-shrink-0 w-[30%] min-w-[110px] sm:w-32 bg-background rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group border border-border hover:border-primary flex flex-col h-[230px]">
      {/* Top Section - Image Area */}
      <div className="h-28 bg-card relative overflow-hidden flex-shrink-0">
        {/* Image */}
        <div className="w-full h-full">
          <img
            alt={imageAlt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            src={imageUrl}
          />
        </div>

        {/* Badge - Top Left - Changed to purple */}
        <div className="absolute top-2 left-2 bg-primary-dark text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg">
          {badgeText}
        </div>
      </div>

      {/* Bottom Section - Info Area */}
      <div className="p-2 flex flex-col flex-grow bg-black/30">
        {/* Title - hover effect changed to purple */}
        <h3 className="font-semibold text-foreground text-[10px] leading-tight text-center line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Subtitle */}
        <p className="text-muted-foreground text-[9px] text-center line-clamp-2 mb-2">
          {subtitle}
        </p>

        {/* Button - FIXED to use PRIMARY (purple) */}
        <div className="mt-auto pt-1">
          <button
            onClick={handleClick}
            className="w-full py-1 rounded-lg font-medium transition-all text-[10px] flex items-center justify-center gap-1 bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};
