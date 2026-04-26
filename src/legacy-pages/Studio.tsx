import React from 'react';
import { SideNav } from '../components/SideNav';
import { FloorPlanCanvas } from '../components/FloorPlanCanvas';
import { InfoPanel } from '../components/InfoPanel';
import { Footer } from '../components/Footer';

export function Studio() {
  return (
    <>
      <SideNav />
      <main className="flex-1 w-full max-w-[1440px] mx-auto ml-0 lg:ml-24 mt-[64px] md:mt-[88px] mb-0 lg:mb-[56px] flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-0 floor-plan-grid">
        <section className="order-1 flex-1 min-w-0">
          <FloorPlanCanvas />
        </section>
        <InfoPanel />
      </main>
      <Footer />
    </>
  );
}
