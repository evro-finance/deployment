export default function CapitalMotion() {
  return (
    <div style={{ width: '100%', height: '100%', aspectRatio: '1/1', backgroundColor: '#f4f3ec', display: 'grid', placeItems: 'center' }}>
      <svg viewBox="0 0 400 400" width="100%" height="100%">
        {/* Left origin point lines */}
        <path d="M 120 200 L 280 100" stroke="#1a1a1a" strokeWidth="1" fill="none" />
        <path d="M 120 200 L 290 200" stroke="#1a1a1a" strokeWidth="1" fill="none" />
        <path d="M 120 200 L 280 300" stroke="#1a1a1a" strokeWidth="1" fill="none" />
        
        {/* Origin node */}
        <circle cx="120" cy="200" r="14" fill="#aa3bff" stroke="#1a1a1a" strokeWidth="1" />
        
        {/* Terminating nodes */}
        <circle cx="280" cy="100" r="9" fill="#fff" stroke="#1a1a1a" strokeWidth="1" />
        <circle cx="290" cy="200" r="9" fill="#fff" stroke="#1a1a1a" strokeWidth="1" />
        <circle cx="280" cy="300" r="9" fill="#fff" stroke="#1a1a1a" strokeWidth="1" />
      </svg>
    </div>
  );
}
