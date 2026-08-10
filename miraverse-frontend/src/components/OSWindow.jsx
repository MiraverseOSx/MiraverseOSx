import React from 'react';

export default function OSWindow({ children }) {
  return (
    <div className="os-window h-full w-full min-h-0 min-w-0">
      {children}
    </div>
  );
}
