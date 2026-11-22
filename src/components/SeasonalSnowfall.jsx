import React from 'react';

// Lightweight seasonal decoration; respects reduced-motion settings.
const flakes = Array.from({ length: 36 }, (_, i) => ({ i, left: (i * 37 % 100), delay: -(i * 1.7 % 18), duration: 10 + (i % 9), size: 7 + (i % 10) }));
export default function SeasonalSnowfall() {
  return <div aria-hidden="true" className="pri-seasonal-snow">{flakes.map(({i,left,delay,duration,size}) => <span key={i} style={{left:left+'%',animationDelay:delay+'s',animationDuration:duration+'s',fontSize:size+'px'}}>❄</span>)}</div>;
}
