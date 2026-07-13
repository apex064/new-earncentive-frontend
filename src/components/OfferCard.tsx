// components/OfferCard.tsx
'use client';

import { Monitor, CheckCircle, Clock } from 'lucide-react';
import { PiCoinsThin } from "react-icons/pi";
import { HiOutlineBanknotes } from "react-icons/hi2";
import { Offer, getDisplayPrice } from '@/utils/offers';
import { usePlatformIcons } from '@/hooks/useDeviceDetection';
import { useCurrency } from '@/contexts/CurrencyContext';

interface OfferCardProps {
  offer: Offer;
  onClick: (offer: Offer) => void;
  status?: 'started' | 'in_progress' | 'completed' | null;
}

export function OfferCard({ offer, onClick, status = null }: OfferCardProps) {
  const { renderPlatformIcons } = usePlatformIcons();
  const { formatOfferAmount, isDollarMode } = useCurrency();

  const getStatusLabel = () => {
    if (status === 'completed') return 'Completed';
    if (status === 'in_progress') return 'In Progress';
    return null;
  };

  const statusLabel = getStatusLabel();
  const displayPrice = formatOfferAmount(offer.payout);
  const CurrencyIcon = isDollarMode ? HiOutlineBanknotes : PiCoinsThin;

  return (
    <div
      className="flex-shrink-0 w-[30%] min-w-[105px] sm:w-32 bg-card rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group border border-border hover:border-primary/50 hover:shadow-lg flex flex-col"
      onClick={() => onClick(offer)}
    >
      {/* Image Area */}
      <div className="aspect-square bg-background relative overflow-hidden flex-shrink-0">
        {offer.logo ? (
          <img
            src={offer.logo}
            alt={offer.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallbackDiv = document.createElement('div');
                fallbackDiv.className = 'w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark';
                fallbackDiv.innerHTML = `
                  <svg 
                    class="h-8 w-8 text-white" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2" 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                `;
                parent.appendChild(fallbackDiv);
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark">
            <Monitor className="h-8 w-8 text-white" />
          </div>
        )}

        {/* Status pill - only shown when relevant */}
        {statusLabel && (
          <div className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[8px] font-semibold shadow-sm backdrop-blur-sm ${
            status === 'completed' ? 'bg-success/90 text-white' : 'bg-warning/90 text-white'
          }`}>
            {status === 'in_progress' && <Clock className="h-2 w-2 inline mr-0.5 -mt-px" />}
            {status === 'completed' && <CheckCircle className="h-2 w-2 inline mr-0.5 -mt-px" />}
            {statusLabel}
          </div>
        )}

        {/* Platform Icons - Bottom Right, on the image */}
        <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-sm px-1 py-0.5 rounded-md">
          {renderPlatformIcons({ osString: offer.os, size: 'sm' })}
        </div>
      </div>

      {/* Name + Price - stacked, no button, no rail */}
      <div className="p-2 flex flex-col gap-0.5">
        <h3 className="font-medium text-foreground text-[10px] leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {offer.name}
        </h3>
        <div className="flex items-center gap-1 text-[11px] font-bold text-foreground tabular-nums">
          <CurrencyIcon className="h-3 w-3 text-primary" />
          {displayPrice}
        </div>
      </div>
    </div>
  );
}
