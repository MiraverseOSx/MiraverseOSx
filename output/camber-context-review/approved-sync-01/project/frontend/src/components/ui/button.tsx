import React from 'react';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        solid: 'bg-[#765b93] text-white border border-[#70558e] hover:bg-[#654a81] shadow-sm',
        soft: 'bg-[#ede7f5] text-[#624c7c] border border-[#dcd0e8] hover:bg-[#e3d9ee]',
        outline: 'bg-white border border-[#c9bdd7] text-[#624c7c] hover:bg-[#f4eff8]',
        ghost: 'text-[#6d5686] hover:bg-[#eee7f5]',
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

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: 'solid' | 'soft' | 'outline' | 'ghost' | string;
  size?: 'sm' | 'md' | 'lg' | string;
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? 'span' : 'button';
  return <Comp className={twMerge(buttonVariants({ variant: variant as any, size: size as any }), 'mira-control', className)} data-variant={variant || 'soft'} data-size={size || 'md'} {...(props as any)} />;
}

export default Button;
