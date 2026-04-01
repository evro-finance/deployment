import React from 'react';

const GITHUB_URL = 'https://github.com/evro-finance';
const TELEGRAM_URL = 'https://t.me/+hofgAYWLewFmM2Zi';
const X_URL = 'https://x.com/evro_finance';
const DISCORD_URL = 'https://discord.gg/raidguild';
const PRIVACY_URL = 'https://evro.finance/privacy-policy';
const TOS_URL = 'https://evro.finance/terms-of-service';
const RAIDGUILD_URL = 'https://raidguild.org';
const ELCO_URL = 'https://elco.work';
const HARNESS_URL = 'https://harness.elco.org';
const APP_URL = 'https://app.evro.finance';

// ── Icon SVGs (inline, no dependency) ────────────────────────────────────────

function IconGitHub() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

function IconTelegram() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

function IconX() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function IconDiscord() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

function SocialLink({ href, label, children, disabled }: { href: string; label: string; children: React.ReactNode; disabled?: boolean }) {
  if (disabled) {
    return (
      <span
        title="Coming soon"
        aria-label={label}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          border: '1px solid rgba(160,129,245,0.08)',
          color: 'var(--muted-foreground)',
          opacity: 0.3,
          cursor: 'not-allowed',
        }}
      >
        {children}
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        border: '1px solid rgba(160,129,245,0.18)',
        color: 'var(--muted-foreground)',
        textDecoration: 'none',
        transition: 'border-color 0.18s ease, color 0.18s ease, background 0.18s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = 'var(--accent)';
        e.currentTarget.style.borderColor = 'rgba(160,129,245,0.5)';
        e.currentTarget.style.background = 'rgba(160,129,245,0.07)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = 'var(--muted-foreground)';
        e.currentTarget.style.borderColor = 'rgba(160,129,245,0.18)';
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {children}
    </a>
  );
}

function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6rem',
        fontWeight: 500,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.12em',
        color: 'var(--muted-foreground)',
        textDecoration: 'none',
        transition: 'color 0.15s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted-foreground)'; }}
    >
      {children}
    </a>
  );
}

export function Footer() {
  return (
    <footer
      className="section"
      style={{
        marginTop: 'var(--section-gap)',
        paddingTop: '48px',
        paddingBottom: '48px',
        borderTop: '1px solid var(--border)',
        position: 'relative',
      }}
    >
      {/* ── Top row: 3 columns ──────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: '40px',
        alignItems: 'start',
        marginBottom: '32px',
      }}>

        {/* Left — Identity + meta / absorbed marginalia */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--foreground)',
          }}>
            EVRO Genesis
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.58rem',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            color: 'var(--muted-foreground)',
            opacity: 0.7,
            lineHeight: 1.8,
          }}>
            EVRO-GEN-001 · V5 · MARCH 2026<br />
            DEPLOYMENT GUIDE · GNOSIS CHAIN<br />
            <a href={ELCO_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', opacity: 0.7, transition: 'opacity 0.15s ease' }} onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }} onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.7'; }}>ELEMENTARY COMPLEXITY</a>{' / '}<a href={HARNESS_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', opacity: 0.7, transition: 'opacity 0.15s ease' }} onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }} onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.7'; }}>HARNESS V3.5</a>
          </div>
          {/* RaidGuild credit */}
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.58rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--muted-foreground)',
            opacity: 0.55,
            marginTop: '4px',
          }}>
            Built by{' '}
            <a
              href={RAIDGUILD_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--accent)',
                textDecoration: 'none',
                opacity: 0.85,
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '0.85'; }}
            >
              RaidGuild
            </a>
          </div>
        </div>

        {/* Center — Social icon cluster */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <SocialLink href={GITHUB_URL} label="GitHub">
              <IconGitHub />
            </SocialLink>
            <SocialLink href={TELEGRAM_URL} label="Telegram">
              <IconTelegram />
            </SocialLink>
            <SocialLink href={X_URL} label="X / Twitter (coming soon)" disabled>
              <IconX />
            </SocialLink>
            <SocialLink href={DISCORD_URL} label="Discord / RaidGuild">
              <IconDiscord />
            </SocialLink>
          </div>
          <a
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--accent)',
              textDecoration: 'none',
              padding: '6px 16px',
              border: '1px solid rgba(160,129,245,0.3)',
              borderRadius: '4px',
              transition: 'background 0.18s ease, border-color 0.18s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(160,129,245,0.08)';
              e.currentTarget.style.borderColor = 'rgba(160,129,245,0.6)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(160,129,245,0.3)';
            }}
          >
            Join Community ↗
          </a>
        </div>

        {/* Right — Legal links */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '10px',
        }}>
          <TextLink href={PRIVACY_URL}>Privacy Policy</TextLink>
          <TextLink href={TOS_URL}>Terms of Service</TextLink>
          <TextLink href="https://evro.finance">evro.finance</TextLink>
          <TextLink href={GITHUB_URL}>Open Source ↗</TextLink>
        </div>
      </div>

      {/* ── Divider ─────────────────────────────────────────── */}
      <div style={{
        height: '1px',
        background: 'var(--border)',
        marginBottom: '24px',
      }} />

      {/* ── Legal disclaimer (from evro.finance, verbatim) ─── */}
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.52rem',
        fontWeight: 400,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--muted-foreground)',
        opacity: 0.5,
        lineHeight: 1.9,
        textAlign: 'center',
        maxWidth: '820px',
        margin: '0 auto',
      }}>
        EVRO IS AN AUTONOMOUS SOFTWARE DEPLOYED ON PUBLIC BLOCKCHAINS. IT DOES NOT ISSUE, HOLD OR REDEEM ASSETS
        AND IS NOT A FINANCIAL SERVICE OR PRODUCT. INTERACTIONS WITH THE PROTOCOL OCCUR DIRECTLY THROUGH SMART
        CONTRACTS AT THE USER'S INITIATIVE. NO ENTITY PROVIDES INVESTMENT ADVICE, CUSTODY OR GUARANTEES OF VALUE
        STABILITY. THIS DOCUMENT IS PROVIDED FOR INFORMATIONAL PURPOSES ONLY AND DOES NOT CONSTITUTE AN OFFER OR
        SOLICITATION OF ANY KIND.
      </p>
    </footer>
  );
}
