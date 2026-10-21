import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { shortestLadder } from '../src/solver.js';
import { buildWordGraph } from '../src/word-list.js';

const words = await readFile(new URL('../examples/words.txt', import.meta.url), 'utf8');
const graph = buildWordGraph(words);

test('finds the documented TINY to MEND solution', () => {
  assert.deepEqual(shortestLadder('TINY', 'MEND', graph), [
    'TINY', 'TINS', 'TENS', 'TEND', 'MEND',
  ]);
});

test('selects a reproducible shortest route when alternatives exist', () => {
  assert.deepEqual(shortestLadder('COLD', 'WARM', graph), [
    'COLD', 'CORD', 'CARD', 'WARD', 'WARM',
  ]);
  assert.deepEqual(shortestLadder('FULL', 'GOOD', graph), [
    'FULL', 'FILL', 'GILL', 'GILD', 'GOLD', 'GOOD',
  ]);
});

test('handles direct, same-word and normalized queries', () => {
  assert.deepEqual(shortestLadder(' cold ', 'cord', graph), ['COLD', 'CORD']);
  assert.deepEqual(shortestLadder('COLD', 'COLD', graph), ['COLD']);
});

test('returns null for missing endpoints, disconnected words and bad queries', () => {
  assert.equal(shortestLadder('XXXX', 'XXXX', graph), null);
  assert.equal(shortestLadder('COLD', 'XXXX', graph), null);
  assert.equal(shortestLadder('COLD', 'ZOOM', graph), null);
  assert.equal(shortestLadder('COLD', 'WARM', new Map()), null);
  assert.equal(shortestLadder(null, 'WARM', graph), null);
  assert.equal(shortestLadder('COLD', undefined, graph), null);
  assert.throws(() => shortestLadder('COLD', 'WARM', {}), TypeError);
});

test('does not mutate the graph across repeated queries', () => {
  const before = structuredClone(graph);
  shortestLadder('COLD', 'WARM', graph);
  shortestLadder('WARM', 'COLD', graph);
  assert.deepEqual(graph, before);
});

test('matches independent all-pairs distances for every subset of a small graph', () => {
  // Synthetic strings deliberately test graph structure without dictionary assumptions.
  const universe = ['AAA', 'AAB', 'ABA', 'ABB', 'BAA', 'BAB', 'BBA', 'BBB'];
  for (let mask = 0; mask < 2 ** universe.length; mask += 1) {
    const subset = universe.filter((_, index) => mask & (1 << index));
    const candidateGraph = buildWordGraph(subset, { length: 3 });
    // Floyd-Warshall is an independent oracle: no wildcard buckets and no BFS.
    const distance = subset.map((a, i) => subset.map((b, j) => {
      if (i === j) return 0;
      return [...a].filter((letter, p) => letter !== b[p]).length === 1 ? 1 : Infinity;
    }));
    for (let k = 0; k < subset.length; k += 1) {
      for (let i = 0; i < subset.length; i += 1) {
        for (let j = 0; j < subset.length; j += 1) {
          distance[i][j] = Math.min(distance[i][j], distance[i][k] + distance[k][j]);
        }
      }
    }
    for (let i = 0; i < subset.length; i += 1) {
      for (let j = 0; j < subset.length; j += 1) {
        const path = shortestLadder(subset[i], subset[j], candidateGraph);
        if (!Number.isFinite(distance[i][j])) {
          assert.equal(path, null);
          continue;
        }
        assert.equal(path.length - 1, distance[i][j]);
        assert.equal(path[0], subset[i]);
        assert.equal(path.at(-1), subset[j]);
        for (let step = 1; step < path.length; step += 1) {
          assert.equal(subset.includes(path[step]), true);
          assert.equal([...path[step]].filter((c, p) => c !== path[step - 1][p]).length, 1);
        }
      }
    }
  }
});
