/**
 * Find one shortest ladder in a graph produced by buildWordGraph().
 * Returns both endpoints, or null for missing words or disconnected components.
 * Start and target are trimmed and uppercased; the graph is not mutated.
 */
export function shortestLadder(start, target, graph) {
  if (!(graph instanceof Map)) {
    throw new TypeError('Expected a word graph created by buildWordGraph().');
  }
  if (typeof start !== 'string' || typeof target !== 'string') return null;
  const source = start.trim().toUpperCase();
  const destination = target.trim().toUpperCase();
  if (!graph.has(source) || !graph.has(destination)) return null;

  const queue = [source];
  const parent = new Map([[source, null]]);
  for (let head = 0; head < queue.length; head += 1) {
    const word = queue[head];
    if (word === destination) {
      const path = [];
      for (let current = word; current !== null; current = parent.get(current)) {
        path.push(current);
      }
      return path.reverse();
    }

    for (const neighbor of graph.get(word)) {
      if (parent.has(neighbor)) continue;
      parent.set(neighbor, word);
      queue.push(neighbor);
    }
  }
  return null;
}
