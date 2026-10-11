# Storage Engine Fundamentals — Research Draft

> A primer compiled for the StorageEngine project. Goal: understand how storage
> engines work, the properties they must provide, and how those properties
> characterize real-world databases — before writing any code.

---

## 1. What is a storage engine?

A **storage engine** is the layer of a database that is responsible for *how
data is physically stored on disk (and cached in memory), how it is read back,
and how it stays correct and durable across crashes and concurrent access*.

It sits **below** the query layer. A typical database is split into:

- **Query / execution layer** — parses SQL (or an API call), plans, and
  executes operations.
- **Storage engine** — turns logical read/write requests into physical page
  reads/writes, manages indexes, transactions, locking, and recovery.

The same query layer can often run on top of *different* storage engines
(e.g., MySQL can use InnoDB or MyRocks; MongoDB uses WiredTiger).

---

## 2. Core components of a storage engine

| Component | Responsibility |
|---|---|
| **Page / block manager** | Data on disk is organized in fixed-size **pages** (commonly 4KB–16KB). The page manager allocates, reads, and writes these. |
| **Buffer pool (page cache)** | In-memory cache of hot pages. Reads check the buffer pool first; writes are often applied in memory and flushed later. Minimizes slow disk I/O. |
| **Data layout / record format** | How rows/tuples are packed into a page — commonly a **slotted page** (a slot directory of pointers at the page header + variable-length records growing from the end). |
| **Indexes** | Auxiliary structures (B+ trees, hash indexes, LSM trees) that map keys → record locations so lookups don't scan everything. |
| **Write-Ahead Log (WAL) / journal** | An append-only log written **before** changes hit the main data files. The foundation of durability and crash recovery. |
| **Transaction / concurrency manager** | Enforces isolation between concurrent transactions via locking and/or MVCC. |
| **Recovery manager** | On restart, replays/undoes the WAL to bring the database back to a consistent state (e.g., ARIES-style redo/undo). |
| **Compaction / vacuum (GC)** | Reclaims space from deleted/obsolete data (LSM compaction, Postgres `VACUUM`). |

### The read path (simplified)
1. Request a key/row.
2. Consult an **index** to find the page.
3. Look in the **buffer pool**; if missing, read the page from disk into it.
4. Extract the record from the page and return it.

### The write path (simplified)
1. Write the change to the **WAL** and `fsync` it (durability point).
2. Apply the change to the page in the **buffer pool** (now "dirty").
3. Later, a background flush/checkpoint writes dirty pages to the data files.

---

## 3. The properties a storage engine must provide

These are the "set of properties" that define a storage engine's character.

### 3.1 ACID transactional properties
- **Atomicity** — a transaction is all-or-nothing. Implemented via WAL
  (undo logging / rollback).
- **Consistency** — transactions move the DB from one valid state to another
  (constraints, invariants hold).
- **Isolation** — concurrent transactions don't corrupt each other's view.
  Implemented via locking and/or MVCC. Governed by **isolation levels**
  (Read Uncommitted → Read Committed → Repeatable Read → Serializable).
- **Durability** — once committed, data survives crashes/power loss.
  Implemented via WAL + `fsync`, checkpoints, and (in InnoDB) the doublewrite
  buffer to guard against torn pages.

### 3.2 Durability & crash recovery mechanisms
- **Write-Ahead Logging (WAL)** — log the intent before mutating data files.
- **Checkpointing** — periodically flush dirty pages so recovery doesn't need
  to replay the entire log.
- **Redo / Undo logging** — redo reapplies committed changes lost before flush;
  undo rolls back uncommitted changes found during recovery.

### 3.3 Concurrency control
- **Locking** (pessimistic) — row-level / page-level / table-level locks.
- **MVCC (Multi-Version Concurrency Control)** — keep multiple versions of a
  row so readers never block writers and vice versa (Postgres, InnoDB,
  Oracle). Requires garbage collection of old versions (VACUUM / purge).

### 3.4 Performance properties (the fundamental tradeoff)
- **Read amplification** — how much extra data must be read per logical read.
- **Write amplification** — how many physical writes per logical write.
- **Space amplification** — how much extra disk is used vs. logical data size.

> You cannot minimize all three at once — storage engine design is largely
> about *choosing which amplification to pay*.

### 3.5 Other practical properties
- Compression & encryption support
- Range scan vs. point lookup efficiency
- Secondary index support
- Embeddability (library) vs. client/server
- Horizontal scalability / replication hooks

---

## 4. The main data structures (and why they matter)

### 4.1 B-Tree / B+ Tree
- **Shape:** a single, balanced, sorted, mutable tree updated **in place**.
- **Reads:** fast and predictable — a few seeks per lookup; **low read
  amplification**; great for range scans.
- **Writes:** random I/O; node splits; **moderate-to-high write amplification**.
- **Best for:** read-heavy / mixed OLTP workloads.

### 4.2 LSM-Tree (Log-Structured Merge-tree)
- **Shape:** buffer writes in an in-memory **memtable**, flush as immutable
  sorted **SSTables**, and **compact** (merge) them in the background.
- **Reads:** may touch several SSTables → **higher read amplification**
  (mitigated by Bloom filters, caching, tuned compaction).
- **Writes:** sequential, batched → **high write throughput** (compaction adds
  write amplification, but avoids random I/O).
- **Best for:** write-heavy / high-ingest workloads (time-series, KV stores).

### 4.3 Heap file
- **Shape:** an unordered collection of pages/tuples.
- **Reads:** need a separate index to be efficient; otherwise full scan.
- **Writes:** cheap appends; requires vacuuming to reclaim dead tuples (MVCC).
- **Best for:** general-purpose base storage with pluggable index types
  (PostgreSQL's table heap + B-tree indexes).

### B-Tree vs LSM-Tree — summary
| | B-Tree | LSM-Tree |
|---|---|---|
| Write amplification | Moderate/High | High (compaction, but sequential) |
| Read amplification | Low | Higher (multiple SSTables) |
| I/O pattern | Random | Sequential |
| Best for | Read-heavy OLTP | Write-heavy ingest |

---

## 5. Row vs. Column storage (orthogonal to the above)

| | Row-oriented | Column-oriented |
|---|---|---|
| Layout | All columns of a row together (tuple) | All values of a column together |
| Best for | OLTP (point reads/writes) | OLAP (scans/aggregations) |
| Compression | Poor–fair | Excellent (RLE, dictionary, delta, bit-packing — 5–30×) |
| Examples | MySQL, PostgreSQL, Oracle | ClickHouse, Redshift, Snowflake, BigQuery, Parquet/ORC |

- **Row stores** read whole rows — ideal when you touch many columns of a few rows.
- **Column stores** read only needed columns — ideal when you aggregate a few
  columns over many rows; adjacency of similar values enables strong compression.

---

## 6. How these properties characterize real-world databases

| Engine (DB) | Primary structure | Key properties | Best for |
|---|---|---|---|
| **InnoDB** (MySQL) | B+ Tree (clustered + secondary) | ACID, row-level locking, MVCC, foreign keys, doublewrite buffer | OLTP / relational |
| **RocksDB** | LSM-Tree | Write-optimized, built-in compaction, embeddable KV; powers MyRocks, TiDB | Write-heavy KV |
| **WiredTiger** (MongoDB) | B-Tree (default) / LSM option | Document-level concurrency, compression, checkpoints + journaling | Document store |
| **LevelDB** | LSM-Tree | Lightweight embedded KV, fast writes | Embedded / KV |
| **PostgreSQL heap** | Heap file + B-tree indexes | MVCC, requires VACUUM, rich index types | General-purpose SQL |

**The pattern:** a database's "personality" (OLTP vs OLAP, read- vs
write-optimized, embedded vs server) is largely **determined by the storage
engine's data structure + the properties it chooses to guarantee**.

---

## 7. Implications for the StorageEngine project (design checklist)

When you start building, decide explicitly on each of these:

1. **Primary data structure** — B+ Tree, LSM-Tree, or heap? (Drives everything.)
2. **Page size & layout** — fixed page size; slotted-page record format.
3. **Buffer pool** — eviction policy (LRU/clock), dirty-page tracking.
4. **Durability** — WAL format, `fsync` strategy, checkpointing, recovery.
5. **Concurrency** — locking vs MVCC; which isolation levels to support.
6. **Indexing** — primary + secondary index support.
7. **Space management** — compaction (LSM) or vacuum/free-space map (heap).
8. **Row vs column** — OLTP row store is the usual starting point.
9. **Amplification target** — which of read/write/space you optimize for.
10. **Packaging** — embedded library vs client/server.

> Recommended learning path: build a **page manager + slotted pages → buffer
> pool → B+ tree index → WAL + recovery**, then add transactions/MVCC. This is
> the classic OLTP row-store path and the most approachable first engine.

---

## Appendix A — Extended real-world database catalog

A broader survey of databases and the properties that define them. "ACID?"
refers to full multi-statement ACID transactions by default.

### Relational / OLTP (row stores)
| Database | Storage engine / structure | Concurrency | ACID? | Notable properties | Best for |
|---|---|---|---|---|---|
| **MySQL (InnoDB)** | B+ Tree, clustered index | MVCC + row locks | Yes | Doublewrite buffer, foreign keys, redo/undo logs | General OLTP |
| **PostgreSQL** | Heap file + B-tree/GiST/GIN indexes | MVCC (needs VACUUM) | Yes | Extensible types/indexes, rich SQL, logical replication | General-purpose SQL |
| **Oracle DB** | B-tree + heap; undo segments | MVCC + locks | Yes | Mature, RAC clustering, flashback, PL/SQL | Enterprise OLTP |
| **SQL Server** | B-tree; also in-memory (Hekaton) & columnstore | MVCC/locks | Yes | Columnstore for HTAP, Always On availability | Enterprise OLTP/mixed |
| **SQLite** | Single-file B-tree | File lock / WAL mode | Yes | Serverless, embedded, zero-admin, portable file | Mobile/embedded/local |
| **CockroachDB** | RocksDB/Pebble LSM + Raft | MVCC, serializable | Yes (distributed) | Horizontally scalable, geo-distributed, Postgres wire | Distributed SQL |
| **TiDB** | RocksDB LSM (TiKV) + Raft | MVCC (Percolator) | Yes (distributed) | MySQL-compatible, HTAP with TiFlash | Distributed SQL/HTAP |

### Key-value / wide-column (mostly LSM)
| Database | Structure | Consistency | Notable properties | Best for |
|---|---|---|---|---|
| **RocksDB / LevelDB** | LSM-Tree | Single-node (embeddable) | Library, compaction, Bloom filters | Embedded KV, engine component |
| **Apache Cassandra** | LSM-Tree (memtable + SSTables + commit log) | Tunable (ONE/QUORUM/ALL) | Masterless, linear write scaling, AP-leaning | Write-heavy, distributed |
| **ScyllaDB** | LSM-Tree (C++ rewrite of Cassandra) | Tunable | Shard-per-core, very low latency | High-throughput Cassandra workloads |
| **Amazon DynamoDB** | LSM-style (managed, B-tree-ish partitions) | Eventual or strong (per-request) | Serverless, auto-scaling, SSD-backed, partitioned | Serverless KV at scale |
| **Redis** | In-memory data structures | Not strict ACID (optional MULTI/EXEC) | RDB snapshots + AOF log; strings/lists/sets/sorted sets | Cache, sessions, real-time |

### Document / search
| Database | Structure | Concurrency | Notable properties | Best for |
|---|---|---|---|---|
| **MongoDB (WiredTiger)** | B-tree (default), LSM option | Document-level, MVCC | Compression, checkpoints + journaling, multi-doc txns | Document store |
| **Elasticsearch** | Inverted index on Lucene segments (LSM-like) | Near-real-time, eventual | Full-text search, aggregations, segment merges | Search & log analytics |

### Analytical / OLAP (column stores)
| Database | Structure | Notable properties | Best for |
|---|---|---|---|
| **ClickHouse** | Columnar (MergeTree, LSM-like) | Vectorized execution, heavy compression, very fast scans | Real-time analytics |
| **Amazon Redshift** | Columnar, MPP | Managed data warehouse, zone maps | Data warehousing |
| **Snowflake** | Columnar micro-partitions on object storage | Separation of storage/compute, elastic scaling | Cloud data warehouse |
| **Google BigQuery** | Columnar (Capacitor) on Colossus | Serverless, massive parallel scans | Ad-hoc analytics at scale |
| **Apache Parquet / ORC** | Columnar file formats | Not DBs — on-disk formats for data lakes | Lakehouse storage |

### Time-series
| Database | Structure | Notable properties | Best for |
|---|---|---|---|
| **InfluxDB** | TSM (LSM-derived, columnar-ish) | Time-partitioned, downsampling, retention policies | Metrics/IoT |
| **TimescaleDB** | PostgreSQL + hypertables (chunked B-tree) | SQL, time/space partitioning on Postgres | Time-series on SQL |

**Takeaways from the catalog:**
- **LSM-trees dominate write-heavy & distributed systems** (Cassandra, RocksDB,
  DynamoDB, ScyllaDB) because sequential writes scale and compaction is tunable.
- **B+ trees dominate single-node OLTP** (InnoDB, SQLite, Oracle) for balanced
  read/write with strong ACID.
- **Columnar engines dominate OLAP** (ClickHouse, Snowflake, BigQuery) by reading
  only needed columns and compressing aggressively.
- **Distributed SQL** (CockroachDB, TiDB) layers consensus (Raft) + MVCC on top
  of an LSM KV store to get horizontal scale *and* ACID.
- **Consistency is a spectrum**: strict ACID (Postgres, Oracle) → tunable
  (Cassandra, DynamoDB) → eventual (Elasticsearch, Redis without AOF-always).

---

## Sources
- B-tree vs LSM tradeoffs — HLD Handbook Academy; dev.to (Dylan Dumont)
- Engine comparison — luminhkhuong.dev; ikshitij.com; MySQL InnoDB docs
- Row vs column & compression — ClickHouse, Exasol, GeeksforGeeks, SystemOverflow
- Reads/pages/buffer pools — dev.to (How Database Reads Work)
- Cassandra consistency & storage — DataStax docs; axonops.com
- Redis persistence (RDB/AOF), SQLite B-tree — vendor docs & NoSQL comparisons
