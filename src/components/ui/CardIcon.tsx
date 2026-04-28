import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import clsx from 'clsx';

type CardIconSize = 'sm' | 'md';

const containerSizeMap: Record<CardIconSize, string> = {
  sm: 'h-12 w-12',
  md: 'h-14 w-14',
};

const iconSizeMap: Record<CardIconSize, string> = {
  sm: 'h-6 w-6',
  md: 'h-7 w-7',
};

export function CardIcon({
  children,
  size = 'sm',
}: {
  children: ReactNode;
  size?: CardIconSize;
}) {
  const childWithSize = isValidElement(children)
    ? cloneElement(children as ReactElement<{ className?: string }>, {
        className: clsx(
          iconSizeMap[size],
          (children as ReactElement<{ className?: string }>).props.className,
        ),
      })
    : children;

  return (
    <span
      className={clsx(
        'flex items-center justify-center',
        containerSizeMap[size],
        'border border-[var(--border-strong)]',
        'bg-[var(--bg-base)]',
        'text-[var(--text-primary)]',
      )}
      aria-hidden="true"
    >
      {childWithSize}
    </span>
  );
}
