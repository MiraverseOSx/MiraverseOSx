import React from 'react';

export default function PublicIcon({ src, alt = '', size = 16, className = '' }) {
    return (
        <img
            src={src}
            alt={alt}
            width={size}
            height={size}
            className={`shrink-0 object-contain ${className}`}
            aria-hidden={alt ? undefined : true}
        />
    );
}
