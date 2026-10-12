const STORAGE_KEY = 'infradesk-demo-v1';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;

const seed = {
  monitors: [
    { id: 'mon-01', name: 'CSE-PH Reviewer', url: 'cscjhelo.netlify.app', kind: 'Web app', environment: 'Production', status: 'operational', latency: 182, uptime: '99.99%', lastCheck: '45 sec ago', history: [99.8, 99.9, 99.8, 100, 99.9, 99.9, 100, 99.9, 99.8, 100, 99.9, 100] },
    { id: 'mon-02', name: 'InfraDesk API', url: 'api.infradesk.demo', kind: 'API', environment: 'Staging', status: 'degraded', latency: 684, uptime: '99.70%', lastCheck: '2 min ago', history: [100, 100, 99.9, 100, 99.8, 99.9, 98.8, 99.3, 98.9, 99.8, 99.7, 99.2] },
    { id: 'mon-03', name: 'Primary database', url: 'db-primary.infradesk.local', kind: 'Database', environment: 'Production', status: 'operational', latency: 14, uptime: '99.98%', lastCheck: '30 sec ago', history: [99.9, 100, 100, 99.9, 100, 100, 99.9, 100, 100, 99.9, 100, 100] },
    { id: 'mon-04', name: 'Background workers', url: 'worker-queue-01', kind: 'Queue', environment: 'Production', status: 'operational', latency: 32, uptime: '99.96%', lastCheck: '1 min ago', history: [100, 99.9, 100, 100, 99.8, 100, 99.9, 100, 100, 99.9, 100, 100] },
    { id: 'mon-05', name: 'Status page', url: 'status.infradesk.demo', kind: 'Web app', environment: 'Production', status: 'operational', latency: 96, uptime: '99.99%', lastCheck: '1 min ago', history: [99.9, 100, 99.9, 100, 100, 99.9, 100, 100, 99.9, 100, 100, 99.9] },
  ],
  assets: [
    { id: 'INF-001', name: 'Public web application', kind: 'Web app', environment: 'Production', owner: 'Alex Morgan', health: 'operational', monitorId: 'mon-01' },
    { id: 'INF-002', name: 'Application API', kind: 'API service', environment: 'Staging', owner: 'Alex Morgan', health: 'degraded', monitorId: 'mon-02' },
    { id: 'INF-003', name: 'Primary data store', kind: 'Database', environment: 'Production', owner: 'Platform team', health: 'operational', monitorId: 'mon-03' },
    { id: 'INF-004', name: 'Job processing queue', kind: 'Queue', environment: 'Production', owner: 'Platform team', health: 'operational', monitorId: 'mon-04' },
    { id: 'INF-005', name: 'Public status page', kind: 'Web app', environment: 'Production', owner: 'Alex Morgan', health: 'operational', monitorId: 'mon-05' },
  ],
  incidents: [
    { id: 'INC-1042', title: 'Elevated API response times', severity: 'major', status: 'investigating', monitorId: 'mon-02', updatedAt: '12 min ago', detail: 'Latency is above the 500 ms service objective in the sample environment.', timeline: [{ at: '12 min ago', title: 'Incident created', detail: 'Seeded sample incident for the staging API.' }] },
    { id: 'INC-1041', title: 'Queue depth returned to normal', severity: 'minor', status: 'resolved', monitorId: 'mon-04', updatedAt: '1 hr ago', detail: 'Backlog cleared after the worker pool recovered.', timeline: [{ at: '1 hr ago', title: 'Incident resolved', detail: 'Backlog cleared after the worker pool recovered.' }] },
  ],
  activity: [
    { id: 'evt-1', title: 'Monitor check completed', detail: 'CSE-PH Reviewer · 182 ms response time', time: '2 min ago', kind: 'check' },
    { id: 'evt-2', title: 'Incident updated', detail: 'INC-1042 · Elevated API response times', time: '12 min ago', kind: 'incident' },
    { id: 'evt-3', title: 'Asset inventory synced', detail: '5 tracked assets in the sample workspace', time: '38 min ago', kind: 'asset' },
    { id: 'evt-4', title: 'Incident resolved', detail: 'INC-1041 · Queue depth returned to normal', time: '1 hr ago', kind: 'check' },
  ],
};

const viewDetails = {
  overview: { title: 'Good morning, Alex', subtitle: 'Here’s what’s happening across your services today.', breadcrumb: 'Overview', eyebrow: 'YOUR INFRASTRUCTURE AT A GLANCE' },
  monitoring: { title: 'Service monitoring', subtitle: 'Keep an eye on the endpoints and services that matter.', breadcrumb: 'Monitoring', eyebrow: 'MONITORING / SERVICE HEALTH' },
  assets: { title: 'Asset inventory', subtitle: 'A clear view of the infrastructure in your workspace.', breadcrumb: 'Assets', eyebrow: 'INVENTORY / CONFIGURATION ITEMS' },
  incidents: { title: 'Incident desk', subtitle: 'Capture service interruptions and keep response work visible.', breadcrumb: 'Incidents', eyebrow: 'RESPONSE / INCIDENT MANAGEMENT' },
  activity: { title: 'Activity log', subtitle: 'A chronological record of the work in this demo workspace.', breadcrumb: 'Activity log', eyebrow: 'AUDIT TRAIL / RECENT CHANGES' },
};

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return structuredClone(seed);
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed.monitors) || !Array.isArray(parsed.assets) || !Array.isArray(parsed.incidents) || !Array.isArray(parsed.activity)) return structuredClone(seed);
    parsed.monitors = parsed.monitors.map((monitor) => ({ ...monitor, history: Array.isArray(monitor.history) ? monitor.history : [], checkHistory: Array.isArray(monitor.checkHistory) ? monitor.checkHistory : [] }));
    parsed.incidents = parsed.incidents.map((incident) => ({ ...incident, timeline: Array.isArray(incident.timeline) ? incident.timeline : [] }));
    parsed.activity = parsed.activity.map((item) => ({ ...item, at: item.at || '' }));
    return parsed;
  } catch { return structuredClone(seed); }
}

let state = loadState();
let activeView = location.hash.slice(1) in viewDetails ? location.hash.slice(1) : 'overview';
let searchTerm = '';
let incidentFilter = 'all';
let monitorStatusFilter = 'all';
let monitorEnvironmentFilter = 'all';
let assetTypeFilter = 'all';
let assetEnvironmentFilter = 'all';
let assetHealthFilter = 'all';
let activityKindFilter = 'all';

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
  catch { toast('This browser could not save the demo changes.', true); return false; }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function filtered(items, fields) {
  const term = searchTerm.trim().toLowerCase();
  if (!term) return items;
  return items.filter((item) => fields.some((field) => String(item[field] ?? '').toLowerCase().includes(term)));
}

function statusClass(status) { return `status-${['operational', 'degraded', 'down', 'paused'].includes(status) ? status : 'unknown'}`; }
function statusLabel(status) { return ({ operational: 'Operational', degraded: 'Degraded', down: 'Down', unknown: 'Awaiting check', paused: 'Paused' })[status] || 'Awaiting check'; }
function severityLabel(severity) { return ({ critical: 'Critical', major: 'Major', minor: 'Minor' })[severity] || 'Minor'; }
function openIncidents() { return state.incidents.filter((item) => item.status !== 'resolved'); }
function monitorName(id) { return state.monitors.find((item) => item.id === id)?.name || 'Unlinked service'; }
function typeIcon(kind) { return kind?.toLowerCase().includes('database') ? 'database' : kind?.toLowerCase().includes('queue') ? 'activity' : kind?.toLowerCase().includes('server') ? 'server' : 'globe'; }
function nowLabel() { return new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()).toUpperCase(); }
function greetingTitle() {
  const hour = new Date().getHours();
  return `${hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'}, Alex`;
}
function relativeTime(value) {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  if (!Number.isFinite(elapsed)) return 'Just now';
  if (elapsed < 60_000) return 'Just now';
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)} min ago`;
  if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)} hr ago`;
  return `${Math.floor(elapsed / 86_400_000)} days ago`;
}
function formatTimestamp(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value || 'Just now') : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
function nextIncidentId() {
  const highest = state.incidents.reduce((max, incident) => Math.max(max, Number(String(incident.id).match(/\d+$/)?.[0] || 1041)), 1041);
  return `INC-${String(highest + 1).padStart(4, '0')}`;
}
function nextAssetId() {
  const highest = state.assets.reduce((max, asset) => Math.max(max, Number(String(asset.id).match(/\d+$/)?.[0] || 0)), 0);
  return `INF-${String(highest + 1).padStart(3, '0')}`;
}
function addIncidentTimeline(incident, title, detail) {
  incident.timeline ||= [];
  incident.timeline.unshift({ at: new Date().toISOString(), title, detail });
  incident.timeline = incident.timeline.slice(0, 30);
  incident.updatedAt = 'Just now';
  incident.updatedAtTime = incident.timeline[0].at;
}

function metricCard(label, value, unit, trend, iconName, tone = 'up') {
  return `<article class="metric-card"><div class="metric-head"><span>${label}</span><span class="metric-icon">${icon(iconName)}</span></div><div class="metric-value-row"><strong class="metric-value">${value}</strong>${unit ? `<span class="metric-unit">${unit}</span>` : ''}</div><div class="metric-trend ${tone === 'warn' ? 'trend-warn' : tone === 'up' ? 'trend-up' : ''}"><span class="trend-dot"></span>${trend}</div></article>`;
}

function statusPill(status) { return `<span class="status-pill ${statusClass(status)}">${statusLabel(status)}</span>`; }
function incidentPill(severity) { return `<span class="severity-pill severity-${escapeHtml(severity)}">${severityLabel(severity)}</span>`; }
function serviceCell(monitor) { return `<div class="service-name-cell"><span class="service-icon">${icon(typeIcon(monitor.kind))}</span><span class="service-copy">${monitor.id ? `<button class="service-detail-link" type="button" data-monitor-details="${escapeHtml(monitor.id)}">${escapeHtml(monitor.name)}</button>` : `<strong>${escapeHtml(monitor.name)}</strong>`}<small>${escapeHtml(monitor.url)}</small></span></div>`; }

function monitorTableRows(monitors, includeActions = false) {
  if (!monitors.length) return `<tr><td colspan="${includeActions ? 7 : 4}"><div class="empty-state"><strong>No services found</strong>Try another search, or add a monitor to this demo.</div></td></tr>`;
  return monitors.map((monitor) => `<tr>
    <td>${serviceCell(monitor)}</td><td>${statusPill(monitor.paused ? 'paused' : monitor.status)}</td>${includeActions ? `<td><span class="env-pill">${escapeHtml(monitor.environment)}</span></td>` : ''}<td><span class="${monitor.latency > 450 ? 'latency-warn' : 'latency-good'}">${monitor.latency ? `${monitor.latency} ms` : '—'}</span></td><td>${escapeHtml(monitor.uptime || '—')}</td>${includeActions ? `<td>${escapeHtml(monitor.lastCheckAt ? relativeTime(monitor.lastCheckAt) : monitor.lastCheck || 'Not checked')}</td><td><div class="row-actions"><button class="row-link" type="button" data-monitor-details="${escapeHtml(monitor.id)}">Details</button><button class="row-link" type="button" data-sample-check="${escapeHtml(monitor.id)}">Sample check</button><button class="row-link" type="button" data-edit-monitor="${escapeHtml(monitor.id)}">Edit</button><button class="row-link" type="button" data-new-incident="${escapeHtml(monitor.id)}">Incident</button><button class="row-link" type="button" data-monitor-toggle="${escapeHtml(monitor.id)}">${monitor.paused ? 'Resume' : 'Pause'}</button></div></td>` : ''}
  </tr>`).join('');
}

function incidentCards(incidents) {
  if (!incidents.length) return `<div class="empty-state"><strong>All clear</strong>No matching incidents in this demo workspace.</div>`;
  return incidents.map((item) => `<article class="incident-item ${item.severity === 'critical' ? 'is-critical' : ''}"><div class="incident-main"><div class="incident-name">${escapeHtml(item.title)}</div><div class="incident-meta">${incidentPill(item.severity)}<span>${escapeHtml(monitorName(item.monitorId))}</span></div></div><span class="incident-age">${escapeHtml(item.updatedAt)}</span></article>`).join('');
}

function chartSvg() {
  const histories = state.monitors.filter((monitor) => !monitor.paused).map((monitor) => monitor.history || []).filter((history) => history.length);
  const pointsCount = Math.max(12, ...histories.map((history) => history.length));
  const values = Array.from({ length: pointsCount }, (_, index) => {
    const samples = histories.map((history) => history[index - (pointsCount - history.length)]).filter(Number.isFinite);
    return samples.length ? samples.reduce((sum, value) => sum + value, 0) / samples.length : 99.9;
  });
  const left = 35, top = 12, width = 570, height = 112;
  const coords = values.map((value, index) => {
    const x = left + (index / (values.length - 1)) * width;
    const y = top + ((100 - value) / 3) * height;
    return [x.toFixed(1), y.toFixed(1)];
  });
  const points = coords.map(([x, y]) => `${x},${y}`).join(' ');
  const area = `${left},${top + height} ${points} ${left + width},${top + height}`;
  const labels = ['Oldest', 'Earlier', 'Midpoint', 'Later', 'Recent', 'Latest', 'Now'];
  return `<svg class="uptime-chart" viewBox="0 0 630 165" role="img" aria-label="Illustrative sample availability trend across monitored services">
    <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#69b69a" stop-opacity=".22"/><stop offset="100%" stop-color="#69b69a" stop-opacity="0"/></linearGradient></defs>
    <line class="chart-grid-line" x1="35" y1="12" x2="605" y2="12"/><line class="chart-grid-line" x1="35" y1="49" x2="605" y2="49"/><line class="chart-grid-line" x1="35" y1="86" x2="605" y2="86"/><line class="chart-grid-line" x1="35" y1="124" x2="605" y2="124"/>
    <text class="chart-axis-label" x="1" y="15">100%</text><text class="chart-axis-label" x="5" y="52">99%</text><text class="chart-axis-label" x="5" y="89">98%</text><text class="chart-axis-label" x="5" y="127">97%</text>
    <polygon class="chart-area" points="${area}"/><polyline class="chart-line" points="${points}"/><circle class="chart-point" cx="${coords.at(-1)[0]}" cy="${coords.at(-1)[1]}" r="3.2"/>
    ${labels.map((label, index) => `<text class="chart-x-label" x="${left + (index / (labels.length - 1)) * width}" y="151" text-anchor="middle">${label}</text>`).join('')}
  </svg>`;
}

function renderOverview() {
  const activeMonitors = state.monitors.filter((item) => !item.paused);
  const operational = activeMonitors.filter((item) => item.status === 'operational').length;
  const total = state.monitors.length;
  const average = activeMonitors.filter((item) => Number(item.latency) > 0);
  const avgLatency = average.length ? Math.round(average.reduce((sum, item) => sum + Number(item.latency), 0) / average.length) : 0;
  const uptimeSamples = activeMonitors.map((item) => Number(item.history?.at(-1))).filter(Number.isFinite);
  const latestUptime = uptimeSamples.length ? (uptimeSamples.reduce((sum, value) => sum + value, 0) / uptimeSamples.length).toFixed(2) : '—';
  const open = openIncidents().length;
  const recentMonitors = filtered(state.monitors, ['name', 'url', 'kind', 'environment', 'status']).slice(0, 4);
  const liveIncidents = filtered(openIncidents(), ['title', 'severity', 'status']).slice(0, 3);
  return `<div class="metric-grid">
    ${metricCard('Services monitored', total, '', 'Sample endpoints in this workspace', 'pulse', 'neutral')}
    ${metricCard('Services operational', `${operational}<span class="metric-unit">/ ${activeMonitors.length}</span>`, '', 'Active sample monitors', 'check', 'up')}
    ${metricCard('Open incidents', open, '', open ? 'Needs attention in the demo' : 'No active incidents', 'alert', open ? 'warn' : 'up')}
    ${metricCard('Avg. response time', avgLatency || '—', avgLatency ? 'ms' : '', 'Illustrative sample values', 'clock', 'neutral')}
  </div>
  <div class="dashboard-grid">
    <section class="panel"><header class="panel-header"><div class="panel-heading"><h2 class="panel-title">Service availability</h2><p class="panel-subtitle">Example uptime across monitored services</p></div><span class="chart-kpi">${latestUptime === '—' ? '—' : `${latestUptime}%`} <span class="metric-note">sample avg</span></span></header><div class="chart-wrap"><div class="chart-legend"><span><i class="legend-dot"></i>Availability</span><span>Illustrative sample points</span></div>${chartSvg()}<div class="chart-caption"><span>Percent of sample availability points</span><span>Demo trend · not live</span></div></div></section>
    <section class="panel"><header class="panel-header"><div class="panel-heading"><h2 class="panel-title">Resource snapshot</h2><p class="panel-subtitle">Example host telemetry</p></div><span class="demo-pill">SAMPLE</span></header><div class="health-list">
      <div class="health-item"><span class="health-ring">42%</span><span class="health-copy"><span class="health-name">CPU utilization</span><span class="health-desc">app-node-01 · 4 vCPU</span></span><span class="health-value">Normal</span></div>
      <div class="health-item"><span class="health-ring amber">71%</span><span class="health-copy"><span class="health-name">Memory usage</span><span class="health-desc">5.7 / 8 GB allocated</span></span><span class="health-value">Watch</span></div>
      <div class="health-item"><span class="health-ring blue">58%</span><span class="health-copy"><span class="health-name">Disk capacity</span><span class="health-desc">116 / 200 GB used</span></span><span class="health-value">Normal</span></div>
      <div class="health-foot"><span>Last sample update</span><strong>3 minutes ago</strong></div>
    </div></section>
  </div>
  <div class="lower-grid">
    <section class="panel"><header class="panel-header"><div class="panel-heading"><h2 class="panel-title">Monitored services</h2><p class="panel-subtitle">A quick look at your connected endpoints</p></div><button class="panel-action" type="button" data-go="monitoring">View all ${icon('arrow')}</button></header><div class="table-scroll"><table class="data-table"><thead><tr><th>Service</th><th>Status</th><th>Latency</th><th>Uptime</th></tr></thead><tbody>${monitorTableRows(recentMonitors)}</tbody></table></div><div class="table-footer"><span>Showing ${recentMonitors.length} of ${total} sample monitors</span><button type="button" data-go="monitoring">Monitoring ${icon('chevron')}</button></div></section>
    <section class="panel"><header class="panel-header"><div class="panel-heading"><h2 class="panel-title">Incident queue</h2><p class="panel-subtitle">Open response work</p></div><button class="panel-action" type="button" data-go="incidents">See queue ${icon('arrow')}</button></header><div class="incident-list">${incidentCards(liveIncidents)}</div>${liveIncidents.length ? `<div class="table-footer"><span>${open} open ${open === 1 ? 'incident' : 'incidents'} in sample data</span><button type="button" data-go="incidents">Manage ${icon('chevron')}</button></div>` : ''}</section>
  </div>`;
}

function renderMonitoring() {
  let monitors = filtered(state.monitors, ['name', 'url', 'kind', 'environment', 'status']);
  if (monitorStatusFilter !== 'all') monitors = monitors.filter((item) => (item.paused ? 'paused' : item.status) === monitorStatusFilter);
  if (monitorEnvironmentFilter !== 'all') monitors = monitors.filter((item) => item.environment === monitorEnvironmentFilter);
  const online = state.monitors.filter((item) => !item.paused && item.status === 'operational').length;
  const degraded = state.monitors.filter((item) => !item.paused && item.status === 'degraded').length;
  const down = state.monitors.filter((item) => !item.paused && item.status === 'down').length;
  const paused = state.monitors.filter((item) => item.paused).length;
  return `<div class="metric-grid module-metrics">${metricCard('Operational', online, '', 'Sample status', 'check', 'up')}${metricCard('Degraded', degraded, '', 'Sample status', 'pulse', degraded ? 'warn' : 'neutral')}${metricCard('Down', down, '', 'Sample status', 'alert', down ? 'warn' : 'neutral')}${metricCard('Paused', paused, '', 'Manual control', 'activity', 'neutral')}</div>
  <div class="section-head"><div><h2>All monitors <span class="metric-unit">${state.monitors.length}</span></h2><p>${online} operational <span class="footer-separator">·</span> Checks are sample values in this portfolio build</p></div><div class="section-tools"><select class="filter-select" id="monitorStatusFilter" aria-label="Filter by monitor status"><option value="all">All statuses</option><option value="operational">Operational</option><option value="degraded">Degraded</option><option value="down">Down</option><option value="unknown">Awaiting check</option><option value="paused">Paused</option></select><select class="filter-select" id="monitorEnvironmentFilter" aria-label="Filter by environment"><option value="all">All environments</option>${[...new Set(state.monitors.map((item) => item.environment))].map((environment) => `<option value="${escapeHtml(environment)}">${escapeHtml(environment)}</option>`).join('')}</select></div></div>
  <section class="panel full-table-panel"><div class="table-toolbar"><strong>Configured endpoints</strong><span class="toolbar-note">Manual sample checks · no schedule</span></div><div class="table-scroll"><table class="data-table"><thead><tr><th>Service</th><th>Status</th><th>Environment</th><th>Latency</th><th>Uptime</th><th>Last sample</th><th>Actions</th></tr></thead><tbody>${monitorTableRows(monitors, true)}</tbody></table></div><div class="table-footer"><span>${monitors.length} shown · data saved to this browser</span><span>Sample checks are manual</span></div></section>
  <div class="panel" style="padding:15px 16px"><h2 class="panel-title">How this demo works</h2><p class="panel-subtitle" style="font-size:10px;line-height:1.7">Use Details to inspect sample history, or Sample check to cycle through simulated operational, degraded, and down states. Results update linked assets and can create an incident in this browser. No network probe or alert is sent. A scheduled backend and shared database are needed for genuine monitoring across visitors and devices.</p></div>`;
}

function renderAssets() {
  let assets = filtered(state.assets, ['id', 'name', 'kind', 'environment', 'owner', 'health']);
  if (assetTypeFilter !== 'all') assets = assets.filter((item) => item.kind === assetTypeFilter);
  if (assetEnvironmentFilter !== 'all') assets = assets.filter((item) => item.environment === assetEnvironmentFilter);
  if (assetHealthFilter !== 'all') assets = assets.filter((item) => item.health === assetHealthFilter);
  const monitoredCount = state.assets.filter((asset) => state.monitors.some((monitor) => monitor.id === asset.monitorId)).length;
  const healthyCount = state.assets.filter((asset) => asset.health === 'operational').length;
  const attentionCount = state.assets.filter((asset) => ['degraded', 'down'].includes(asset.health)).length;
  const rows = assets.length ? assets.map((asset) => `<tr><td class="asset-id">${escapeHtml(asset.id)}</td><td>${serviceCell({ id: asset.monitorId, name: asset.name, url: monitorName(asset.monitorId), kind: asset.kind })}</td><td><span class="asset-type-cell">${icon(typeIcon(asset.kind))}${escapeHtml(asset.kind)}</span></td><td><span class="env-pill">${escapeHtml(asset.environment)}</span></td><td><span class="owner-cell"><i class="owner-dot">${escapeHtml(String(asset.owner || 'Unassigned').split(' ').map((part) => part[0]).slice(0,2).join(''))}</i>${escapeHtml(asset.owner || 'Unassigned')}</span></td><td>${statusPill(asset.health)}</td><td><div class="row-actions"><button class="row-link" type="button" data-edit-asset="${escapeHtml(asset.id)}">Edit ${icon('edit')}</button><button class="row-link row-link-danger" type="button" data-delete-asset="${escapeHtml(asset.id)}">Remove</button></div></td></tr>`).join('') : `<tr><td colspan="7"><div class="empty-state"><strong>No assets found</strong>Try another search or adjust the filters.</div></td></tr>`;
  return `<div class="metric-grid module-metrics">${metricCard('Assets tracked', state.assets.length, '', 'Local inventory', 'box', 'neutral')}${metricCard('Linked to monitors', monitoredCount, '', 'Relationship coverage', 'pulse', 'up')}${metricCard('Operational', healthyCount, '', 'Sample asset health', 'check', 'up')}${metricCard('Needs attention', attentionCount, '', 'Degraded or down', 'alert', attentionCount ? 'warn' : 'neutral')}</div>
  <div class="section-head"><div><h2>Configuration items <span class="metric-unit">${state.assets.length}</span></h2><p>Services and components tracked in the sample workspace.</p></div><div class="section-tools"><select class="filter-select" id="assetTypeFilter" aria-label="Filter by asset type"><option value="all">All asset types</option>${[...new Set(state.assets.map((item) => item.kind))].map((kind) => `<option value="${escapeHtml(kind)}">${escapeHtml(kind)}</option>`).join('')}</select><select class="filter-select" id="assetEnvironmentFilter" aria-label="Filter by environment"><option value="all">All environments</option>${[...new Set(state.assets.map((item) => item.environment))].map((environment) => `<option value="${escapeHtml(environment)}">${escapeHtml(environment)}</option>`).join('')}</select><select class="filter-select" id="assetHealthFilter" aria-label="Filter by sample health"><option value="all">All health states</option><option value="operational">Operational</option><option value="degraded">Degraded</option><option value="down">Down</option><option value="unknown">Awaiting check</option></select></div></div>
  <section class="panel full-table-panel"><div class="table-toolbar"><strong>Infrastructure inventory</strong><span class="toolbar-note">Owners and relationships are example data</span></div><div class="table-scroll"><table class="data-table"><thead><tr><th>Asset ID</th><th>Name / linked monitor</th><th>Type</th><th>Environment</th><th>Owner</th><th>Health</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table></div><div class="table-footer"><span>${assets.length} of ${state.assets.length} assets shown</span><span>Local browser demo</span></div></section>
  <div class="dashboard-grid"><div class="panel"><header class="panel-header"><div class="panel-heading"><h2 class="panel-title">Inventory coverage</h2><p class="panel-subtitle">Assets linked to service monitors.</p></div></header><div style="padding:17px"><div style="display:flex;align-items:center;justify-content:space-between;color:#738489;font-size:10px"><span>Monitored assets</span><strong style="color:#405a52">${state.assets.filter((a) => state.monitors.some((m) => m.id === a.monitorId)).length} / ${state.assets.length}</strong></div><div style="height:6px;margin-top:9px;border-radius:5px;background:#edf2ef;overflow:hidden"><span style="display:block;width:${state.assets.length ? Math.round(state.assets.filter((a) => state.monitors.some((m) => m.id === a.monitorId)).length/state.assets.length*100) : 0}%;height:100%;background:#67a88d"></span></div><p class="panel-subtitle" style="margin-top:10px;line-height:1.65">Keep ownership and monitoring relationships together to speed up incident triage.</p></div></div><div class="panel"><header class="panel-header"><div class="panel-heading"><h2 class="panel-title">Asset types</h2><p class="panel-subtitle">Configuration items by type</p></div></header><div class="health-list">${[...new Set(state.assets.map((asset) => asset.kind))].map((kind) => `<div class="health-item"><span class="service-icon">${icon(typeIcon(kind))}</span><span class="health-copy"><span class="health-name">${escapeHtml(kind)}</span><span class="health-desc">Tracked in this workspace</span></span><span class="health-value">${state.assets.filter((asset) => asset.kind === kind).length}</span></div>`).join('')}</div></div></div>`;
}

function renderIncidents() {
  const bySearch = filtered(state.incidents, ['id', 'title', 'severity', 'status', 'detail']);
  const incidents = bySearch.filter((item) => incidentFilter === 'all' || (incidentFilter === 'open' ? item.status !== 'resolved' : item.status === 'resolved'));
  const criticalOpen = openIncidents().filter((item) => item.severity === 'critical').length;
  const majorOpen = openIncidents().filter((item) => item.severity === 'major').length;
  const resolved = state.incidents.filter((item) => item.status === 'resolved').length;
  const rows = incidents.length ? incidents.map((item) => `<tr><td class="asset-id">${escapeHtml(item.id)}</td><td><span class="incident-row-title"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail || '')}</small></span></td><td>${incidentPill(item.severity)}</td><td>${escapeHtml(monitorName(item.monitorId))}</td><td><span class="status-pill ${item.status === 'resolved' ? 'status-operational' : 'status-degraded'}">${item.status === 'resolved' ? 'Resolved' : 'Investigating'}</span></td><td>${escapeHtml(item.updatedAtTime ? relativeTime(item.updatedAtTime) : item.updatedAt)}</td><td><div class="row-actions"><button class="row-link" type="button" data-edit-incident="${escapeHtml(item.id)}">Update</button><button class="resolve-button" type="button" data-resolve="${escapeHtml(item.id)}">${item.status === 'resolved' ? 'Reopen' : 'Resolve'}</button></div></td></tr>`).join('') : `<tr><td colspan="7"><div class="empty-state"><strong>No incidents found</strong>Try another search, or log an incident to get started.</div></td></tr>`;
  return `<div class="metric-grid module-metrics">${metricCard('Open incidents', openIncidents().length, '', 'Response queue', 'alert', openIncidents().length ? 'warn' : 'up')}${metricCard('Critical', criticalOpen, '', 'Open incidents', 'alert', criticalOpen ? 'warn' : 'neutral')}${metricCard('Major', majorOpen, '', 'Open incidents', 'pulse', majorOpen ? 'warn' : 'neutral')}${metricCard('Resolved', resolved, '', 'Incident history', 'check', 'up')}</div>
  <div class="section-head"><div><h2>Response queue <span class="metric-unit">${openIncidents().length} open</span></h2><p>Record what happened, connect it to a service, and close the loop.</p></div><div class="section-tools"><select class="filter-select" id="incidentFilter" aria-label="Filter incidents"><option value="all">All incidents</option><option value="open">Open only</option><option value="resolved">Resolved</option></select></div></div>
  <section class="panel full-table-panel"><div class="table-toolbar"><strong>Incident history</strong><span class="toolbar-note">Update, resolve, or reopen a sample incident</span></div><div class="table-scroll"><table class="data-table"><thead><tr><th>Incident</th><th>Summary</th><th>Severity</th><th>Affected service</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div><div class="table-footer"><span>${incidents.length} incidents shown</span><span>Sample incident response log</span></div></section>
  <div class="panel" style="padding:15px 16px"><h2 class="panel-title">Triage checklist</h2><p class="panel-subtitle" style="font-size:10px;line-height:1.8">1. Confirm the affected service. &nbsp; 2. Capture impact and severity. &nbsp; 3. Record the resolution. <span style="color:#9aa6a8">This demo does not page on-call responders.</span></p></div>`;
}

function renderActivity() {
  let activity = filtered(state.activity, ['title', 'detail', 'time', 'kind']);
  if (activityKindFilter !== 'all') activity = activity.filter((item) => item.kind === activityKindFilter);
  const rows = activity.length ? activity.map((item) => `<div class="activity-row"><span class="activity-icon">${icon(item.kind === 'asset' ? 'box' : item.kind === 'incident' ? 'alert' : 'check')}</span><div class="activity-text"><strong>${escapeHtml(item.title)}</strong><div class="activity-detail">${escapeHtml(item.detail)}</div></div><span class="activity-time">${escapeHtml(item.at ? relativeTime(item.at) : item.time)}</span></div>`).join('') : `<div class="empty-state"><strong>No activity found</strong>Try another search to look through the demo log.</div>`;
  return `<div class="section-head"><div><h2>Recent events <span class="metric-unit">${activity.length} shown</span></h2><p>Monitor updates and changes made in this browser session.</p></div><div class="section-tools"><select class="filter-select" id="activityKindFilter" aria-label="Filter activity type"><option value="all">All event types</option><option value="check">Monitor</option><option value="asset">Asset</option><option value="incident">Incident</option></select></div></div>
  <section class="panel"><header class="panel-header"><div class="panel-heading"><h2 class="panel-title">Recent activity</h2><p class="panel-subtitle">Local demo activity · newest first</p></div><span class="env-pill">${icon('clock')} ${state.activity.length} total events</span></header><div class="activity-feed">${rows}</div></section>
  <div class="panel" style="padding:15px 16px;margin-top:14px"><h2 class="panel-title">About this activity log</h2><p class="panel-subtitle" style="font-size:10px;line-height:1.7">Events you create while using this demo are saved in local browser storage. A production audit trail should record actor identity and timestamps in a shared, access-controlled database.</p></div>`;
}

function render() {
  const detail = viewDetails[activeView] || viewDetails.overview;
  const title = $('#pageTitle');
  title.innerHTML = activeView === 'overview' ? `${escapeHtml(greetingTitle())} <span class="wave" aria-hidden="true">✳</span>` : escapeHtml(detail.title);
  $('#pageSubtitle').textContent = detail.subtitle;
  $('#breadcrumbCurrent').textContent = detail.breadcrumb;
  $('#pageEyebrow').innerHTML = `${activeView === 'overview' ? nowLabel() + ' <span>·</span> ' : ''}${detail.eyebrow}`;
  $$('.nav-item').forEach((button) => {
    const active = button.dataset.view === activeView;
    button.classList.toggle('is-active', active);
    if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
  });
  $('#monitorNavCount').textContent = String(state.monitors.length).padStart(2, '0');
  $('#incidentNavCount').textContent = String(openIncidents().length).padStart(2, '0');
  const actions = {
    overview: [{ label: 'Log incident', icon: 'alert', action: 'new-incident' }, { label: 'Add monitor', icon: 'plus', action: 'new-monitor' }],
    monitoring: [{ label: 'Export monitors', icon: 'download', action: 'export-monitors' }, { label: 'Add monitor', icon: 'plus', action: 'new-monitor' }],
    assets: [{ label: 'Export assets', icon: 'download', action: 'export-assets' }, { label: 'Add asset', icon: 'plus', action: 'new-asset' }],
    incidents: [{ label: 'Export incidents', icon: 'download', action: 'export-incidents' }, { label: 'Log incident', icon: 'plus', action: 'new-incident' }],
    activity: [{ label: 'Reset sample data', icon: 'refresh', action: 'reset-demo' }, { label: 'Export activity', icon: 'download', action: 'export-activity' }],
  }[activeView];
  const secondary = $('#secondaryAction');
  const primary = $('#primaryAction');
  secondary.innerHTML = `${icon(actions[0].icon)}${actions[0].label}`;
  secondary.dataset.action = actions[0].action;
  primary.innerHTML = `${icon(actions[1].icon)}${actions[1].label}`;
  primary.dataset.action = actions[1].action;
  const templates = { overview: renderOverview, monitoring: renderMonitoring, assets: renderAssets, incidents: renderIncidents, activity: renderActivity };
  $('#content').innerHTML = templates[activeView]();
  $('#content').setAttribute('aria-busy', 'false');
  const filters = { monitorStatusFilter, monitorEnvironmentFilter, assetTypeFilter, assetEnvironmentFilter, assetHealthFilter, incidentFilter, activityKindFilter };
  for (const [id, value] of Object.entries(filters)) { const control = $(`#${id}`); if (control) control.value = value; }
}

function goTo(view) {
  if (!(view in viewDetails)) return;
  activeView = view;
  history.replaceState(null, '', `#${view}`);
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toast(message, isError = false) {
  const region = $('#toastRegion');
  const item = document.createElement('div');
  item.className = `toast${isError ? ' is-error' : ''}`;
  item.innerHTML = `${icon(isError ? 'alert' : 'check')}<span>${escapeHtml(message)}</span>`;
  region.append(item);
  setTimeout(() => { item.classList.add('toast-out'); setTimeout(() => item.remove(), 250); }, 3200);
}

function addActivity(title, detail, kind = 'check') {
  const at = new Date().toISOString();
  state.activity.unshift({ id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title, detail, time: 'Just now', at, kind });
  state.activity = state.activity.slice(0, 30);
}

function renderTimeline(items, emptyMessage) {
  if (!items?.length) return `<div class="timeline-empty">${escapeHtml(emptyMessage)}</div>`;
  return `<ol class="event-timeline">${items.map((item) => `<li class="event-timeline-item"><span class="timeline-marker"></span><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.detail || '')}</p><time>${escapeHtml(formatTimestamp(item.at))}</time></div></li>`).join('')}</ol>`;
}

function renderMonitorDetails(id) {
  const monitor = state.monitors.find((item) => item.id === id);
  if (!monitor) return `<p class="dialog-kicker">Monitoring</p><h2 class="dialog-title" id="dialogTitle">Monitor unavailable</h2><p class="dialog-description">This monitor may have been removed from the local workspace.</p>`;
  const assets = state.assets.filter((asset) => asset.monitorId === id);
  const incidents = state.incidents.filter((incident) => incident.monitorId === id).slice(0, 5);
  const checks = monitor.checkHistory || [];
  const latestLatency = monitor.latency ? `${monitor.latency} ms` : '—';
  const history = checks.length ? renderTimeline(checks.map((check) => ({ at: check.at, title: `${statusLabel(check.status)}${check.latency ? ` · ${check.latency} ms` : ''}`, detail: check.note })), 'No sample check history yet.') : `<div class="timeline-empty">No recorded sample checks yet. Record one to start this local history.</div>`;
  return `<div data-monitor-detail="${escapeHtml(id)}"><p class="dialog-kicker">Monitoring / ${escapeHtml(monitor.environment)}</p><h2 class="dialog-title" id="dialogTitle">${escapeHtml(monitor.name)}</h2><p class="dialog-description">${escapeHtml(monitor.url)} · ${escapeHtml(monitor.kind)}. All results below are local sample data.</p>
    <div class="monitor-detail-stats"><div><span>Status</span>${statusPill(monitor.paused ? 'paused' : monitor.status)}</div><div><span>Latency</span><strong>${escapeHtml(latestLatency)}</strong></div><div><span>Sample uptime</span><strong>${escapeHtml(monitor.uptime || '—')}</strong></div></div>
    <div class="detail-section"><div class="detail-section-heading"><h3>Recent sample checks</h3><span>Latest ${checks.length}</span></div>${history}</div>
    <div class="detail-section"><div class="detail-section-heading"><h3>Linked assets</h3><span>${assets.length}</span></div>${assets.length ? `<ul class="detail-link-list">${assets.map((asset) => `<li><span>${escapeHtml(asset.name)} <small>${escapeHtml(asset.owner)}</small></span>${statusPill(asset.health)}</li>`).join('')}</ul>` : `<div class="timeline-empty">No assets are linked to this monitor.</div>`}</div>
    <div class="detail-section"><div class="detail-section-heading"><h3>Related incidents</h3><span>${incidents.length}</span></div>${incidents.length ? `<ul class="detail-link-list">${incidents.map((incident) => `<li><span>${escapeHtml(incident.id)} · ${escapeHtml(incident.title)}<small>${incident.status === 'resolved' ? 'Resolved' : 'Open'} · ${severityLabel(incident.severity)}</small></span><button class="row-link" type="button" data-edit-incident="${escapeHtml(incident.id)}">View</button></li>`).join('')}</ul>` : `<div class="timeline-empty">No incidents are linked to this monitor.</div>`}</div>
    <div class="dialog-actions"><button class="button button-secondary" type="button" data-close-dialog>Close</button><button class="button button-secondary" type="button" data-monitor-toggle="${escapeHtml(id)}">${monitor.paused ? 'Resume' : 'Pause'}</button><button class="button button-secondary" type="button" data-edit-monitor="${escapeHtml(id)}">Edit</button><button class="button button-primary" type="button" data-sample-check="${escapeHtml(id)}">Record sample check</button></div></div>`;
}

function openDialog(type, monitorId = '') {
  const dialog = $('#editorDialog');
  if (dialog.open) dialog.close();
  const linkedOptions = state.monitors.map((monitor) => `<option value="${escapeHtml(monitor.id)}" ${monitor.id === monitorId ? 'selected' : ''}>${escapeHtml(monitor.name)}</option>`).join('');
  const editingMonitor = type === 'monitor-edit' ? state.monitors.find((item) => item.id === monitorId) : null;
  const editingAsset = type === 'asset' ? state.assets.find((item) => item.id === monitorId) : null;
  const editingIncident = type === 'incident-update' ? state.incidents.find((item) => item.id === monitorId) : null;
  const assetMonitorOptions = `<option value="">Not linked</option>${state.monitors.map((monitor) => `<option value="${escapeHtml(monitor.id)}" ${monitor.id === editingAsset?.monitorId ? 'selected' : ''}>${escapeHtml(monitor.name)}</option>`).join('')}`;
  const formMarkup = (type === 'monitor' || editingMonitor) ? `<p class="dialog-kicker">Monitoring / ${editingMonitor ? 'Edit endpoint' : 'New endpoint'}</p><h2 class="dialog-title" id="dialogTitle">${editingMonitor ? 'Edit monitor' : 'Add a monitor'}</h2><p class="dialog-description">${editingMonitor ? 'Update endpoint metadata in your demo workspace.' : 'Add an endpoint to your demo workspace. No network probe will run in this static build.'}</p>
    <form id="monitorForm" class="form-grid" data-id="${escapeHtml(editingMonitor?.id || '')}">
      <div class="form-field"><label for="monitorName">Service name</label><input id="monitorName" name="name" required maxlength="70" value="${escapeHtml(editingMonitor?.name || '')}" placeholder="e.g. Customer portal"></div>
      <div class="form-field"><label for="monitorUrl">Hostname or URL</label><input id="monitorUrl" name="url" required maxlength="180" value="${escapeHtml(editingMonitor?.url || '')}" placeholder="https://example.com"><span class="form-hint">Saved as inventory data only. It won’t be requested from this browser.</span></div>
      <div class="form-field"><label for="monitorKind">Service type</label><select id="monitorKind" name="kind">${['Web app','API','Database','Queue','Server'].map((kind) => `<option ${kind === (editingMonitor?.kind || 'Web app') ? 'selected' : ''}>${kind}</option>`).join('')}</select></div>
      <div class="form-field"><label for="monitorEnvironment">Environment</label><select id="monitorEnvironment" name="environment">${['Production','Staging','Development'].map((environment) => `<option ${environment === (editingMonitor?.environment || 'Production') ? 'selected' : ''}>${environment}</option>`).join('')}</select></div>
      <div class="dialog-actions"><button class="button button-secondary" type="button" data-close-dialog>Cancel</button><button class="button button-primary" type="submit">${editingMonitor ? 'Save changes' : 'Add to workspace'}</button></div>
    </form>` : type === 'asset' ? `<p class="dialog-kicker">Inventory / ${editingAsset ? 'Edit configuration item' : 'New configuration item'}</p><h2 class="dialog-title" id="dialogTitle">${editingAsset ? 'Update asset' : 'Add an asset'}</h2><p class="dialog-description">Track an infrastructure component, assign an owner, and optionally link a monitor.</p>
    <form id="assetForm" class="form-grid" data-id="${escapeHtml(editingAsset?.id || '')}">
      <div class="form-field"><label for="assetName">Asset name</label><input id="assetName" name="name" required maxlength="70" value="${escapeHtml(editingAsset?.name || '')}" placeholder="e.g. Web application"></div>
      <div class="form-field"><label for="assetKind">Asset type</label><select id="assetKind" name="kind">${['Web app','API service','Database','Queue','Server','Network'].map((kind) => `<option ${kind === (editingAsset?.kind || 'Web app') ? 'selected' : ''}>${kind}</option>`).join('')}</select></div>
      <div class="form-field"><label for="assetEnvironment">Environment</label><select id="assetEnvironment" name="environment">${['Production','Staging','Development'].map((env) => `<option ${env === (editingAsset?.environment || 'Production') ? 'selected' : ''}>${env}</option>`).join('')}</select></div>
      <div class="form-field"><label for="assetOwner">Owner</label><input id="assetOwner" name="owner" required maxlength="70" value="${escapeHtml(editingAsset?.owner || 'Alex Morgan')}" placeholder="Team or person"></div>
      <div class="form-field"><label for="assetMonitor">Linked monitor</label><select id="assetMonitor" name="monitorId">${assetMonitorOptions}</select></div>
      <div class="form-field"><label for="assetHealth">Health note</label><select id="assetHealth" name="health">${[['operational','Operational'],['degraded','Degraded'],['down','Down'],['unknown','Awaiting check']].map(([value,label]) => `<option value="${value}" ${value === (editingAsset?.health || 'unknown') ? 'selected' : ''}>${label}</option>`).join('')}</select></div>
      <div class="dialog-actions"><button class="button button-secondary" type="button" data-close-dialog>Cancel</button><button class="button button-primary" type="submit">${editingAsset ? 'Save changes' : 'Add asset'}</button></div>
    </form>` : editingIncident ? `<p class="dialog-kicker">Incident management / ${escapeHtml(editingIncident.id)}</p><h2 class="dialog-title" id="dialogTitle">Update incident</h2><p class="dialog-description">Adjust severity, affected service, response status, or the incident notes.</p>
    <form id="incidentUpdateForm" class="form-grid" data-id="${escapeHtml(editingIncident.id)}">
      <div class="form-field"><label for="incidentTitle">Incident summary</label><input id="incidentTitle" name="title" required maxlength="100" value="${escapeHtml(editingIncident.title)}"></div>
      <div class="form-field"><label for="incidentService">Affected service</label><select id="incidentService" name="monitorId"><option value="">Choose a service</option>${state.monitors.map((monitor) => `<option value="${escapeHtml(monitor.id)}" ${monitor.id === editingIncident.monitorId ? 'selected' : ''}>${escapeHtml(monitor.name)}</option>`).join('')}</select></div>
      <div class="form-field"><label for="incidentSeverity">Severity</label><select id="incidentSeverity" name="severity">${['minor','major','critical'].map((severity) => `<option value="${severity}" ${severity === editingIncident.severity ? 'selected' : ''}>${severityLabel(severity)}</option>`).join('')}</select></div>
      <div class="form-field"><label for="incidentStatus">Response status</label><select id="incidentStatus" name="status"><option value="investigating" ${editingIncident.status !== 'resolved' ? 'selected' : ''}>Investigating</option><option value="resolved" ${editingIncident.status === 'resolved' ? 'selected' : ''}>Resolved</option></select></div>
      <div class="form-field"><label for="incidentDetail">Impact / notes</label><textarea id="incidentDetail" name="detail" maxlength="400">${escapeHtml(editingIncident.detail || '')}</textarea></div>
      <div class="form-field"><label for="incidentWorkNote">Work note <span style="font-weight:400;color:#9aa6a8">(optional, added to timeline)</span></label><textarea id="incidentWorkNote" name="workNote" maxlength="300" placeholder="Record an investigation step or handoff."></textarea></div>
      <section class="detail-section"><div class="detail-section-heading"><h3>Response timeline</h3><span>${editingIncident.timeline?.length || 0} events</span></div>${renderTimeline(editingIncident.timeline, 'No response updates recorded yet.')}</section>
      <div class="dialog-actions"><button class="button button-secondary" type="button" data-close-dialog>Cancel</button><button class="button button-primary" type="submit">Save update</button></div>
    </form>` : `<p class="dialog-kicker">Incident management / New record</p><h2 class="dialog-title" id="dialogTitle">Log an incident</h2><p class="dialog-description">Capture an event in the sample incident queue and link it to an affected service.</p>
    <form id="incidentForm" class="form-grid">
      <div class="form-field"><label for="incidentTitle">Incident summary</label><input id="incidentTitle" name="title" required maxlength="100" placeholder="What is happening?"></div>
      <div class="form-field"><label for="incidentService">Affected service</label><select id="incidentService" name="monitorId"><option value="">Choose a service</option>${linkedOptions}</select></div>
      <div class="form-field"><label for="incidentSeverity">Severity</label><select id="incidentSeverity" name="severity"><option value="minor">Minor · limited impact</option><option value="major" selected>Major · service degraded</option><option value="critical">Critical · service unavailable</option></select></div>
      <div class="form-field"><label for="incidentDetail">Impact / notes <span style="font-weight:400;color:#9aa6a8">(optional)</span></label><textarea id="incidentDetail" name="detail" maxlength="400" placeholder="Describe who is affected and what you have observed."></textarea></div>
      <div class="dialog-actions"><button class="button button-secondary" type="button" data-close-dialog>Cancel</button><button class="button button-primary" type="submit">Create incident</button></div>
    </form>`;
  $('#dialogContent').innerHTML = type === 'monitor-details' ? renderMonitorDetails(monitorId) : formMarkup;
  dialog.showModal();
  const focusTarget = (type === 'monitor' || type === 'monitor-edit') ? $('#monitorName') : type === 'asset' ? $('#assetName') : (type === 'incident' || type === 'incident-update') ? $('#incidentTitle') : null;
  focusTarget?.focus();
}

function closeDialog() { $('#editorDialog').close(); }

function submitMonitor(form) {
  const formData = new FormData(form);
  const name = String(formData.get('name') || '').trim();
  const url = String(formData.get('url') || '').trim();
  if (!name || !url) return;
  const id = form.dataset.id;
  const existing = id ? state.monitors.find((item) => item.id === id) : null;
  const monitor = existing || { id: `mon-${Date.now()}`, name, url, kind: String(formData.get('kind')), environment: String(formData.get('environment')), status: 'unknown', latency: null, uptime: '—', lastCheck: 'Not checked', history: [] };
  Object.assign(monitor, { name, url, kind: String(formData.get('kind')), environment: String(formData.get('environment')) });
  if (!existing) state.monitors.unshift(monitor);
  if (existing) {
    addActivity('Monitor updated', `${name} · endpoint details changed`, 'check');
    saveState(); closeDialog(); goTo('monitoring'); toast('Monitor details updated.');
    return;
  }
  state.assets.unshift({ id: nextAssetId(), name, kind: monitor.kind, environment: monitor.environment, owner: 'Alex Morgan', health: 'unknown', monitorId: monitor.id });
  addActivity('Monitor added', `${name} · awaiting backend probe integration`, 'check');
  addActivity('Asset linked', `${name} · inventory record created`, 'asset');
  saveState(); closeDialog(); goTo('monitoring'); toast('Monitor added to this browser’s demo workspace.');
}

function submitAsset(form) {
  const formData = new FormData(form);
  const id = form.dataset.id;
  const existing = id ? state.assets.find((item) => item.id === id) : null;
  const asset = {
    id: id || nextAssetId(),
    name: String(formData.get('name') || '').trim(),
    kind: String(formData.get('kind')),
    environment: String(formData.get('environment')),
    owner: String(formData.get('owner') || '').trim(),
    health: String(formData.get('health')),
    monitorId: String(formData.get('monitorId') || ''),
  };
  if (!asset.name || !asset.owner) return;
  if (existing) Object.assign(existing, asset);
  else state.assets.unshift(asset);
  addActivity(existing ? 'Asset updated' : 'Asset added', `${asset.name} · ${asset.kind}`, 'asset');
  saveState(); closeDialog(); goTo('assets'); toast(existing ? 'Asset details updated.' : 'Asset added to the inventory.');
}

function submitIncident(form) {
  const formData = new FormData(form);
  const title = String(formData.get('title') || '').trim();
  if (!title) return;
  const incident = { id: nextIncidentId(), title, severity: String(formData.get('severity')), status: 'investigating', monitorId: String(formData.get('monitorId') || ''), updatedAt: 'Just now', detail: String(formData.get('detail') || '').trim() || 'No impact notes provided.', timeline: [] };
  addIncidentTimeline(incident, 'Incident created', incident.detail);
  state.incidents.unshift(incident);
  addActivity('Incident created', `${incident.id} · ${title}`, 'incident');
  saveState(); closeDialog(); goTo('incidents'); toast('Incident logged in the demo queue.');
}

function submitIncidentUpdate(form) {
  const incident = state.incidents.find((item) => item.id === form.dataset.id);
  if (!incident) return;
  const formData = new FormData(form);
  const previous = { title: incident.title, monitorId: incident.monitorId, severity: incident.severity, status: incident.status, detail: incident.detail };
  incident.title = String(formData.get('title') || '').trim();
  incident.monitorId = String(formData.get('monitorId') || '');
  incident.severity = String(formData.get('severity'));
  incident.status = String(formData.get('status'));
  incident.detail = String(formData.get('detail') || '').trim() || 'No impact notes provided.';
  const changed = [];
  if (previous.title !== incident.title) changed.push('summary changed');
  if (previous.monitorId !== incident.monitorId) changed.push('affected service changed');
  if (previous.severity !== incident.severity) changed.push(`severity set to ${severityLabel(incident.severity)}`);
  if (previous.detail !== incident.detail) changed.push('impact notes updated');
  const statusChanged = previous.status !== incident.status;
  const eventTitle = statusChanged ? (incident.status === 'resolved' ? 'Incident resolved' : 'Incident reopened') : 'Incident updated';
  const workNote = String(formData.get('workNote') || '').trim();
  addIncidentTimeline(incident, eventTitle, [workNote, changed.join(' · ')].filter(Boolean).join(' — ') || 'Incident details reviewed; no field changes were made.');
  addActivity(eventTitle, `${incident.id} · ${incident.title}`, 'incident');
  saveState(); closeDialog(); goTo('incidents'); toast('Incident details updated.');
}

function toggleMonitor(id) {
  const monitor = state.monitors.find((item) => item.id === id);
  if (!monitor) return;
  const refreshDetails = $('#editorDialog').open && $('#dialogContent [data-monitor-detail]')?.dataset.monitorDetail === id;
  if (refreshDetails) closeDialog();
  monitor.paused = !monitor.paused;
  addActivity(monitor.paused ? 'Monitor paused' : 'Monitor resumed', `${monitor.name} · sample monitor`, 'check');
  saveState(); render();
  if (refreshDetails) openDialog('monitor-details', id);
  toast(monitor.paused ? 'Monitor paused in this demo.' : 'Monitor resumed in this demo.');
}

function recordSampleCheck(id) {
  const monitor = state.monitors.find((item) => item.id === id);
  if (!monitor) return;
  if (monitor.paused) { toast('Resume this monitor before recording a sample check.', true); return; }
  const refreshDetails = $('#editorDialog').open && $('#dialogContent [data-monitor-detail]')?.dataset.monitorDetail === id;
  if (refreshDetails) closeDialog();
  const nextStatus = ({ operational: 'degraded', degraded: 'down', down: 'operational', unknown: 'operational' })[monitor.status] || 'operational';
  const latency = ({ operational: 192, degraded: 684, down: null })[nextStatus];
  const note = `Simulated ${statusLabel(nextStatus).toLowerCase()} outcome; no request was sent to ${monitor.url}.`;
  const at = new Date().toISOString();
  monitor.status = nextStatus;
  monitor.latency = latency;
  monitor.lastCheck = 'Just now';
  monitor.lastCheckAt = at;
  monitor.checkHistory ||= [];
  monitor.checkHistory.unshift({ id: `chk-${Date.now()}`, at, status: nextStatus, latency, note });
  monitor.checkHistory = monitor.checkHistory.slice(0, 12);
  const priorUptime = Number(monitor.history?.at(-1)) || 99.9;
  const nextUptime = nextStatus === 'down' ? Math.max(97, priorUptime - 0.25) : nextStatus === 'operational' ? Math.min(100, priorUptime + 0.06) : Math.max(97, priorUptime - 0.03);
  monitor.history = [...(monitor.history || []), nextUptime].slice(-24);
  monitor.uptime = `${nextUptime.toFixed(2)}%`;
  for (const asset of state.assets.filter((item) => item.monitorId === id)) asset.health = nextStatus;

  let incident = state.incidents.find((item) => item.monitorId === id && item.status !== 'resolved');
  if (nextStatus === 'degraded' || nextStatus === 'down') {
    if (!incident) {
      incident = { id: nextIncidentId(), title: nextStatus === 'down' ? `${monitor.name} sample check reports service down` : `Elevated latency on ${monitor.name}`, severity: nextStatus === 'down' ? 'critical' : 'major', status: 'investigating', monitorId: id, updatedAt: 'Just now', detail: 'Created by a local simulated check. No real alert was sent.', timeline: [] };
      addIncidentTimeline(incident, 'Opened by sample check', note);
      state.incidents.unshift(incident);
      addActivity('Incident opened by sample check', `${incident.id} · ${incident.title}`, 'incident');
    } else {
      if (nextStatus === 'down') incident.severity = 'critical';
      addIncidentTimeline(incident, 'Sample check updated service health', `${note}${nextStatus === 'down' ? ' Severity raised to Critical.' : ''}`);
    }
  } else if (incident) {
    addIncidentTimeline(incident, 'Sample check reports recovery', 'Service sample returned to operational. Resolve the incident manually after reviewing the response.');
  }
  addActivity('Sample check recorded', `${monitor.name} · ${statusLabel(nextStatus)}${latency ? ` · ${latency} ms` : ''}`, 'check');
  saveState(); render();
  if (refreshDetails) openDialog('monitor-details', id);
  toast(`Sample result recorded: ${statusLabel(nextStatus).toLowerCase()}.`);
}

function resolveIncident(id) {
  const incident = state.incidents.find((item) => item.id === id);
  if (!incident) return;
  const reopening = incident.status === 'resolved';
  incident.status = reopening ? 'investigating' : 'resolved';
  addIncidentTimeline(incident, reopening ? 'Incident reopened' : 'Incident resolved', reopening ? 'Reopened from the incident queue.' : 'Marked resolved from the incident queue.');
  addActivity(reopening ? 'Incident reopened' : 'Incident resolved', `${incident.id} · ${incident.title}`, 'incident');
  saveState(); render(); toast(reopening ? `${incident.id} reopened.` : `${incident.id} marked resolved.`);
}

function deleteAsset(id) {
  const asset = state.assets.find((item) => item.id === id);
  if (!asset) return;
  if (!window.confirm(`Remove ${asset.name} from this browser’s demo inventory?`)) return;
  state.assets = state.assets.filter((item) => item.id !== id);
  addActivity('Asset removed', `${asset.id} · ${asset.name}`, 'asset');
  saveState(); render(); toast(`${asset.name} removed from the demo inventory.`);
}

function exportCsv(filename, rows, columns) {
  if (!rows.length) { toast('There are no records in this view to export.', true); return; }
  const cell = (value) => {
    const raw = String(value ?? '');
    const safe = /^[\s]*[=+\-@]/.test(raw) ? `'${raw}` : raw;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  const csv = [columns.map(([,label]) => cell(label)).join(','), ...rows.map((row) => columns.map(([key]) => cell(row[key])).join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(`${rows.length} records exported.`);
}

function runExport(action) {
  if (action === 'export-monitors') exportCsv('infradesk-monitors.csv', state.monitors.map((monitor) => ({ ...monitor, status: monitor.paused ? 'paused' : monitor.status, checkCount: monitor.checkHistory?.length || 0 })), [['name','Service'],['url','Endpoint'],['kind','Type'],['environment','Environment'],['status','Sample status'],['latency','Latency ms'],['uptime','Sample uptime'],['lastCheck','Last sample'],['checkCount','Recorded local checks']]);
  if (action === 'export-assets') exportCsv('infradesk-assets.csv', state.assets, [['id','Asset ID'],['name','Name'],['kind','Type'],['environment','Environment'],['owner','Owner'],['health','Health'],['monitorId','Linked monitor ID']]);
  if (action === 'export-incidents') exportCsv('infradesk-incidents.csv', state.incidents.map((incident) => ({ ...incident, timelineSummary: (incident.timeline || []).map((event) => `${event.at}: ${event.title} — ${event.detail}`).join(' | ') })), [['id','Incident ID'],['title','Summary'],['severity','Severity'],['status','Status'],['monitorId','Monitor ID'],['updatedAt','Updated'],['detail','Impact notes'],['timelineSummary','Response timeline']]);
  if (action === 'export-activity') exportCsv('infradesk-activity.csv', state.activity.map((item) => ({ ...item, time: item.at ? formatTimestamp(item.at) : item.time })), [['time','Time'],['title','Event'],['detail','Details'],['kind','Type']]);
}

function resetDemo() {
  if (!window.confirm('Reset this browser’s InfraDesk sample records? Your local demo changes will be cleared.')) return;
  state = structuredClone(seed);
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* Keep the in-memory reset if browser storage is unavailable. */ }
  searchTerm = ''; $('#globalSearch').value = '';
  incidentFilter = monitorStatusFilter = monitorEnvironmentFilter = assetTypeFilter = assetEnvironmentFilter = assetHealthFilter = activityKindFilter = 'all';
  render(); toast('Sample workspace restored.');
}

document.addEventListener('click', (event) => {
  const nav = event.target.closest('[data-view]');
  if (nav) { goTo(nav.dataset.view); return; }
  const go = event.target.closest('[data-go]');
  if (go) { goTo(go.dataset.go); return; }
  const actionButton = event.target.closest('[data-action]');
  if (actionButton) {
    const action = actionButton.dataset.action;
    if (action === 'new-monitor') openDialog('monitor');
    if (action === 'new-asset') openDialog('asset');
    if (action === 'new-incident') openDialog('incident');
    if (action.startsWith('export-')) runExport(action);
    if (action === 'reset-demo') resetDemo();
    return;
  }
  const newIncident = event.target.closest('[data-new-incident]');
  if (newIncident) { openDialog('incident', newIncident.dataset.newIncident); return; }
  const editMonitor = event.target.closest('[data-edit-monitor]');
  if (editMonitor) { openDialog('monitor-edit', editMonitor.dataset.editMonitor); return; }
  const monitorDetails = event.target.closest('[data-monitor-details]');
  if (monitorDetails) { openDialog('monitor-details', monitorDetails.dataset.monitorDetails); return; }
  const sampleCheck = event.target.closest('[data-sample-check]');
  if (sampleCheck) { recordSampleCheck(sampleCheck.dataset.sampleCheck); return; }
  const pauseMonitor = event.target.closest('[data-monitor-toggle]');
  if (pauseMonitor) { toggleMonitor(pauseMonitor.dataset.monitorToggle); return; }
  const editAsset = event.target.closest('[data-edit-asset]');
  if (editAsset) { openDialog('asset', editAsset.dataset.editAsset); return; }
  const removeAsset = event.target.closest('[data-delete-asset]');
  if (removeAsset) { deleteAsset(removeAsset.dataset.deleteAsset); return; }
  const editIncident = event.target.closest('[data-edit-incident]');
  if (editIncident) { openDialog('incident-update', editIncident.dataset.editIncident); return; }
  const resolve = event.target.closest('[data-resolve]');
  if (resolve) { resolveIncident(resolve.dataset.resolve); return; }
  if (event.target.closest('[data-close-dialog]')) { closeDialog(); return; }
  if (event.target.closest('#dismissNotice')) { event.target.closest('.demo-notice')?.remove(); return; }
  if (event.target.closest('#clearSearch')) {
    $('#globalSearch').value = ''; searchTerm = '';
    incidentFilter = monitorStatusFilter = monitorEnvironmentFilter = assetTypeFilter = assetEnvironmentFilter = assetHealthFilter = activityKindFilter = 'all';
    render(); return;
  }
  if (event.target.closest('#focusSearch')) { $('#globalSearch').focus(); return; }
});

document.addEventListener('submit', (event) => {
  if (event.target.id === 'monitorForm') { event.preventDefault(); submitMonitor(event.target); }
  if (event.target.id === 'assetForm') { event.preventDefault(); submitAsset(event.target); }
  if (event.target.id === 'incidentForm') { event.preventDefault(); submitIncident(event.target); }
  if (event.target.id === 'incidentUpdateForm') { event.preventDefault(); submitIncidentUpdate(event.target); }
});

$('#globalSearch').addEventListener('input', (event) => { searchTerm = event.target.value; render(); });
document.addEventListener('change', (event) => {
  const filters = {
    monitorStatusFilter: (value) => { monitorStatusFilter = value; },
    monitorEnvironmentFilter: (value) => { monitorEnvironmentFilter = value; },
    assetTypeFilter: (value) => { assetTypeFilter = value; },
    assetEnvironmentFilter: (value) => { assetEnvironmentFilter = value; },
    assetHealthFilter: (value) => { assetHealthFilter = value; },
    incidentFilter: (value) => { incidentFilter = value; },
    activityKindFilter: (value) => { activityKindFilter = value; },
  };
  filters[event.target.id]?.(event.target.value);
  if (filters[event.target.id]) render();
});
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) { event.preventDefault(); $('#globalSearch').focus(); }
  if (event.key === 'Escape' && $('#editorDialog').open) closeDialog();
});
window.addEventListener('hashchange', () => { const view = location.hash.slice(1); if (view in viewDetails && view !== activeView) { activeView = view; render(); } });

$('#pageEyebrow').innerHTML = `${nowLabel()} <span>·</span> YOUR INFRASTRUCTURE AT A GLANCE`;
render();

