/* Database explorer: pick a DB, see its full property sheet. */

const EXPLAIN = {
  workload: {
    oltp: "Transactional (OLTP) \u2014 many small reads/writes from an app",
    olap: "Analytics (OLAP) \u2014 scanning/aggregating large datasets",
    htap: "Hybrid (HTAP) \u2014 transactions and analytics on the same data",
    cache: "Caching / sessions \u2014 fast, disposable data",
    search: "Full-text search \u2014 keyword and relevance queries",
    timeseries: "Time-series \u2014 timestamped streams (metrics, IoT)",
    "kv-scale": "Key-value at scale \u2014 high-volume key lookups",
    graph: "Graph \u2014 connected data and relationship traversal",
    vector: "Vector \u2014 AI similarity search over embeddings"
  },
  dataModel: {
    relational: "Relational (tables with a fixed schema)",
    document: "Document (flexible JSON-like records)",
    keyvalue: "Key-value (key \u2192 value)",
    widecolumn: "Wide-column (rows with many dynamic columns)",
    columnar: "Columnar (column-oriented for analytics)",
    timeseries: "Time-series (timestamp-partitioned)",
    graph: "Graph (nodes and edges)",
    vector: "Vector (numeric embeddings)"
  },
  consistency: {
    strong: "Strong \u2014 strict ACID; reads always see committed data",
    tunable: "Tunable \u2014 trade consistency for speed per operation",
    eventual: "Eventual \u2014 replicas converge after a short delay"
  },
  scaling: {
    single: "Single-node \u2014 runs on one machine (plus replicas)",
    both: "Flexible \u2014 scales from single-node to a cluster",
    distributed: "Distributed \u2014 shards/replicates across many nodes"
  },
  deployment: {
    embedded: "Embedded (runs inside your app as a library)",
    "self-hosted": "Self-hosted (you run the server)",
    managed: "Managed (cloud provider operates it)"
  }
};

function rwLabel(rw) {
  if (rw <= 0.35) return "Read-optimized";
  if (rw >= 0.7) return "Write-optimized";
  return "Balanced read/write";
}

function row(term, value) {
  return '<div class="prop"><div class="prop-key">' + term + '</div><div class="prop-val">' + value + '</div></div>';
}

function list(items, map) {
  return '<ul class="prop-list">' +
    items.map(function (i) { return "<li>" + (map[i] || i) + "</li>"; }).join("") +
    "</ul>";
}

function renderDb(db) {
  const panel = document.getElementById("detail");

  const rwPct = Math.round(db.rw * 100);
  const rwBar =
    '<div class="rw"><span>Read</span>' +
    '<div class="rw-bar"><div class="rw-fill" style="width:' + rwPct + '%"></div></div>' +
    '<span>Write</span></div>' +
    '<div class="rw-label">' + rwLabel(db.rw) + ' (' + rwPct + '% write-leaning)</div>';

  panel.innerHTML =
    '<div class="detail-head">' +
      '<h2>' + db.name + '</h2>' +
      (db.sql ? '<span class="tag sql">SQL</span>' : '<span class="tag nosql">NoSQL</span>') +
    '</div>' +
    '<p class="detail-summary">' + db.summary + '</p>' +
    row("Storage structure", db.structure) +
    row("Best-fit workloads", list(db.workloads, EXPLAIN.workload)) +
    row("Data model(s)", list(db.dataModel, EXPLAIN.dataModel)) +
    row("Read / write profile", rwBar) +
    row("Consistency", EXPLAIN.consistency[db.consistency]) +
    row("Scaling", EXPLAIN.scaling[db.scaling]) +
    row("Deployment option(s)", list(db.deployment, EXPLAIN.deployment)) +
    row("SQL interface", db.sql ? "Yes" : "No") +
    row("License", db.license) +
    row("First released", String(db.released) + " (" + (new Date().getFullYear() - db.released) + " years ago)") +
    row("Popularity", db.popularity) +
    row("Managed / availability", db.clouds.join(", ")) +
    row("Key trade-off", '<span class="tradeoff-inline">' + db.tradeoff + '</span>');
}

function selectAndRender(name) {
  const sel = document.getElementById("dbPicker");
  const db = window.DB_CATALOG.find(function (d) { return d.name === name; });
  if (db) {
    sel.value = name;
    renderDb(db);
    return true;
  }
  return false;
}

function populateSelect() {
  const sel = document.getElementById("dbPicker");
  const sorted = window.DB_CATALOG.slice().sort(function (a, b) {
    return a.name.localeCompare(b.name);
  });
  sorted.forEach(function (db) {
    const opt = document.createElement("option");
    opt.value = db.name;
    opt.textContent = db.name;
    sel.appendChild(opt);
  });
  sel.addEventListener("change", function () {
    const db = window.DB_CATALOG.find(function (d) { return d.name === sel.value; });
    if (db) renderDb(db);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  populateSelect();
  const sorted = window.DB_CATALOG.slice().sort(function (a, b) {
    return a.name.localeCompare(b.name);
  });
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("db");
  if (!requested || !selectAndRender(requested)) {
    renderDb(sorted[0]);
  }
});
