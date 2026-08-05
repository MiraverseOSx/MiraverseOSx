import React from 'react';

export default function OSWindow({ children }) {
  return (
    <div className="
      relative
      mx-auto
      my-6
      rounded-xl
      backdrop-blur-xl
      bg-white/40
      border border-white/30
      shadow-xl
      overflow-hidden
      max-w-[1100px]
      h-[700px]
    ">
      {children}
    </div>
  );
}
