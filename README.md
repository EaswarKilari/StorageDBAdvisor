# DBAdvisor

A lightweight, no-build web tool that helps you **choose the right database** for a
project. Tweak a few knobs describing your requirements and get real-world databases
**ranked by how well they match**, each with a match score, trade-off note, and a full
property sheet.

> Built as a decision-support tool on top of a structured catalog of 40 real-world
> databases and the storage-engine concepts that define them.

---

## Features

- **Recommender** (`index.html`) — pick your workload, data model, read/write balance,
  consistency, scale, deployment, and SQL need; get a ranked list with a percentage
  match, pros/cons, a one-line **trade-off**, and license/maturity/popularity metadata.
- **Explorer** (`explore.html`) — select any of the 40 databases to view a full
  property sheet: storage structure, best-fit workloads, data model(s), read/write
  profile, consistency, scaling, deployment options, SQL support, license, release
  year, popularity, cloud availability, and the key trade-off.
- **Clickable results** — each recommended database links straight to its property
  sheet in the Explorer.
- **Plain-language explanations** — every question and option has a "What do these
  mean?" expander so non-experts can answer confidently.

---

## Storage engine vs. database

This project distinguishes between two layers:

| Layer | Role | Examples |
|---|---|---|
| **Database (DBMS)** | The full product: client connections, query language/parser, planner, security, and storage | PostgreSQL, MySQL, MongoDB |
| **Storage engine** | *How* data is physically stored, indexed, cached, and made durable | InnoDB, WiredTiger, RocksDB |

The catalog lists **databases**; the `structure` field shown for each describes its
**storage engine** (e.g., B+ Tree, LSM-Tree, heap, columnar). See
[`docs/storage-engine-fundamentals.md`](docs/storage-engine-fundamentals.md) for the
underlying concepts (pages, buffer pool, WAL, ACID, read/write/space amplification,
B-tree vs LSM vs columnar, and more).

---

## How it works

1. **`catalog.js`** — a structured catalog of 40 databases. Each entry has scored
   attributes (workloads, data model, read/write profile, consistency, scaling,
   deployment, SQL) plus metadata (license, release year, popularity, clouds) and a
   trade-off note.
2. **`app.js`** — a **weighted scoring engine**. Your form answers become weights; each
   database is scored per criterion, ranked, and annotated with human-readable reasons.
3. **`explore.js`** — renders the per-database property sheet and supports deep links
   via `explore.html?db=<name>`.
4. **`index.html` / `explore.html` / `style.css`** — the UI. Pure HTML/CSS/JS, **no
   build step and no dependencies**.

### Scoring model (summary)

Each criterion contributes a weighted fraction of the total score:

| Criterion | Weight |
|---|---|
| Workload | 30 |
| Data model | 15 |
| Consistency | 15 |
| Scaling | 15 |
| Read/write balance | 10 |
| Deployment | 10 |
| SQL | 10 |

Criteria set to "No preference" are skipped and don't count against any database.

---

## Running locally

No server or build is required — just open the file:

```text
Open index.html in any modern browser.
```

Or, if you prefer serving over HTTP (optional):

```powershell
# Python 3
python -m http.server 8000
# then visit http://localhost:8000
```

---

## Project structure

```text
.
├── index.html     # Recommender page (knobs + ranked results)
├── explore.html   # Explorer page (per-database property sheet)
├── catalog.js     # Structured catalog of 40 databases
├── app.js         # Weighted scoring engine + results rendering
├── explore.js     # Property-sheet rendering + deep links
├── style.css      # Shared styling
└── docs/
    └── storage-engine-fundamentals.md   # Research: how storage engines work
```

---

## Extending the catalog

To add a database, append an entry to `window.DB_CATALOG` in `catalog.js` using the
attribute vocabulary documented at the top of that file. New entries automatically
appear in **both** the recommender and the explorer. Keep the vocabulary values in sync
with the label maps in `app.js` and `explore.js`.

---

## Roadmap

- [x] Weighted scoring recommender over a structured catalog
- [x] Per-database explorer with full property sheets
- [x] 40-database catalog with license/maturity/popularity/cloud metadata
- [x] Trade-off notes and clickable results
- [ ] Deploy to GitHub Pages
- [ ] Search/filter in the explorer
- [ ] "Compare top matches" side-by-side view
- [ ] User-weighted priorities (choose which criteria matter most)
- [ ] Move catalog to JSON + validation + tests

---

## License

Personal/educational project. See individual databases in the catalog for their own
licenses.
