// src/components/GlassContainer.jsx
export default function GlassContainer({ children, className = '' }) {
  return (
    <div className={`border border-white/20 bg-white/10 backdrop-blur-xl rounded-xl shadow-lg ${className}`}>
      {children}
    </div>
  );
}
