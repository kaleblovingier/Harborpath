# HarborPath SPA reset boundary

HarborPath views should keep clinical/session state ephemeral and synchronously invalidate delayed writes when Quick Exit clears the app.

## What Happened
During HarborPath task t2, the router and reset flow showed that loaded views participate in Quick Exit through synchronous reset handlers, while delayed callbacks can otherwise outlive a reset.

## Takeaway
For a stateful view, export an idempotent synchronous reset, clear the view's rendered state, and invalidate pending async completions with a revision/generation guard or cancellation. Test a pre-reset deferred callback resolving after reset. Keep clinical answers out of URLs, storage, requests, and logs.

## History
- 2026-11-12 (HarborPath/t2): initial
