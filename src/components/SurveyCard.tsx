// components/SurveyCard.tsx
'use client';

import { Clock, ClipboardList, Award } from 'lucide-react';
import { PiCoinsThin } from "react-icons/pi";
import { HiOutlineBanknotes } from "react-icons/hi2";
import { useCurrency } from '@/contexts/CurrencyContext';

interface SurveyCardProps {
  survey: any;
  onClick: (survey: any) => void;
}

export function SurveyCard({ survey, onClick }: SurveyCardProps) {
  const { formatOfferAmount, isDollarMode } = useCurrency();

  const payout = survey.payout?.toFixed(2) || '0.00';
  const displayPayout = formatOfferAmount(parseFloat(payout));
  const rating = survey.rating_avg || 0;
  const lengthMinutes = survey.length_minutes || 15;
  const CurrencyIcon = isDollarMode ? HiOutlineBanknotes : PiCoinsThin;

  return (
    <div
      className="flex-shrink-0 w-[30%] min-w-[110px] sm:w-32 bg-card rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group border border-border hover:border-primary/50 hover:shadow-lg flex flex-col"
      onClick={() => onClick(survey)}
    >
      {/* Image Area */}
      <div className="aspect-square bg-background relative overflow-hidden flex-shrink-0">
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark group-hover:scale-105 transition-transform duration-300">
          <ClipboardList className="h-8 w-8 text-white/90" />
        </div>

        {/* Time badge - Top Right */}
        <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-md text-[9px] flex items-center gap-1 shadow-sm tabular-nums">
          <Clock className="h-2.5 w-2.5" />
          {lengthMinutes}m
        </div>

        {/* Top Rated badge - only when relevant */}
        {rating >= 4.0 && (
          <div className="absolute top-1.5 left-1.5 bg-warning/90 backdrop-blur-sm text-white p-1 rounded-full shadow-sm">
            <Award className="h-2.5 w-2.5" />
          </div>
        )}
      </div>

      {/* Name + Price - stacked, no button */}
      <div className="p-2 flex flex-col gap-0.5">
        <h3 className="font-medium text-foreground text-[10px] leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {survey.title}
        </h3>
        <div className="flex items-center gap-1 text-[11px] font-bold text-foreground tabular-nums">
          <CurrencyIcon className="h-3 w-3 text-primary" />
          {displayPayout}
        </div>
      </div>
    </div>
  );
}
