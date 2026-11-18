// A small, safe Markdown renderer and C++/Go/Python highlighter for the Learning Dojo webviews.
// Everything is HTML-escaped first, so model output can never inject markup.
// Supports: headings, paragraphs, fenced code, inline code, bold, italics,
// bullet and numbered lists, block quotes and horizontal rules.

function esc(s) {
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

function md(src) {
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

function stripAnsi(s) {
  // eslint-disable-next-line no-control-regex
  return String(s).replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, '');
}

// ---------------------------------------------------------------------------
// C++, Go and Python syntax highlighting for fenced code blocks (colours come from CSS)
// ---------------------------------------------------------------------------

const KEYWORDS = new Set(
  ('alignas alignof and asm auto bool break case catch char class const consteval constexpr constinit const_cast ' +
    'continue co_await co_return co_yield decltype default delete do double dynamic_cast else enum explicit export ' +
    'extern false final float for friend goto if inline int long mutable namespace new noexcept not nullptr operator ' +
    'or override private protected public register reinterpret_cast requires return short signed sizeof static ' +
    'static_assert static_cast struct switch template this thread_local throw true try typedef typeid typename union ' +
    'unsigned using virtual void volatile wchar_t while').split(' '),
);
const TYPES = new Set(
  ('std string vector map set unordered_map unordered_set queue stack deque priority_queue pair array size_t ' +
    'int8_t int16_t int32_t int64_t uint8_t uint16_t uint32_t uint64_t ptrdiff_t unique_ptr shared_ptr optional ' +
    'function tuple').split(' '),
);

const TOKEN =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(^[ \t]*#[ \t]*\w+)|(\b0[xX][0-9a-fA-F']+[uUlL]*\b|\b\d[\d']*(?:\.\d*)?(?:[eE][+-]?\d+)?[uUlLfF]*\b)|([A-Za-z_]\w*)/gm;

const GO_KEYWORDS = new Set(
  ('break case chan const continue default defer else fallthrough for func go goto if import interface map package range ' +
    'return select struct switch type var true false nil iota').split(' '),
);
const GO_TYPES = new Set(
  ('any bool byte comparable complex64 complex128 error float32 float64 int int8 int16 int32 int64 rune string uint uint8 ' +
    'uint16 uint32 uint64 uintptr fmt strings strconv sort errors sync time math os bufio bytes slices maps').split(' '),
);
const GO_BUILTINS = new Set('append cap clear close complex copy delete imag len make max min new panic print println real recover'.split(' '));

// Go has raw strings (backticks, which may span lines), runes, and no preprocessor.
const GO_TOKEN =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`[^`]*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|((?!))|(\b0[xX][0-9a-fA-F_]+\b|\b0[bB][01_]+\b|\b\d[\d_]*(?:\.\d*)?(?:[eE][+-]?\d+)?\b)|([A-Za-z_]\w*)/g;

const PY_KEYWORDS = new Set(
  ('False None True and as assert async await break class continue def del elif else except finally for from global if ' +
    'import in is lambda nonlocal not or pass raise return try while with yield match case self').split(' '),
);
const PY_TYPES = new Set(
  ('int float str bool bytes list dict set frozenset tuple object type Exception ValueError TypeError KeyError IndexError ' +
    'NotImplementedError pd np DataFrame Series csv json math os sys pathlib Path collections Counter defaultdict deque ' +
    'namedtuple dataclass heapq itertools functools').split(' '),
);
const PY_BUILTINS = new Set(
  ('abs all any enumerate filter isinstance iter len map max min next open print range reversed round sorted sum zip ' +
    'super getattr setattr hasattr').split(' '),
);

// Python: # comments, (prefixed) triple-quoted and plain strings, decorators shown like preprocessor lines.
const PY_TOKEN =
  /(#[^\n]*)|((?:\b[rRbBfFuU]{1,2})?(?:'''[\s\S]*?'''|"""[\s\S]*?"""|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'))|(^[ \t]*@[\w.]+)|(\b0[xX][0-9a-fA-F_]+\b|\b0[bB][01_]+\b|\b\d[\d_]*(?:\.\d*)?(?:[eE][+-]?\d+)?j?\b)|([A-Za-z_]\w*)/gm;

function colorize(code, token, keywords, types, builtins) {
  let out = '';
  let last = 0;
  let m;
  token.lastIndex = 0;
  while ((m = token.exec(code))) {
    out += esc(code.slice(last, m.index));
    last = token.lastIndex;
    const text = esc(m[0]);
    if (m[1]) out += '<span class="tok-c">' + text + '</span>';
    else if (m[2]) out += '<span class="tok-s">' + text + '</span>';
    else if (m[3]) out += '<span class="tok-p">' + text + '</span>';
    else if (m[4]) out += '<span class="tok-n">' + text + '</span>';
    else if (keywords.has(m[5]) || (builtins && builtins.has(m[5]))) out += '<span class="tok-k">' + text + '</span>';
    else if (types.has(m[5])) out += '<span class="tok-t">' + text + '</span>';
    else out += text;
  }
  return out + esc(code.slice(last));
}

function highlight(code) {
  return colorize(code, TOKEN, KEYWORDS, TYPES, null);
}

function highlightGo(code) {
  return colorize(code, GO_TOKEN, GO_KEYWORDS, GO_TYPES, GO_BUILTINS);
}

function highlightPython(code) {
  return colorize(code, PY_TOKEN, PY_KEYWORDS, PY_TYPES, PY_BUILTINS);
}

const CPP_LANGS = new Set(['cpp', 'c++', 'c', 'h', 'hpp', 'cc']);
const GO_LANGS = new Set(['go', 'golang']);
const PY_LANGS = new Set(['python', 'py', 'python3']);

function highlightAll(root) {
  for (const code of root.querySelectorAll('pre code[data-lang]')) {
    const lang = code.dataset.lang.toLowerCase();
    if (CPP_LANGS.has(lang)) code.innerHTML = highlight(code.textContent);
    else if (GO_LANGS.has(lang)) code.innerHTML = highlightGo(code.textContent);
    else if (PY_LANGS.has(lang)) code.innerHTML = highlightPython(code.textContent);
  }
}

window.DojoRender = { md, esc, stripAnsi, highlight, highlightGo, highlightPython, highlightAll };
