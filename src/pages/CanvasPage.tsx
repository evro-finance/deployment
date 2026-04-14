import { useEffect } from 'react';
import '../styles/tokens.css';
import '../styles/global.css';

/* ═══════════════════════════════════════════════════════════
   EVRO Genesis — Business Model Canvas
   Clean structural overview. No yield promises, no returns.
   ═══════════════════════════════════════════════════════════ */

interface BlockProps {
  icon: string;
  title: string;
  items: string[];
  accent?: boolean;
}

function Block({ icon, title, items, accent }: BlockProps) {
  return (
    <div className="bmc-block" style={accent ? { borderColor: 'var(--accent)', borderWidth: '2px' } : undefined}>
      <div className="bmc-block__header">
        <span className="bmc-block__icon">{icon}</span>
        <span className="bmc-block__title">{title}</span>
      </div>
      <ul className="bmc-block__list">
        {items.map((item, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        ))}
      </ul>
    </div>
  );
}

export function CanvasPage() {
  useEffect(() => {
    const sections = document.querySelectorAll('.bmc-section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -30px 0px' }
    );
    sections.forEach((s, i) => {
      if (i === 0) s.classList.add('revealed');
      else observer.observe(s);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="grain" />
      <div className="blueprint-grid" />

      <style>{`
        .bmc-page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 var(--content-padding);
        }

        .bmc-section {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .bmc-section.revealed {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Canvas Grid — classic BMC 2×5 layout ────────────── */
        .bmc-canvas {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
          grid-template-rows: auto auto auto;
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
        }

        /* Named grid areas — BMC standard layout */
        .bmc-canvas .bmc-cell-kp   { grid-column: 1; grid-row: 1 / 3; }
        .bmc-canvas .bmc-cell-ka   { grid-column: 2; grid-row: 1; }
        .bmc-canvas .bmc-cell-kr   { grid-column: 2; grid-row: 2; }
        .bmc-canvas .bmc-cell-vp   { grid-column: 3; grid-row: 1 / 3; }
        .bmc-canvas .bmc-cell-cr   { grid-column: 4; grid-row: 1; }
        .bmc-canvas .bmc-cell-ch   { grid-column: 4; grid-row: 2; }
        .bmc-canvas .bmc-cell-cs   { grid-column: 5; grid-row: 1 / 3; }
        .bmc-canvas .bmc-cell-cost { grid-column: 1 / 4; grid-row: 3; }
        .bmc-canvas .bmc-cell-rev  { grid-column: 4 / 6; grid-row: 3; }

        .bmc-block {
          background: var(--card);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border: 1px solid transparent;
          min-height: 0;
        }

        .bmc-block__header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bmc-block__icon {
          font-size: 1rem;
          line-height: 1;
        }

        .bmc-block__title {
          font-family: var(--font-heading);
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--foreground);
        }

        .bmc-block__list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .bmc-block__list li {
          font-family: var(--font-body);
          font-size: 0.78rem;
          line-height: 1.5;
          color: var(--evro-shark-600);
          padding-left: 12px;
          position: relative;
        }

        .bmc-block__list li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 7px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--accent);
          opacity: 0.5;
        }

        .bmc-block__list li strong {
          color: var(--foreground);
          font-weight: 600;
        }

        /* ── Responsive collapse ─────────────────────────────── */
        @media (max-width: 900px) {
          .bmc-canvas {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto;
          }
          .bmc-canvas .bmc-cell-kp,
          .bmc-canvas .bmc-cell-ka,
          .bmc-canvas .bmc-cell-kr,
          .bmc-canvas .bmc-cell-vp,
          .bmc-canvas .bmc-cell-cr,
          .bmc-canvas .bmc-cell-ch,
          .bmc-canvas .bmc-cell-cs,
          .bmc-canvas .bmc-cell-cost,
          .bmc-canvas .bmc-cell-rev {
            grid-column: auto;
            grid-row: auto;
          }
        }

        @media (max-width: 560px) {
          .bmc-canvas {
            grid-template-columns: 1fr;
          }
        }

        /* ── Footer stripe ───────────────────────────────────── */
        .bmc-footer {
          margin-top: 80px;
          padding: 32px 0;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .bmc-footer__text {
          font-family: var(--font-mono);
          font-size: 0.55rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--muted-foreground);
          opacity: 0.6;
        }
        .bmc-footer__back {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: var(--accent);
          text-decoration: none;
          transition: opacity 0.15s ease;
        }
        .bmc-footer__back:hover { opacity: 0.7; }

        /* ── Detail section cards ────────────────────────────── */
        .bmc-details {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .bmc-detail-card {
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: 6px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: var(--glass-shadow);
        }

        .bmc-detail-card__header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .bmc-detail-card__icon {
          font-size: 1.2rem;
          line-height: 1;
        }

        .bmc-detail-card__title {
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--foreground);
        }

        .bmc-detail-card__body {
          font-family: var(--font-body);
          font-size: 0.85rem;
          line-height: 1.65;
          color: var(--evro-shark-600);
        }

        .bmc-detail-card__body strong {
          color: var(--foreground);
          font-weight: 600;
        }

        .bmc-detail-card__list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .bmc-detail-card__list li {
          font-family: var(--font-body);
          font-size: 0.82rem;
          line-height: 1.5;
          color: var(--evro-shark-600);
          padding-left: 14px;
          position: relative;
        }

        .bmc-detail-card__list li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 8px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--accent);
          opacity: 0.4;
        }

        .bmc-detail-card__list li strong {
          color: var(--foreground);
          font-weight: 600;
        }
      `}</style>

      <div className="bmc-page">
        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="bmc-section" style={{ paddingTop: '80px', paddingBottom: '24px' }}>
          <div className="animate-in">
            <p className="label" style={{ marginBottom: '12px', color: 'var(--accent)' }}>
              EVRO Genesis
            </p>
            <h1 className="heading-xl" style={{ marginBottom: '16px' }}>
              Business Model Canvas
            </h1>
            <div className="divider" />
            <p style={{
              maxWidth: '680px',
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
              fontWeight: 400,
              lineHeight: 1.5,
              color: 'var(--foreground)',
              letterSpacing: '-0.01em',
            }}>
              Structural overview of the EVRO protocol — a decentralized Euro-pegged stablecoin
              issued via CDPs on Gnosis Chain. Liquity v2 fork with 6 isolated collateral branches,
              MEV-protected liquidity, and minimal DAO governance.
            </p>
          </div>
        </section>

        {/* ── Canvas Grid ──────────────────────────────────────── */}
        <section className="bmc-section" style={{ marginTop: '48px' }}>
          <div className="bmc-canvas">
            {/* Key Partners */}
            <div className="bmc-cell-kp">
              <Block
                icon="🤝"
                title="Key Partners"
                items={[
                  '**GnosisDAO** — anchor capital partner, 15% RETVRN',
                  '**RaidGuild** — protocol builder, 30% RETVRN',
                  '**CoW Protocol** — MEV-protected AMM infrastructure',
                  '**Monerium** — EURe issuer, fiat on/off ramp',
                  '**Curve Finance** — retail swap routing venue',
                  '**NOCA / Noctua** — GnosisDAO treasury operator',
                  '**Sherlock** — smart contract auditor (2 audits)',
                ]}
              />
            </div>

            {/* Key Activities */}
            <div className="bmc-cell-ka">
              <Block
                icon="⚙️"
                title="Key Activities"
                items={[
                  'Protocol deployment and operations on Gnosis Chain',
                  'Liquidity bootstrapping across 3 venues',
                  'Money market listing pursuit (Aave, SparkLend)',
                  'DAO governance and proposal management',
                  'Growth partnerships and BD pipeline',
                ]}
              />
            </div>

            {/* Key Resources */}
            <div className="bmc-cell-kr">
              <Block
                icon="🏗️"
                title="Key Resources"
                items={[
                  '**Liquity v2 codebase** — licensed fork, immutable contracts',
                  '**2 Sherlock audits** — all findings resolved',
                  '**EVRO DAO** — Moloch v3 on Gnosis Chain',
                  '**RETVRN token** — 100M fixed supply governance',
                  '**Empirical market data** — 365 days on-chain',
                ]}
              />
            </div>

            {/* Value Propositions */}
            <div className="bmc-cell-vp">
              <Block
                icon="💎"
                title="Value Propositions"
                accent
                items={[
                  '**Euro yield from day one** — Stability Pool earns protocol interest + liquidation gains',
                  '**MEV protection** — CoW AMM batch-auction settlement captures arb surplus for LPs',
                  '**Asset isolation** — 6 independent collateral branches, crash in one cannot trigger another',
                  '**Rate sovereignty** — borrowers set their own interest rate',
                  '**No living competitor** — Angle Protocol wound down, decentralized Euro CDP market is empty',
                  '**Immutable 75/25 split** — hardcoded, no admin keys',
                ]}
              />
            </div>

            {/* Customer Relationships */}
            <div className="bmc-cell-cr">
              <Block
                icon="🫂"
                title="Customer Relationships"
                items={[
                  '**Set-and-forget CDPs** — ERC-721 NFT Troves, autonomous',
                  '**Governance** — RETVRN token via Moloch v3 proposals',
                  '**Ragequit** — proportional exit rights at any time',
                  '**Transparent reporting** — on-going protocol health cadence',
                ]}
              />
            </div>

            {/* Channels */}
            <div className="bmc-cell-ch">
              <Block
                icon="📡"
                title="Channels"
                items={[
                  '**L1 Minting** — 6 collateral branches (sDAI, GNO, wstETH, wXDAI, wBTC, osGNO)',
                  '**L2 Distribution** — Stability Pool, CoW AMM, Curve StableSwap',
                  '**GIP proposals** — direct governance channel to target DAOs',
                  '**Gnosis Pay / Zeal** — retail spend integration path',
                ]}
              />
            </div>

            {/* Customer Segments */}
            <div className="bmc-cell-cs">
              <Block
                icon="👥"
                title="Customer Segments"
                items={[
                  '**Borrowers** — Gnosis Chain users seeking better rates, MEV protection, and branch isolation',
                  '**DAO Treasuries** — DAOs with idle wstETH/GNO wanting Euro-denominated yield without changing convictions',
                  '**Retail spenders** — consumers earning SP yield and spending in Euros via Gnosis Pay cards',
                ]}
              />
            </div>

            {/* Cost Structure */}
            <div className="bmc-cell-cost">
              <Block
                icon="💸"
                title="Cost Structure"
                items={[
                  '**Curve venue LVR bleed** — arb extraction on unprotected AMM, capped and contained',
                  '**Smart contract immutability** — no ability to patch post-deployment',
                  '**Gas subsidies** — 3.5 WXDAI per Trove for operational costs',
                  '**Growth agency fees** — BD partner compensation from DAO treasury',
                  '**DAO governance coordination** — proposals, reporting, partnership management',
                ]}
              />
            </div>

            {/* Revenue Streams */}
            <div className="bmc-cell-rev">
              <Block
                icon="💰"
                title="Revenue Streams"
                items={[
                  '**75% borrowing interest** → Stability Pool depositors',
                  '**25% borrowing interest** → EVRO DAO treasury via interestRouter',
                  '**Collateral staking yield** — sDAI DSR, wstETH staking, GNO validators',
                  '**CoW AMM batch surplus** — arb value captured and returned to LPs',
                ]}
              />
            </div>
          </div>
        </section>

        {/* ── Expanded Detail Cards ────────────────────────────── */}
        <section className="bmc-section" style={{ marginTop: 'var(--section-gap)' }}>
          <p className="label" style={{ marginBottom: '24px', color: 'var(--accent)' }}>
            Block Details
          </p>
          <h2 className="heading-lg" style={{ marginBottom: '40px' }}>
            Structural Breakdown
          </h2>

          <div className="bmc-details">
            {/* Key Partners detail */}
            <div className="bmc-detail-card">
              <div className="bmc-detail-card__header">
                <span className="bmc-detail-card__icon">🤝</span>
                <span className="bmc-detail-card__title">Key Partners</span>
              </div>
              <p className="bmc-detail-card__body">
                The protocol's partner network spans capital, infrastructure, security, and growth.
                <strong> GnosisDAO</strong> provides anchor capital and ecosystem access.
                <strong> RaidGuild</strong> built the protocol and holds the largest governance stake.
                <strong> CoW Protocol</strong> provides the MEV-protected AMM infrastructure
                (FM-AMM batch auctions) that differentiates EVRO from legacy venues.
              </p>
              <ul className="bmc-detail-card__list">
                <li><strong>Contango</strong> — looping layer for leveraged positions (contingent on money market listing)</li>
                <li><strong>Alpha Growth</strong> — DeFi growth agency for borrower acquisition pipeline</li>
                <li><strong>Zeal / Gnosis Pay</strong> — retail Euro spend integration (live USD model)</li>
              </ul>
            </div>

            {/* Value Propositions detail */}
            <div className="bmc-detail-card">
              <div className="bmc-detail-card__header">
                <span className="bmc-detail-card__icon">💎</span>
                <span className="bmc-detail-card__title">Value Propositions</span>
              </div>
              <p className="bmc-detail-card__body">
                EVRO fills a structural gap: there is no decentralized Euro CDP on the market. Angle Protocol
                (agEUR/EURA) wound down. EURe, the only regulated Euro stablecoin with meaningful presence
                on Gnosis, yields <strong>0%</strong>.
              </p>
              <p className="bmc-detail-card__body" style={{ marginTop: '8px' }}>
                The protocol operates on <strong>immutable smart contracts</strong> with no admin keys.
                The 75/25 interest split is hardcoded —
                governance can direct the 25% but cannot change the ratio.
                Each collateral branch is <strong>isolated</strong>: a crash in one cannot cascade to others.
              </p>
            </div>

            {/* Customer Segments detail */}
            <div className="bmc-detail-card">
              <div className="bmc-detail-card__header">
                <span className="bmc-detail-card__icon">👥</span>
                <span className="bmc-detail-card__title">Customer Segments</span>
              </div>
              <ul className="bmc-detail-card__list">
                <li><strong>Borrowers seeking better rates</strong> — currently paying above-market with MEV exposure. EVRO offers rate sovereignty and branch isolation. Growth agency partnerships active.</li>
                <li><strong>DAO Treasuries</strong> — DAOs holding idle wstETH or GNO can mint EVRO without changing asset conviction. GnosisDAO is the anchor case.</li>
                <li><strong>Retail spenders</strong> — Euro-denominated yield → Gnosis Pay card spending. Zeal has already proven the model with USD/Aave.</li>
              </ul>
            </div>

            {/* Channels detail */}
            <div className="bmc-detail-card">
              <div className="bmc-detail-card__header">
                <span className="bmc-detail-card__icon">📡</span>
                <span className="bmc-detail-card__title">Two-Layer Architecture</span>
              </div>
              <p className="bmc-detail-card__body">
                <strong>Layer 1 (Minting)</strong> locks collateral across 6 isolated branches:
                sDAI, GNO, wstETH, wXDAI, wBTC, osGNO. Each branch has independent
                oracle inputs, liquidation parameters, and shutdown semantics.
              </p>
              <p className="bmc-detail-card__body" style={{ marginTop: '8px' }}>
                <strong>Layer 2 (Distribution)</strong> deploys minted EVRO into 3 venues:
                the <strong>Stability Pool</strong> (liquidation backstop),
                the <strong>Anchor Pool</strong> (CoW AMM sDAI/EVRO — primary depth, MEV-protected),
                and the <strong>Bridge Pool</strong> (Curve EURe/EVRO — retail routing, size-capped).
              </p>
            </div>

            {/* Revenue Streams detail */}
            <div className="bmc-detail-card">
              <div className="bmc-detail-card__header">
                <span className="bmc-detail-card__icon">💰</span>
                <span className="bmc-detail-card__title">Revenue Architecture</span>
              </div>
              <p className="bmc-detail-card__body">
                Interest paid by borrowers is split <strong>75/25</strong> — immutable, in code.
                75% flows to Stability Pool depositors. 25% flows to the EVRO DAO
                treasury via the interestRouter contract.
              </p>
              <ul className="bmc-detail-card__list" style={{ marginTop: '8px' }}>
                <li><strong>Protocol interest</strong> — 75% of borrowing fees to SP depositors</li>
                <li><strong>DAO treasury</strong> — 25% via interestRouter, governed by RETVRN holders</li>
                <li><strong>Collateral yield</strong> — sDAI DSR, wstETH staking, GNO validator income accrues to collateral holders</li>
                <li><strong>CoW AMM surplus</strong> — batch-auction arbitrage value captured for LP positions</li>
              </ul>
            </div>

            {/* Governance detail */}
            <div className="bmc-detail-card">
              <div className="bmc-detail-card__header">
                <span className="bmc-detail-card__icon">🗳️</span>
                <span className="bmc-detail-card__title">Governance</span>
              </div>
              <p className="bmc-detail-card__body">
                <strong>EVRO DAO</strong> operates on Moloch v3 (Baal) via DAOhaus on Gnosis Chain.
                The treasury sits on a Gnosis Safe multisig with Zodiac standards.
              </p>
              <ul className="bmc-detail-card__list" style={{ marginTop: '8px' }}>
                <li><strong>RETVRN token</strong> — 100M fixed supply. RaidGuild 30%, GnosisDAO 15%, DAO treasury 55%</li>
                <li><strong>Ragequit</strong> — members can exit with proportional treasury share at any time</li>
                <li><strong>veRETVRN</strong> (planned) — vote-escrow instrument directing the 25% revenue stream</li>
                <li><strong>Reserve allocation signal</strong> — percentage of positions sent to Reserve is the strongest alignment signal</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── Growth Phases (structural, no targets) ───────────── */}
        <section className="bmc-section" style={{ marginTop: 'var(--section-gap)' }}>
          <p className="label" style={{ marginBottom: '24px', color: 'var(--accent)' }}>
            Growth Roadmap
          </p>
          <h2 className="heading-lg" style={{ marginBottom: '32px' }}>
            Phase Progression
          </h2>

          <div className="phase-timeline">
            <div className="phase-item">
              <div className="phase-number">PHASE I</div>
              <div className="phase-dot" />
              <div className="phase-content">
                <div className="phase-title">The Infrastructure</div>
                <div className="phase-desc">
                  Seed capital launches the protocol and the EVRO DAO.
                  This deployment is the unlock — every phase that follows depends on this infrastructure being live.
                </div>
              </div>
            </div>
            <div className="phase-item">
              <div className="phase-number">PHASE II</div>
              <div className="phase-dot" />
              <div className="phase-content">
                <div className="phase-title">Organic Migration</div>
                <div className="phase-desc">
                  LPs on legacy venues realize extraction by MEV bots.
                  EVRO offers what they can't get elsewhere: real yield, rate sovereignty, and MEV protection.
                  BD with extracted LPs, money market listings, partnership pipeline.
                </div>
              </div>
            </div>
            <div className="phase-item">
              <div className="phase-number">PHASE III</div>
              <div className="phase-dot" />
              <div className="phase-content">
                <div className="phase-title">Treasury Adoption</div>
                <div className="phase-desc">
                  The track record exists. DAOs evaluate real performance, not a whitepaper.
                  Treasury capital enters for yield without changing asset conviction.
                  Performance reports, GIP proposals, treasury committee outreach.
                </div>
              </div>
            </div>
            <div className="phase-item">
              <div className="phase-number">PHASE IV</div>
              <div className="phase-dot" />
              <div className="phase-content">
                <div className="phase-title">Ecosystem Integration</div>
                <div className="phase-desc">
                  EVRO becomes core Euro infrastructure on Gnosis.
                  Protocols build around it. Retail spend routes through it.
                  Ecosystem support, open-source tooling, community integrations.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────── */}
        <div className="bmc-section" style={{ paddingBottom: '60px' }}>
          <div className="bmc-footer">
            <span className="bmc-footer__text">
              EVRO Genesis · Business Model Canvas · April 2026
            </span>
            <a href="/" className="bmc-footer__back">← Deployment Guide</a>
          </div>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.5rem',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--muted-foreground)',
            opacity: 0.45,
            lineHeight: 1.9,
            textAlign: 'center',
            maxWidth: '820px',
            margin: '24px auto 0',
          }}>
            This document is a structural overview for informational purposes only.
            It does not constitute an offer or solicitation of any kind.
          </p>
        </div>
      </div>
    </>
  );
}
