/*
 * Database catalog for the "find the right DB" decision tool.
 *
 * Attribute vocabulary (keep in sync with app.js / explore.js):
 *   workloads:  oltp | olap | htap | cache | search | timeseries | kv-scale | graph | vector
 *   dataModel:  relational | document | keyvalue | widecolumn | columnar | timeseries | graph | vector
 *   rw:         0.0 (read-optimized) .. 1.0 (write-optimized)
 *   consistency: strong | tunable | eventual
 *   scaling:    single | both | distributed
 *   deployment: embedded | self-hosted | managed
 *   sql:        true | false
 *   license:    short license string
 *   released:   first public release year (number)
 *   popularity: "Very high" | "High" | "Medium" | "Niche"
 *   clouds:     managed availability: "AWS" | "Azure" | "GCP" | "Self-managed" | "Embedded"
 *   tradeoff:   one-line "what you gain / what you pay" summary
 */
window.DB_CATALOG = [
  {
    name: "PostgreSQL",
    structure: "Heap file + B-tree indexes (MVCC)",
    workloads: ["oltp", "htap"], dataModel: ["relational", "document"],
    rw: 0.4, consistency: "strong", scaling: "single",
    deployment: ["self-hosted", "managed"], sql: true,
    license: "Open source (PostgreSQL License)", released: 1996,
    popularity: "Very high", clouds: ["AWS", "Azure", "GCP", "Self-managed"],
    summary: "Feature-rich, extensible relational database. The safe default for general-purpose OLTP.",
    tradeoff: "Hugely versatile and standards-compliant, but single-primary writes can bottleneck at very large scale without extensions."
  },
  {
    name: "MySQL (InnoDB)",
    structure: "B+ Tree clustered index (MVCC)",
    workloads: ["oltp"], dataModel: ["relational"],
    rw: 0.4, consistency: "strong", scaling: "both",
    deployment: ["self-hosted", "managed"], sql: true,
    license: "Open source (GPLv2)", released: 1995,
    popularity: "Very high", clouds: ["AWS", "Azure", "GCP", "Self-managed"],
    summary: "Popular, battle-tested relational OLTP engine with a vast ecosystem.",
    tradeoff: "Ubiquitous and fast for simple reads, but historically weaker on complex queries and strict SQL standards than Postgres.",
    engines: [
      { name: "InnoDB", structure: "B+ tree (ACID, MVCC, row locks)", bestFor: "default", note: "The balanced default: full transactions and foreign keys for general OLTP." },
      { name: "MyRocks", structure: "LSM tree", bestFor: "write", note: "Write-optimized and space-efficient for very large, write-heavy datasets." },
      { name: "MyISAM", structure: "B-tree (table locks, no transactions)", bestFor: "read", note: "Legacy read-mostly engine; fast but no ACID or row locking." },
      { name: "MEMORY", structure: "In-memory hash", bestFor: "cache", note: "Ultra-fast volatile tables for scratch/temporary data." }
    ]
  },
  {
    name: "Oracle Database",
    structure: "B-tree + heap, undo segments (MVCC)",
    workloads: ["oltp", "htap"], dataModel: ["relational"],
    rw: 0.4, consistency: "strong", scaling: "both",
    deployment: ["self-hosted", "managed"], sql: true,
    license: "Proprietary", released: 1979,
    popularity: "High", clouds: ["Azure", "AWS", "Self-managed"],
    summary: "Enterprise relational database with RAC clustering, flashback, and deep tuning.",
    tradeoff: "Extremely powerful and mature, but expensive licensing and heavy operational complexity."
  },
  {
    name: "Microsoft SQL Server",
    structure: "B-tree + in-memory + columnstore",
    workloads: ["oltp", "htap"], dataModel: ["relational"],
    rw: 0.4, consistency: "strong", scaling: "single",
    deployment: ["self-hosted", "managed"], sql: true,
    license: "Proprietary", released: 1989,
    popularity: "High", clouds: ["Azure", "AWS", "Self-managed"],
    summary: "Enterprise OLTP with built-in columnstore for mixed (HTAP) workloads.",
    tradeoff: "Excellent tooling and HTAP support, but licensing cost and a Windows-centric heritage.",
    engines: [
      { name: "Rowstore (B-tree)", structure: "B-tree", bestFor: "default", note: "Standard disk-based OLTP tables." },
      { name: "Columnstore", structure: "Columnar", bestFor: "analytics", note: "Column-oriented indexes for analytics and HTAP." },
      { name: "In-Memory OLTP (Hekaton)", structure: "In-memory (lock-free)", bestFor: "cache", note: "Memory-optimized tables for very high-throughput transactional hotspots." }
    ]
  },
  {
    name: "SQLite",
    structure: "Single-file B-tree",
    workloads: ["oltp"], dataModel: ["relational"],
    rw: 0.4, consistency: "strong", scaling: "single",
    deployment: ["embedded"], sql: true,
    license: "Open source (Public Domain)", released: 2000,
    popularity: "Very high", clouds: ["Embedded"],
    summary: "Zero-admin, serverless, single-file SQL database. Ideal for embedded and local apps.",
    tradeoff: "Zero-config and portable, but single-writer and not meant for high-concurrency server workloads."
  },
  {
    name: "CockroachDB",
    structure: "LSM (Pebble) + Raft consensus",
    workloads: ["oltp"], dataModel: ["relational"],
    rw: 0.5, consistency: "strong", scaling: "distributed",
    deployment: ["self-hosted", "managed"], sql: true,
    license: "Source-available (BSL) + free tier", released: 2015,
    popularity: "Medium", clouds: ["AWS", "Azure", "GCP", "Self-managed"],
    summary: "Distributed SQL with serializable ACID and geo-distribution; Postgres-compatible wire.",
    tradeoff: "Horizontal scale with serializable ACID, but higher write latency from consensus coordination."
  },
  {
    name: "TiDB",
    structure: "LSM (TiKV) + Raft, TiFlash columnar",
    workloads: ["oltp", "htap"], dataModel: ["relational"],
    rw: 0.5, consistency: "strong", scaling: "distributed",
    deployment: ["self-hosted", "managed"], sql: true,
    license: "Open source (Apache 2.0)", released: 2016,
    popularity: "Medium", clouds: ["AWS", "GCP", "Self-managed"],
    summary: "MySQL-compatible distributed SQL with HTAP via a columnar replica (TiFlash).",
    tradeoff: "MySQL-compatible HTAP at scale, but operationally complex (multi-component cluster)."
  },
  {
    name: "RocksDB",
    structure: "LSM-Tree (embeddable library)",
    workloads: ["kv-scale"], dataModel: ["keyvalue"],
    rw: 0.8, consistency: "strong", scaling: "single",
    deployment: ["embedded"], sql: false,
    license: "Open source (Apache 2.0 / GPLv2)", released: 2013,
    popularity: "High", clouds: ["Embedded"],
    summary: "Embeddable, write-optimized key-value engine. Often a building block inside other databases.",
    tradeoff: "Excellent write throughput as a library, but it's a storage engine, not a full database (no queries or network layer)."
  },
  {
    name: "Apache Cassandra",
    structure: "LSM-Tree (memtable + SSTables + commit log)",
    workloads: ["kv-scale"], dataModel: ["widecolumn"],
    rw: 0.85, consistency: "tunable", scaling: "distributed",
    deployment: ["self-hosted", "managed"], sql: false,
    license: "Open source (Apache 2.0)", released: 2008,
    popularity: "High", clouds: ["AWS", "Azure", "GCP", "Self-managed"],
    summary: "Masterless, write-scalable wide-column store with tunable consistency (ONE/QUORUM/ALL).",
    tradeoff: "Linear write scalability with no single point of failure, but no joins and reads require careful upfront data modeling."
  },
  {
    name: "ScyllaDB",
    structure: "LSM-Tree, shard-per-core (C++)",
    workloads: ["kv-scale"], dataModel: ["widecolumn"],
    rw: 0.85, consistency: "tunable", scaling: "distributed",
    deployment: ["self-hosted", "managed"], sql: false,
    license: "Open source (AGPL) + enterprise", released: 2015,
    popularity: "Medium", clouds: ["AWS", "GCP", "Self-managed"],
    summary: "Cassandra-compatible wide-column store rewritten for very low latency and high throughput.",
    tradeoff: "Cassandra performance with lower latency, but a smaller ecosystem and community."
  },
  {
    name: "Amazon DynamoDB",
    structure: "LSM-style, partitioned (managed)",
    workloads: ["kv-scale"], dataModel: ["keyvalue"],
    rw: 0.6, consistency: "tunable", scaling: "distributed",
    deployment: ["managed"], sql: false,
    license: "Proprietary (managed)", released: 2012,
    popularity: "High", clouds: ["AWS"],
    summary: "Serverless, auto-scaling key-value/document store with per-request eventual or strong reads.",
    tradeoff: "Effortless scaling and operations, but AWS lock-in and rigid access patterns you must design around upfront."
  },
  {
    name: "Redis",
    structure: "In-memory data structures (RDB + AOF)",
    workloads: ["cache", "kv-scale"], dataModel: ["keyvalue"],
    rw: 0.5, consistency: "eventual", scaling: "both",
    deployment: ["self-hosted", "managed"], sql: false,
    license: "Source-available (RSALv2/SSPL)", released: 2009,
    popularity: "Very high", clouds: ["AWS", "Azure", "GCP", "Self-managed"],
    summary: "Ultra-fast in-memory store for caching, sessions, and real-time data; optional persistence.",
    tradeoff: "Blazing fast in-memory access, but RAM-bound capacity and durability is traded off against speed."
  },
  {
    name: "MongoDB (WiredTiger)",
    structure: "B-tree (default), LSM option",
    workloads: ["oltp"], dataModel: ["document"],
    rw: 0.5, consistency: "strong", scaling: "both",
    deployment: ["self-hosted", "managed"], sql: false,
    license: "Source-available (SSPL)", released: 2009,
    popularity: "Very high", clouds: ["AWS", "Azure", "GCP", "Self-managed"],
    summary: "Document database with flexible schema, compression, and sharding for horizontal scale.",
    tradeoff: "Flexible schema and easy scaling, but denormalized modeling discipline is required and the SSPL license limits some uses.",
    engines: [
      { name: "WiredTiger (B-tree)", structure: "B-tree", bestFor: "default", note: "The default: balanced read/write with compression and document-level concurrency." },
      { name: "WiredTiger (LSM)", structure: "LSM tree", bestFor: "write", note: "Configurable LSM mode for sustained write-heavy ingestion." }
    ]
  },
  {
    name: "Elasticsearch",
    structure: "Lucene inverted index (segment merges)",
    workloads: ["search"], dataModel: ["document"],
    rw: 0.5, consistency: "eventual", scaling: "distributed",
    deployment: ["self-hosted", "managed"], sql: false,
    license: "Source-available (SSPL / Elastic License)", released: 2010,
    popularity: "Very high", clouds: ["AWS", "Azure", "GCP", "Self-managed"],
    summary: "Distributed full-text search and analytics engine with near-real-time indexing.",
    tradeoff: "Powerful search and analytics, but resource-hungry and eventually consistent (not a system of record)."
  },
  {
    name: "ClickHouse",
    structure: "Columnar MergeTree (LSM-like)",
    workloads: ["olap"], dataModel: ["columnar"],
    rw: 0.6, consistency: "tunable", scaling: "distributed",
    deployment: ["self-hosted", "managed"], sql: true,
    license: "Open source (Apache 2.0)", released: 2016,
    popularity: "High", clouds: ["AWS", "GCP", "Self-managed"],
    summary: "Column-oriented OLAP engine with vectorized execution and heavy compression; very fast scans.",
    tradeoff: "Blisteringly fast analytics, but weak on single-row updates/deletes and lacks full transactions."
  },
  {
    name: "Amazon Redshift",
    structure: "Columnar, MPP",
    workloads: ["olap"], dataModel: ["columnar"],
    rw: 0.4, consistency: "strong", scaling: "distributed",
    deployment: ["managed"], sql: true,
    license: "Proprietary (managed)", released: 2012,
    popularity: "High", clouds: ["AWS"],
    summary: "Managed MPP columnar data warehouse for large-scale analytics and reporting.",
    tradeoff: "Mature MPP warehouse, but cluster-based sizing is less elastic than newer serverless warehouses, and it's AWS-only."
  },
  {
    name: "Snowflake",
    structure: "Columnar micro-partitions on object storage",
    workloads: ["olap"], dataModel: ["columnar"],
    rw: 0.4, consistency: "strong", scaling: "distributed",
    deployment: ["managed"], sql: true,
    license: "Proprietary (managed)", released: 2014,
    popularity: "Very high", clouds: ["AWS", "Azure", "GCP"],
    summary: "Cloud data warehouse separating storage and compute for elastic analytics scaling.",
    tradeoff: "Elastic storage/compute separation, but consumption pricing can get costly and it is cloud-only."
  },
  {
    name: "Google BigQuery",
    structure: "Columnar (Capacitor) on Colossus",
    workloads: ["olap"], dataModel: ["columnar"],
    rw: 0.4, consistency: "strong", scaling: "distributed",
    deployment: ["managed"], sql: true,
    license: "Proprietary (managed)", released: 2010,
    popularity: "High", clouds: ["GCP"],
    summary: "Serverless, massively parallel columnar warehouse for ad-hoc analytics at huge scale.",
    tradeoff: "Serverless scale with no ops, but per-query pricing and GCP lock-in; not for low-latency OLTP."
  },
  {
    name: "InfluxDB",
    structure: "TSM engine (LSM-derived, columnar-ish)",
    workloads: ["timeseries"], dataModel: ["timeseries"],
    rw: 0.8, consistency: "tunable", scaling: "both",
    deployment: ["self-hosted", "managed"], sql: false,
    license: "Open source (MIT/Apache) + commercial", released: 2013,
    popularity: "High", clouds: ["AWS", "Azure", "GCP", "Self-managed"],
    summary: "Purpose-built time-series database with retention policies and downsampling for metrics/IoT.",
    tradeoff: "Purpose-built for time-series, but major version changes (query languages) have caused ecosystem churn."
  },
  {
    name: "TimescaleDB",
    structure: "PostgreSQL hypertables (chunked B-tree)",
    workloads: ["timeseries", "olap"], dataModel: ["relational", "timeseries"],
    rw: 0.6, consistency: "strong", scaling: "single",
    deployment: ["self-hosted", "managed"], sql: true,
    license: "Open source (Apache 2.0 / Timescale License)", released: 2017,
    popularity: "Medium", clouds: ["AWS", "Azure", "GCP", "Self-managed"],
    summary: "Time-series on PostgreSQL: full SQL plus time/space partitioning via hypertables.",
    tradeoff: "Full SQL and the Postgres ecosystem for time-series, but inherits single-node Postgres scaling limits."
  },
  {
    name: "MariaDB",
    structure: "B+ Tree (InnoDB/Aria), MVCC",
    workloads: ["oltp"], dataModel: ["relational"],
    rw: 0.4, consistency: "strong", scaling: "both",
    deployment: ["self-hosted", "managed"], sql: true,
    license: "Open source (GPLv2)", released: 2009,
    popularity: "High", clouds: ["AWS", "Azure", "GCP", "Self-managed"],
    summary: "Community-driven MySQL fork with extra storage engines and drop-in compatibility.",
    tradeoff: "Open MySQL fork with more engines, but compatibility is gradually diverging from MySQL.",
    engines: [
      { name: "InnoDB", structure: "B+ tree (ACID, MVCC)", bestFor: "default", note: "General-purpose transactional default." },
      { name: "MyRocks", structure: "LSM tree", bestFor: "write", note: "Write-optimized and space-efficient for large write-heavy datasets." },
      { name: "ColumnStore", structure: "Columnar", bestFor: "analytics", note: "Column-oriented engine for OLAP/analytics queries." },
      { name: "Aria", structure: "B-tree (crash-safe)", bestFor: "read", note: "Crash-safe, read-mostly engine (non-transactional)." }
    ]
  },
  {
    name: "Amazon Aurora",
    structure: "Distributed log-structured storage (MySQL/Postgres compatible)",
    workloads: ["oltp", "htap"], dataModel: ["relational"],
    rw: 0.5, consistency: "strong", scaling: "distributed",
    deployment: ["managed"], sql: true,
    license: "Proprietary (managed)", released: 2014,
    popularity: "High", clouds: ["AWS"],
    summary: "Cloud-native relational engine with auto-scaling storage and read replicas; MySQL/Postgres compatible.",
    tradeoff: "MySQL/Postgres compatible with cloud-scale storage, but AWS-only and pricier than vanilla RDS."
  },
  {
    name: "Google Cloud Spanner",
    structure: "Distributed B-tree + Paxos, TrueTime",
    workloads: ["oltp", "htap"], dataModel: ["relational"],
    rw: 0.5, consistency: "strong", scaling: "distributed",
    deployment: ["managed"], sql: true,
    license: "Proprietary (managed)", released: 2017,
    popularity: "Medium", clouds: ["GCP"],
    summary: "Globally distributed SQL with external consistency via synchronized clocks (TrueTime).",
    tradeoff: "Global strong consistency with horizontal scale, but premium cost and GCP lock-in."
  },
  {
    name: "DuckDB",
    structure: "Columnar, vectorized (embeddable)",
    workloads: ["olap"], dataModel: ["columnar"],
    rw: 0.3, consistency: "strong", scaling: "single",
    deployment: ["embedded"], sql: true,
    license: "Open source (MIT)", released: 2019,
    popularity: "High", clouds: ["Embedded"],
    summary: "In-process analytical (OLAP) database \u2014 'SQLite for analytics'; fast local column scans.",
    tradeoff: "Fantastic in-process analytics, but single-node and not built for concurrent multi-user writes."
  },
  {
    name: "Apache HBase",
    structure: "LSM-Tree on HDFS (wide-column)",
    workloads: ["kv-scale"], dataModel: ["widecolumn"],
    rw: 0.8, consistency: "strong", scaling: "distributed",
    deployment: ["self-hosted"], sql: false,
    license: "Open source (Apache 2.0)", released: 2008,
    popularity: "Medium", clouds: ["AWS", "Azure", "Self-managed"],
    summary: "Hadoop-ecosystem wide-column store for random real-time read/write access to big data.",
    tradeoff: "Strong-consistency wide-column at scale, but a heavy Hadoop/HDFS dependency and operational burden."
  },
  {
    name: "Couchbase",
    structure: "B-tree + memory-first (document)",
    workloads: ["oltp", "cache"], dataModel: ["document", "keyvalue"],
    rw: 0.6, consistency: "tunable", scaling: "distributed",
    deployment: ["self-hosted", "managed"], sql: true,
    license: "Source-available (BSL) + enterprise", released: 2011,
    popularity: "Medium", clouds: ["AWS", "Azure", "GCP", "Self-managed"],
    summary: "Distributed document store with a built-in cache tier and SQL-like query language (SQL++).",
    tradeoff: "Memory-first document store with SQL++, but a smaller ecosystem than MongoDB."
  },
  {
    name: "Apache CouchDB",
    structure: "Append-only B-tree (MVCC)",
    workloads: ["oltp"], dataModel: ["document"],
    rw: 0.4, consistency: "eventual", scaling: "distributed",
    deployment: ["self-hosted", "managed"], sql: false,
    license: "Open source (Apache 2.0)", released: 2005,
    popularity: "Niche", clouds: ["Self-managed"],
    summary: "Document database focused on offline-first sync and multi-master replication over HTTP.",
    tradeoff: "Great offline-first replication, but lower raw performance and niche adoption."
  },
  {
    name: "Memcached",
    structure: "In-memory hash table (no persistence)",
    workloads: ["cache"], dataModel: ["keyvalue"],
    rw: 0.5, consistency: "eventual", scaling: "both",
    deployment: ["self-hosted", "managed"], sql: false,
    license: "Open source (BSD)", released: 2003,
    popularity: "Medium", clouds: ["AWS", "GCP", "Self-managed"],
    summary: "Minimal, ultra-fast in-memory cache for transient key-value data; no durability.",
    tradeoff: "Dead-simple and fast, but no persistence, no data structures, and no replication."
  },
  {
    name: "Aerospike",
    structure: "Hybrid memory + SSD-optimized (keyvalue)",
    workloads: ["kv-scale", "cache"], dataModel: ["keyvalue"],
    rw: 0.7, consistency: "tunable", scaling: "distributed",
    deployment: ["self-hosted", "managed"], sql: false,
    license: "Open source (AGPL) + enterprise", released: 2012,
    popularity: "Niche", clouds: ["AWS", "GCP", "Azure", "Self-managed"],
    summary: "Low-latency key-value store optimized for flash/SSD at high throughput; real-time use cases.",
    tradeoff: "Predictable low latency on SSD at scale, but niche adoption and the best features are enterprise-paid."
  },
  {
    name: "Neo4j",
    structure: "Native graph storage (index-free adjacency)",
    workloads: ["graph"], dataModel: ["graph"],
    rw: 0.4, consistency: "strong", scaling: "both",
    deployment: ["self-hosted", "managed"], sql: false,
    license: "Open source (GPLv3) + enterprise", released: 2007,
    popularity: "High", clouds: ["AWS", "Azure", "GCP", "Self-managed"],
    summary: "Leading native graph database with the Cypher query language for connected-data traversals.",
    tradeoff: "Best-in-class graph traversal, but horizontal write scaling is limited and clustering is an enterprise feature."
  },
  {
    name: "ArangoDB",
    structure: "RocksDB LSM (multi-model)",
    workloads: ["graph", "oltp"], dataModel: ["graph", "document", "keyvalue"],
    rw: 0.5, consistency: "tunable", scaling: "distributed",
    deployment: ["self-hosted", "managed"], sql: false,
    license: "Source-available (BSL) + enterprise", released: 2012,
    popularity: "Niche", clouds: ["AWS", "GCP", "Self-managed"],
    summary: "Multi-model database combining graph, document, and key-value in one engine (AQL query language).",
    tradeoff: "Multi-model flexibility in one engine, but a jack-of-all-trades can trail specialized DBs on each model."
  },
  {
    name: "Pinecone",
    structure: "ANN vector index (managed)",
    workloads: ["vector"], dataModel: ["vector"],
    rw: 0.5, consistency: "eventual", scaling: "distributed",
    deployment: ["managed"], sql: false,
    license: "Proprietary (managed)", released: 2021,
    popularity: "High", clouds: ["AWS", "GCP", "Azure"],
    summary: "Fully managed vector database for similarity search powering embeddings and RAG applications.",
    tradeoff: "Turnkey managed vector search, but proprietary and cost scales with vector volume."
  },
  {
    name: "Milvus",
    structure: "ANN vector index (segments)",
    workloads: ["vector"], dataModel: ["vector"],
    rw: 0.6, consistency: "tunable", scaling: "distributed",
    deployment: ["self-hosted", "managed"], sql: false,
    license: "Open source (Apache 2.0)", released: 2019,
    popularity: "High", clouds: ["AWS", "GCP", "Azure", "Self-managed"],
    summary: "Open-source, horizontally scalable vector database for large-scale similarity search.",
    tradeoff: "Scalable open vector DB, but operationally complex to self-host at scale."
  },
  {
    name: "Qdrant",
    structure: "HNSW vector index (Rust)",
    workloads: ["vector"], dataModel: ["vector"],
    rw: 0.6, consistency: "tunable", scaling: "both",
    deployment: ["self-hosted", "managed", "embedded"], sql: false,
    license: "Open source (Apache 2.0)", released: 2021,
    popularity: "High", clouds: ["AWS", "GCP", "Self-managed"],
    summary: "Vector search engine with rich payload filtering; easy to self-host or run managed.",
    tradeoff: "Fast, easy vector search with filtering, but a younger ecosystem than incumbents."
  },
  {
    name: "Azure Cosmos DB",
    structure: "Multi-model, log-structured (atom-record-sequence)",
    workloads: ["oltp", "kv-scale"], dataModel: ["document", "keyvalue", "widecolumn", "graph"],
    rw: 0.6, consistency: "tunable", scaling: "distributed",
    deployment: ["managed"], sql: true,
    license: "Proprietary (managed)", released: 2017,
    popularity: "High", clouds: ["Azure"],
    summary: "Globally distributed, multi-model database with multiple APIs (NoSQL, MongoDB, Cassandra, Gremlin, PostgreSQL) and five consistency levels.",
    tradeoff: "Global distribution with five tunable consistency levels and multi-model APIs, but Request Unit pricing is hard to predict and it's Azure-only."
  },
  {
    name: "Google Cloud Bigtable",
    structure: "LSM-Tree (wide-column, managed)",
    workloads: ["kv-scale", "timeseries"], dataModel: ["widecolumn"],
    rw: 0.8, consistency: "strong", scaling: "distributed",
    deployment: ["managed"], sql: false,
    license: "Proprietary (managed)", released: 2015,
    popularity: "Medium", clouds: ["GCP"],
    summary: "Managed wide-column store (the original Bigtable) for massive low-latency read/write workloads.",
    tradeoff: "Massive low-latency wide-column scale, but no SQL or multi-row transactions and GCP lock-in."
  },
  {
    name: "Firebase Firestore",
    structure: "Document store with realtime sync (managed)",
    workloads: ["oltp"], dataModel: ["document"],
    rw: 0.5, consistency: "strong", scaling: "distributed",
    deployment: ["managed"], sql: false,
    license: "Proprietary (managed)", released: 2017,
    popularity: "High", clouds: ["GCP"],
    summary: "Serverless document database with realtime sync and offline support; popular for mobile/web backends.",
    tradeoff: "Realtime sync and an effortless mobile/web backend, but limited querying and cost can climb at scale."
  },
  {
    name: "Azure SQL Database",
    structure: "B-tree + columnstore (managed SQL Server)",
    workloads: ["oltp", "htap"], dataModel: ["relational"],
    rw: 0.4, consistency: "strong", scaling: "both",
    deployment: ["managed"], sql: true,
    license: "Proprietary (managed)", released: 2010,
    popularity: "High", clouds: ["Azure"],
    summary: "Fully managed SQL Server engine in Azure with automatic patching, backups, and scaling.",
    tradeoff: "Managed SQL Server with great tooling, but Azure-only and cost climbs at higher service tiers."
  },
  {
    name: "FoundationDB",
    structure: "Ordered key-value + distributed ACID (SSI)",
    workloads: ["kv-scale", "oltp"], dataModel: ["keyvalue"],
    rw: 0.5, consistency: "strong", scaling: "distributed",
    deployment: ["self-hosted"], sql: false,
    license: "Open source (Apache 2.0)", released: 2013,
    popularity: "Niche", clouds: ["Self-managed"],
    summary: "Distributed, strictly serializable key-value foundation designed to have higher-level 'layers' built on top.",
    tradeoff: "Rock-solid distributed ACID, but low-level (you build data models as layers on top) with a small community."
  },
  {
    name: "etcd",
    structure: "Raft-replicated key-value (B-tree, MVCC)",
    workloads: ["kv-scale"], dataModel: ["keyvalue"],
    rw: 0.5, consistency: "strong", scaling: "distributed",
    deployment: ["self-hosted"], sql: false,
    license: "Open source (Apache 2.0)", released: 2013,
    popularity: "Medium", clouds: ["Self-managed"],
    summary: "Strongly-consistent key-value store for configuration and coordination (powers Kubernetes).",
    tradeoff: "Reliable strongly-consistent coordination, but intended for small config data \u2014 not a general-purpose database."
  }
];
