import React from 'react';

const NewAppleGlass = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="
        relative
        rounded-3xl
        bg-white/10
        backdrop-blur-[40px]
        border
        border-white/30
        shadow-[0_8px_32px_rgba(31,38,135,0.37)]
        overflow-hidden
        p-8
        text-white
        max-w-md
        w-full
      "
      style={{
        background:
          'linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.05))',
        boxShadow:
          'inset 0 0 100px 20px rgba(255,255,255,0.1), 0 8px 32px 0 rgba(31,38,135,0.37)',
      }}
    >
      {/* Noise Overlay */}
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          background:
            'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAHklEQVQYV2NkYGD4z0ABYBxVSF0NQ2UwGMZgGwAFHFAcNYhP9ZAAAAABJRU5ErkJggg==") repeat',
          opacity: 0.04,
          zIndex: 1,
          borderRadius: '1.5rem',
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
};

export default NewAppleGlass;
