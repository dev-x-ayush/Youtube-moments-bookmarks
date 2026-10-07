import type { TextareaHTMLAttributes } from 'react';
import { cn } from './button';

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-24 w-full resize-y rounded-xl border border-white/10 bg-slate-950/70 px-3.5 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-lime-300/70 focus:ring-2 focus:ring-lime-300/15',
        className,
      )}
      {...props}
    />
  );
}
