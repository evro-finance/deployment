export default function ProjectedReturn() {
  return (
    <div style={{ width: '100%', height: '100%', aspectRatio: '1/1', backgroundColor: '#f4f3ec', display: 'grid', placeItems: 'center' }}>
      <svg viewBox="0 0 400 400" width="100%" height="100%">
        {/* Chart Axes (X and Y only) */}
        <polyline points="60,60 60,340 340,340" stroke="#1a1a1a" strokeWidth="1" fill="none" />
        
        {/* Smooth projection curve */}
        <path d="M 60 340 Q 220 340 340 120" stroke="#aa3bff" strokeWidth="2" fill="none" />
        
        {/* Plotting point at the end */}
        <circle cx="340" cy="120" r="4" fill="#f4f3ec" stroke="#aa3bff" strokeWidth="1" />
      </svg>
    </div>
  );
}
