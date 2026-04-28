import type { ReactNode } from 'react';

export function CardContent({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-5 lg:items-center">
      <div className="shrink-0">
        {icon}
      </div>

      <div className="flex max-w-[560px] flex-col lg:max-w-[600px]">
        {children}
      </div>
    </div>
  );
}
