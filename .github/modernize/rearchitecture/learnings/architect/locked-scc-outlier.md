# Locked SCC Outlier

When a topology group's L3 outlier is an indivisible mega-SCC, inspect every member's authoritative `--module-loc` breakdown before attempting a split.

## What Happened
During HarborPath project-decomposition, L3 flagged a 17,424-LOC group containing four mutually dependent browser modules. The mega-SCC rule required those modules to remain together. Three module directories contained only root source files; the fourth was a flat root module whose diagnostic also counted the already-separate child modules. Treating those children as split units would overlap L1 modules, while splitting SCC members across groups would violate SCC integrity.

## Takeaway
Do not merge or divide groups solely to make the outlier ratio pass when that breaks the topology rules. Verify subdirectory LOC with `--module-loc`, document overlap/no-boundary evidence, keep the L3 score visible, and request manual review when no clean split exists.

When a locked mega-SCC is removed for periphery statistics, distinguish that rule from the Path A pure-star safety test. If a candidate leaf edge still crosses from `{H ∪ leaves}` into the SCC group, do not claim the resulting group has no escaping cross-group edges; report the alternative L3 score as diagnostic only and ask the coordinator to clarify the intended edge scope.

## History
- 2026-11-11 (HarborPath / project-decomposition, task ID not supplied): initial
- 2026-11-12 (HarborPath / project-decomposition follow-up, task ID not supplied): documented SCC-touching-edge ambiguity in the Path A pure-star test
