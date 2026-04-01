export default function CollateralRatio() {
  return (
    <div style={{ width: '100%', height: '100%', aspectRatio: '1/1', backgroundColor: '#f4f3ec', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ 
        width: '12%', 
        height: '75%', 
        display: 'flex', 
        flexDirection: 'column', 
        border: '1px solid #1a1a1a', 
        backgroundColor: '#fff',
        position: 'relative'
      }}>
        {/* Hairline extending markers */}
        <div style={{ position: 'absolute', top: '25%', left: '-20%', right: '-20%', height: '1px', backgroundColor: '#1a1a1a' }} />
        <div style={{ position: 'absolute', top: '70%', left: '-20%', right: '-20%', height: '1px', backgroundColor: '#1a1a1a' }} />

        {/* Top whitespace zone */}
        <div style={{ flex: '25' }} />
        
        {/* Mid-range grey zone */}
        <div style={{ flex: '45', backgroundColor: '#d1cdc7' }} />
        
        {/* Minimum CR floor (Violet) */}
        <div style={{ flex: '30', backgroundColor: '#aa3bff' }} />
      </div>
    </div>
  );
}
