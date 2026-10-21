import { readFile } from 'node:fs/promises';

import { shortestLadder } from '../src/solver.js';
import { buildWordGraph } from '../src/word-list.js';

const [start = 'TINY', target = 'MEND', wordListPath] = process.argv.slice(2);
const input = await readFile(
  wordListPath ?? new URL('./words.txt', import.meta.url),
  'utf8',
);
const graph = buildWordGraph(input);
const path = shortestLadder(start, target, graph);

if (path === null) {
  console.log('No ladder found in this word list. Both endpoints must be included.');
  process.exitCode = 1;
} else {
  console.log(path.join(' → '));
  console.log(`${path.length - 1} moves`);
}
