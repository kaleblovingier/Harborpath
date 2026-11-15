## [project-decomposition — task ID not supplied] HarborPath topology decomposition
- Codebase/domain discoveries: JS browser modules form a 4-module, 17,424-LOC mega-SCC; its members are root-file-only module boundaries, while the `web-js-core` subdirectory diagnostic overlaps other modules.
- Wrong assumptions and corrections: the general `web-views` outlier breakdown's 82,244 LOC is not module LOC; authoritative `--module-loc web-views` reports 9,125 LOC. L1's 43% source coverage gap is accounted for by filtered test files.
- Debugging dead-ends and what actually worked: a repository-specific in-memory adapter allowed L1/L3 to include Swift and map HarborPath's actual module layout without modifying the installed extractor or app.
- Reusable pattern: when an L3 outlier is itself a mandatory locked SCC and module-loc shows no non-overlapping subdirectory boundaries, preserve SCC integrity, record the critical score, and escalate rather than rebalance by violating topology rules.
- Learnings consumed: []

## [project-decomposition follow-up] Pure-star test and SCC edges
- The periphery hub-ratio explicitly drops edges touching a locked mega-SCC; the Path A pure-star rule separately requires that no leaf outbound edge escapes `{H ∪ leaves}`.
- An alternative L3 grouping scored 2.08 only after treating `node-build-tools→web-js-core` as ignorable and merging the hub with its leaves. It was rejected because that edge still crosses to G1, so the stated no-escaping-edges safety condition is not met under a full-boundary reading.
- The project guidance does not explicitly resolve whether the pure-star test should ignore SCC-touching edges; keep the topology blocked and request coordinator interpretation rather than silently accepting the numeric pass.
- Learnings consumed: [architect/locked-scc-outlier]

## [t2] HarborPath technical seams and safety constraints
- Codebase/domain discoveries: HarborPath is a zero-dependency Node server and browser-native ES-module SPA; its router, synchronous Quick Exit reset path, modular i18n, and service-worker shell are the main frontend integration seams.
- Wrong assumptions and corrections: the task brief said the worktree was clean, but pre-edit `git status` showed modified/deleted/untracked files from other work; preserved them and notified the coordinator.
- Debugging dead-ends and what actually worked: no source change or runtime test was appropriate for this bounded architecture handoff; mapping the app modules and existing tests provided actionable seams without deciding the feature owned by PM.
- Reusable pattern: keep the frontend integration lead as sole owner of shared route/state/locale/style/offline changes; for ephemeral state, make Quick Exit reset synchronous and invalidate pending writes so delayed callbacks cannot repopulate cleared state.
- Learnings consumed: [] (no architect learning applied; locked-scc-outlier was unrelated)
