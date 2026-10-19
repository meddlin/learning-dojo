import * as crypto from 'crypto';
import * as vscode from 'vscode';

export interface HtmlOptions {
  webview: vscode.Webview;
  extensionUri: vscode.Uri;
  title: string;
  /** File names inside media/. */
  styles: string[];
  scripts: string[];
  /** Markup placed in <body>. */
  body: string;
}

export function getNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

/** Builds a webview page with a strict content-security policy (scripts only run with our nonce). */
export function webviewHtml(o: HtmlOptions): string {
  const nonce = getNonce();
  const media = (file: string) => o.webview.asWebviewUri(vscode.Uri.joinPath(o.extensionUri, 'media', file));
  const csp = [
    "default-src 'none'",
    `style-src ${o.webview.cspSource}`,
    `script-src 'nonce-${nonce}'`,
    `font-src ${o.webview.cspSource}`,
    `img-src ${o.webview.cspSource} data:`,
  ].join('; ');
  const links = o.styles.map((s) => `<link rel="stylesheet" href="${media(s)}">`).join('\n  ');
  const scripts = o.scripts.map((s) => `<script nonce="${nonce}" src="${media(s)}"></script>`).join('\n  ');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${o.title}</title>
  ${links}
</head>
<body>
${o.body}
  ${scripts}
</body>
</html>`;
}
