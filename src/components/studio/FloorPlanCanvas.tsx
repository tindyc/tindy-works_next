"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

export function FloorPlanCanvas() {
  const router = useRouter();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="relative w-full px-4 sm:px-6 md:px-8 lg:px-10 py-4 md:py-6 z-10 order-1">
      <div className="relative w-full mx-auto lg:max-w-4xl aspect-square md:aspect-[4/3] border border-[var(--border-subtle)] shadow-[0_10px_30px_var(--shadow-base)] lg:shadow-none">
        <div className="absolute inset-0 flex">
          {/* OFFICE SECTION */}
          <div onClick={() => router.push('/office')} className="w-1/2 border-r border-[var(--border-subtle)] relative group md:hover:bg-[var(--hover-bg)] transition-colors duration-500 cursor-pointer">
          <img alt="Office space" className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isLight ? 'opacity-60 grayscale-0 mix-blend-normal' : 'opacity-30 grayscale mix-blend-normal'} md:group-hover:opacity-20`} src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBBoXpGn1bXDQHT-4Q-cXU_ftW8LL97JhWQqetk0sI90vb-85asJo5kGy1Ru-FTTLpnriLmDn1MSy9GEmwWTwBlyWpr8wB2oQnUq_k_dbqpeQQylzqzzufH2zjZUPsOmr77ut5z-n75sFnN936UG18JpoVbd-ajFS48nSP9O7evkFZQoxI40mz04XXlAg5aruGcIatvaewATZbmZZEYzKyYLAtCVc-wL41zurhiNjYccYSbr8RVgree1HYCv_NJ4L1RYPYaff1WNwK" />
          <div className="absolute inset-0 border-[1px] border-transparent md:group-hover:border-[var(--border-subtle)] transition-colors duration-500 m-1 md:m-2"></div>
          <div className="absolute top-3 left-3 md:top-6 md:left-6 z-10">
            <h2 className="font-headline-md text-lg sm:text-2xl md:text-headline-md text-[var(--text-primary)] tracking-tighter leading-tight">OFFICE</h2>
            <p className="font-label-sm text-[8px] sm:text-[10px] md:text-label-sm text-[var(--text-secondary)] mt-1 md:mt-1 hidden sm:block">EXPERIENCE & TECH STACK</p>
          </div>
          <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6 z-10 opacity-0 translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-500 ease-out hidden md:block">
            <div className="border border-[var(--text-primary)] text-[var(--text-primary)] px-3 md:px-6 py-1.5 md:py-2 font-label-sm text-[10px] md:text-label-sm md:group-hover:bg-[var(--hover-bg)] md:group-hover:text-[var(--text-primary)] transition-colors duration-300 flex items-center gap-2">
              ENTER
              <span className="material-symbols-outlined text-xs md:text-sm">arrow_forward</span>
            </div>
          </div>
          {/* Tech Overlays */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-32 md:h-32 border border-[var(--border-subtle)] rounded-full flex items-center justify-center pointer-events-none md:group-hover:opacity-0 transition-opacity duration-500">
            <div className="w-1 h-1 md:w-2 md:h-2 bg-[var(--text-primary)] rounded-full"></div>
          </div>
          {/* HUD Data Card */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-all duration-500 ease-out z-20 pointer-events-none p-2 sm:p-6 hidden md:flex">
            <div className="bg-[var(--bg-base)] border border-[var(--border-subtle)] p-3 sm:p-6 backdrop-blur-md w-full max-w-sm translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500 shadow-[0_10px_30px_var(--shadow-base)] hidden md:block">
              <div className="flex items-center gap-3 mb-2 md:mb-3 border-b border-[var(--border-subtle)] pb-2 md:pb-3">
                <span className="material-symbols-outlined text-[var(--text-primary)] text-xs md:text-sm">desktop_windows</span>
                <h4 className="font-label-sm text-[var(--text-primary)] tracking-widest text-[8px] md:text-[10px] uppercase">Work, Experience & Systems</h4>
              </div>
              <p className="font-body-sm text-[var(--text-secondary)] text-[9px] md:text-[11px] leading-relaxed hidden md:block">
                This is where I share what I’ve built and delivered. From software engineering to project management, the Office brings together my work, technical stack, and the systems I’ve designed in real environments. <br/><br/>You’ll find:<br/>- Projects and case studies<br/>- Tools and technologies I work with<br/>- How I approach delivery, problem-solving, and building efficiently<br/><br/>It reflects how I think — structured, practical, and always with real-world impact in mind.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SECTIONS */}
        <div className="w-1/2 flex flex-col">
          {/* GARDEN SECTION */}
          <div onClick={() => router.push('/garden')} className="flex-1 border-b border-[var(--border-subtle)] relative group md:hover:bg-[var(--hover-bg)] transition-colors duration-500 cursor-pointer">
            <img alt="Zen garden" className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isLight ? 'opacity-60 grayscale-0 mix-blend-normal' : 'opacity-30 grayscale mix-blend-normal'} md:group-hover:opacity-20`} src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYxiMnNNfpB13zCPNA4JfBVYSxGYOTVvZSck0k73i2CL2hM8CQsUoyPoUZ1RRAx_mz26sDvs-b-fODquu4RcLxH6o0EV-5uG1IRxJHKWFh-AVpo6L9rH15OVQOdj_rMSs6fDTSNYmDRdhPBjqjanaqMq6IEIj5TJZN2omCNktM8leZe_M9yprLXmZl_UStq5IGDVip_NingcacpRd8z8cw3s85JB5cLrU4Cim3G0oGem_O4-DlGz1sVQmOuhbaneu4w_eEMq4TIl9D" />
            <div className="absolute inset-0 border-[1px] border-transparent md:group-hover:border-[var(--border-subtle)] transition-colors duration-500 m-1 md:m-2"></div>
            <div className="absolute top-3 left-3 md:top-6 md:left-6 z-10">
              <h2 className="font-headline-md text-lg sm:text-2xl md:text-headline-md text-[var(--text-primary)] tracking-tighter leading-tight">GARDEN</h2>
              <p className="font-label-sm text-[8px] sm:text-[10px] md:text-label-sm text-[var(--text-secondary)] mt-1 md:mt-1 hidden sm:block">PLANT GROWTH SYSTEM</p>
            </div>
            <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6 z-10 opacity-0 translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-500 ease-out hidden md:block">
              <div className="border border-[var(--text-primary)] text-[var(--text-primary)] px-3 md:px-4 py-1.5 md:py-2 font-label-sm text-[10px] md:text-label-sm md:group-hover:bg-[var(--hover-bg)] md:group-hover:text-[var(--text-primary)] transition-colors duration-300 flex items-center gap-2">
                  ENTER
                  <span className="material-symbols-outlined text-xs md:text-sm">arrow_forward</span>
              </div>
            </div>
            {/* HUD Data Card */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-all duration-500 ease-out z-20 pointer-events-none p-2 sm:p-6 hidden md:flex">
              <div className="bg-[var(--bg-base)] border border-[var(--border-subtle)] p-3 sm:p-6 backdrop-blur-md w-full max-w-sm translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500 shadow-[0_10px_30px_var(--shadow-base)] hidden md:block">
                <div className="flex items-center gap-3 mb-2 md:mb-3 border-b border-[var(--border-subtle)] pb-2 md:pb-3">
                  <span className="material-symbols-outlined text-[var(--text-primary)] text-xs md:text-sm">nature_people</span>
                  <h4 className="font-label-sm text-[var(--text-primary)] tracking-widest text-[8px] md:text-[10px] uppercase">Grow & Reflect</h4>
                </div>
                <p className="font-body-sm text-[var(--text-secondary)] text-[9px] md:text-[11px] leading-relaxed hidden md:block">
                  A slower, more personal space.<br/>The Garden is home to a digital plant you can interact with — something simple that grows over time and stays with you. It’s stored locally, so it’s yours to look after.<br/><br/>You can water it, watch the weather shape its mood, and return over time to see what has changed.<br/><br/>It’s a quiet system for growth, attention, and small daily rituals.
                </p>
              </div>
            </div>
          </div>

          {/* RECEPTION SECTION */}
          <div onClick={() => router.push('/reception')} className="flex-1 relative group md:hover:bg-[var(--hover-bg)] transition-colors duration-500 cursor-pointer">
            <img alt="Lounge area" className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isLight ? 'opacity-60 grayscale-0 mix-blend-normal' : 'opacity-30 grayscale mix-blend-normal'} md:group-hover:opacity-20`} src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3Arx62mPvWNqGJA2f_O64KbLUDAZosA8koYEC2ZB4Zt1l5xgg6pMqCNHcIKXJ1b4uRPTCUuiELWkp7elfuHm0eQa9boWdsnKVHgZJWUaZOBLy_DDxk_NAQXb9Kzm2Ek766jRRqUp7zbmShiwlO9m6iaLYrhQU_bWkg06MkZcD69rqGpNQNeM2CjH0yrj87Zq220mIrMKdDcLjIowEfq4C6W5SOwslEhnLXMp6H3pvMaCLrVv7wnw5Dk5W3CL4oRaENB5CnaP1MmxX" />
            <div className="absolute inset-0 border-[1px] border-transparent md:group-hover:border-[var(--border-subtle)] transition-colors duration-500 m-1 md:m-2"></div>
            <div className="absolute top-3 left-3 md:top-6 md:left-6 z-10">
              <h2 className="font-headline-md text-lg sm:text-2xl md:text-headline-md text-[var(--text-primary)] tracking-tighter leading-tight">RECEPTION</h2>
              <p className="font-label-sm text-[8px] sm:text-[10px] md:text-label-sm text-[var(--text-secondary)] mt-1 md:mt-1 hidden sm:block">SUPPORT & CONNECTION</p>
            </div>
            <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6 z-10 opacity-0 translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-500 ease-out hidden md:block">
              <div className="border border-[var(--text-primary)] text-[var(--text-primary)] px-3 md:px-4 py-1.5 md:py-2 font-label-sm text-[10px] md:text-label-sm md:group-hover:bg-[var(--hover-bg)] md:group-hover:text-[var(--text-primary)] transition-colors duration-300 flex items-center gap-2">
                  ENTER
                  <span className="material-symbols-outlined text-xs md:text-sm">arrow_forward</span>
              </div>
            </div>
            {/* HUD Data Card */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-all duration-500 ease-out z-20 pointer-events-none p-2 sm:p-6 hidden md:flex">
              <div className="bg-[var(--bg-base)] border border-[var(--border-subtle)] p-3 sm:p-6 backdrop-blur-md w-full max-w-sm translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500 shadow-[0_10px_30px_var(--shadow-base)] hidden md:block">
                <div className="flex items-center gap-3 mb-2 md:mb-3 border-b border-[var(--border-subtle)] pb-2 md:pb-3">
                  <span className="material-symbols-outlined text-[var(--text-primary)] text-xs md:text-sm">groups</span>
                  <h4 className="font-label-sm text-[var(--text-primary)] tracking-widest text-[8px] md:text-[10px] uppercase">Reception // SYS.NODE: SUPPORT</h4>
                </div>
                <p className="font-body-sm text-[var(--text-secondary)] text-[9px] md:text-[11px] leading-relaxed hidden md:block">
                  This is the most human part of the studio.<br/>Reception is where support starts, especially for people who want clear and friendly help with tech.<br/><br/>You can:<br/>- Submit a support request (for yourself or someone else)<br/>- Get help with everyday digital tasks<br/>- Book time for a direct conversation<br/><br/>I care about making technology feel accessible and comfortable, including for people who may feel left behind.<br/><br/>You’re welcome here.
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Blueprint Crosshairs */}
        <div className="absolute top-0 left-1/2 w-px h-full bg-[var(--border-subtle)] pointer-events-none md:group-hover:opacity-0 transition-opacity"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-[var(--border-subtle)] pointer-events-none md:group-hover:opacity-0 transition-opacity"></div>
      </div>
    </div>
  );
}
