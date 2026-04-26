import { NavLink } from 'react-router-dom';

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'text-[var(--text-primary)] border-b border-[var(--text-primary)] pb-1'
    : 'hover:text-[var(--text-primary)] transition-colors';

export function SupportNav() {
  return (
    <nav className="flex flex-col gap-4 p-6 border-b border-[var(--border-subtle)] font-mono text-[10px] uppercase text-[var(--text-secondary)] md:flex-row md:items-center md:justify-between">
      <NavLink
        to="/reception"
        className="text-[var(--text-primary)] font-bold tracking-widest hover:text-[var(--text-secondary)] transition-colors"
      >
        STUDIO_RECEPTION
      </NavLink>

      <div className="flex gap-6 md:gap-8">
        <NavLink to="/reception" end className={linkClassName}>
          SUPPORT
        </NavLink>
        <NavLink to="/contact" className={linkClassName}>
          CONTACT
        </NavLink>
      </div>

      <NavLink to="/" className="hover:text-[var(--text-primary)] transition-colors md:text-right">
        BACK TO STUDIO
      </NavLink>
    </nav>
  );
}
