import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import type { Session } from './session';

async function adopt(session: Session, dir: string): Promise<boolean> {
  const hasDojo = fs.existsSync(path.join(dir, '.dojo'));
  let entries: string[] = [];
  try {
    entries = fs.readdirSync(dir).filter((n) => n !== '.DS_Store');
  } catch {
    /* the folder will be created */
  }
  if (path.resolve(dir) === os.homedir()) {
    void vscode.window.showWarningMessage('Please pick a dedicated folder rather than your home folder.');
    return false;
  }
  if (!hasDojo && entries.length > 0) {
    const pick = await vscode.window.showWarningMessage(
      `"${path.basename(dir)}" already has files in it. Learning Dojo will add the folders cpp/, go/ and .dojo/ to it. Use it anyway?`,
      { modal: true },
      'Use This Folder',
    );
    if (pick !== 'Use This Folder') return false;
  }
  await session.setRoot(dir);
  return true;
}

/** Asks for a folder with the system dialog. */
export async function chooseFolder(session: Session): Promise<boolean> {
  const picked = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    canSelectFiles: false,
    canSelectMany: false,
    openLabel: 'Use as Dojo Folder',
    title: 'Choose the folder for your exercises and progress',
    defaultUri: vscode.Uri.file(session.root ?? path.join(os.homedir(), 'git')),
  });
  if (!picked || picked.length === 0) return false;
  return adopt(session, picked[0].fsPath);
}

/** Uses the folder that is currently open in VS Code. */
export async function useOpenFolder(session: Session): Promise<boolean> {
  const folders = vscode.workspace.workspaceFolders ?? [];
  if (folders.length === 0) {
    void vscode.window.showInformationMessage('There is no open folder. Use "Choose Dojo Folder…" instead.');
    return false;
  }
  let folder = folders[0];
  if (folders.length > 1) {
    const pick = await vscode.window.showQuickPick(
      folders.map((f) => ({ label: f.name, description: f.uri.fsPath, folder: f })),
      { placeHolder: 'Which folder should hold your exercises?' },
    );
    if (!pick) return false;
    folder = pick.folder;
  }
  return adopt(session, folder.uri.fsPath);
}

/** Makes sure a dojo folder is set, asking the learner the first time. */
export async function ensureFolder(session: Session): Promise<boolean> {
  if (session.root) return true;
  const open = vscode.workspace.workspaceFolders?.[0];
  const items: Array<vscode.QuickPickItem & { id: 'open' | 'choose' }> = [];
  if (open) items.push({ id: 'open', label: `$(folder) Use the open folder`, description: open.name, detail: 'Exercises and progress are created inside it.' });
  items.push({ id: 'choose', label: '$(folder-opened) Choose a folder…', detail: 'Pick or create a dedicated folder, for example ~/git/my-dojo.' });
  const pick = await vscode.window.showQuickPick(items, {
    title: 'Where should your exercises live?',
    placeHolder: 'Your solution files and progress are plain files in this folder, so you can put them under git.',
  });
  if (!pick) return false;
  return pick.id === 'open' ? useOpenFolder(session) : chooseFolder(session);
}
