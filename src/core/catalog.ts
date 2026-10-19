import * as fs from 'fs';
import * as path from 'path';
import { LANGUAGES, LANGUAGE_IDS, type LanguagePack } from './languages';
import type { Exercise, LanguageId, Track, TrackMeta } from './types';

export const ID_RE = /^[a-z][a-z0-9-]{1,60}$/;

function readJson<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

/**
 * One language's exercise catalogue, `languages/<id>/` inside the extension. It is
 * read-only: learners' files live in their dojo folder, never here.
 */
export class Catalog {
  private cache: Track[] | null = null;

  constructor(
    readonly contentDir: string,
    readonly pack: LanguagePack,
  ) {}

  get language(): LanguageId {
    return this.pack.id;
  }

  get includeDir(): string {
    return path.join(this.contentDir, 'include');
  }

  tracks(): Track[] {
    if (this.cache) return this.cache;
    const metas = readJson<TrackMeta[]>(path.join(this.contentDir, 'exercises', 'tracks.json'), []);
    this.cache = metas.map((meta) => {
      const trackDir = path.join(this.contentDir, 'exercises', meta.id);
      let names: string[] = [];
      try {
        names = fs
          .readdirSync(trackDir, { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => d.name)
          .sort();
      } catch {
        /* a missing track directory just shows up empty */
      }
      const exercises = names.map((n) => this.load(meta.id, n)).filter((e): e is Exercise => e !== null);
      return { ...meta, exercises };
    });
    return this.cache;
  }

  private load(track: string, id: string): Exercise | null {
    const dir = path.join(this.contentDir, 'exercises', track, id);
    const meta = readJson<Partial<Exercise> | null>(path.join(dir, 'exercise.json'), null);
    if (!meta) return null;
    return {
      id,
      track,
      language: this.pack.id,
      dir,
      title: meta.title || id,
      summary: meta.summary || '',
      concepts: meta.concepts || [],
      minutes: meta.minutes ?? null,
      hints: Array.isArray(meta.hints) ? meta.hints : [],
    };
  }

  all(): Exercise[] {
    return this.tracks().flatMap((t) => t.exercises);
  }

  find(id: string): Exercise | undefined {
    if (!ID_RE.test(id)) return undefined;
    return this.all().find((e) => e.id === id);
  }

  trackOf(ex: Exercise): Track | undefined {
    return this.tracks().find((t) => t.id === ex.track);
  }

  /** The exercise after `id` in curriculum order for which `wanted` holds, wrapping around. */
  nextAfter(id: string, wanted: (e: Exercise) => boolean): Exercise | undefined {
    const all = this.all();
    const i = all.findIndex((e) => e.id === id);
    const order = i < 0 ? all : all.slice(i + 1).concat(all.slice(0, i));
    return order.find(wanted);
  }

  prompt(ex: Exercise): string {
    try {
      return fs.readFileSync(path.join(ex.dir, 'prompt.md'), 'utf8');
    } catch {
      return '*This exercise has no prompt yet.*';
    }
  }

  starter(ex: Exercise): string {
    return fs.readFileSync(path.join(ex.dir, this.pack.starterFile), 'utf8');
  }

  testFile(ex: Exercise): string {
    return path.join(ex.dir, this.pack.testFile);
  }

  /** Names of the test cases (C++ TEST(...), Go Test functions), in the order they run. */
  testNames(ex: Exercise): string[] {
    try {
      return this.pack.testNames(fs.readFileSync(this.testFile(ex), 'utf8'));
    } catch {
      return [];
    }
  }

  referenceDir(ex: Exercise): string {
    return path.join(this.contentDir, 'reference', ex.id);
  }

  reference(ex: Exercise): string | null {
    try {
      return fs.readFileSync(path.join(this.referenceDir(ex), this.pack.solutionFile), 'utf8');
    } catch {
      return null;
    }
  }
}

/** The catalogues of every language, side by side. */
export class Catalogs {
  private readonly byLanguage = new Map<LanguageId, Catalog>();

  /** `languagesDir` holds one folder per language id (`languages/cpp`, `languages/go`). */
  constructor(readonly languagesDir: string) {
    for (const id of LANGUAGE_IDS) this.byLanguage.set(id, new Catalog(path.join(languagesDir, id), LANGUAGES[id]));
  }

  get(id: LanguageId): Catalog {
    return this.byLanguage.get(id) as Catalog;
  }

  /** The catalogue an exercise belongs to. */
  of(ex: Pick<Exercise, 'language'>): Catalog {
    return this.get(ex.language);
  }
}
