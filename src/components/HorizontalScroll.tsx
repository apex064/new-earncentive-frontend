// components/HorizontalScroll.tsx

'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollProps {
  children: React.ReactNode;
  id: string;
}

export function HorizontalScroll({ children, id }: HorizontalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);

  useEffect(() => {
    const checkIfArrowsNeeded = () => {
      if (containerRef.current) {
        const hasScroll = containerRef.current.scrollWidth > containerRef.current.clientWidth;
        const isMobile = window.innerWidth < 768;
        // Show arrows only on desktop and if content overflows
        setShowArrows(!isMobile && hasScroll);
      }
    };

    // Check initially
    checkIfArrowsNeeded();

    // Check on window resize
    window.addEventListener('resize', checkIfArrowsNeeded);
    
    // Use ResizeObserver to detect content changes
    const resizeObserver = new ResizeObserver(checkIfArrowsNeeded);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', checkIfArrowsNeeded);
      resizeObserver.disconnect();
    };
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = 300;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative">
      {showArrows && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-secondary-dark hover:bg-secondary-dark rounded-full p-2 shadow-lg transition-all"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
      )}
      <div
        ref={containerRef}
        id={id}
        className="flex overflow-x-auto scrollbar-hide space-x-4 pb-4 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
      {showArrows && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-secondary-dark hover:bg-secondary-dark rounded-full p-2 shadow-lg transition-all"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>
      )}
    </div>
  );
}