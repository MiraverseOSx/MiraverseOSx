import React from 'react';
import { twMerge } from 'tailwind-merge';

export default function Input({ className = '', ...props }) {
  return (
    <input
      className={twMerge(
        'h-9 w-full rounded-lg border border-[#dcd8e7] bg-white/95 px-3 text-sm text-[#24324b] shadow-sm placeholder:text-[#7c7689]',
        'focus-visible:outline-none focus-visible:border-[#a58cbe] focus-visible:ring-2 focus-visible:ring-[#d8c9e9] focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'mira-input', className
      )}
      {...props}
    />
  );
}
