import React from 'react';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        solid: 'bg-os-accent text-white hover:brightness-110',
        soft: 'bg-[color-mix(in_oklch,var(--color-accent)_15%,transparent)] text-[--color-text] border border-[color-mix(in_oklch,var(--color-accent)_35%,transparent)] hover:bg-[color-mix(in_oklch,var(--color-accent)_22%,transparent)]',
        outline: 'border border-[--color-accent] text-[--color-accent] hover:bg-[color-mix(in_oklch,var(--color-accent)_12%,transparent)]',
        ghost: 'text-[--color-accent] hover:bg-[color-mix(in_oklch,var(--color-accent)_10%,transparent)]',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md',
        md: 'h-9 px-3.5 text-sm rounded-lg',
        lg: 'h-10 px-4 text-sm rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'soft',
      size: 'md',
    },
  }
);

export function Button({ className, variant, size, asChild, ...props }) {
  const Comp = asChild ? 'span' : 'button';
  return <Comp className={twMerge(buttonVariants({ variant, size }), className)} {...props} />;
}

export default Button;
