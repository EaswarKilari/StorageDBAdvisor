# StorageDBAdvisor

Picking a database is one of those decisions that's easy to get wrong and hard to undo. I built this little tool to make the choice less overwhelming: you answer a handful of questions about what you're building, and it ranks real databases by how well they fit, explains why, and shows the trade-offs you'd be signing up for.

It's plain HTML, CSS and JavaScript. No framework, no build step, nothing to install.

**Live site:** https://easwarkilari.github.io/StorageDBAdvisor/

## What it does

There are two pages.

The **recommender** (`index.html`) is the main one. You set a few knobs: the kind of workload, data model, whether you read or write more, how strict you need consistency to be, how far it has to scale, how you want to run it, and whether SQL is a must. It scores all 40 databases against your answers and gives you a ranked list. Each result tells you how well it matched, what's good and bad about it for your case, a one-line trade-off, and some basics like the license and how long it's been around.

If you're not sure what a question means, every one of them has a "What do these mean?" toggle that explains the options in plain English. I added that because terms like "eventual consistency" or "embedded deployment" aren't obvious if you haven't run into them before.

The **explorer** (`explore.html`) is for when you just want to look up a single database and see everything about it on one page. Pick one from the list and you get its storage structure, the workloads it's good at, consistency and scaling behaviour, deployment options, license, release year, and so on.

The two pages are linked. Click a database name in the recommender results and it jumps straight to that database's page in the explorer.

## Database vs. storage engine

One thing worth being clear about, because the tool leans on it: a database and a storage engine aren't the same thing.

A database (Postgres, MongoDB, MySQL) is the whole product. It handles connections, understands your queries, plans how to run them, deals with security, and so on. The storage engine is the layer underneath that actually decides how bytes get written to disk, indexed, cached, and kept safe after a crash. InnoDB, WiredTiger and RocksDB are storage engines, not databases.

Most databases hide this from you entirely. But a few (MySQL, MariaDB, MongoDB, SQL Server) let you swap the engine depending on your workload. For those, the recommender goes a step further: it picks the engine that suits what you described and shows the full picture. Say your workload is write-heavy, and it'll suggest MySQL with the MyRocks engine instead of the default InnoDB, and tell you why. Databases that don't give you the choice just show their built-in engine.

If you want to go deeper on the concepts, there's a writeup in [docs/storage-engine-fundamentals.md](docs/storage-engine-fundamentals.md) covering pages, buffer pools, write-ahead logs, B-trees vs LSM-trees, and the usual trade-offs.

## How the matching works

Everything lives in four small files:

- `catalog.js` holds the data. Each database is an object with its attributes (workload fit, data model, read/write lean, consistency, scaling, deployment, SQL support), some metadata like license and popularity, and a trade-off note. Pluggable databases also list their engine options here.
- `app.js` does the scoring and renders the recommender. Your answers become weights, each database earns a fraction of each weight depending on how well it fits, and the totals get sorted.
- `explore.js` renders the single-database property sheet and handles the `explore.html?db=Name` deep links.
- `style.css` is the shared styling.

The scoring is just a weighted sum. Workload fit matters most, then data model, consistency and scaling, with read/write balance, deployment and SQL counting for a bit less. Anything you leave on "No preference" is skipped so it doesn't count for or against anything.

## Running it

Open `index.html` in a browser. That's it.

If you'd rather serve it over HTTP (handy on some setups):

```
python -m http.server 8000
```

then go to http://localhost:8000.

## Files

```
index.html     recommender page
explore.html   single-database explorer
catalog.js     the 40-database catalog
app.js         scoring + recommender rendering
explore.js     explorer rendering + deep links
style.css      styling
docs/          background notes on storage engines
```

## Adding a database

Add an object to `DB_CATALOG` in `catalog.js`, following the format of the existing entries (the attribute values are listed in a comment at the top of the file). New entries show up in both pages automatically. If you use a workload or data-model value that doesn't exist yet, add a matching label in `app.js` and `explore.js` so it displays nicely.

## License

Personal project, built mostly to learn. The databases in the catalog each have their own licenses — check those if you're choosing one for real.
