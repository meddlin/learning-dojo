// A small, safe Markdown renderer for exercise prompts and tutor replies.
// Everything is HTML-escaped first, so model output can never inject markup.
// Supports: headings, paragraphs, fenced code, inline code, bold, italics,
// bullet and numbered lists, block quotes and horizontal rules.

export function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function inline(text) {
  const codes = [];
  let s = text.replace(/`([^`\n]+)`/g, (_, c) => {
    codes.push(c);
    return `\u0000${codes.length - 1}\u0000`;
  });
  s = esc(s);
  s = s.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^\w*])\*([^*\s][^*\n]*?)\*(?![\w*])/g, '$1<em>$2</em>');
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[Number(i)])}</code>`);
  return s;
}

const FENCE = /^```\s*([\w+#-]*)\s*$/;
const LIST = /^(\s*)([-*]|\d+\.)\s+(.*)$/;
const BLOCK_START = /^(```|#{1,4}\s|>\s?|\s*([-*]|\d+\.)\s+)/;

export function md(src) {
  const lines = String(src).replace(/\r\n?/g, '\n').split('\n');
  const html = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    let m = line.match(FENCE);
    if (m) {
      const lang = m[1];
      const body = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) body.push(lines[i++]);
      i++;
      const attr = lang ? ` data-lang="${esc(lang)}"` : '';
      html.push(`<pre class="code"><code${attr}>${esc(body.join('\n'))}</code></pre>`);
      continue;
    }

    if (!line.trim()) {
      i++;
      continue;
    }

    m = line.match(/^(#{1,4})\s+(.*)$/);
    if (m) {
      const level = m[1].length;
      html.push(`<h${level}>${inline(m[2])}</h${level}>`);
      i++;
      continue;
    }

    if (/^(-{3,}|\*{3,})\s*$/.test(line)) {
      html.push('<hr>');
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ''));
      html.push(`<blockquote>${md(quote.join('\n'))}</blockquote>`);
      continue;
    }

    m = line.match(LIST);
    if (m) {
      const tag = /\d/.test(m[2]) ? 'ol' : 'ul';
      const items = [];
      while (i < lines.length) {
        const mm = lines[i].match(LIST);
        if (mm) {
          items.push([mm[3]]);
          i++;
        } else if (items.length && /^\s{2,}\S/.test(lines[i])) {
          items[items.length - 1].push(lines[i].trim());
          i++;
        } else {
          break;
        }
      }
      html.push(`<${tag}>${items.map((it) => `<li>${inline(it.join(' '))}</li>`).join('')}</${tag}>`);
      continue;
    }

    const para = [];
    while (i < lines.length && lines[i].trim() && !(para.length && BLOCK_START.test(lines[i]))) para.push(lines[i++]);
    if (!para.length) para.push(lines[i++]);
    html.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return html.join('\n');
}

export function stripAnsi(s) {
  // eslint-disable-next-line no-control-regex
  return String(s).replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, '');
}
