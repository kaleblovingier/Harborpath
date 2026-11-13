# HarborPath Care Companion

A standalone companion for planning a first step toward substance use care or supporting someone who is looking for care. It links to the existing HarborPath platform and FindTreatment.gov for directories; it makes no provider requests itself. Guide checkmarks live in page memory and clear on reload. The site collects no personal details and uses no analytics or browser storage.

Run a local preview from this directory:

```sh
python -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open <http://127.0.0.1:4173>. There is no build or dependency installation. `dist/` is the authored source and is tracked deliberately; `.openai/hosting.json` configures it as the static root for the private Sites project. The existing HarborPath deployment is independent.
