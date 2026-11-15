## [t5] Added listener-level keyboard regression coverage and validated frontend
- Codebase/domain discoveries: `test/navigation.test.js` already had source-shape assertions for Escape behavior; a small `node:vm` harness can execute the registered listener itself with deterministic time and injected navigation controls without importing/altering production code.
- Wrong assumptions and corrections: the repository working tree was not clean at validation start; t4 source and orchestration changes were already present and left untouched.
- Debugging dead-ends and what actually worked: an initial harness boundary expected LF blank lines; the file contains mixed line endings, so locating the next listener by its stable identifier made extraction robust.
- Techniques/patterns worth reusing for future tasks: capture actual event callbacks from source with `node:vm`, supply only the closure dependencies, and use a fake clock to test keyboard-sequence boundaries deterministically.
- Learnings consumed: (none)
