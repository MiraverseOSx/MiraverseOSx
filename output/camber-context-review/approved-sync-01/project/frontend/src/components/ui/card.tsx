import React from 'react';
import { twMerge } from 'tailwind-merge';

export function Card({ className = '', children, ...props }) {
  return (
    <section
      className={twMerge('border border-[#e3e3ee] bg-[#fcfbff] text-[#24324b] shadow-[0_3px_14px_rgba(36,50,75,0.04)] rounded-xl mira-card', className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardHeader({ className = '', ...props }) {
  return <div className={twMerge('border-b border-[#e3e3ee] px-4 py-3 mira-card-header', className)} {...props} />;
}

export function CardBody({ className = '', ...props }) {
  return <div className={twMerge('p-4 mira-card-body', className)} {...props} />;
}

export function CardFooter({ className = '', ...props }) {
  return <div className={twMerge('border-t border-[#e3e3ee] px-4 py-3 mira-card-footer', className)} {...props} />;
}

export default Card;
