import { useState, useEffect } from 'react';
import { get } from '../data/content';
import { fmt } from '../data/branches';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  capital: number;
  apy: number;
}

export function ShareModal({ isOpen, onClose, shareUrl, capital, apy }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCopied(false);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Pull verbatim copy from content.md
  const hook = get('problem', 'title'); // "European Capital On-Chain Shouldn't be Dead Capital"
  const closer = get('hero', 'title').replace(/\*\*/g, ''); // strip bold markers

  const shareText = `European Capital On-Chain Shouldn't be Dead Capital.\n\nSimulated ${fmt(capital)} EVRO deployment — ${apy.toFixed(1)}% annualised.\n\nDeploy Into European MEV-Protected Yield Infrastructure\n\n`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="share-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="share-modal">
        <button className="share-modal__close" onClick={onClose}>×</button>

        {/* Eyebrow */}
        <p className="share-modal__eyebrow">
          I've designed a deployment on EVRO
        </p>
        <p className="share-modal__url">
          {shareUrl}
        </p>

        {/* Hook — the problem statement */}
        <h3 className="share-modal__hook">
          {hook}
        </h3>

        {/* Dynamic — personalised numbers */}
        <p className="share-modal__dynamic">
          Simulated <strong>{fmt(capital)}</strong> deployment — <strong>{apy.toFixed(1)}%</strong> annualised.
        </p>

        {/* Closer — the hero headline */}
        <p className="share-modal__closer">
          {closer}
        </p>

        {/* Share actions */}
        <div className="share-modal__actions">
          <button
            className={`btn-ghost ${copied ? 'share-modal__copied' : ''}`}
            onClick={handleCopy}
          >
            {copied ? '✓ Copied' : '🔗 Copy Link'}
          </button>
          <a
            className="btn-ghost"
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            𝕏
          </a>
          <a
            className="btn-ghost"
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}
