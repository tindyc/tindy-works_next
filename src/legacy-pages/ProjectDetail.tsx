"use client";

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, CornerDownRight } from 'lucide-react';

export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data
  const project = {
    id: id || '892',
    title: 'Autonomous Supply Chain Sync',
    description: 'A real-time data synchronization engine built to handle millions of logistics events across global distribution centers.',
    sector: 'Logistics',
    timeline: 'Q3 2023 - Q1 2024',
    techStack: ['Node.js', 'Kafka', 'React', 'PostgreSQL'],
    problem: 'Legacy ERP systems were operating with a 4-hour delay, leading to misallocated inventory and inefficient route planning for long-haul freight.',
    approach: 'Implemented an event-driven architecture using Kafka to ingest telemetry data from transport vehicles and warehouse scanners, processing them through a centralized Node.js orchestration layer.',
    outcomes: [
      'Reduced data latency from 4 hours to 1.2 seconds.',
      'Saved estimated $2.4M annually in misrouting costs.',
      'Improved warehouse worker efficiency by 18%.'
    ]
  };

  return (
    <main className="flex-grow w-full max-w-[1440px] mx-auto border-x border-[var(--border-subtle)] flex flex-col bg-[var(--overlay-bg)] backdrop-blur-md min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-88px)] mt-[64px] md:mt-[88px]">
      
      <div className="flex justify-end p-4 md:p-8 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]">
        <button onClick={() => navigate('/office')} className="ui-button h-11 w-11 p-0 focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]">
          <span className="sr-only">Close Dossier</span>
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>

      <header className="p-8 md:p-16 border-b border-[var(--border-subtle)] relative overflow-hidden bg-[var(--bg-base)] tech-panel">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, var(--text-primary) 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
        <p className="font-mono text-[10px] font-semibold tracking-widest text-[var(--text-muted)] uppercase mb-6 relative z-10">DOSSIER // PRJ-{project.id}</p>
        <h1 className="font-display text-5xl md:text-6xl lg:text-[7rem] leading-none font-bold tracking-tighter uppercase mb-6 max-w-6xl relative z-10 drop-shadow-lg">{project.title}</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 flex-grow">
        
        {/* Sidebar Info */}
        <aside className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] p-8 space-y-12 bg-[var(--bg-base)] font-mono">
          <div>
            <h3 className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mb-3 border-b border-[var(--border-subtle)] pb-2">Sector</h3>
            <p className="text-xs uppercase tracking-wider text-[var(--text-primary)]">{project.sector}</p>
          </div>
          <div>
             <h3 className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mb-3 border-b border-[var(--border-subtle)] pb-2">Timeline</h3>
            <p className="text-xs uppercase tracking-wider text-[var(--text-primary)]">{project.timeline}</p>
          </div>
          <div>
             <h3 className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mb-4 border-b border-[var(--border-subtle)] pb-2">Tech Stack</h3>
             <ul className="space-y-3">
               {project.techStack.map(tech => (
                 <li key={tech} className="flex items-center gap-3 text-[10px] md:text-xs uppercase tracking-widest text-[var(--text-secondary)]">
                   <div className="w-1.5 h-1.5 border border-[var(--text-primary)]/40"></div>
                   {tech}
                 </li>
               ))}
             </ul>
          </div>
        </aside>

        {/* Main Content */}
        <section className="lg:col-span-9 p-8 md:p-16 lg:p-24 space-y-24 bg-[var(--bg-base)] relative">
          
          <div className="relative pl-8 border-l-2 border-[var(--text-primary)]">
             <div className="absolute top-0 -left-[11px] w-5 h-5 bg-[var(--bg-base)] border border-[var(--text-primary)] flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[var(--text-primary)]"></div>
             </div>
             <h2 className="font-mono text-[10px] text-[var(--text-secondary)] tracking-widest uppercase mb-4">01 // The Problem</h2>
             <p className="text-[var(--text-secondary)] leading-relaxed max-w-4xl text-lg md:text-xl font-sans">{project.problem}</p>
          </div>

          <div className="relative pl-8 border-l-2 border-[var(--border-subtle)] hover:border-[var(--text-primary)] transition-colors group">
             <div className="absolute top-0 -left-[11px] w-5 h-5 bg-[var(--bg-base)] border border-[var(--border-subtle)] group-hover:border-[var(--text-primary)] flex items-center justify-center transition-colors">
                 <div className="w-1.5 h-1.5 bg-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
             </div>
             <h2 className="font-mono text-[10px] text-[var(--text-secondary)] tracking-widest uppercase mb-4">02 // Architectural Approach</h2>
             <p className="text-[var(--text-secondary)] leading-relaxed max-w-4xl text-lg md:text-xl font-sans mb-12">{project.approach}</p>
             
             {/* Architectural Blueprint Diagram Placeholder */}
             <div className="w-full max-w-4xl border border-[var(--border-subtle)] bg-[var(--hover-bg)] p-8 aspect-auto md:aspect-[2/1] flex flex-col relative overflow-hidden tech-panel mt-16 shadow-2xl floor-plan-grid">
                <div className="absolute top-4 left-4 font-mono text-[8px] text-[var(--text-muted)] uppercase">FIG 1. SYSTEM TOPOLOGY</div>
                <div className="absolute top-4 right-4 font-mono text-[8px] text-[var(--text-muted)] uppercase">TOP SECRET // CLASSIFIED</div>
                
                <div className="flex-grow flex items-center justify-center w-full relative z-10 py-12">
                  <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full px-4 md:px-12 mt-4">
                     <div className="w-full md:flex-1 border border-[var(--border-subtle)] p-6 text-center text-[var(--text-primary)] font-mono text-xs uppercase tracking-widest bg-[var(--bg-base)] backdrop-blur-md relative shadow-[0_4px_15px_var(--shadow-base)]">
                        <CornerDownRight className="absolute -top-3 -right-3 w-4 h-4 text-[var(--text-muted)]" />
                        IoT Sensors
                     </div>
                     <div className="h-8 w-px md:h-px md:w-16 bg-[var(--border-strong)] relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 border border-[var(--border-subtle)] bg-[var(--bg-base)]"></div>
                     </div>
                     <div className="w-full md:flex-[1.5] border-2 border-[var(--text-primary)] p-8 text-center text-[var(--text-primary)] font-display font-bold text-xl uppercase tracking-widest bg-[var(--border-subtle)] backdrop-blur-md shadow-[0_10px_30px_var(--shadow-base)]">
                        Kafka Engine
                     </div>
                     <div className="h-8 w-px md:h-px md:w-16 bg-[var(--border-strong)] relative">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 border border-[var(--border-subtle)] bg-[var(--bg-base)]"></div>
                     </div>
                     <div className="w-full md:flex-1 border border-[var(--border-subtle)] p-6 text-center text-[var(--text-primary)] font-mono text-xs uppercase tracking-widest bg-[var(--bg-base)] backdrop-blur-md shadow-[0_4px_15px_var(--shadow-base)]">
                        Client DB
                     </div>
                  </div>
                </div>
                
                <div className="absolute bottom-4 left-4 right-4 flex justify-between border-t border-[var(--border-subtle)] pt-2 font-mono text-[8px] text-[var(--text-muted)] uppercase">
                  <span>SCALE: NOT TO SCALE</span>
                  <span>CONFIDENTIAL</span>
                </div>
             </div>
          </div>

          <div className="relative pl-8 border-l-2 border-[var(--border-subtle)] hover:border-[var(--text-primary)] transition-colors group">
             <div className="absolute top-0 -left-[11px] w-5 h-5 bg-[var(--bg-base)] border border-[var(--border-subtle)] group-hover:border-[var(--text-primary)] flex items-center justify-center transition-colors">
                <div className="w-1.5 h-1.5 bg-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
             </div>
             <h2 className="font-mono text-[10px] text-[var(--text-secondary)] tracking-widest uppercase mb-8">03 // Outcomes</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
               {project.outcomes.map((outcome, i) => (
                 <div key={i} className="border border-[var(--border-subtle)] p-8 tech-panel text-[var(--text-secondary)] hover:border-[var(--text-primary)]/40 hover:bg-[var(--hover-bg)] transition-colors group/item relative bg-[var(--bg-base)] shadow-[0_4px_15px_var(--shadow-base)]">
                   <div className="absolute top-4 right-4 font-mono text-[8px] text-[var(--text-muted)]">O.0{i+1}</div>
                   <p className="font-sans text-sm leading-relaxed mt-4 group-hover/item:text-[var(--text-primary)] transition-colors">{outcome}</p>
                 </div>
               ))}
             </div>
          </div>
          
        </section>
      </div>
    </main>
  );
}
