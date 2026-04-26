"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PlantSlide } from './PlantSlide';
import { PlantRequestModal } from './PlantRequestModal';

export type PlantDef = {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
  vibe: string;
};

const plants: PlantDef[] = [
  { 
    id: 'snake-plant', 
    name: 'SNAKE PLANT', 
    bgColor: 'bg-black', 
    textColor: '#817565', 
    vibe: 'Calm, low-maintenance' 
  },
  { 
    id: 'catmint', 
    name: 'CATMINT', 
    bgColor: 'bg-black', 
    textColor: '#8b7c99', 
    vibe: 'Playful, cat-friendly' 
  },
  { 
    id: 'fresh-greens', 
    name: 'FRESH GREENS', 
    bgColor: 'bg-black', 
    textColor: '#6f8f7c', 
    vibe: 'Leafy, abundant, fresh' 
  }
];

export function PlantCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedPlant, setSelectedPlant] = useState<PlantDef | null>(null);
  
  // Drag state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    
    // Calculate the index based on scroll position
    const newIndex = Math.round(scrollLeft / clientWidth);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const scrollTo = (index: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: index * scrollRef.current.clientWidth,
      behavior: 'smooth'
    });
  };

  // Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.scrollSnapType = 'none'; // Disable snap entirely during drag
    scrollRef.current.style.scrollBehavior = 'auto'; // Disable smooth scroll during drag
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (!isDragging.current || !scrollRef.current) return;
    isDragging.current = false;
    
    // Re-enable smooth scroll and snap
    scrollRef.current.style.scrollBehavior = 'smooth';
    scrollRef.current.style.scrollSnapType = 'x mandatory';

    // Snap to nearest slide after drag
    const { scrollLeft, clientWidth } = scrollRef.current;
    const newIndex = Math.round(scrollLeft / clientWidth);
    scrollTo(newIndex);
  };

  // Convert vertical scroll to horizontal
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Only capture vertical wheel events that are predominantly vertical,
      // and only if we are hovering the carousel to prevent breaking the whole page scroll.
      if (!scrollRef.current) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        // Prevent default vertical scrolling if we are not at the edges
        const atStart = scrollRef.current.scrollLeft <= 0;
        const atEnd = scrollRef.current.scrollLeft >= scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
        
        if ((!atStart && e.deltaY < 0) || (!atEnd && e.deltaY > 0)) {
           e.preventDefault();
           scrollRef.current.scrollBy({ left: e.deltaY * 1.5, behavior: 'auto' });
        }
      }
    };

    const container = scrollRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  return (
    <div className="w-full relative min-h-[500px] overflow-hidden group flex flex-col flex-1 bg-[var(--bg-base)]">
      
      {/* Scrollable Container */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className="w-full flex-1 flex items-center justify-start overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar relative z-10 select-none cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {plants.map((plant, index) => (
          <PlantSlide 
            key={plant.id} 
            plant={plant} 
            isActive={index === activeIndex} 
            onRequest={(p) => setSelectedPlant(p)}
          />
        ))}
      </div>

      {/* Navigation UI */}
      <div className="absolute bottom-6 md:bottom-8 inset-x-0 w-full flex justify-between items-center z-30 pointer-events-none px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        
        {/* Prev Button */}
        <button 
          onClick={() => scrollTo(Math.max(0, activeIndex - 1))}
          className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--overlay-bg)] backdrop-blur-md pointer-events-auto transition-all duration-300 hover:bg-[var(--text-primary)] hover:text-[var(--bg-base)] text-[var(--text-primary)] shadow-[0_4px_20px_var(--shadow-base)] ${activeIndex === 0 ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}
        >
          <ChevronLeft size={20} />
        </button>

        {/* Indicators */}
        <div className="flex gap-2 sm:gap-3 pointer-events-auto">
          {plants.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => scrollTo(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${idx === activeIndex ? 'w-6 sm:w-8 bg-[var(--text-primary)] opacity-100' : 'w-2 bg-[var(--text-muted)] opacity-40 hover:opacity-70'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button 
          onClick={() => scrollTo(Math.min(plants.length - 1, activeIndex + 1))}
          className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--overlay-bg)] backdrop-blur-md pointer-events-auto transition-all duration-300 hover:bg-[var(--text-primary)] hover:text-[var(--bg-base)] text-[var(--text-primary)] z-30 shadow-[0_4px_20px_var(--shadow-base)] ${activeIndex === plants.length - 1 ? 'opacity-0 scale-90 md:opacity-30 md:scale-100 cursor-not-allowed' : 'opacity-100 scale-100'}`}
          disabled={activeIndex === plants.length - 1}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Request Modal */}
      {selectedPlant && (
        <PlantRequestModal plant={selectedPlant} onClose={() => setSelectedPlant(null)} />
      )}

      {/* CSS to hide scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
