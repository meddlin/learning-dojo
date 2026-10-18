import * as vscode from 'vscode';
import type { Session } from './session';

// Recalling syntax is part of learning it, and an inline assistant would simply
// write the exercise for you. These are applied to the dojo folder only.
const SETTINGS: Array<[string, unknown]> = [
  ['editor.quickSuggestions', { other: 'off', comments: 'off', strings: 'off' }],
  ['editor.suggestOnTriggerCharacters', false],
  ['editor.parameterHints.enabled', false],
  ['editor.inlineSuggest.enabled', false],
  ['editor.acceptSuggestionOnEnter', 'off'],
  ['editor.wordBasedSuggestions', 'off'],
  ['github.copilot.enable', { '*': false }],
  ['chat.disableAIFeatures', true],
];

function dojoFolder(session: Session): vscode.WorkspaceFolder | undefined {
  const root = session.root;
  if (!root) return undefined;
  return vscode.workspace.workspaceFolders?.find((f) => f.uri.fsPath === root);
}

export function isPracticeMode(session: Session): boolean {
  const folder = dojoFolder(session);
  if (!folder) return false;
  const v = vscode.workspace.getConfiguration('editor', folder.uri).inspect<boolean>('suggestOnTriggerCharacters');
  return v?.workspaceFolderValue === false;
}

export async function setPracticeMode(session: Session, on: boolean): Promise<boolean> {
  const folder = dojoFolder(session);
  if (!folder) {
    const open = await vscode.window.showInformationMessage(
      'Practice mode changes settings for the folder that holds your exercises, so that folder needs to be the one open in VS Code.',
      'Open Dojo Folder',
    );
    if (open && session.root) await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(session.root));
    return false;
  }
  for (const [key, value] of SETTINGS) {
    try {
      await vscode.workspace.getConfiguration(undefined, folder.uri).update(key, on ? value : undefined, vscode.ConfigurationTarget.WorkspaceFolder);
    } catch {
      // Settings from extensions that are not installed (Copilot) or from newer VS Code versions are not registered.
    }
  }
  void vscode.window.showInformationMessage(
    on
      ? 'Practice mode is on for this folder: autocomplete, parameter hints and AI suggestions are off. Run "Dojo: Toggle Practice Mode" to turn it back off.'
      : 'Practice mode is off for this folder.',
  );
  return true;
}

export async function togglePracticeMode(session: Session): Promise<void> {
  await setPracticeMode(session, !isPracticeMode(session));
}
