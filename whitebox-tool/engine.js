/* ============================================================
   ENGINE.JS — Parsing, Graph Analysis, Path Finding
   ============================================================ */

// ---- PARSING ----
function parseNodes(text) {
    const lines = text.trim().split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
    const nodes = []; const errors = [];
    const validTypes = ['entry','exit','stmt','if','elseif','loop','try','catch','ternary','merge'];
    const ids = new Set();
    lines.forEach((line, i) => {
        const parts = line.split(':');
        if (parts.length < 4) { errors.push(`Baris ${i+1}: Format salah, butuh 4 bagian (id:type:label:complexity)`); return; }
        const id = parseInt(parts[0].trim());
        const type = parts[1].trim().toLowerCase();
        const label = parts.slice(2, -1).join(':').trim();
        const complexity = parseInt(parts[parts.length - 1].trim());
        if (isNaN(id) || id < 1) { errors.push(`Baris ${i+1}: ID harus angka positif`); return; }
        if (ids.has(id)) { errors.push(`Baris ${i+1}: ID ${id} duplikat`); return; }
        if (!validTypes.includes(type)) { errors.push(`Baris ${i+1}: Type "${type}" tidak valid`); return; }
        if (isNaN(complexity) || complexity < 0) { errors.push(`Baris ${i+1}: Complexity harus >= 0`); return; }
        ids.add(id);
        nodes.push({ id, type, label, complexity });
    });
    return { nodes, errors };
}

function parseEdges(text, nodeIds) {
    const lines = text.trim().split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
    const edges = []; const errors = [];
    const re = /^(\d+)\s*->\s*(\d+)(?:\(([^)]*)\))?$/;
    lines.forEach((line, i) => {
        const m = line.trim().match(re);
        if (!m) { errors.push(`Baris ${i+1}: Format salah, gunakan "from->to" atau "from->to(LABEL)"`); return; }
        const from = parseInt(m[1]), to = parseInt(m[2]), label = m[3] || '';
        if (!nodeIds.has(from)) errors.push(`Baris ${i+1}: Node ${from} tidak ditemukan`);
        if (!nodeIds.has(to)) errors.push(`Baris ${i+1}: Node ${to} tidak ditemukan`);
        edges.push({ from, to, label });
    });
    return { edges, errors };
}

// ---- CYCLOMATIC COMPLEXITY ----
function computeComplexity(nodes) {
    let totalP = 0;
    const predicates = [];
    nodes.forEach(n => {
        if (n.complexity > 0) {
            totalP += n.complexity;
            predicates.push({ id: n.id, type: n.type, label: n.label, p: n.complexity });
        }
    });
    return { vg: totalP + 1, totalP, predicates };
}

// ---- INDEPENDENT PATHS (DFS) ----
function findIndependentPaths(nodes, edges, vg) {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const adj = new Map();
    nodes.forEach(n => adj.set(n.id, []));
    edges.forEach(e => { if (adj.has(e.from)) adj.get(e.from).push({ to: e.to, label: e.label }); });
    
    const entryNodes = nodes.filter(n => n.type === 'entry');
    const exitNodes = new Set(nodes.filter(n => n.type === 'exit').map(n => n.id));
    // Also treat nodes with no outgoing edges as exits
    nodes.forEach(n => { if ((adj.get(n.id) || []).length === 0) exitNodes.add(n.id); });
    
    if (entryNodes.length === 0) return [];
    const startId = entryNodes[0].id;
    
    const allPaths = [];
    const maxPaths = Math.max(vg * 2, 30);
    
    function dfs(current, path, visited) {
        if (allPaths.length >= maxPaths) return;
        path.push(current);
        if (exitNodes.has(current)) {
            allPaths.push([...path]);
            path.pop();
            return;
        }
        visited.add(current);
        const neighbors = adj.get(current) || [];
        for (const nb of neighbors) {
            if (visited.has(nb.to)) {
                // Allow loop back once
                allPaths.push([...path, nb.to]);
                continue;
            }
            dfs(nb.to, path, new Set(visited));
        }
        path.pop();
    }
    
    dfs(startId, [], new Set());
    
    // Select up to V(G) independent paths (ones that cover new edges)
    const coveredEdges = new Set();
    const selected = [];
    
    function pathEdges(p) {
        const e = [];
        for (let i = 0; i < p.length - 1; i++) e.push(`${p[i]}->${p[i+1]}`);
        return e;
    }
    
    // Sort paths by length descending to get more coverage
    allPaths.sort((a, b) => b.length - a.length);
    
    for (const p of allPaths) {
        if (selected.length >= vg) break;
        const pe = pathEdges(p);
        const hasNew = pe.some(e => !coveredEdges.has(e));
        if (hasNew || selected.length === 0) {
            selected.push(p);
            pe.forEach(e => coveredEdges.add(e));
        }
    }
    
    // If we still need more paths, add remaining
    for (const p of allPaths) {
        if (selected.length >= vg) break;
        if (!selected.includes(p)) selected.push(p);
    }
    
    return selected.slice(0, vg);
}

// ---- COVERAGE ANALYSIS ----
function analyzeCoverage(nodes, edges, paths) {
    const nodeSet = new Set(nodes.map(n => n.id));
    const edgeSet = new Set(edges.map(e => `${e.from}->${e.to}`));
    
    // Statement coverage: which nodes are covered
    const coveredNodes = new Set();
    paths.forEach(p => p.forEach(n => coveredNodes.add(n)));
    const stmtCovered = nodes.filter(n => coveredNodes.has(n.id)).length;
    const stmtTotal = nodes.length;
    
    // Decision coverage: for decision nodes, check if both TRUE and FALSE branches are taken
    const decisionNodes = nodes.filter(n => ['if','elseif','loop','ternary','catch'].includes(n.type) && n.complexity > 0);
    const edgeMap = new Map();
    edges.forEach(e => {
        if (!edgeMap.has(e.from)) edgeMap.set(e.from, []);
        edgeMap.get(e.from).push(e);
    });
    
    const coveredEdges = new Set();
    paths.forEach(p => {
        for (let i = 0; i < p.length - 1; i++) coveredEdges.add(`${p[i]}->${p[i+1]}`);
    });
    
    const decisions = [];
    decisionNodes.forEach(dn => {
        const outEdges = edgeMap.get(dn.id) || [];
        const branches = outEdges.map(e => ({
            to: e.to,
            label: e.label || `→${e.to}`,
            covered: coveredEdges.has(`${e.from}->${e.to}`)
        }));
        const allCovered = branches.length > 0 && branches.every(b => b.covered);
        decisions.push({ nodeId: dn.id, label: dn.label, type: dn.type, branches, allCovered });
    });
    
    const decCovered = decisions.filter(d => d.allCovered).length;
    const decTotal = decisions.length;
    
    return {
        statement: { covered: stmtCovered, total: stmtTotal, pct: stmtTotal > 0 ? Math.round(stmtCovered/stmtTotal*100) : 0 },
        decision: { covered: decCovered, total: decTotal, pct: decTotal > 0 ? Math.round(decCovered/decTotal*100) : 0, details: decisions },
        coveredNodes, coveredEdges
    };
}

// ---- GRAPH LAYOUT (Branching Left/Right for Decisions) ----
function layoutGraph(nodes, edges) {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const adj = new Map();       // adjacency with edge info
    const adjSimple = new Map(); // adjacency just IDs
    const inDeg = new Map();
    const inEdges = new Map();   // incoming edges per node
    
    nodes.forEach(n => { adj.set(n.id, []); adjSimple.set(n.id, []); inDeg.set(n.id, 0); inEdges.set(n.id, []); });
    edges.forEach(e => {
        if (adj.has(e.from)) adj.get(e.from).push(e);
        if (adjSimple.has(e.from)) adjSimple.get(e.from).push(e.to);
        if (inDeg.has(e.to)) inDeg.set(e.to, inDeg.get(e.to) + 1);
        if (inEdges.has(e.to)) inEdges.get(e.to).push(e);
    });
    
    // Step 1: Topological sort (Kahn's) for Y layers
    const queue = [];
    const layers = new Map();
    nodes.forEach(n => { if (inDeg.get(n.id) === 0) { queue.push(n.id); layers.set(n.id, 0); } });
    
    let maxLayer = 0;
    while (queue.length > 0) {
        const cur = queue.shift();
        const curLayer = layers.get(cur);
        for (const nb of (adjSimple.get(cur) || [])) {
            if (!layers.has(nb) || layers.get(nb) < curLayer + 1) {
                layers.set(nb, curLayer + 1);
                maxLayer = Math.max(maxLayer, curLayer + 1);
            }
            inDeg.set(nb, inDeg.get(nb) - 1);
            if (inDeg.get(nb) === 0) queue.push(nb);
        }
    }
    nodes.forEach(n => { if (!layers.has(n.id)) layers.set(n.id, ++maxLayer); });
    
    // Step 2: Assign X offsets — decisions branch left/right
    const xOffset = new Map(); // node id -> column offset (0 = center)
    const decisionTypes = new Set(['if', 'elseif', 'loop', 'ternary', 'catch']);
    
    // BFS from entry to assign offsets
    const entry = nodes.find(n => n.type === 'entry');
    const startId = entry ? entry.id : nodes[0].id;
    xOffset.set(startId, 0);
    
    const visited = new Set();
    const bfsQueue = [startId];
    visited.add(startId);
    
    while (bfsQueue.length > 0) {
        const cur = bfsQueue.shift();
        const curOff = xOffset.get(cur) || 0;
        const outEdges = adj.get(cur) || [];
        const curNode = nodeMap.get(cur);
        const isDecision = curNode && decisionTypes.has(curNode.type);
        
        if (isDecision && outEdges.length >= 2) {
            // Determine which edge is TRUE/FALSE or first/second
            outEdges.forEach((e, idx) => {
                const label = (e.label || '').toUpperCase();
                let off = curOff;
                if (label === 'TRUE' || label === 'Y' || label === 'YES') {
                    off = curOff + 1; // RIGHT
                } else if (label === 'FALSE' || label === 'N' || label === 'NO') {
                    off = curOff - 1; // LEFT
                } else if (idx === 0) {
                    off = curOff - 1; // First edge → LEFT
                } else {
                    off = curOff + 1; // Second edge → RIGHT
                }
                
                if (!xOffset.has(e.to)) xOffset.set(e.to, off);
                if (!visited.has(e.to)) { visited.add(e.to); bfsQueue.push(e.to); }
            });
        } else {
            outEdges.forEach(e => {
                // If target has multiple incoming edges (merge point), bring it closer to center
                const targetInCount = (inEdges.get(e.to) || []).length;
                if (!xOffset.has(e.to)) {
                    if (targetInCount > 1) {
                        // Merge point: try to center it
                        const incomingOffsets = (inEdges.get(e.to) || [])
                            .map(ie => xOffset.get(ie.from))
                            .filter(o => o !== undefined);
                        if (incomingOffsets.length > 0) {
                            const avg = incomingOffsets.reduce((a, b) => a + b, 0) / incomingOffsets.length;
                            xOffset.set(e.to, Math.round(avg));
                        } else {
                            xOffset.set(e.to, curOff);
                        }
                    } else {
                        xOffset.set(e.to, curOff);
                    }
                }
                if (!visited.has(e.to)) { visited.add(e.to); bfsQueue.push(e.to); }
            });
        }
    }
    
    // Unvisited nodes
    nodes.forEach(n => { if (!xOffset.has(n.id)) xOffset.set(n.id, 0); });
    
    // Step 3: Convert to pixel positions
    const nodeH = 50, colW = 420, rowH = 150;
    const positions = new Map();
    
    nodes.forEach(n => {
        const col = xOffset.get(n.id) || 0;
        const row = layers.get(n.id) || 0;
        
        // Calculate dynamic width based on label length
        const charWidth = 7; // Approx width per char
        const padding = 50;
        const maxChars = 50; // Cap at 50 chars
        const effectiveLen = Math.min(n.label.length, maxChars);
        const w = Math.max(140, effectiveLen * charWidth + padding);

        positions.set(n.id, {
            x: col * colW,
            y: row * rowH,
            w: w,
            h: nodeH
        });
    });
    
    return positions;
}
