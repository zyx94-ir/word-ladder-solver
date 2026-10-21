import assert from 'node:assert/strict';
import test from 'node:test';

import { buildWordGraph, normalizeWordList } from '../src/word-list.js';

test('normalizes case, whitespace, CRLF and duplicate entries', () => {
  assert.deepEqual(normalizeWordList(' cold \r\nCORD\r\ncold\n\nword'), [
    'COLD', 'CORD', 'WORD',
  ]);
});

test('rejects punctuation, non-ASCII letters and wrong-length words', () => {
  assert.deepEqual(normalizeWordList([
    'COLD', 'c0ld', "can't", 'café', 'ßabc', 'longer', 'cat', 'a-bc', 'two words',
  ]), ['COLD']);
});

test('accepts iterables, empty lists and explicit word lengths', () => {
  assert.deepEqual(normalizeWordList(new Set(['dog', 'DOG', 'dot']), { length: 3 }), [
    'DOG', 'DOT',
  ]);
  assert.deepEqual(normalizeWordList([]), []);
  assert.deepEqual([...buildWordGraph('cat\ncot', { length: 3 }).get('CAT')], ['COT']);
});

test('reports malformed input and invalid lengths', () => {
  for (const length of [0, -1, 1.5, Infinity, NaN, '4']) {
    assert.throws(() => normalizeWordList([], { length }), RangeError);
  }
  for (const input of [null, undefined, 42, {}]) {
    assert.throws(() => normalizeWordList(input), TypeError);
  }
  assert.throws(() => normalizeWordList(['COLD', 42]), TypeError);
});

test('creates sorted, symmetric edges only for one-letter changes', () => {
  const graph = buildWordGraph(['WORD', 'ZOOM', 'COLD', 'CORD', 'CARD', 'CORD']);
  assert.deepEqual([...graph.get('CORD')], ['CARD', 'COLD', 'WORD']);
  assert.deepEqual([...graph.get('COLD')], ['CORD']);
  assert.deepEqual([...graph.get('ZOOM')], []);
  for (const [word, neighbors] of graph) {
    assert.equal(neighbors.has(word), false);
    for (const next of neighbors) {
      assert.equal(graph.get(next).has(word), true);
      assert.equal([...word].filter((letter, i) => letter !== next[i]).length, 1);
    }
  }
});
