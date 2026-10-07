import type { ButtonHTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...values: ClassValue[]) {
  return twMerge(clsx(values));
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
};

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-lime-300 text-slate-950 hover:bg-lime-200 focus-visible:ring-lime-300',
    secondary: 'border border-white/10 bg-white/[0.06] text-slate-100 hover:bg-white/10 focus-visible:ring-white/30',
    ghost: 'bg-transparent text-slate-400 hover:bg-white/[0.06] hover:text-white focus-visible:ring-white/30',
    danger: 'bg-rose-400/10 text-rose-300 hover:bg-rose-400/20 focus-visible:ring-rose-300',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-45',
        size === 'sm' ? 'min-h-9 px-3 text-xs' : 'min-h-11 px-4 text-sm',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
