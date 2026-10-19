import * as fs from 'fs';
import * as vscode from 'vscode';
import { stripAnsi } from './core/diagnostics';
import type { Exercise } from './core/types';
import type { Exercises, RunRecord } from './exercises';
import type { Session } from './session';

const pretty = (name: string) => name.replace(/_/g, ' ');

/**
 * Shows every exercise of the current language in VS Code's Test Explorer, with each
 * test case as a child, and runs them with the language's backend from the core library.
 */
export class Testing implements vscode.Disposable {
  readonly controller: vscode.TestController;
  private readonly profile: vscode.TestRunProfile;
  private readonly items = new Map<string, vscode.TestItem>();
  private readonly disposables: vscode.Disposable[] = [];

  constructor(
    private readonly session: Session,
    private readonly exercises: Exercises,
    private readonly onSolved: (ex: Exercise, record: RunRecord) => void,
  ) {
    this.controller = vscode.tests.createTestController('dojo', 'Learning Dojo');
    this.profile = this.controller.createRunProfile('Run Exercise Tests', vscode.TestRunProfileKind.Run, (req, token) => this.handle(req, token), true);
    this.disposables.push(
      this.controller,
      session.onDidChangeFolder(() => this.rebuild()),
      session.onDidChangeLanguage(() => this.rebuild()),
      session.onDidChangeProgress(() => this.decorate()),
    );
    this.rebuild();
  }

  /** (Re)creates the item tree. Exercise items point at the learner's solution file. */
  rebuild(): void {
    this.controller.items.replace([]);
    this.items.clear();
    if (!this.session.root) return;
    const catalog = this.session.catalog;
    for (const track of catalog.tracks()) {
      const trackItem = this.controller.createTestItem(`track:${track.id}`, track.title);
      for (const ex of track.exercises) {
        const uri = this.session.work ? vscode.Uri.file(this.session.work.solutionPath(ex)) : undefined;
        const exItem = this.controller.createTestItem(ex.id, ex.title, uri);
        for (const name of catalog.testNames(ex)) {
          const child = this.controller.createTestItem(`${ex.id}::${name}`, pretty(catalog.pack.resultName(name)));
          exItem.children.add(child);
        }
        trackItem.children.add(exItem);
        this.items.set(ex.id, exItem);
      }
      this.controller.items.add(trackItem);
    }
    this.decorate();
  }

  private decorate(): void {
    for (const [id, item] of this.items) {
      const status = this.session.view(id).status;
      item.description = status === 'new' ? undefined : status.replace('-', ' ');
    }
  }

  /** Runs one exercise's tests through the Test Explorer, so results appear in the Testing views. */
  async runExercise(ex: Exercise): Promise<void> {
    const item = this.items.get(ex.id);
    if (!item) return;
    const request = new vscode.TestRunRequest([item], undefined, this.profile);
    const source = new vscode.CancellationTokenSource();
    try {
      await vscode.commands.executeCommand('workbench.panel.testResults.view.focus').then(undefined, () => undefined);
    } catch {
      /* the results view id differs between versions; the run still works */
    }
    await this.profile.runHandler(request, source.token);
    source.dispose();
  }

  private exerciseOf(item: vscode.TestItem): Exercise | undefined {
    let cur: vscode.TestItem | undefined = item;
    while (cur) {
      const ex = this.session.catalog.find(cur.id);
      if (ex) return ex;
      cur = cur.parent;
    }
    return undefined;
  }

  private async handle(request: vscode.TestRunRequest, token: vscode.CancellationToken): Promise<void> {
    const run = this.controller.createTestRun(request);
    const list = this.selectExercises(request);

    for (const ex of list) {
      const item = this.items.get(ex.id);
      if (!item) continue;
      run.enqueued(item);
      item.children.forEach((c) => run.enqueued(c));
    }

    for (const ex of list) {
      const item = this.items.get(ex.id);
      if (!item) continue;
      if (token.isCancellationRequested) {
        run.skipped(item);
        continue;
      }
      run.started(item);
      item.children.forEach((c) => run.started(c));
      let record: RunRecord | undefined;
      try {
        record = await this.exercises.runTests(ex, run, token);
      } catch (e) {
        run.errored(item, new vscode.TestMessage(`Something went wrong while running the tests: ${(e as Error).message}`));
        continue;
      }
      this.report(run, ex, item, record);
      if (record?.passedAll && list.length === 1) this.onSolved(ex, record);
    }
    run.end();
  }

  private selectExercises(request: vscode.TestRunRequest): Exercise[] {
    const picked = new Map<string, Exercise>();
    const add = (item: vscode.TestItem) => {
      const ex = this.exerciseOf(item);
      if (ex) picked.set(ex.id, ex);
      else item.children.forEach(add); // a track: take its exercises
    };
    if (request.include) {
      request.include.forEach(add);
    } else {
      // "Run all": only exercises the learner has started, so untouched ones are not counted as attempts.
      for (const ex of this.session.catalog.all()) {
        if (this.session.work && fs.existsSync(this.session.work.solutionPath(ex))) picked.set(ex.id, ex);
      }
    }
    for (const item of request.exclude ?? []) {
      const ex = this.exerciseOf(item);
      if (ex) picked.delete(ex.id);
    }
    return [...picked.values()];
  }

  private report(run: vscode.TestRun, ex: Exercise, item: vscode.TestItem, record: RunRecord | undefined): void {
    const skipChildren = () => item.children.forEach((c) => run.skipped(c));
    if (!record || record.cancelled) {
      run.skipped(item);
      skipChildren();
      return;
    }
    if (!record.compiled) {
      run.errored(item, new vscode.TestMessage('Did not compile. The compiler messages are in the output and in the Problems panel.'));
      skipChildren();
      return;
    }
    if (!record.results) {
      const why = record.timedOut
        ? 'Timed out. Check for an infinite loop.'
        : record.signal
          ? `The tests crashed (${record.signal}). The output shows the line that failed.`
          : `The tests stopped early (exit code ${record.exitCode}). The output shows where.`;
      run.errored(item, new vscode.TestMessage(why));
      skipChildren();
      return;
    }
    const byName = new Map(record.results.tests.map((t) => [t.name, t]));
    const catalog = this.session.catalogs.of(ex);
    for (const name of catalog.testNames(ex)) {
      const child = item.children.get(`${ex.id}::${name}`);
      if (!child) continue;
      const outcome = byName.get(catalog.pack.resultName(name));
      if (!outcome) run.skipped(child);
      else if (outcome.ok) run.passed(child);
      else run.failed(child, new vscode.TestMessage(stripAnsi(outcome.message).replace(/^\n+/, '')));
    }
  }

  dispose(): void {
    for (const d of this.disposables) d.dispose();
  }
}
