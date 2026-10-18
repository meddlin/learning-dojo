import * as vscode from 'vscode';
import type { Exercise, ProgressStatus, Track } from './core/types';
import type { Session } from './session';

export type PathNode = { kind: 'track'; track: Track } | { kind: 'exercise'; ex: Exercise };

const ICONS: Record<ProgressStatus, { icon: string; color?: string; label: string }> = {
  new: { icon: 'circle-outline', label: '' },
  started: { icon: 'circle-large-filled', color: 'charts.blue', label: 'in progress' },
  solved: { icon: 'pass-filled', color: 'testing.iconPassed', label: 'solved' },
  'review-due': { icon: 'history', color: 'charts.yellow', label: 'review due' },
  reviewing: { icon: 'sync', color: 'charts.yellow', label: 'reviewing' },
};

export class PathProvider implements vscode.TreeDataProvider<PathNode> {
  private readonly emitter = new vscode.EventEmitter<PathNode | undefined>();
  readonly onDidChangeTreeData = this.emitter.event;
  private readonly trackNodes = new Map<string, PathNode>();
  private readonly exerciseNodes = new Map<string, PathNode>();

  constructor(private readonly session: Session) {
    this.index();
  }

  /** Builds the tree nodes for the current language. Nodes are reused so `reveal` can find them. */
  private index(): void {
    this.trackNodes.clear();
    this.exerciseNodes.clear();
    for (const t of this.session.catalog.tracks()) {
      this.trackNodes.set(t.id, { kind: 'track', track: t });
      for (const ex of t.exercises) this.exerciseNodes.set(ex.id, { kind: 'exercise', ex });
    }
  }

  /** Call after the language changed, so the tree shows the other catalogue. */
  reindex(): void {
    this.index();
    this.refresh();
  }

  refresh(): void {
    this.emitter.fire(undefined);
  }

  nodeFor(id: string): PathNode | undefined {
    return this.exerciseNodes.get(id);
  }

  getChildren(node?: PathNode): PathNode[] {
    if (!this.session.root) return [];
    if (!node) return [...this.trackNodes.values()];
    if (node.kind === 'track') return node.track.exercises.map((e) => this.exerciseNodes.get(e.id)!);
    return [];
  }

  getParent(node: PathNode): PathNode | undefined {
    return node.kind === 'exercise' ? this.trackNodes.get(node.ex.track) : undefined;
  }

  getTreeItem(node: PathNode): vscode.TreeItem {
    if (node.kind === 'track') {
      const t = node.track;
      const solved = t.exercises.filter((e) => ['solved', 'review-due'].includes(this.session.view(e.id).status)).length;
      const item = new vscode.TreeItem(t.title, vscode.TreeItemCollapsibleState.Expanded);
      item.id = `track:${t.id}`;
      item.description = `${solved}/${t.exercises.length}`;
      item.tooltip = t.blurb;
      item.contextValue = 'track';
      return item;
    }
    const ex = node.ex;
    const p = this.session.view(ex.id);
    const look = ICONS[p.status];
    const item = new vscode.TreeItem(ex.title, vscode.TreeItemCollapsibleState.None);
    item.id = `ex:${ex.id}`;
    item.description = look.label || (ex.minutes ? `~${ex.minutes} min` : '');
    item.iconPath = new vscode.ThemeIcon(look.icon, look.color ? new vscode.ThemeColor(look.color) : undefined);
    const tip = new vscode.MarkdownString(undefined, true);
    tip.appendMarkdown(`**${ex.title}**\n\n${ex.summary}\n\n`);
    if (ex.concepts.length) tip.appendMarkdown(`_${ex.concepts.join(' · ')}_`);
    item.tooltip = tip;
    item.contextValue = p.status === 'solved' || p.status === 'review-due' ? 'exercise-solved' : 'exercise';
    item.command = { command: 'dojo.openExercise', title: 'Open Exercise', arguments: [ex.id] };
    return item;
  }

  /** Number of exercises whose review is due. */
  dueCount(): number {
    return this.session.catalog.all().filter((e) => this.session.view(e.id).status === 'review-due').length;
  }

  solvedCount(): number {
    return this.session.catalog.all().filter((e) => ['solved', 'review-due'].includes(this.session.view(e.id).status)).length;
  }
}
