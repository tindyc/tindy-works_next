import React from 'react';
import { X } from 'lucide-react';
import { PlantDef } from './PlantCarousel';
import { PlantRequestTerminal } from './PlantRequestTerminal';
import { type TerminalFormData } from '../hooks/useTerminalFlow';
import { submitPlantRequest } from '../lib/plantRequestApi';

interface PlantRequestModalProps {
  plant: PlantDef;
  onClose: () => void;
}

export function PlantRequestModal({ plant, onClose }: PlantRequestModalProps) {
  const handleSubmit = async (data: TerminalFormData) => {
    await submitPlantRequest(data);
    window.setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[var(--bg-base)] backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="ui-card relative w-full max-w-3xl overflow-hidden p-4 sm:p-6 md:p-8">
        <div className="absolute top-0 left-0 w-full h-2 bg-[var(--text-primary)] opacity-80" style={{ backgroundColor: plant.textColor }} />
        
        <button 
          type="button"
          onClick={onClose}
          aria-label="Close request modal"
          title="Close"
          className="ui-button absolute top-6 right-6 h-10 w-10 p-0"
        >
          <X size={20} />
        </button>

        <div className="mb-6 sm:mb-8 pr-9">
          <h2 className="font-headline-sm text-2xl text-[var(--text-primary)] mb-2">Request a Plant</h2>
          <p className="text-[var(--text-secondary)] font-body-sm text-sm">
            You&apos;ve chosen the <span className="text-[var(--text-primary)] font-medium">{plant.name}</span>. 
            Complete the terminal prompts to initiate the growth process.
          </p>
        </div>

        <PlantRequestTerminal plant={plant} onComplete={handleSubmit} />
      </div>
    </div>
  );
}
