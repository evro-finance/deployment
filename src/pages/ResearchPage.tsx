import '../styles/tokens.css';
import '../styles/global.css';
import rawMd from '../research-compendium.md?raw';

/**
 * Minimal markdown → HTML renderer.
 * Handles: headings, tables, bold, italic, code, links, hr, lists, blockquotes, code blocks.
 */
function renderMarkdown(md: string): string {
  const lines = md.split('\n');
  const html: string[] = [];
  let inTable = false;
  let inCodeBlock = false;
  let inList = false;
  let tableRows: string[][] = [];

  const flushTable = () => {
    if (tableRows.length < 2) { tableRows = []; return; }
    let t = '<div class="table-wrap"><table>';
    // header
    t += '<thead><tr>';
    for (const cell of tableRows[0]) t += `<th>${inlineFormat(cell)}</th>`;
    t += '</tr></thead><tbody>';
    // skip separator row (index 1)
    for (let i = 2; i < tableRows.length; i++) {
      t += '<tr>';
      for (const cell of tableRows[i]) t += `<td>${inlineFormat(cell)}</td>`;
      t += '</tr>';
    }
    t += '</tbody></table></div>';
    html.push(t);
    tableRows = [];
  };

  const flushList = () => {
    if (inList) { html.push('</ul>'); inList = false; }
  };

  const inlineFormat = (text: string): string => {
    // 1. Markdown links first (before bold can break bracket syntax)
    let out = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
      if (href.startsWith('#')) {
        return `<a href="${href}">${label}</a>`;
      }
      return `<a href="${href}" target="_blank" rel="noopener">${label}</a>`;
    });
    // 2. Bold & italic
    out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // 3. Inline code
    out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
    // 4. Auto-link bare https:// URLs not already inside an <a> tag
    out = out.replace(/(?<!href="|">)(https?:\/\/[^\s<,)|]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    // 5. Auto-link bare domain names (word.word.tld patterns NOT already linked)
    out = out.replace(/(?<!href="|">|\/\/)([a-z0-9][\w-]*\.(com|fi|io|org|net|app|xyz|money|fun|club)\b[^\s<,)|]*)/gi, (_m, domain) => {
      // skip if it looks like it's already inside an anchor
      if (/^<\/a>/.test(domain)) return domain;
      return `<a href="https://${domain}" target="_blank" rel="noopener">${domain}</a>`;
    });
    return out;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        html.push('</code></pre>');
        inCodeBlock = false;
      } else {
        flushList();
        if (inTable) { flushTable(); inTable = false; }
        inCodeBlock = true;
        html.push('<pre><code>');
      }
      continue;
    }
    if (inCodeBlock) {
      html.push(line.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '\n');
      continue;
    }

    // Empty line
    if (!trimmed) {
      if (inTable) { flushTable(); inTable = false; }
      flushList();
      continue;
    }

    // HR
    if (trimmed === '---') {
      if (inTable) { flushTable(); inTable = false; }
      flushList();
      html.push('<hr />');
      continue;
    }

    // Table row
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      inTable = true;
      const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
      inTable = false;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      flushList();
      html.push(`<h3>${inlineFormat(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      const id = trimmed.slice(3).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      html.push(`<h2 id="${id}">${inlineFormat(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      html.push(`<h1>${inlineFormat(trimmed.slice(2))}</h1>`);
      continue;
    }

    // List items
    if (/^[\-\*]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
      if (!inList) { html.push('<ul>'); inList = true; }
      const content = trimmed.replace(/^[\-\*]\s+/, '').replace(/^\d+\.\s+/, '');
      html.push(`<li>${inlineFormat(content)}</li>`);
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      flushList();
      html.push(`<blockquote>${inlineFormat(trimmed.slice(1).trim())}</blockquote>`);
      continue;
    }

    // Paragraph
    flushList();
    html.push(`<p>${inlineFormat(trimmed)}</p>`);
  }

  if (inTable) flushTable();
  flushList();

  return html.join('\n');
}

export function ResearchPage() {
  const htmlContent = renderMarkdown(rawMd);

  return (
    <>
      <style>{`
        .research-page {
          max-width: 820px;
          margin: 0 auto;
          padding: 60px 24px 80px;
          color: var(--text-primary);
          font-family: var(--font-body);
          line-height: 1.7;
        }
        .research-page a.back-link {
          display: inline-block;
          margin-bottom: 32px;
          color: var(--accent);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.03em;
        }
        .research-page a.back-link:hover { text-decoration: underline; }
        .research-page h1 {
          font-family: var(--font-heading);
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 8px;
        }
        .research-page h2 {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 40px 0 12px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }
        .research-page h3 {
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin: 24px 0 8px;
        }
        .research-page p {
          margin: 8px 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .research-page ul {
          margin: 8px 0;
          padding-left: 20px;
        }
        .research-page li {
          margin: 4px 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .research-page hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 32px 0;
        }
        .research-page code {
          background: var(--glass-bg);
          padding: 1px 5px;
          border-radius: 3px;
          font-size: 0.82rem;
        }
        .research-page pre {
          background: var(--glass-bg);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 16px;
          overflow-x: auto;
          font-size: 0.82rem;
          line-height: 1.5;
        }
        .research-page pre code {
          background: none;
          padding: 0;
        }
        .research-page blockquote {
          border-left: 3px solid var(--accent);
          padding-left: 12px;
          margin: 12px 0;
          color: var(--text-secondary);
          font-style: italic;
        }
        .research-page a {
          color: var(--accent);
          text-decoration: none;
        }
        .research-page a:hover { text-decoration: underline; }
        .research-page strong { color: var(--text-primary); }
        .table-wrap {
          overflow-x: auto;
          margin: 12px 0;
        }
        .research-page table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.82rem;
          background: var(--glass-bg);
          border-radius: 6px;
          overflow: hidden;
        }
        .research-page th {
          text-align: left;
          padding: 8px 12px;
          font-weight: 600;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border);
          font-family: var(--font-heading);
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .research-page td {
          padding: 6px 12px;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border);
        }
        .research-page tr:last-child td { border-bottom: none; }
      `}</style>
      <div className="research-page">
        <a href="/" className="back-link">← Back to Deployment Guide</a>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </>
  );
}
