#!/usr/bin/env node
'use strict';
// Sanity-checks the whole curriculum:
//   * every starter.cpp must compile, and must FAIL its tests (an exercise whose
//     starter already passes teaches nothing);
//   * every reference solution must compile and PASS all tests;
//   * the scratch `main` in both must compile and run.
//
// Usage: node scripts/verify.js [id-prefix]

const fs = require('fs');
const os = require('os');
const path = require('path');
const lib = require('../server/lib/curriculum');
const stripAnsi = (s) => String(s).replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, '');
const { Job, getToolchain } = require('../server/lib/runner');

function runJob(opts) {
  return new Promise((resolve) => {
    const job = new Job(opts);
    let output = '';
    job.on('out', (d) => {
      output += d;
    });
    job.on('done', (summary) => resolve({ summary, output }));
    job.start();
  });
}

function passedAll(summary) {
  const r = summary.results;
  return Boolean(summary.compiled && r && r.total > 0 && r.failed === 0 && summary.exitCode === 0 && !summary.timedOut);
}

async function main() {
  const filter = process.argv[2] || '';
  const tc = getToolchain();
  if (!tc.cmd) {
    console.error('No C++ compiler found.');
    process.exit(2);
  }
  console.log(`Compiler: ${tc.version} (${tc.std}, sanitizers ${tc.sanitizers ? 'on' : 'off'})\n`);

  const exercises = lib.allExercises().filter((e) => e.id.startsWith(filter));
  let problems = 0;
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dojo-verify-'));

  for (const ex of exercises) {
    const issues = [];
    const refDir = lib.referenceDir(ex);
    const hasRef = fs.existsSync(path.join(refDir, 'solution.cpp'));
    for (const f of ['exercise.json', 'prompt.md', 'starter.cpp', 'test.cpp']) {
      if (!fs.existsSync(path.join(ex.dir, f))) issues.push(`missing ${f}`);
    }
    if (ex.hints.length < 3) issues.push(`has ${ex.hints.length} hints (want at least 3)`);
    if (!hasRef) issues.push('missing reference/solution.cpp');

    if (!issues.length) {
      // Starter: compiles, fails the tests.
      const starterDir = path.join(tmpRoot, ex.id);
      fs.mkdirSync(starterDir, { recursive: true });
      fs.copyFileSync(path.join(ex.dir, 'starter.cpp'), path.join(starterDir, 'solution.cpp'));
      const s = await runJob({ mode: 'test', workDir: starterDir, exerciseDir: ex.dir });
      if (!s.summary.compiled) issues.push(`starter does not compile:\n${s.output}`);
      else if (passedAll(s.summary)) issues.push('starter already passes every test');
      else if (s.summary.timedOut) issues.push('starter times out (stubs should return immediately)');

      // Reference: compiles and passes.
      const r = await runJob({ mode: 'test', workDir: refDir, exerciseDir: ex.dir });
      if (!r.summary.compiled) issues.push(`reference does not compile:\n${r.output}`);
      else if (!passedAll(r.summary)) issues.push(`reference fails its tests:\n${r.output}`);

      // Scratch mains build and run.
      const sr = await runJob({ mode: 'run', workDir: starterDir, exerciseDir: ex.dir });
      if (!sr.summary.compiled) issues.push(`starter main does not compile:\n${sr.output}`);
      const rr = await runJob({ mode: 'run', workDir: refDir, exerciseDir: ex.dir });
      if (!rr.summary.compiled) issues.push(`reference main does not compile:\n${rr.output}`);
      else if (rr.summary.exitCode !== 0) issues.push(`reference main exited with ${rr.summary.exitCode}:\n${rr.output}`);
    }

    const tag = issues.length ? 'FAIL' : ' ok ';
    console.log(`[${tag}] ${ex.id}`);
    for (const i of issues) console.log(`       ${stripAnsi(i).replace(/\n/g, '\n       ')}`);
    problems += issues.length ? 1 : 0;
  }

  fs.rmSync(tmpRoot, { recursive: true, force: true });
  console.log(`\n${exercises.length - problems} of ${exercises.length} exercises verified.`);
  process.exit(problems ? 1 : 0);
}

main();
