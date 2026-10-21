/**
 * Normalize a newline-separated string or iterable of words.
 * Keep unique ASCII words of the requested length, sorted in uppercase.
 * Blank lines, punctuation, accented words and wrong-length entries are skipped.
 */
export function normalizeWordList(input, { length = 4 } = {}) {
  if (!Number.isSafeInteger(length) || length < 1) {
    throw new RangeError('Word length must be a positive safe integer.');
  }
  const entries = typeof input === 'string' ? input.split(/\r?\n/) : input;
  if (entries == null || typeof entries[Symbol.iterator] !== 'function') {
    throw new TypeError('Provide a word-list string or an iterable of strings.');
  }

  const words = new Set();
  for (const entry of entries) {
    if (typeof entry !== 'string') {
      throw new TypeError('Every word-list entry must be a string.');
    }
    const trimmed = entry.trim();
    // Validate before uppercasing: Unicode case folding can change word length.
    if (trimmed.length === length && /^[a-z]+$/i.test(trimmed)) {
      words.add(trimmed.toUpperCase());
    }
  }
  return [...words].sort();
}

/** Build an undirected graph of words that differ at exactly one position. */
export function buildWordGraph(input, options) {
  const words = normalizeWordList(input, options);
  const graph = new Map(words.map((word) => [word, new Set()]));
  const buckets = new Map();

  for (const word of words) {
    for (let position = 0; position < word.length; position += 1) {
      const pattern = word.slice(0, position) + '*' + word.slice(position + 1);
      if (!buckets.has(pattern)) buckets.set(pattern, []);
      buckets.get(pattern).push(word);
    }
  }

  for (const bucket of buckets.values()) {
    for (let left = 0; left < bucket.length; left += 1) {
      for (let right = left + 1; right < bucket.length; right += 1) {
        graph.get(bucket[left]).add(bucket[right]);
        graph.get(bucket[right]).add(bucket[left]);
      }
    }
  }

  // Stable neighbor order makes equal-length solutions reproducible.
  for (const [word, neighbors] of graph) {
    graph.set(word, new Set([...neighbors].sort()));
  }
  return graph;
}
