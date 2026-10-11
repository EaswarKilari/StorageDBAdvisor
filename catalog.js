/*
 * Database catalog for the "find the right DB" recommender.
 *
 * Attribute vocabulary (keep in sync with app.js):
 *   workloads:  oltp | olap | htap | cache | search | timeseries | kv-scale | graph | vector
 *   dataModel:  relational | document | keyvalue | widecolumn | columnar | timeseries | graph | vector
 *   rw:         0.0 (read-optimized) .. 1.0 (write-optimized)
 *   consistency: strong | tunable | eventual
 *   scaling:    single | both | distributed
 *   deployment: embedded | self-hosted | managed
 *   sql:        true | false
 */
window.DB_CATALOG = [
  {
    name: "PostgreSQL",
    structure: "Heap file + B-tree indexes (MVCC)",
    workloads: ["oltp", "htap"],
    dataModel: ["relational", "document"],
    rw: 0.4, consistency: "strong", scaling: "single",
    deployment: ["self-hosted", "managed"], sql: true,
    summary: "Feature-rich, extensible relational database. The safe default for general-purpose OLTP."
  },
  {
    name: "MySQL (InnoDB)",
    structure: "B+ Tree clustered index (MVCC)",
    workloads: ["oltp"],
    dataModel: ["relational"],
    rw: 0.4, consistency: "strong", scaling: "single",
    deployment: ["self-hosted", "managed"], sql: true,
    summary: "Popular, battle-tested relational OLTP engine with wide ecosystem support."
  },
  {
    name: "Oracle Database",
    structure: "B-tree + heap, undo segments (MVCC)",
    workloads: ["oltp", "htap"],
    dataModel: ["relational"],
    rw: 0.4, consistency: "strong", scaling: "both",
    deployment: ["self-hosted", "managed"], sql: true,
    summary: "Enterprise relational database with RAC clustering, flashback, and deep tuning."
  },
  {
    name: "Microsoft SQL Server",
    structure: "B-tree + in-memory + columnstore",
    workloads: ["oltp", "htap"],
    dataModel: ["relational"],
    rw: 0.4, consistency: "strong", scaling: "single",
    deployment: ["self-hosted", "managed"], sql: true,
    summary: "Enterprise OLTP with built-in columnstore for mixed (HTAP) workloads."
  },
  {
    name: "SQLite",
    structure: "Single-file B-tree",
    workloads: ["oltp"],
    dataModel: ["relational"],
    rw: 0.4, consistency: "strong", scaling: "single",
    deployment: ["embedded"], sql: true,
    summary: "Zero-admin, serverless, single-file SQL database. Ideal for embedded and local apps."
  },
  {
    name: "CockroachDB",
    structure: "LSM (Pebble) + Raft consensus",
    workloads: ["oltp"],
    dataModel: ["relational"],
    rw: 0.5, consistency: "strong", scaling: "distributed",
    deployment: ["self-hosted", "managed"], sql: true,
    summary: "Distributed SQL with serializable ACID and geo-distribution; Postgres-compatible wire."
  },
  {
    name: "TiDB",
    structure: "LSM (TiKV) + Raft, TiFlash columnar",
    workloads: ["oltp", "htap"],
    dataModel: ["relational"],
    rw: 0.5, consistency: "strong", scaling: "distributed",
    deployment: ["self-hosted", "managed"], sql: true,
    summary: "MySQL-compatible distributed SQL with HTAP via a columnar replica (TiFlash)."
  },
  {
    name: "RocksDB",
    structure: "LSM-Tree (embeddable library)",
    workloads: ["kv-scale"],
    dataModel: ["keyvalue"],
    rw: 0.8, consistency: "strong", scaling: "single",
    deployment: ["embedded"], sql: false,
    summary: "Embeddable, write-optimized key-value engine. Often a building block inside other databases."
  },
  {
    name: "Apache Cassandra",
    structure: "LSM-Tree (memtable + SSTables + commit log)",
    workloads: ["kv-scale"],
    dataModel: ["widecolumn"],
    rw: 0.85, consistency: "tunable", scaling: "distributed",
    deployment: ["self-hosted", "managed"], sql: false,
    summary: "Masterless, write-scalable wide-column store with tunable consistency (ONE/QUORUM/ALL)."
  },
  {
    name: "ScyllaDB",
    structure: "LSM-Tree, shard-per-core (C++)",
    workloads: ["kv-scale"],
    dataModel: ["widecolumn"],
    rw: 0.85, consistency: "tunable", scaling: "distributed",
    deployment: ["self-hosted", "managed"], sql: false,
    summary: "Cassandra-compatible wide-column store rewritten for very low latency and high throughput."
  },
  {
    name: "Amazon DynamoDB",
    structure: "LSM-style, partitioned (managed)",
    workloads: ["kv-scale"],
    dataModel: ["keyvalue"],
    rw: 0.6, consistency: "tunable", scaling: "distributed",
    deployment: ["managed"], sql: false,
    summary: "Serverless, auto-scaling key-value/document store with per-request eventual or strong reads."
  },
  {
    name: "Redis",
    structure: "In-memory data structures (RDB + AOF)",
    workloads: ["cache", "kv-scale"],
    dataModel: ["keyvalue"],
    rw: 0.5, consistency: "eventual", scaling: "both",
    deployment: ["self-hosted", "managed"], sql: false,
    summary: "Ultra-fast in-memory store for caching, sessions, and real-time data; optional persistence."
  },
  {
    name: "MongoDB (WiredTiger)",
    structure: "B-tree (default), LSM option",
    workloads: ["oltp"],
    dataModel: ["document"],
    rw: 0.5, consistency: "strong", scaling: "both",
    deployment: ["self-hosted", "managed"], sql: false,
    summary: "Document database with flexible schema, compression, and sharding for horizontal scale."
  },
  {
    name: "Elasticsearch",
    structure: "Lucene inverted index (segment merges)",
    workloads: ["search"],
    dataModel: ["document"],
    rw: 0.5, consistency: "eventual", scaling: "distributed",
    deployment: ["self-hosted", "managed"], sql: false,
    summary: "Distributed full-text search and analytics engine with near-real-time indexing."
  },
  {
    name: "ClickHouse",
    structure: "Columnar MergeTree (LSM-like)",
    workloads: ["olap"],
    dataModel: ["columnar"],
    rw: 0.6, consistency: "tunable", scaling: "distributed",
    deployment: ["self-hosted", "managed"], sql: true,
    summary: "Column-oriented OLAP engine with vectorized execution and heavy compression; very fast scans."
  },
  {
    name: "Amazon Redshift",
    structure: "Columnar, MPP",
    workloads: ["olap"],
    dataModel: ["columnar"],
    rw: 0.4, consistency: "strong", scaling: "distributed",
    deployment: ["managed"], sql: true,
    summary: "Managed MPP columnar data warehouse for large-scale analytics and reporting."
  },
  {
    name: "Snowflake",
    structure: "Columnar micro-partitions on object storage",
    workloads: ["olap"],
    dataModel: ["columnar"],
    rw: 0.4, consistency: "strong", scaling: "distributed",
    deployment: ["managed"], sql: true,
    summary: "Cloud data warehouse separating storage and compute for elastic analytics scaling."
  },
  {
    name: "Google BigQuery",
    structure: "Columnar (Capacitor) on Colossus",
    workloads: ["olap"],
    dataModel: ["columnar"],
    rw: 0.4, consistency: "strong", scaling: "distributed",
    deployment: ["managed"], sql: true,
    summary: "Serverless, massively parallel columnar warehouse for ad-hoc analytics at huge scale."
  },
  {
    name: "InfluxDB",
    structure: "TSM engine (LSM-derived, columnar-ish)",
    workloads: ["timeseries"],
    dataModel: ["timeseries"],
    rw: 0.8, consistency: "tunable", scaling: "both",
    deployment: ["self-hosted", "managed"], sql: false,
    summary: "Purpose-built time-series database with retention policies and downsampling for metrics/IoT."
  },
  {
    name: "TimescaleDB",
    structure: "PostgreSQL hypertables (chunked B-tree)",
    workloads: ["timeseries", "olap"],
    dataModel: ["relational", "timeseries"],
    rw: 0.6, consistency: "strong", scaling: "single",
    deployment: ["self-hosted", "managed"], sql: true,
    summary: "Time-series on PostgreSQL: full SQL plus time/space partitioning via hypertables."
  },
  {
    name: "MariaDB",
    structure: "B+ Tree (InnoDB/Aria), MVCC",
    workloads: ["oltp"],
    dataModel: ["relational"],
    rw: 0.4, consistency: "strong", scaling: "both",
    deployment: ["self-hosted", "managed"], sql: true,
    summary: "Community-driven MySQL fork with extra storage engines and drop-in compatibility."
  },
  {
    name: "Amazon Aurora",
    structure: "Distributed log-structured storage (MySQL/Postgres compatible)",
    workloads: ["oltp", "htap"],
    dataModel: ["relational"],
    rw: 0.5, consistency: "strong", scaling: "distributed",
    deployment: ["managed"], sql: true,
    summary: "Cloud-native relational engine with auto-scaling storage and read replicas; MySQL/Postgres compatible."
  },
  {
    name: "Google Cloud Spanner",
    structure: "Distributed B-tree + Paxos, TrueTime",
    workloads: ["oltp", "htap"],
    dataModel: ["relational"],
    rw: 0.5, consistency: "strong", scaling: "distributed",
    deployment: ["managed"], sql: true,
    summary: "Globally distributed SQL with external consistency via synchronized clocks (TrueTime)."
  },
  {
    name: "DuckDB",
    structure: "Columnar, vectorized (embeddable)",
    workloads: ["olap"],
    dataModel: ["columnar"],
    rw: 0.3, consistency: "strong", scaling: "single",
    deployment: ["embedded"], sql: true,
    summary: "In-process analytical (OLAP) database — 'SQLite for analytics'; fast local column scans."
  },
  {
    name: "Apache HBase",
    structure: "LSM-Tree on HDFS (wide-column)",
    workloads: ["kv-scale"],
    dataModel: ["widecolumn"],
    rw: 0.8, consistency: "strong", scaling: "distributed",
    deployment: ["self-hosted"], sql: false,
    summary: "Hadoop-ecosystem wide-column store for random real-time read/write access to big data."
  },
  {
    name: "Couchbase",
    structure: "B-tree + memory-first (document)",
    workloads: ["oltp", "cache"],
    dataModel: ["document", "keyvalue"],
    rw: 0.6, consistency: "tunable", scaling: "distributed",
    deployment: ["self-hosted", "managed"], sql: true,
    summary: "Distributed document store with a built-in cache tier and SQL-like query language (N1QL/SQL++)."
  },
  {
    name: "Apache CouchDB",
    structure: "Append-only B-tree (MVCC)",
    workloads: ["oltp"],
    dataModel: ["document"],
    rw: 0.4, consistency: "eventual", scaling: "distributed",
    deployment: ["self-hosted", "managed"], sql: false,
    summary: "Document database focused on offline-first sync and multi-master replication over HTTP."
  },
  {
    name: "Memcached",
    structure: "In-memory hash table (no persistence)",
    workloads: ["cache"],
    dataModel: ["keyvalue"],
    rw: 0.5, consistency: "eventual", scaling: "both",
    deployment: ["self-hosted", "managed"], sql: false,
    summary: "Minimal, ultra-fast in-memory cache for transient key-value data; no durability."
  },
  {
    name: "Aerospike",
    structure: "Hybrid memory + SSD-optimized (keyvalue)",
    workloads: ["kv-scale", "cache"],
    dataModel: ["keyvalue"],
    rw: 0.7, consistency: "tunable", scaling: "distributed",
    deployment: ["self-hosted", "managed"], sql: false,
    summary: "Low-latency key-value store optimized for flash/SSD at high throughput; real-time use cases."
  },
  {
    name: "Neo4j",
    structure: "Native graph storage (index-free adjacency)",
    workloads: ["graph"],
    dataModel: ["graph"],
    rw: 0.4, consistency: "strong", scaling: "both",
    deployment: ["self-hosted", "managed"], sql: false,
    summary: "Leading native graph database with the Cypher query language for connected-data traversals."
  },
  {
    name: "ArangoDB",
    structure: "RocksDB LSM (multi-model)",
    workloads: ["graph", "oltp"],
    dataModel: ["graph", "document", "keyvalue"],
    rw: 0.5, consistency: "tunable", scaling: "distributed",
    deployment: ["self-hosted", "managed"], sql: false,
    summary: "Multi-model database combining graph, document, and key-value in one engine (AQL query language)."
  },
  {
    name: "Pinecone",
    structure: "ANN vector index (managed)",
    workloads: ["vector"],
    dataModel: ["vector"],
    rw: 0.5, consistency: "eventual", scaling: "distributed",
    deployment: ["managed"], sql: false,
    summary: "Fully managed vector database for similarity search powering embeddings and RAG applications."
  },
  {
    name: "Milvus",
    structure: "ANN vector index (segments)",
    workloads: ["vector"],
    dataModel: ["vector"],
    rw: 0.6, consistency: "tunable", scaling: "distributed",
    deployment: ["self-hosted", "managed"], sql: false,
    summary: "Open-source, horizontally scalable vector database for large-scale similarity search."
  },
  {
    name: "Qdrant",
    structure: "HNSW vector index (Rust)",
    workloads: ["vector"],
    dataModel: ["vector"],
    rw: 0.6, consistency: "tunable", scaling: "both",
    deployment: ["self-hosted", "managed", "embedded"], sql: false,
    summary: "Vector search engine with rich payload filtering; easy to self-host or run managed."
  }
];
