import React from 'react';
import { twMerge } from 'tailwind-merge';

export function Card({ className = '', children, ...props }) {
  return (
    <section
      className={twMerge('border border-[color-mix(in_oklch,var(--color-text)_10%,transparent)] bg-[--color-surface] text-[--color-text] shadow-[0_18px_45px_rgba(43,55,98,0.12)] rounded-xl', className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardHeader({ className = '', ...props }) {
  return <div className={twMerge('border-b border-[color-mix(in_oklch,var(--color-text)_10%,transparent)] px-4 py-3', className)} {...props} />;
}

export function CardBody({ className = '', ...props }) {
  return <div className={twMerge('p-4', className)} {...props} />;
}

export function CardFooter({ className = '', ...props }) {
  return <div className={twMerge('border-t border-[color-mix(in_oklch,var(--color-text)_10%,transparent)] px-4 py-3', className)} {...props} />;
}

export default Card;
