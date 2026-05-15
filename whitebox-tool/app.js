/* ============================================================
   APP.JS — UI Controller, SVG Rendering, Interactions
   ============================================================ */

let currentZoom = 1;
let panX = 0;
let panY = 0;
let analysisData = null;

// ---- TAB SWITCHING ----
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
    document.querySelectorAll('.tab-content').forEach(tc => tc.style.display = 'none');
    const el = document.getElementById(`tab-${tabName}`);
    if (el) el.style.display = '';
}

// ---- GUIDE MODAL ----
function toggleGuide() {
    document.getElementById('guideOverlay').classList.toggle('active');
}

// ---- CLEAR ----
function clearAll() {
    document.getElementById('functionName').value = '';
    document.getElementById('nodeInput').value = '';
    document.getElementById('edgeInput').value = '';
    document.getElementById('nodeCount').textContent = '0 node';
    document.getElementById('edgeCount').textContent = '0 edge';
    document.getElementById('nodeErrors').textContent = '';
    document.getElementById('edgeErrors').textContent = '';
    document.getElementById('emptyState').style.display = '';
    document.querySelectorAll('.tab-content').forEach(tc => tc.style.display = 'none');
    analysisData = null;
    undoStack = [];
}

// ---- ZOOM & PAN ----
function zoomIn() { currentZoom = Math.min(currentZoom * 1.2, 5); updateViewport(); }
function zoomOut() { currentZoom = Math.max(currentZoom / 1.2, 0.1); updateViewport(); }
function resetZoom() { 
    currentZoom = 1; 
    panX = 0;
    panY = 0;
    updateViewport(); 
}

function updateViewport() {
    const viewport = document.getElementById('svgViewport');
    const container = document.getElementById('flowgraphContainer');
    if (viewport) {
        viewport.setAttribute('transform', `translate(${panX}, ${panY}) scale(${currentZoom})`);
    }
    if (container) {
        container.style.backgroundPosition = `${panX}px ${panY}px`;
    }
}

// Fit graph to container
function fitToView() {
    if (!analysisData) return;
    const container = document.getElementById('flowgraphContainer');
    const { svgW, svgH } = analysisData;
    
    const padding = 40;
    const cw = container.clientWidth - padding;
    const ch = container.clientHeight - padding;
    
    currentZoom = Math.min(cw / svgW, ch / svgH, 1);
    panX = (container.clientWidth - svgW * currentZoom) / 2;
    panY = (container.clientHeight - svgH * currentZoom) / 2;

    updateViewport();
}

// ---- EXPORT SVG ----
function exportSVG() {
    const svg = document.getElementById('flowgraphSvg');
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (document.getElementById('functionName').value || 'flowgraph').replace(/[^a-zA-Z0-9_:-]/g, '_') + '.svg';
    a.click();
    URL.revokeObjectURL(url);
}

// ---- LIVE COUNTER ----
document.getElementById('nodeInput').addEventListener('input', function() {
    const lines = this.value.trim().split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
    document.getElementById('nodeCount').textContent = lines.length + ' node';
});
document.getElementById('edgeInput').addEventListener('input', function() {
    const lines = this.value.trim().split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
    document.getElementById('edgeCount').textContent = lines.length + ' edge';
});

// ---- MAIN ANALYZE ----
function analyze() {
    const nodeText = document.getElementById('nodeInput').value;
    const edgeText = document.getElementById('edgeInput').value;
    
    if (!nodeText.trim()) { document.getElementById('nodeErrors').textContent = 'Node tidak boleh kosong!'; return; }
    if (!edgeText.trim()) { document.getElementById('edgeErrors').textContent = 'Edge tidak boleh kosong!'; return; }
    
    // Parse
    const { nodes, errors: nErr } = parseNodes(nodeText);
    document.getElementById('nodeErrors').textContent = nErr.length ? nErr[0] : '';
    if (nErr.length > 0) return;
    
    const nodeIds = new Set(nodes.map(n => n.id));
    const { edges, errors: eErr } = parseEdges(edgeText, nodeIds);
    document.getElementById('edgeErrors').textContent = eErr.length ? eErr[0] : '';
    if (eErr.length > 0) return;
    
    // Compute
    const { vg, totalP, predicates } = computeComplexity(nodes);
    const paths = findIndependentPaths(nodes, edges, vg);
    const coverage = analyzeCoverage(nodes, edges, paths);
    
    // Get initial positions
    const positions = layoutGraph(nodes, edges);
    
    // Calculate static bounds so dragging doesn't shift the canvas
    let minX = Infinity, maxX = -Infinity, minY = 0, maxY = -Infinity;
    positions.forEach(pos => {
        minX = Math.min(minX, pos.x - pos.w/2);
        maxX = Math.max(maxX, pos.x + pos.w/2);
        maxY = Math.max(maxY, pos.y + pos.h);
    });
    
    const pad = 100;
    const svgW = (maxX - minX) + pad * 2;
    const svgH = maxY + pad * 2;
    const offX = -minX + pad;
    const offY = pad;
    
    analysisData = { nodes, edges, vg, totalP, predicates, paths, coverage, positions, svgW, svgH, offX, offY, maxX };
    manualLabelPos.clear();
    undoStack = [];
    
    // Render all tabs
    renderFlowgraph();
    renderComplexity(vg, totalP, predicates, nodes.length, edges.length);
    renderPaths(paths, nodes, edges);
    renderCoverage(coverage, paths);
    
    // Show results
    document.getElementById('emptyState').style.display = 'none';
    switchTab('flowgraph');
    
    // Fit to view after a short delay for layout to settle
    setTimeout(fitToView, 10);
}

// ---- MANUAL DRAG STATE ----
let manualLabelPos = new Map();
const manualEdgeWaypoints = new Map(); // edgeId -> [{x, y}, ...]
const manualEdgePos = new Map();       // edgeId -> {x, y} (legacy offset)
const manualAnchorOffsets = new Map();  // edgeId-(source|target) -> {x, y}
let undoStack = [];
let selectedEdgeId = null;
let dragWaypointIdx = -1;
let dragSegmentIdx = -1;
let dragAnchorType = null; // 'source' or 'target'

function snap(v) { return Math.round(v / 10) * 10; }

// ---- UNDO / HISTORY ----
const MAX_UNDO = 50;
let stateBeforeDrag = null;
let hasDragged = false;

function captureLayoutState() {
    if (!analysisData) return null;
    const anchors = {};
    manualAnchorOffsets.forEach((val, key) => anchors[key] = { ...val });

    return {
        positions: JSON.parse(JSON.stringify(Array.from(analysisData.positions.entries()))),
        labelOffsets: JSON.parse(JSON.stringify(Array.from(manualLabelPos.entries()))),
        waypoints: JSON.parse(JSON.stringify(Array.from(manualEdgeWaypoints.entries()))),
        edgeOffsets: JSON.parse(JSON.stringify(Array.from(manualEdgePos.entries()))),
        anchors
    };
}

function restoreLayoutState(state) {
    if (!state || !analysisData) return;
    analysisData.positions.clear();
    state.positions.forEach(([k, v]) => analysisData.positions.set(k, v));
    manualLabelPos.clear();
    state.labelOffsets.forEach(([k, v]) => manualLabelPos.set(k, v));
    manualEdgeWaypoints.clear();
    state.waypoints.forEach(([k, v]) => manualEdgeWaypoints.set(k, v));
    manualEdgePos.clear();
    state.edgeOffsets.forEach(([k, v]) => manualEdgePos.set(k, v));
    manualAnchorOffsets.clear();
    if (state.anchors) {
        Object.entries(state.anchors).forEach(([k, v]) => manualAnchorOffsets.set(k, v));
    }
    renderFlowgraph();
}

function pushUndo() {
    if (stateBeforeDrag && hasDragged) {
        undoStack.push(stateBeforeDrag);
        if (undoStack.length > MAX_UNDO) undoStack.shift();
    }
    stateBeforeDrag = null;
    hasDragged = false;
}

function undo() {
    if (undoStack.length > 0) {
        const prevState = undoStack.pop();
        restoreLayoutState(prevState);
    }
}

// Global Undo Shortcut
window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
    }
});

// ---- SVG FLOWGRAPH RENDERING ----
function renderFlowgraph() {
    if (!analysisData) return;
    const { nodes, edges, positions, svgW, svgH, offX, offY, maxX } = analysisData;
    const svg = document.getElementById('flowgraphSvg');
    
    // Reset SVG to be responsive
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
    
    const nodeColors = {
        entry:   { fill: '#ffffff', stroke: '#333333', text: '#111' },
        exit:    { fill: '#ffffff', stroke: '#333333', text: '#111' },
        stmt:    { fill: '#ffffff', stroke: '#333333', text: '#111' },
        'if':    { fill: '#ffffff', stroke: '#333333', text: '#111' },
        elseif:  { fill: '#ffffff', stroke: '#333333', text: '#111' },
        loop:    { fill: '#ffffff', stroke: '#333333', text: '#111' },
        'try':   { fill: '#ffffff', stroke: '#333333', text: '#111' },
        'catch': { fill: '#ffffff', stroke: '#333333', text: '#111' },
        ternary: { fill: '#ffffff', stroke: '#333333', text: '#111' },
        merge:   { fill: '#ffffff', stroke: '#333333', text: '#111' }
    };
    
    let html = `<defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" fill="#333">
            <polygon points="0 0, 10 3.5, 0 7"/>
        </marker>
    </defs>
    <g id="svgViewport" transform="translate(${panX}, ${panY}) scale(${currentZoom})">`;
    
    const allOffsets = computeAllAnchorOffsets(edges);
    
    // Draw edges — ORTHOGONAL (garis lurus siku-siku)
    edges.forEach(e => {
        const from = positions.get(e.from);
        const to = positions.get(e.to);
        if (!from || !to) return;
        
        const edgeId = `${e.from}->${e.to}`;
        const dOff = allOffsets.get(edgeId) || {sourceOffX: 0, targetOffX: 0, midYJitter: 0};

        // Respect manual anchor offsets if present
        const sOff = manualAnchorOffsets.get(`${edgeId}-source`) || {x: dOff.sourceOffX, y: from.h};
        const tOff = manualAnchorOffsets.get(`${edgeId}-target`) || {x: dOff.targetOffX, y: -4};

        const x1 = from.x + offX + sOff.x, y1 = from.y + offY + sOff.y;
        const x2 = to.x + offX + tOff.x, y2 = to.y + offY + tOff.y;
        
        let waypoints = manualEdgeWaypoints.get(edgeId);
        
        // Generate default waypoints if none exist
        if (!waypoints) {
            const mEdge = manualEdgePos.get(edgeId) || {x: 0, y: 0};
            const snX = snap(mEdge.x), snY = snap(mEdge.y);
            
            if (y2 <= y1 - from.h) {
                // Loop
                const rx = snap(maxX + offX + 60) + snX + (dOff.idxIn * 5);
                waypoints = [{x: x1, y: y1+20}, {x: rx, y: y1+20}, {x: rx, y: y2-20}, {x: x2, y: y2-20}];
            } else if (Math.abs(x1 - x2) < 5 && snX === 0) {
                // Straight
                waypoints = [];
            } else {
                // Orthogonal
                const midY = snap(y1 + (y2 - y1) / 2) + snY + dOff.midYJitter;
                const midX = x1 + snX;
                waypoints = [{x: midX, y: midY}, {x: x2, y: midY}];
            }
        }

        let pathD = `M${x1},${y1}`;
        (waypoints || []).forEach(p => pathD += ` L${snap(p.x)},${snap(p.y)}`);
        pathD += ` L${x2},${y2}`;

        let labelX, labelY, labelAnchor = 'middle';
        if (waypoints && waypoints.length > 0) {
            const midIdx = Math.floor(waypoints.length / 2);
            labelX = snap(waypoints[midIdx].x);
            labelY = snap(waypoints[midIdx].y) - 10;
        } else {
            labelX = snap((x1 + x2) / 2 + 10);
            labelY = snap((y1 + y2) / 2);
            labelAnchor = 'start';
        }

        const isSelected = selectedEdgeId === edgeId;
        const strokeColor = isSelected ? '#388bfd' : '#333';
        const strokeWidth = isSelected ? 2 : 1.5;
        const dash = (y2 <= y1 - from.h) ? '5,3' : 'none';

        html += `<g class="draggable-edge" data-edge="${edgeId}" style="cursor: pointer;">`;
        // Hit area for easier clicking
        html += `<path d="${pathD}" fill="none" stroke="transparent" stroke-width="12" class="edge-hit-area" />`;
        // Visible path
        html += `<path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${dash}" marker-end="url(#arrowhead)"/>`;
        
        // Waypoint handles
        if (isSelected && waypoints) {
            waypoints.forEach((p, idx) => {
                html += `<circle cx="${snap(p.x)}" cy="${snap(p.y)}" r="4" fill="#fff" stroke="#388bfd" stroke-width="2" class="waypoint-handle" data-edge="${edgeId}" data-idx="${idx}" style="cursor: move;" />`;
            });
        }
        html += `</g>`;
        
        // Edge label
        if (e.label) {
            const edgeId = `${e.from}->${e.to}`;
            const mPos = manualLabelPos.get(edgeId) || {x: 0, y: 0};
            
            labelX += snap(mPos.x);
            labelY += snap(mPos.y);
            
            const tw = e.label.length * 6.5;
            let bgX = labelX - tw/2;
            if (labelAnchor === 'start') bgX = labelX;
            else if (labelAnchor === 'end') bgX = labelX - tw;
            
            html += `<g class="draggable-label" data-edge="${edgeId}" style="cursor: grab;">`;
            html += `<rect x="${bgX - 4}" y="${labelY - 10}" width="${tw + 8}" height="16" fill="#ffffff" opacity="0.95" rx="2" stroke="#ddd" stroke-width="0.5"/>`;
            html += `<text x="${labelX}" y="${labelY + 2}" fill="#333" font-size="11" font-family="Inter,sans-serif" font-weight="600" text-anchor="${labelAnchor}">${e.label}</text>`;
            html += `</g>`;
        }
    });
    
    // Draw nodes
    nodes.forEach(n => {
        const pos = positions.get(n.id);
        if (!pos) return;
        const x = snap(pos.x + offX - pos.w/2);
        const y = snap(pos.y + offY);
        const c = nodeColors[n.type] || nodeColors.stmt;
        const isDiamond = ['if','elseif','loop','ternary'].includes(n.type);
        
        html += `<g class="draggable-node" data-id="${n.id}" style="cursor: grab;">`;
        
        if (isDiamond) {
            const cx = x + pos.w/2, cy = y + pos.h/2;
            const hw = pos.w/2 + 25, hh = pos.h/2 + 10;
            html += `<polygon points="${cx},${cy-hh} ${cx+hw},${cy} ${cx},${cy+hh} ${cx-hw},${cy}" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>`;
        } else if (n.type === 'merge') {
            html += `<circle cx="${x+pos.w/2}" cy="${y+pos.h/2}" r="${pos.h/2}" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>`;
        } else {
            const r = (n.type === 'entry' || n.type === 'exit') ? 20 : 8;
            html += `<rect x="${x}" y="${y}" width="${pos.w}" height="${pos.h}" rx="${r}" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>`;
        }
        
        // Node ID badge
        // Node ID number positioned top-right outside the shape
        html += `<text x="${x+pos.w+8}" y="${y+14}" fill="#333" font-size="12" font-family="Inter" font-weight="700" text-anchor="start">${n.id}</text>`;
        
        // Node label
        const maxChars = 50;
        const label = n.label.length > maxChars ? n.label.substring(0, maxChars) + '…' : n.label;
        html += `<text x="${x+pos.w/2}" y="${y+pos.h/2+4}" fill="${c.text}" font-size="11" font-family="JetBrains Mono,monospace" text-anchor="middle" font-weight="500">${escapeHtml(label)}</text>`;
        
        html += `</g>`;
    });
    
    html += `</g>`;
    svg.innerHTML = html;
}

// ---- DRAG & PAN EVENT LISTENERS ----
let isDragging = false;
let isPanning = false;
let dragType = null;
let dragId = null;
let lastMouseX = 0, lastMouseY = 0;

const flowgraphContainer = document.getElementById('flowgraphContainer');
const flowgraphSvg = document.getElementById('flowgraphSvg');

// Scroll to zoom (Ctrl + Scroll) — Zoom towards cursor
flowgraphContainer.addEventListener('wheel', (e) => {
    if (!analysisData || !e.ctrlKey) return;
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const nextZoom = Math.min(Math.max(currentZoom * delta, 0.1), 5);
    
    const rect = flowgraphContainer.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate mouse position relative to the graph before zoom
    const graphX = (mouseX - panX) / currentZoom;
    const graphY = (mouseY - panY) / currentZoom;

    // Apply new zoom
    currentZoom = nextZoom;

    // Update pan to keep the point under the mouse fixed
    panX = mouseX - graphX * currentZoom;
    panY = mouseY - graphY * currentZoom;

    updateViewport();
}, { passive: false });

// Prevent context menu for right-click panning
flowgraphSvg.addEventListener('contextmenu', (e) => e.preventDefault());

flowgraphSvg.addEventListener('mousedown', (e) => {
    const target = e.target.closest('.draggable-node, .draggable-label, .draggable-edge, .waypoint-handle');
    
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    // Deselect edge if clicking background
    if (!target && e.button === 0) selectedEdgeId = null;

    // Capture state before any potential modification
    stateBeforeDrag = captureLayoutState();
    hasDragged = false;

    // Right Click (Button 2) for Panning
    if (e.button === 2) {
        isPanning = true;
        flowgraphSvg.style.cursor = 'grabbing';
        return;
    }
    
    // Left Click (Button 0)
    if (e.button === 0) {
        if (target) {
            if (target.classList.contains('waypoint-handle')) {
                isDragging = true;
                dragType = 'waypoint';
                dragId = target.getAttribute('data-edge');
                dragWaypointIdx = parseInt(target.getAttribute('data-idx'));
                selectedEdgeId = dragId;
            } else if (target.classList.contains('draggable-node')) {
                isDragging = true;
                dragType = 'node';
                dragId = parseInt(target.getAttribute('data-id'));
            } else if (target.classList.contains('draggable-label')) {
                isDragging = true;
                dragType = 'label';
                dragId = target.getAttribute('data-edge');
                if (!manualLabelPos.has(dragId)) manualLabelPos.set(dragId, {x: 0, y: 0});
            } else if (target.classList.contains('draggable-edge')) {
                const edgeId = target.getAttribute('data-edge');
                selectedEdgeId = edgeId;

                const svgP = getSVGPoint(e);
                const path = getEdgeFullPath(edgeId);
                const x1 = path[0].x, y1 = path[0].y;
                const x2 = path[path.length-1].x, y2 = path[path.length-1].y;

                const distSource = Math.hypot(svgP.x - x1, svgP.y - y1);
                const distTarget = Math.hypot(svgP.x - x2, svgP.y - y2);

                if (distSource < 20) {
                    isDragging = true;
                    dragType = 'anchor';
                    dragAnchorType = 'source';
                    dragId = edgeId;
                } else if (distTarget < 20) {
                    isDragging = true;
                    dragType = 'anchor';
                    dragAnchorType = 'target';
                    dragId = edgeId;
                } else if (e.shiftKey) {
                    // Shift + Click to add waypoint
                    if (!manualEdgeWaypoints.has(edgeId)) {
                        manualEdgeWaypoints.set(edgeId, initializeWaypointsForEdge(edgeId));
                    }
                    const pts = manualEdgeWaypoints.get(edgeId);
                    const insertIdx = findNearestSegmentIndex(svgP, path);
                    pts.splice(insertIdx, 0, {x: svgP.x, y: svgP.y});
                    
                    hasDragged = true;
                    isDragging = true;
                    dragType = 'waypoint';
                    dragId = edgeId;
                    dragWaypointIdx = insertIdx;
                } else {
                    isDragging = true;
                    dragType = 'edge';
                    dragId = edgeId;
                    const pts = manualEdgeWaypoints.get(edgeId);
                    if (pts) {
                        dragSegmentIdx = findNearestSegmentIndex(svgP, path);
                    } else {
                        dragSegmentIdx = -1;
                    }
                }
            }
            flowgraphSvg.style.cursor = 'grabbing';
        }
    }
    renderFlowgraph();
});

// Find the index in waypoints array where the new point should be inserted
function findNearestSegmentIndex(p, path) {
    let minDist = Infinity;
    let bestIdx = 0;

    for (let i = 0; i < path.length - 1; i++) {
        const a = path[i];
        const b = path[i + 1];
        
        // Distance from point p to segment ab
        const l2 = (a.x - b.x)**2 + (a.y - b.y)**2;
        if (l2 === 0) continue;
        
        let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        
        const dist = Math.sqrt((p.x - (a.x + t * (b.x - a.x)))**2 + (p.y - (a.y + t * (b.y - a.y)))**2);
        
        if (dist < minDist) {
            minDist = dist;
            bestIdx = i; // Will insert at i in waypoints (compensating for start node)
        }
    }
    return bestIdx;
}

// Helper to get mouse coord in SVG space
function getSVGPoint(e) {
    const svg = document.getElementById('flowgraphSvg');
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const transformed = pt.matrixTransform(document.getElementById('svgViewport').getScreenCTM().inverse());
    return transformed;
}

function computeAllAnchorOffsets(edges) {
    const incomingMap = new Map();
    const outgoingMap = new Map();
    edges.forEach(e => {
        incomingMap.set(e.to, (incomingMap.get(e.to) || 0) + 1);
        outgoingMap.set(e.from, (outgoingMap.get(e.from) || 0) + 1);
    });
    
    const incomingProcessed = new Map();
    const outgoingProcessed = new Map();
    const offsets = new Map();
    
    edges.forEach(e => {
        const edgeId = `${e.from}->${e.to}`;
        const totalIn = incomingMap.get(e.to) || 1;
        const idxIn = incomingProcessed.get(e.to) || 0;
        incomingProcessed.set(e.to, idxIn + 1);

        const totalOut = outgoingMap.get(e.from) || 1;
        const idxOut = outgoingProcessed.get(e.from) || 0;
        outgoingProcessed.set(e.from, idxOut + 1);

        const sourceOffX = totalOut > 1 ? (idxOut - (totalOut - 1) / 2) * 12 : 0;
        const targetOffX = totalIn > 1 ? (idxIn - (totalIn - 1) / 2) * 12 : 0;
        const midYJitter = totalIn > 1 ? (idxIn - (totalIn - 1) / 2) * 8 : 0;
        
        offsets.set(edgeId, { sourceOffX, targetOffX, midYJitter, idxIn, idxOut });
    });
    return offsets;
}

function getEdgeFullPath(edgeId) {
    if (!analysisData) return [];
    const { edges, positions, offX, offY } = analysisData;
    const e = edges.find(edge => `${edge.from}->${edge.to}` === edgeId);
    if (!e) return [];
    
    const from = positions.get(e.from);
    const to = positions.get(e.to);
    
    // Get automatic distribution offsets for this edge
    const allOffsets = computeAllAnchorOffsets(edges);
    const dOff = allOffsets.get(edgeId) || {sourceOffX: 0, targetOffX: 0, midYJitter: 0};

    // Priority: Manual > Automatic Distribution
    const sOff = manualAnchorOffsets.get(`${edgeId}-source`) || {x: dOff.sourceOffX, y: from.h};
    const tOff = manualAnchorOffsets.get(`${edgeId}-target`) || {x: dOff.targetOffX, y: -4};
    
    const x1 = from.x + offX + sOff.x, y1 = from.y + offY + sOff.y;
    const x2 = to.x + offX + tOff.x, y2 = to.y + offY + tOff.y;
    
    const pts = manualEdgeWaypoints.get(edgeId) || [];
    return [{x: x1, y: y1}, ...pts, {x: x2, y: y2}];
}

function initializeWaypointsForEdge(edgeId) {
    const { nodes, edges, positions, offX, offY, maxX } = analysisData;
    const e = edges.find(edge => `${edge.from}->${edge.to}` === edgeId);
    if (!e) return [];
    const from = positions.get(e.from);
    const to = positions.get(e.to);
    const x1 = from.x + offX, y1 = from.y + offY + from.h;
    const x2 = to.x + offX, y2 = to.y + offY - 4;
    
    if (y2 <= y1 - from.h) {
        const rx = maxX + offX + 60;
        return [{x: x1, y: y1+20}, {x: rx, y: y1+20}, {x: rx, y: y2-20}, {x: x2, y: y2-20}];
    } else if (Math.abs(x1 - x2) < 5) {
        return [{x: (x1+x2)/2, y: (y1+y2)/2}];
    } else {
        const midY = y1 + (y2 - y1) / 2;
        return [{x: x1, y: midY}, {x: x2, y: midY}];
    }
}

window.addEventListener('mousemove', (e) => {
    if ((!isDragging && !isPanning) || !analysisData) return;
    
    const dx = (e.clientX - lastMouseX) / currentZoom;
    const dy = (e.clientY - lastMouseY) / currentZoom;
    
    if (isPanning) {
        const sensitivity = 1.6; // Increased sensitivity
        panX += (e.clientX - lastMouseX) * sensitivity;
        panY += (e.clientY - lastMouseY) * sensitivity;
        updateViewport();
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        return;
    }

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    
    if (isDragging) hasDragged = true;
    
    if (dragType === 'node') {
        const pos = analysisData.positions.get(dragId);
        pos.x += dx;
        pos.y += dy;
    } else if (dragType === 'label') {
        const off = manualLabelPos.get(dragId);
        off.x += dx;
        off.y += dy;
    } else if (dragType === 'waypoint') {
        const pts = manualEdgeWaypoints.get(dragId);
        if (pts && pts[dragWaypointIdx]) {
            pts[dragWaypointIdx].x += dx;
            pts[dragWaypointIdx].y += dy;
        }
    } else if (dragType === 'anchor') {
        const svgP = getSVGPoint(e);
        const { edges, positions, offX, offY } = analysisData;
        const edgeData = edges.find(ed => `${ed.from}->${ed.to}` === dragId);
        const nodeId = (dragAnchorType === 'source') ? edgeData.from : edgeData.to;
        const node = positions.get(nodeId);

        // Slide along perimeter logic
        const relX = svgP.x - (node.x + offX);
        const relY = svgP.y - (node.y + offY);
        
        const distL = Math.abs(relX + node.w/2);
        const distR = Math.abs(relX - node.w/2);
        const distT = Math.abs(relY);
        const distB = Math.abs(relY - node.h);
        
        const min = Math.min(distL, distR, distT, distB);
        let finalX = relX, finalY = relY;
        
        if (min === distL) { finalX = -node.w/2; finalY = Math.max(0, Math.min(node.h, relY)); }
        else if (min === distR) { finalX = node.w/2; finalY = Math.max(0, Math.min(node.h, relY)); }
        else if (min === distT) { finalY = 0; finalX = Math.max(-node.w/2, Math.min(node.w/2, relX)); }
        else { finalY = node.h; finalX = Math.max(-node.w/2, Math.min(node.w/2, relX)); }

        manualAnchorOffsets.set(`${dragId}-${dragAnchorType}`, { x: finalX, y: finalY });
    } else if (dragType === 'edge') {
        const pts = manualEdgeWaypoints.get(dragId);
        if (pts && dragSegmentIdx !== -1) {
            const i = dragSegmentIdx;
            const fullPath = getEdgeFullPath(dragId);
            const s = fullPath[i], en = fullPath[i+1];
            
            const isHorizontal = Math.abs(s.y - en.y) < 5;
            const isVertical = Math.abs(s.x - en.x) < 5;

            if (i > 0 && pts[i-1]) {
                if (isHorizontal) pts[i-1].y += dy;
                else if (isVertical) pts[i-1].x += dx;
                else { pts[i-1].x += dx; pts[i-1].y += dy; }
            }
            if (i < pts.length && pts[i]) {
                if (isHorizontal) pts[i].y += dy;
                else if (isVertical) pts[i].x += dx;
                else { pts[i].x += dx; pts[i].y += dy; }
            }
        } else if (pts) {
            pts.forEach(p => { p.x += dx; p.y += dy; });
        } else {
            const off = manualEdgePos.get(dragId) || {x: 0, y: 0};
            if (!manualEdgePos.has(dragId)) manualEdgePos.set(dragId, off);
            off.x += dx;
            off.y += dy;
        }
    }
    
    renderFlowgraph();
});

window.addEventListener('mouseup', (e) => {
    if (isDragging) {
        pushUndo();
    }
    
    isDragging = false;
    isPanning = false;
    dragType = null;
    flowgraphSvg.style.cursor = 'grab';
});

function escapeHtml(t) {
    return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ---- EXPORT FUNCTIONS ----
// Helper to get standalone SVG for export
function getStandaloneSVG() {
    const svg = document.getElementById('flowgraphSvg').cloneNode(true);
    const viewport = svg.querySelector('#svgViewport');
    
    // If we want to export the current view, we keep the transform.
    // If we want to export the whole graph exactly as laid out, we reset it.
    // Let's reset it for a clean export of the full graph.
    if (viewport) {
        viewport.setAttribute('transform', 'translate(0,0) scale(1)');
    }

    // Embed critical CSS styles for classic look
    const style = document.createElement('style');
    style.textContent = `
        text { font-family: 'JetBrains Mono', monospace; }
        .draggable-label text { font-family: 'Inter', sans-serif; font-weight: 600; }
        polygon, rect, circle { vector-effect: non-scaling-stroke; }
    `;
    svg.insertBefore(style, svg.firstChild);

    // Set dimensions to fit the content exactly based on analysisData
    if (analysisData) {
        svg.setAttribute('width', analysisData.svgW);
        svg.setAttribute('height', analysisData.svgH);
        svg.setAttribute('viewBox', `0 0 ${analysisData.svgW} ${analysisData.svgH}`);
    }

    return new XMLSerializer().serializeToString(svg);
}

// Function to handle system "Save As" dialog
async function saveAsSystem(blob, defaultName, types) {
    try {
        if ('showSaveFilePicker' in window) {
            const handle = await window.showSaveFilePicker({
                suggestedName: defaultName,
                types: types
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
        } else {
            // Fallback for browsers without File System Access API
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = defaultName;
            a.click();
            URL.revokeObjectURL(url);
        }
    } catch (err) {
        console.error("Save cancelled or failed:", err);
    }
}

async function exportSVG() {
    const source = getStandaloneSVG();
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const name = (document.getElementById('functionName').value || 'flowgraph') + ".svg";
    
    await saveAsSystem(blob, name, [{
        description: 'SVG Image',
        accept: {'image/svg+xml': ['.svg']},
    }]);
}

async function exportPNG() {
    const source = getStandaloneSVG();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    const img = new Image();
    img.onload = async function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(async (blob) => {
            const name = (document.getElementById('functionName').value || 'flowgraph') + ".png";
            await saveAsSystem(blob, name, [{
                description: 'PNG Image',
                accept: {'image/png': ['.png']},
            }]);
        }, 'image/png');
    };
    const svgEncoded = encodeURIComponent(source);
    img.src = "data:image/svg+xml;charset=utf-8," + svgEncoded;
}

function exportPDF() {
    window.print(); // Browser print dialog will open, user can Save as PDF
}

// ---- COPY SUMMARY FUNCTION ----
function copySummary() {
    if (!analysisData) return;
    const { nodes, edges, vg, totalP, paths, coverage } = analysisData;
    const funcName = document.getElementById('functionName').value || 'Unnamed Function';
    
    const riskLabel = vg <= 5 ? 'Low' : vg <= 10 ? 'Medium' : vg <= 20 ? 'High' : 'Very High';
    
    let text = `WHITEBOX TESTING ANALYSIS SUMMARY: ${funcName}\n`;
    text += `==================================================\n\n`;
    
    text += `1. CYCLOMATIC COMPLEXITY (McCabe)\n`;
    text += `----------------------------------\n`;
    text += `- Total Predicate Nodes (P): ${totalP}\n`;
    text += `- V(G) = P + 1 = ${totalP} + 1 = ${vg}\n`;
    text += `- Risk Level: ${riskLabel}\n`;
    text += `- Minimum Test Cases Required: ${vg}\n\n`;
    
    text += `2. INDEPENDENT PATHS\n`;
    text += `---------------------\n`;
    paths.forEach((path, i) => {
        text += `Path ${i + 1}: ${path.join(' -> ')}\n`;
    });
    text += `\n`;
    
    text += `3. COVERAGE ANALYSIS\n`;
    text += `---------------------\n`;
    text += `- Statement Coverage: ${coverage.statement.pct}% (${coverage.statement.covered}/${coverage.statement.total} nodes)\n`;
    text += `- Decision Coverage: ${coverage.decision.pct}% (${coverage.decision.covered}/${coverage.decision.total} decisions)\n\n`;
    
    text += `4. DETAILED DECISION NODES\n`;
    text += `--------------------------\n`;
    if (coverage.decision.details.length > 0) {
        coverage.decision.details.forEach(d => {
            text += `- Node ${d.nodeId} (${d.label}):\n`;
            d.branches.forEach(b => {
                text += `  * ${b.label}: ${b.covered ? 'COVERED' : 'NOT COVERED'}\n`;
            });
        });
    } else {
        text += `No decision nodes found.\n`;
    }
    
    text += `\n--------------------------------------------------\n`;
    text += `Generated by Whitebox Testing Tool (SIGAP PNJ)`;

    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copySummaryBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
        setTimeout(() => { btn.innerHTML = originalText; }, 2000);
    });
}

// ---- RENDER COMPLEXITY TAB ----
function renderComplexity(vg, totalP, predicates, nodeCount, edgeCount) {
    const riskColor = vg <= 5 ? 'var(--accent-green)' : vg <= 10 ? 'var(--accent-yellow)' : vg <= 20 ? 'var(--accent-orange)' : 'var(--accent-red)';
    const riskLabel = vg <= 5 ? 'Rendah' : vg <= 10 ? 'Sedang' : vg <= 20 ? 'Tinggi' : 'Sangat Tinggi';
    const riskBadge = vg <= 5 ? 'badge-green' : vg <= 10 ? 'badge-yellow' : 'badge-red';
    
    let html = `
    <div class="result-card">
        <div class="vg-display">
            <div class="vg-number" style="color:${riskColor}">${vg}</div>
            <div class="vg-label">Cyclomatic Complexity V(G)</div>
            <div class="vg-formula">V(G) = P + 1 = ${totalP} + 1 = <strong>${vg}</strong></div>
        </div>
    </div>
    <div class="result-card">
        <h3>📊 Ringkasan <span class="badge ${riskBadge}">Risiko ${riskLabel}</span></h3>
        <table class="coverage-table">
            <tr><td>Total Node</td><td><strong>${nodeCount}</strong></td></tr>
            <tr><td>Total Edge</td><td><strong>${edgeCount}</strong></td></tr>
            <tr><td>Total Predicate (P)</td><td><strong style="color:var(--accent-yellow)">${totalP}</strong></td></tr>
            <tr><td>V(G) = P + 1</td><td><strong style="color:${riskColor}">${vg}</strong></td></tr>
            <tr><td>Minimum Test Cases</td><td><strong>${vg}</strong></td></tr>
        </table>
    </div>
    <div class="result-card">
        <h3>🔍 Detail Predicate Nodes</h3>
        <ul class="predicate-list">`;
    
    predicates.forEach(p => {
        html += `<li>
            <span class="node-badge">Node ${p.id}</span>
            <span class="pred-label">${escapeHtml(p.label)}</span>
            <span class="pred-p">P=${p.p}</span>
        </li>`;
    });
    
    if (predicates.length === 0) html += `<li style="color:var(--text-muted)">Tidak ada predicate node (kode linear)</li>`;
    html += `</ul></div>`;
    
    document.getElementById('complexityResult').innerHTML = html;
}

// ---- RENDER PATHS TAB ----
function renderPaths(paths, nodes, edges) {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const edgeMap = new Map();
    edges.forEach(e => { edgeMap.set(`${e.from}->${e.to}`, e.label); });
    
    let html = `<div class="result-card"><h3>🛤️ Independent Paths <span class="badge badge-blue">${paths.length} path</span></h3>`;
    
    if (paths.length === 0) {
        html += `<p style="color:var(--text-muted);font-size:0.8rem">Tidak dapat menemukan path. Pastikan ada node entry dan exit.</p>`;
    }
    
    paths.forEach((path, i) => {
        // Build description
        let desc = '';
        const lastNode = nodeMap.get(path[path.length - 1]);
        const hasDecision = path.some(id => { const n = nodeMap.get(id); return n && ['if','elseif','loop','catch','ternary'].includes(n.type); });
        if (lastNode && lastNode.type === 'exit') desc = lastNode.label;
        
        html += `<div class="path-item">
            <div class="path-header">
                <span class="path-name">Path ${i + 1}</span>
                ${desc ? `<span class="path-desc">${escapeHtml(desc)}</span>` : ''}
            </div>
            <div class="path-nodes">`;
        
        path.forEach((nodeId, j) => {
            if (j > 0) {
                const edgeLabel = edgeMap.get(`${path[j-1]}->${nodeId}`);
                if (edgeLabel) {
                    html += `<span class="decision-label">(${escapeHtml(edgeLabel)})</span>`;
                }
                html += `<span class="arrow"> → </span>`;
            }
            html += `<span class="node-ref">${nodeId}</span>`;
        });
        
        html += `</div></div>`;
    });
    
    html += `</div>`;
    document.getElementById('pathsResult').innerHTML = html;
}

// ---- RENDER COVERAGE TAB ----
function renderCoverage(cov, paths) {
    let html = `
    <div class="coverage-summary">
        <div class="coverage-stat">
            <div class="stat-value">${cov.statement.pct}%</div>
            <div class="stat-label">Statement Coverage</div>
            <div class="coverage-bar"><div class="coverage-bar-fill green" style="width:${cov.statement.pct}%"></div></div>
        </div>
        <div class="coverage-stat">
            <div class="stat-value">${cov.decision.pct}%</div>
            <div class="stat-label">Decision Coverage</div>
            <div class="coverage-bar"><div class="coverage-bar-fill green" style="width:${cov.decision.pct}%"></div></div>
        </div>
    </div>`;
    
    // Statement Coverage Detail
    html += `<div class="result-card coverage-section">
        <h4>📋 Statement Coverage (${cov.statement.covered}/${cov.statement.total} node)</h4>
        <p style="font-size:0.78rem;color:var(--text-secondary);margin-bottom:10px">
            Setiap node (baris kode) harus dieksekusi minimal 1 kali. Jalankan path berikut untuk memenuhi 100% statement coverage:
        </p>
        <table class="coverage-table"><thead><tr><th>Path</th><th>Node yang Dilalui</th></tr></thead><tbody>`;
    
    const seenNodes = new Set();
    paths.forEach((p, i) => {
        const newNodes = p.filter(n => !seenNodes.has(n));
        p.forEach(n => seenNodes.add(n));
        if (newNodes.length > 0) {
            html += `<tr><td style="color:var(--accent-cyan);font-weight:600">Path ${i+1}</td>
                <td>${p.map(n => `<span class="node-ref">${n}</span>`).join(' → ')}</td></tr>`;
        }
    });
    
    html += `</tbody></table></div>`;
    
    // Decision Coverage Detail
    html += `<div class="result-card coverage-section">
        <h4>🔀 Decision Coverage (${cov.decision.covered}/${cov.decision.total} decision)</h4>
        <p style="font-size:0.78rem;color:var(--text-secondary);margin-bottom:10px">
            Setiap percabangan (IF/Loop/Ternary) harus menghasilkan TRUE <strong>dan</strong> FALSE minimal 1 kali.
        </p>
        <table class="coverage-table"><thead><tr><th>Node</th><th>Kondisi</th><th>Cabang</th><th>Status</th></tr></thead><tbody>`;
    
    cov.decision.details.forEach(d => {
        d.branches.forEach((b, bi) => {
            html += `<tr>
                ${bi === 0 ? `<td rowspan="${d.branches.length}" style="color:var(--accent-yellow);font-weight:600">Node ${d.nodeId}</td>
                <td rowspan="${d.branches.length}">${escapeHtml(d.label)}</td>` : ''}
                <td>${escapeHtml(b.label)}</td>
                <td>${b.covered ? '<span class="check-icon">✅ Covered</span>' : '<span style="color:var(--accent-red)">❌ Not Covered</span>'}</td>
            </tr>`;
        });
    });
    
    if (cov.decision.details.length === 0) {
        html += `<tr><td colspan="4" style="color:var(--text-muted);text-align:center">Tidak ada decision node</td></tr>`;
    }
    
    html += `</tbody></table></div>`;
    
    document.getElementById('coverageResult').innerHTML = html;
}

// ---- LOAD EXAMPLE ----
function loadExample() {
    document.getElementById('functionName').value = 'KegiatanController:store';
    document.getElementById('nodeInput').value = `# KegiatanController:store
1:entry:public function store($request):0
2:stmt:$kak = KAK::findOrFail($request->kak_id):0
3:if:$kak->kegiatan()->exists():1
4:stmt:return back() error 'Sudah diajukan':0
5:if:$kak->status_id !== 3:1
6:stmt:return back() error 'Belum disetujui':0
7:stmt:DB::beginTransaction():0
8:try:try block:0
9:stmt:$filePath = null:0
10:if:$request->hasFile('surat_pengantar'):1
11:stmt:upload file ke Supabase:0
12:if:! $filePath (upload gagal):1
13:stmt:throw new Exception('Gagal upload'):0
14:stmt:Kegiatan::create([...]):0
15:loop:foreach ($approvalSteps as $step):1
16:ternary:$step === 'PPK' ? 'Aktif' : 'Menunggu':1
17:stmt:$kak->update(['status_id' => 6]):0
18:stmt:KegiatanLogStatus::create([...]):0
19:stmt:DB::commit():0
20:exit:return redirect() success:0
21:catch:catch (Exception $e):1
22:stmt:DB::rollBack():0
23:if:isset($filePath) && $filePath:2
24:stmt:Storage::delete($filePath):0
25:exit:return back() error message:0`;

    document.getElementById('edgeInput').value = `# Edges KegiatanController:store
1->2
2->3
3->4(TRUE)
3->5(FALSE)
5->6(TRUE)
5->7(FALSE)
7->8
8->9
9->10
10->11(TRUE)
10->14(FALSE)
11->12
12->13(TRUE)
12->14(FALSE)
13->21
14->15
15->16(Loop Body)
16->15(Next Iteration)
15->17(Loop Exit)
17->18
18->19
19->20
8->21(Exception)
21->22
22->23
23->24(TRUE)
23->25(FALSE)
24->25`;

    // Trigger counters
    document.getElementById('nodeInput').dispatchEvent(new Event('input'));
    document.getElementById('edgeInput').dispatchEvent(new Event('input'));
}

// ---- KEYBOARD SHORTCUT ----
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const guide = document.getElementById('guideOverlay');
        if (guide.classList.contains('active')) toggleGuide();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        analyze();
    }
});
