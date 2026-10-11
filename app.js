/* Scoring engine + rendering for the database recommender. */

const LABELS = {
  workload: {
    oltp: "transactional (OLTP)",
    olap: "analytics (OLAP)",
    htap: "mixed transactional + analytical (HTAP)",
    cache: "caching / sessions",
    search: "full-text search",
    timeseries: "time-series / metrics",
    "kv-scale": "key-value at scale",
    graph: "connected-data / graph",
    vector: "vector similarity search"
  },
  dataModel: {
    relational: "relational",
    document: "document",
    keyvalue: "key-value",
    widecolumn: "wide-column",
    columnar: "columnar",
    timeseries: "time-series",
    graph: "graph",
    vector: "vector"
  },
  rw: { 0: "read-heavy", 0.5: "balanced", 1: "write-heavy" },
  consistency: { strong: "strict ACID", tunable: "tunable", eventual: "eventual-OK" },
  scale: { single: "single-node", distributed: "horizontally scalable" },
  deployment: { embedded: "embedded / in-process", "self-hosted": "self-hosted server", managed: "managed cloud" }
};

/* Weights per criterion (relative importance). */
const WEIGHTS = {
  workload: 30,
  dataModel: 15,
  rw: 10,
  consistency: 15,
  scaling: 15,
  deployment: 10,
  sql: 10
};

function consistencyFrac(need, have) {
  const table = {
    strong: { strong: 1, tunable: 0.6, eventual: 0.2 },
    tunable: { strong: 1, tunable: 1, eventual: 0.7 },
    eventual: { strong: 1, tunable: 1, eventual: 1 }
  };
  return table[need][have];
}

function scalingFrac(need, have) {
  const table = {
    single: { single: 1, both: 1, distributed: 0.7 },
    distributed: { single: 0.15, both: 1, distributed: 1 }
  };
  return table[need][have];
}

function scoreDb(db, req) {
  let earned = 0, possible = 0;
  const pros = [], cons = [];

  // Workload
  possible += WEIGHTS.workload;
  if (db.workloads.includes(req.workload)) {
    earned += WEIGHTS.workload;
    pros.push("Designed for " + LABELS.workload[req.workload] + " workloads");
  } else {
    cons.push("Not optimized for " + LABELS.workload[req.workload] + " workloads");
  }

  // Data model (skip if "any")
  if (req.dataModel !== "any") {
    possible += WEIGHTS.dataModel;
    if (db.dataModel.includes(req.dataModel)) {
      earned += WEIGHTS.dataModel;
      pros.push(LABELS.dataModel[req.dataModel] + " data model");
    } else {
      cons.push("Not a " + LABELS.dataModel[req.dataModel] + " store");
    }
  }

  // Read/write balance
  possible += WEIGHTS.rw;
  const rwFrac = Math.max(0, 1 - Math.abs(req.rw - db.rw) * 1.5);
  earned += WEIGHTS.rw * rwFrac;
  if (rwFrac > 0.66) pros.push("Good fit for " + LABELS.rw[req.rw] + " access patterns");
  else if (rwFrac < 0.4) cons.push("Less ideal for " + LABELS.rw[req.rw] + " access patterns");

  // Consistency
  possible += WEIGHTS.consistency;
  const cFrac = consistencyFrac(req.consistency, db.consistency);
  earned += WEIGHTS.consistency * cFrac;
  if (cFrac >= 0.9) pros.push("Meets your " + LABELS.consistency[req.consistency] + " consistency need");
  else if (cFrac < 0.5) cons.push("Only " + db.consistency + " consistency (you need " + LABELS.consistency[req.consistency] + ")");

  // Scaling
  possible += WEIGHTS.scaling;
  const sFrac = scalingFrac(req.scale, db.scaling);
  earned += WEIGHTS.scaling * sFrac;
  if (sFrac >= 0.9) pros.push(req.scale === "distributed" ? "Scales horizontally across nodes" : "Runs well on a single node");
  else if (sFrac < 0.5) cons.push(req.scale === "distributed" ? "Not built for horizontal scale" : "Heavier than needed for a single node");

  // Deployment (skip if "any")
  if (req.deployment !== "any") {
    possible += WEIGHTS.deployment;
    if (db.deployment.includes(req.deployment)) {
      earned += WEIGHTS.deployment;
      pros.push(LABELS.deployment[req.deployment] + " deployment available");
    } else {
      cons.push("No " + LABELS.deployment[req.deployment] + " option");
    }
  }

  // SQL (only if required)
  if (req.sql) {
    possible += WEIGHTS.sql;
    if (db.sql) {
      earned += WEIGHTS.sql;
      pros.push("Supports a SQL interface");
    } else {
      cons.push("No native SQL interface");
    }
  }

  return { pct: Math.round((earned / possible) * 100), pros, cons };
}

function readRequirements() {
  const val = (id) => document.getElementById(id).value;
  return {
    workload: val("workload"),
    dataModel: val("dataModel"),
    rw: parseFloat(val("rw")),
    consistency: val("consistency"),
    scale: val("scale"),
    deployment: val("deployment"),
    sql: document.getElementById("sql").checked
  };
}

/* For pluggable databases, pick the storage engine that best fits the request. */
function selectEngine(db, req) {
  if (!db.engines || !db.engines.length) return null;

  let want, reason;
  if (req.workload === "olap") {
    want = "analytics";
    reason = "you chose an analytics (OLAP) workload";
  } else if (req.workload === "cache") {
    want = "cache";
    reason = "you chose a caching workload";
  } else if (req.rw >= 0.66) {
    want = "write";
    reason = "you chose a write-heavy workload";
  } else if (req.rw <= 0.34) {
    want = "read";
    reason = "you chose a read-heavy workload";
  } else {
    want = "default";
    reason = "it is the balanced general-purpose default";
  }

  let engine = db.engines.find(function (e) { return e.bestFor === want; });
  if (!engine) {
    engine = db.engines.find(function (e) { return e.bestFor === "default"; }) || db.engines[0];
    reason = "it is the recommended default for your needs";
  }
  return { engine: engine, reason: reason };
}

function engineBlock(db, req) {
  const baseName = db.name.replace(/\s*\([^)]*\)\s*$/, "");
  const pick = selectEngine(db, req);
  if (!pick) {
    return '<div class="engine-pick">' +
      '<div class="ep-row"><span class="ep-label">Database</span><span class="ep-val">' + baseName + '</span></div>' +
      '<div class="ep-row"><span class="ep-label">Storage engine</span><span class="ep-val">' + db.structure + ' <em>(built-in, not configurable)</em></span></div>' +
      '<div class="ep-row final"><span class="ep-label">Final product</span><span class="ep-val">' + baseName + '</span></div>' +
      '</div>';
  }
  const e = pick.engine;
  return '<div class="engine-pick">' +
    '<div class="ep-row"><span class="ep-label">Database</span><span class="ep-val">' + baseName + ' <em>(pluggable engines)</em></span></div>' +
    '<div class="ep-row"><span class="ep-label">Storage engine</span><span class="ep-val"><strong>' + e.name + '</strong> \u2014 ' + e.structure + '</span></div>' +
    '<div class="ep-why">Chosen because ' + pick.reason + '. ' + e.note + '</div>' +
    '<div class="ep-row final"><span class="ep-label">Final product</span><span class="ep-val">' + baseName + ' with the ' + e.name + ' engine</span></div>' +
    '</div>';
}

function render(results, req) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  const heading = document.createElement("h2");
  heading.textContent = "Ranked matches";
  container.appendChild(heading);

  results.forEach((r, i) => {
    const db = r.db;
    const card = document.createElement("div");
    card.className = "card";

    const tier = r.pct >= 80 ? "great" : r.pct >= 60 ? "good" : r.pct >= 40 ? "ok" : "weak";

    card.innerHTML =
      '<div class="card-head">' +
        '<span class="rank">#' + (i + 1) + '</span>' +
        '<a class="name" href="explore.html?db=' + encodeURIComponent(db.name) + '" title="View full properties of ' + db.name + '">' + db.name + '</a>' +
        '<span class="pct ' + tier + '">' + r.pct + '%</span>' +
      '</div>' +
      '<div class="bar"><div class="bar-fill ' + tier + '" style="width:' + r.pct + '%"></div></div>' +
      '<div class="struct">' + db.structure + '</div>' +
      '<div class="summary">' + db.summary + '</div>' +
      '<div class="meta">' +
        '<span class="meta-item">' + db.license + '</span>' +
        '<span class="meta-item">Since ' + db.released + '</span>' +
        '<span class="meta-item">Popularity: ' + db.popularity + '</span>' +
      '</div>' +
      '<div class="tradeoff"><strong>Trade-off:</strong> ' + db.tradeoff + '</div>' +
      engineBlock(db, req);

    const reasons = document.createElement("div");
    reasons.className = "reasons";
    r.pros.forEach((p) => {
      const chip = document.createElement("span");
      chip.className = "chip pro";
      chip.textContent = "\u2713 " + p;
      reasons.appendChild(chip);
    });
    r.cons.forEach((c) => {
      const chip = document.createElement("span");
      chip.className = "chip con";
      chip.textContent = "\u2717 " + c;
      reasons.appendChild(chip);
    });
    card.appendChild(reasons);
    container.appendChild(card);
  });
}

function recommend() {
  const req = readRequirements();
  const results = window.DB_CATALOG
    .map((db) => {
      const s = scoreDb(db, req);
      return { db: db, pct: s.pct, pros: s.pros, cons: s.cons };
    })
    .sort((a, b) => b.pct - a.pct);
  render(results, req);
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("recommend").addEventListener("click", recommend);
    recommend(); // show an initial ranking with defaults
  });
} else if (typeof module !== "undefined") {
  module.exports = { scoreDb: scoreDb, selectEngine: selectEngine }; // exposed for headless testing
}
