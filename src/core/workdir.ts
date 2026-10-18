import * as fs from 'fs';
import * as path from 'path';
import type { Catalogs } from './catalog';
import { LANGUAGES, isLanguageId } from './languages';
import type { Exercise } from './types';

/**
 * The learner's exercise files: `<root>/<language>/<track>/<exercise>/solution.<ext>`,
 * plus `<root>/.dojo/` for progress and build products. Languages share track and
 * exercise ids, so each gets its own folder.
 */
export class WorkDir {
  constructor(
    readonly root: string,
    private readonly catalogs: Catalogs,
  ) {}

  get metaDir(): string {
    return path.join(this.root, '.dojo');
  }

  get progressFile(): string {
    return path.join(this.metaDir, 'progress.json');
  }

  get buildDir(): string {
    return path.join(this.metaDir, 'build');
  }

  /** Creates `.dojo/` with a .gitignore that keeps build products out of version control. */
  init(): void {
    fs.mkdirSync(this.buildDir, { recursive: true });
    const ignore = path.join(this.metaDir, '.gitignore');
    if (!fs.existsSync(ignore)) fs.writeFileSync(ignore, 'build/\n');
  }

  dirOf(ex: Exercise): string {
    return path.join(this.root, ex.language, ex.track, ex.id);
  }

  solutionPath(ex: Exercise): string {
    return path.join(this.dirOf(ex), LANGUAGES[ex.language].solutionFile);
  }

  /** Creates the solution file from the starter if it does not exist yet. */
  ensureSolution(ex: Exercise): string {
    const file = this.solutionPath(ex);
    if (!fs.existsSync(file)) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, this.catalogs.of(ex).starter(ex));
    }
    return file;
  }

  readCode(ex: Exercise): string {
    try {
      return fs.readFileSync(this.solutionPath(ex), 'utf8');
    } catch {
      return this.catalogs.of(ex).starter(ex);
    }
  }

  writeCode(ex: Exercise, code: string): void {
    const file = this.solutionPath(ex);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, code);
  }

  /** Saves the current solution under history/ (if it differs from the starter) and restores the starter. */
  archiveAndReset(ex: Exercise): string {
    const current = this.readCode(ex);
    const starter = this.catalogs.of(ex).starter(ex);
    if (current.trim() && current !== starter) {
      const hist = path.join(this.dirOf(ex), 'history');
      fs.mkdirSync(hist, { recursive: true });
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const ext = LANGUAGES[ex.language].fileExt;
      // Never overwrite an earlier archive, even if two land in the same millisecond.
      let file = path.join(hist, `${stamp}.${ext}`);
      for (let n = 2; fs.existsSync(file); n++) file = path.join(hist, `${stamp}-${n}.${ext}`);
      fs.writeFileSync(file, current);
    }
    this.writeCode(ex, starter);
    return starter;
  }

  /** Which exercise (if any) a file path in the dojo folder belongs to. */
  exerciseForFile(file: string): Exercise | undefined {
    const rel = path.relative(this.root, file);
    if (rel.startsWith('..') || path.isAbsolute(rel)) return undefined;
    const parts = rel.split(path.sep);
    if (parts.length !== 4 || !isLanguageId(parts[0]) || parts[3] !== LANGUAGES[parts[0]].solutionFile) return undefined;
    const ex = this.catalogs.get(parts[0]).find(parts[2]);
    return ex && ex.track === parts[1] ? ex : undefined;
  }
}
