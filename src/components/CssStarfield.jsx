import React from 'react';

/** Always-on CSS star drift — visible motion even if WebGL is light */
export default function CssStarfield() {
  return (
    <div className="css-starfield" aria-hidden>
      <div className="css-starfield-layer layer-1" />
      <div className="css-starfield-layer layer-2" />
      <div className="css-starfield-layer layer-3" />
      <div className="css-nebula-pulse" />
    </div>
  );
}
