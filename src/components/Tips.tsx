import React from 'react';
import { Droplets as Droplet, Sun, Hourglass, RefreshCw } from 'lucide-react';

export function Tips() {
  return (
    <section className="w-full max-w-[1440px] mx-auto border-x border-t border-[var(--border-subtle)] bg-[var(--bg-base)] p-6 md:p-12">
      <p className="font-sans text-[10px] md:text-xs font-semibold tracking-widest text-[var(--text-muted)] mb-8 uppercase">TIPS FOR GROWTH</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
        
        <div className="border-l border-[var(--border-subtle)] pl-4 md:pl-6">
          <Droplet className="w-5 h-5 text-[var(--text-muted)] mb-4" strokeWidth={1.5} />
          <h3 className="font-sans text-xs font-semibold text-[var(--text-primary)] mb-2 uppercase tracking-widest">Water daily</h3>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">Maintain optimal hydration to ensure steady growth progression.</p>
        </div>
        
        <div className="border-l border-[var(--border-subtle)] pl-4 md:pl-6">
          <Sun className="w-5 h-5 text-[var(--text-muted)] mb-4" strokeWidth={1.5} />
          <h3 className="font-sans text-xs font-semibold text-[var(--text-primary)] mb-2 uppercase tracking-widest">Sunlight helps</h3>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">Aligns with daytime hours to boost overall vitality stats.</p>
        </div>
        
        <div className="border-l border-[var(--border-subtle)] pl-4 md:pl-6">
          <Hourglass className="w-5 h-5 text-[var(--text-muted)] mb-4" strokeWidth={1.5} />
          <h3 className="font-sans text-xs font-semibold text-[var(--text-primary)] mb-2 uppercase tracking-widest">Be patient</h3>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">Digital flora evolves slowly over weeks of consistent care.</p>
        </div>
        
        <div className="border-l border-[var(--border-subtle)] pl-4 md:pl-6">
          <RefreshCw className="w-5 h-5 text-[var(--text-muted)] mb-4" strokeWidth={1.5} />
          <h3 className="font-sans text-xs font-semibold text-[var(--text-primary)] mb-2 uppercase tracking-widest">Stay connected</h3>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">Local environment feeds data directly into the plant's algorithm.</p>
        </div>

      </div>
    </section>
  );
}
