import { usePlant } from '@/hooks/usePlant';

type PlantState = ReturnType<typeof usePlant>;

export function PlantStats({ plant }: { plant: PlantState }) {
  return (
    <div className="pt-2 space-y-4">
      <p className="font-sans text-xs font-semibold tracking-widest text-[var(--text-muted)] uppercase mb-6">PLANT STATUS</p>

      <div className="flex justify-between items-end border-b border-[var(--border-subtle)] pb-2">
        <span className="font-mono text-[10px] font-semibold tracking-widest text-[var(--text-muted)] uppercase">STAGE</span>
        <span className="font-display text-4xl font-bold leading-none">{plant.stage?.toUpperCase() ?? 'SEED'}</span>
      </div>

      <div className="flex justify-between items-end border-b border-[var(--border-subtle)] pb-2">
        <span className="font-mono text-[10px] font-semibold tracking-widest text-[var(--text-muted)] uppercase">HYDRATION</span>
        <span className="font-display text-4xl font-bold leading-none">{plant.hydration}%</span>
      </div>

      <div className="flex justify-between items-end border-b border-[var(--border-subtle)] pb-2">
        <span className="font-mono text-[10px] font-semibold tracking-widest text-[var(--text-muted)] uppercase">VITALITY</span>
        <span className={`font-mono text-[10px] font-semibold tracking-widest uppercase ${plant.status === 'WILTED' ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
          {plant.status}
        </span>
      </div>
    </div>
  );
}
