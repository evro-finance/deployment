export default function IsolationDoctrine() {
  return (
    <div style={{ width: '100%', height: '100%', aspectRatio: '1/1', backgroundColor: '#f4f3ec', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gridTemplateRows: 'repeat(2, 1fr)', 
        gap: '24px', 
        width: '60%', 
        height: '40%' 
      }}>
        {/* Simulated failure cell */}
        <div style={{ border: '1px solid #1a1a1a', backgroundColor: '#1a1a1a' }} />
        {/* 5 Pristine cells */}
        <div style={{ border: '1px solid #1a1a1a', backgroundColor: '#fff' }} />
        <div style={{ border: '1px solid #1a1a1a', backgroundColor: '#fff' }} />
        <div style={{ border: '1px solid #1a1a1a', backgroundColor: '#fff' }} />
        <div style={{ border: '1px solid #1a1a1a', backgroundColor: '#fff' }} />
        <div style={{ border: '1px solid #1a1a1a', backgroundColor: '#fff' }} />
      </div>
    </div>
  );
}
