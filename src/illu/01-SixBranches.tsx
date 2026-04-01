const Hexagon = ({ cx, cy, r, fill, stroke, strokeWidth }: any) => {
  const points = Array.from({ length: 6 }).map((_, i) => {
    // Pointy-top hex orientation
    const angle = (Math.PI / 3) * i - (Math.PI / 2);
    return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
  }).join(' ');
  return <polygon points={points} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
};

export default function SixBranches() {
  const r = 38;
  const d = 90; // distance from center
  const opacities = [0.8, 0.65, 0.5, 0.35, 0.2, 0.05];

  return (
    <div style={{ width: '100%', height: '100%', aspectRatio: '1/1', backgroundColor: '#f4f3ec', display: 'grid', placeItems: 'center' }}>
      <svg viewBox="0 0 400 400" width="100%" height="100%">
        <g transform="translate(200, 200)">
          {/* Connection Lines */}
          {opacities.map((_, i) => {
            const angle = (Math.PI / 3) * i - (Math.PI / 2);
            return (
              <line key={`line-${i}`} x1={0} y1={0} x2={Math.cos(angle) * d} y2={Math.sin(angle) * d} stroke="#1a1a1a" strokeWidth="1" />
            );
          })}
          
          {/* Surrounding Nodes */}
          {opacities.map((opacity, i) => {
            const angle = (Math.PI / 3) * i - (Math.PI / 2);
            const cx = Math.cos(angle) * d;
            const cy = Math.sin(angle) * d;
            return (
              <Hexagon 
                key={`hex-${i}`} 
                cx={cx} 
                cy={cy} 
                r={r} 
                fill={`rgba(26, 26, 26, ${opacity})`} 
                stroke="#1a1a1a" 
                strokeWidth="1" 
              />
            );
          })}
          
          {/* Central Core Node */}
          <Hexagon cx={0} cy={0} r={r} fill="#aa3bff" stroke="#1a1a1a" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}
