import SixBranches from './01-SixBranches';
import CollateralRatio from './02-CollateralRatio';
import CapitalMotion from './03-CapitalMotion';
import IsolationDoctrine from './04-IsolationDoctrine';
import ProjectedReturn from './05-ProjectedReturn';

export default function IlluGallery() {
  return (
    <div style={{ padding: '40px', background: '#fff', color: '#1a1a1a' }}>
      <h2 style={{ fontFamily: 'sans-serif', textAlign: 'center', marginBottom: '40px', fontWeight: 500 }}>
        Generated Vector Components
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '40px',
        maxWidth: '1050px',
        margin: '0 auto'
      }}>
        <div>
          <h4 style={{fontFamily: 'monospace', margin: '0 0 12px', fontSize: '12px'}}>01_SIX_BRANCHES</h4>
          <div style={{ border: '1px solid #e5e4e7' }}>
            <SixBranches />
          </div>
        </div>

        <div>
           <h4 style={{fontFamily: 'monospace', margin: '0 0 12px', fontSize: '12px'}}>02_COLLATERAL_RATIO</h4>
           <div style={{ border: '1px solid #e5e4e7' }}>
            <CollateralRatio />
          </div>
        </div>

        <div>
           <h4 style={{fontFamily: 'monospace', margin: '0 0 12px', fontSize: '12px'}}>03_CAPITAL_MOTION</h4>
           <div style={{ border: '1px solid #e5e4e7' }}>
            <CapitalMotion />
          </div>
        </div>

        <div>
           <h4 style={{fontFamily: 'monospace', margin: '0 0 12px', fontSize: '12px'}}>04_ISOLATION_DOCTRINE</h4>
           <div style={{ border: '1px solid #e5e4e7' }}>
            <IsolationDoctrine />
          </div>
        </div>

        <div>
           <h4 style={{fontFamily: 'monospace', margin: '0 0 12px', fontSize: '12px'}}>05_PROJECTED_RETURN</h4>
           <div style={{ border: '1px solid #e5e4e7' }}>
            <ProjectedReturn />
          </div>
        </div>
      </div>
    </div>
  );
}
