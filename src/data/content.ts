// ═══════════════════════════════════════════════════════════
// Content Parser — reads content.md into structured sections
// ═══════════════════════════════════════════════════════════

import rawContent from '../content.md?raw';

export type ContentSection = Record<string, string>;
export type Content = Record<string, ContentSection>;

/**
 * Parses the custom markdown format:
 *   # section-id        → creates a section
 *   ## field-name        → creates a field in the current section
 *   text below ##        → the field value (supports multi-line)
 *   ---                  → section separator (ignored, # does the work)
 */
function parseContent(raw: string): Content {
  const content: Content = {};
  let currentSection = '';
  let currentField = '';
  let currentValue: string[] = [];

  const flush = () => {
    if (currentSection && currentField) {
      content[currentSection][currentField] = currentValue.join('\n').trim();
    }
    currentValue = [];
  };

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();

    // Section separator — skip
    if (trimmed === '---') {
      flush();
      currentField = '';
      continue;
    }

    // H1 = new section
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      flush();
      currentSection = trimmed.slice(2).trim();
      currentField = '';
      content[currentSection] = {};
      continue;
    }

    // H2 = new field within current section
    if (trimmed.startsWith('## ')) {
      flush();
      currentField = trimmed.slice(3).trim();
      continue;
    }

    // Regular text — append to current field value
    if (currentSection && currentField) {
      currentValue.push(line);
    }
  }

  // Flush the last field
  flush();

  return content;
}

export const content = parseContent(rawContent);

/**
 * Safe getter — returns the field value or a fallback.
 * Usage: get('hero', 'title') → "€5M Deployment Into..."
 */
export function get(section: string, field: string, fallback = ''): string {
  return content[section]?.[field] ?? fallback;
}

/** Replace `{{key}}` placeholders — use for copy that includes dynamic numbers */
export function fillTemplate(
  template: string,
  vars: Record<string, string | number>
): string {
  if (!template) return '';
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = vars[key];
    return v !== undefined && v !== null ? String(v) : '';
  });
}

/**
 * Get all fields matching a prefix pattern as an array.
 * Usage: getList('risk', 'risk', ['title', 'mitigation'])
 *   → [{ title: '...', mitigation: '...' }, ...]
 */
export function getList(
  section: string,
  prefix: string,
  fields: string[]
): Record<string, string>[] {
  const sectionData = content[section];
  if (!sectionData) return [];

  const items: Record<string, string>[] = [];
  let i = 1;

  while (sectionData[`${prefix}-${i}-${fields[0]}`] !== undefined) {
    const item: Record<string, string> = {};
    for (const field of fields) {
      item[field] = sectionData[`${prefix}-${i}-${field}`] ?? '';
    }
    items.push(item);
    i++;
  }

  return items;
}
