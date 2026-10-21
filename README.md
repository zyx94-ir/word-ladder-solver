# Word Ladder Solver

A small, dependency-free JavaScript **word ladder solver** using breadth-first search (BFS). Includes word-list normalization, wildcard indexing, runnable examples, and tests.

**Try the online [Word Ladder Solver](https://wordladderdaily.com/solver)**, or play the daily puzzle at [Word Ladder Daily](https://wordladderdaily.com/).

```text
TINY → TINS → TENS → TEND → MEND
4 moves
```

This repository is a standalone educational implementation of the algorithm behind a word ladder. It contains a small demonstration word list, not the website application or its complete vocabulary. Results depend on the dictionary you provide.

## Run it

Requires Node.js 20 or later. No dependency installation, API key, or network request is needed to run the example or tests.

```bash
git clone https://github.com/zyx94-ir/word-ladder-solver.git
cd word-ladder-solver
node examples/solve.js
node examples/solve.js COLD WARM
node --test
```

To use your own word list, pass a UTF-8 text file with one word per line:

```bash
node examples/solve.js COLD WARM ./my-words.txt
```

The example accepts four-letter words. The underlying library also supports other word lengths using the `length` option.

## Use the functions

```js
import { shortestLadder } from './src/solver.js';
import { buildWordGraph } from './src/word-list.js';

const graph = buildWordGraph([
  'cold', 'cord', 'card', 'word', 'ward', 'warm',
]);

const path = shortestLadder('COLD', 'WARM', graph);
console.log(path);
// ['COLD', 'CORD', 'CARD', 'WARD', 'WARM']
console.log(path.length - 1); // 4 moves
```

Both source files use standard JavaScript and can also be imported as browser ES modules. The example script uses Node.js only to read a local text file.

## How a word ladder works

1. Start and finish with words of the same length.
2. Change exactly one letter at each move; positions stay fixed.
3. Every word, including both endpoints, must be in the supplied dictionary.

The solver returns **one shortest path** including both endpoints. The number of moves is `path.length - 1`. It returns `null` when either endpoint is missing or the words are disconnected. A valid word transformed into itself takes zero moves and returns `[word]`.

## Why BFS finds a shortest path

Treat each word as a graph vertex. Connect two words when they differ at exactly one letter position. Each edge costs one move, so the graph is unweighted.

BFS visits words in layers: zero moves away, then one, then two, and so on. When it reaches the target, no shorter route remains unexplored. A parent map records how each word was first discovered, allowing the path to be reconstructed without keeping a full path in every queue entry.

A queue cursor avoids repeatedly removing the first array element. Words are marked visited when enqueued, so cycles do not cause repeated work.

For an already-built graph with `V` words and `E` edges, a search takes `O(V + E)` time in the worst case and `O(V)` additional space. Graph construction is a separate cost.

## Word-list processing

`normalizeWordList(input, { length: 4 })` accepts either a newline-separated string or an iterable of strings. It:

- Trims whitespace and accepts ASCII letters only.
- Keeps words of the requested length and converts them to uppercase.
- Removes duplicates and returns a sorted array.
- Skips blank, malformed, non-ASCII and wrong-length words; non-string entries throw a `TypeError`.

`buildWordGraph(input, options)` normalizes the list and groups words by wildcard patterns. For example, `COLD` produces `*OLD`, `C*LD`, `CO*D`, and `COL*`. Words sharing a pattern become neighbors. Neighbor lists are sorted so ties yield a reproducible solution.

The normalizer checks spelling format, not whether a string is an English word. Your input dictionary defines which words are accepted. Use a dictionary whose license permits your intended use; this project does not download or bundle a third-party dictionary.

The graph stores all adjacency lists, which is convenient for repeated queries on a small dictionary. For a very large dictionary, generating neighbors during the search can reduce stored graph data.

## Tests

```bash
node --test
```

Tests cover normalization, duplicate words, invalid input, one-letter edges, disconnected components, same-word queries, deterministic ties, and non-mutation. An exhaustive small-graph test compares shortest paths against an independent Floyd-Warshall implementation across all 256 subsets of an eight-vertex graph.

## Project scope and license

MIT applies only to the independently authored files in this repository. The repository contains no website framework, authentication, billing, deployment configuration, website assets, production word list, or daily-puzzle content. It does not grant rights to the Word Ladder Daily website or any third-party software.

The `.gitignore` intentionally allowlists the standalone files. New files must be explicitly allowed before they can be committed.
