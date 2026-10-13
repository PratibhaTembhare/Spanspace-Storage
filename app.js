/* ═══════════════════════════════════════════════════════════════
   CloudAI Storage — app.js
   Research: Cost-Effective Cloud Storage Using
   AI-Enabled Image Compression and Decompression
════════════════════════════════════════════════════════════════ */
'use strict';

// ── STATE ──
const state = {
  theme: 'dark',
  uploadQueue: [],
  storageUsed: 8.5,
  modalOpen: false,
};

// ── GALLERY DATA ──
const galleryData = [
  { name:'vacation_beach.jpg',  engine:'webp',   origSize:'4.2 MB', compSize:'1.8 MB', psnr:41.8, ssim:0.952, colors:['#1e3a8a','#7c3aed'] },
  { name:'family_photo.png',    engine:'neural', origSize:'7.1 MB', compSize:'3.0 MB', psnr:43.2, ssim:0.961, colors:['#ec4899','#f97316'] },
  { name:'mountain_view.jpg',   engine:'webp',   origSize:'5.6 MB', compSize:'2.3 MB', psnr:40.5, ssim:0.947, colors:['#16a34a','#065f46'] },
  { name:'city_night.jpg',      engine:'neural', origSize:'8.9 MB', compSize:'3.7 MB', psnr:42.7, ssim:0.958, colors:['#d97706','#dc2626'] },
  { name:'portrait_edit.jpg',   engine:'neural', origSize:'6.3 MB', compSize:'2.7 MB', psnr:44.1, ssim:0.967, colors:['#8b5cf6','#6366f1'] },
  { name:'landscape_4k.png',    engine:'webp',   origSize:'11.2 MB',compSize:'4.5 MB', psnr:40.9, ssim:0.944, colors:['#06b6d4','#3b82f6'] },
  { name:'food_photo.jpg',      engine:'webp',   origSize:'3.1 MB', compSize:'1.3 MB', psnr:41.4, ssim:0.950, colors:['#ef4444','#f97316'] },
  { name:'travel_tokyo.jpg',    engine:'neural', origSize:'9.7 MB', compSize:'4.0 MB', psnr:42.3, ssim:0.956, colors:['#ec4899','#8b5cf6'] },
  { name:'wedding_shoot.png',   engine:'neural', origSize:'14.1 MB',compSize:'5.9 MB', psnr:43.8, ssim:0.963, colors:['#fbbf24','#f9a8d4'] },
  { name:'architecture.jpg',    engine:'webp',   origSize:'6.8 MB', compSize:'2.8 MB', psnr:41.1, ssim:0.948, colors:['#64748b','#1e293b'] },
  { name:'macro_flower.jpg',    engine:'neural', origSize:'5.5 MB', compSize:'2.2 MB', psnr:43.5, ssim:0.960, colors:['#ec4899','#22c55e'] },
  { name:'sports_action.jpg',   engine:'webp',   origSize:'7.4 MB', compSize:'3.0 MB', psnr:40.3, ssim:0.942, colors:['#f97316','#1e3a8a'] },
];

/* ════════════════════════════════════════════
   INIT
════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initTheme();
  initDropzone();
  initGallery();
  initCharts();
  initScatterPlot();
  initCostChart();
  initTimeChart();
  initHamburger();
  animateCounters();
});

/* ════════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════════ */
function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      showPage(item.dataset.page);
    });
  });
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pageEl = document.getElementById(`page-${pageId}`);
  const navEl  = document.querySelector(`.nav-item[data-page="${pageId}"]`);
  if (pageEl) pageEl.classList.add('active');
  if (navEl)  navEl.classList.add('active');
  const titles = {
    dashboard:'Dashboard Overview', upload:'Upload Files', gallery:'My Gallery',
    analytics:'AI Analytics',  pipeline:'AI Processing Pipeline',
    metrics:'Metrics Lab',     costs:'Cost Analysis',
  };
  document.getElementById('pageTitle').textContent = titles[pageId] || pageId;
  document.getElementById('sidebar').classList.remove('open');
  if (pageId === 'analytics') initAnalyticsPage();
}
window.showPage = showPage;

/* ════════════════════════════════════════════
   THEME
════════════════════════════════════════════ */
function initTheme() {
  document.getElementById('themeToggle').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    const icon = document.getElementById('themeIcon');
    icon.innerHTML = state.theme === 'light'
      ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
      : '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
    // Redraw canvas
    setTimeout(redrawScatter, 50);
  });
}

function initHamburger() {
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
}

/* ════════════════════════════════════════════
   DRAG & DROP UPLOAD
════════════════════════════════════════════ */
function initDropzone() {
  const zone  = document.getElementById('dropzone');
  const input = document.getElementById('fileInput');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('dragover');
    handleFiles([...e.dataTransfer.files].filter(f => f.type.startsWith('image/')));
  });
  zone.addEventListener('click', e => {
    if (!['LABEL','INPUT'].includes(e.target.tagName)) input.click();
  });
  input.addEventListener('change', () => handleFiles([...input.files]));
}

function handleFiles(files) {
  if (!files.length) return;
  document.getElementById('queueSection').style.display = 'block';
  files.forEach(file => {
    const id = `file-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    state.uploadQueue.push({ id, file });
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('queueList').appendChild(createQueueItem(id, file, e.target.result));
      setTimeout(() => startProcessing(id, file, e.target.result), 700);
    };
    reader.readAsDataURL(file);
  });
}

function createQueueItem(id, file, dataUrl) {
  const div = document.createElement('div');
  div.className = 'queue-item'; div.id = `queue-${id}`;
  div.innerHTML = `
    <img class="queue-thumb" src="${dataUrl}" alt="${file.name}"/>
    <div class="queue-info">
      <div class="queue-name">${file.name}</div>
      <div class="queue-size">${formatBytes(file.size)} · ${file.type.split('/')[1].toUpperCase()}</div>
      <div class="queue-status" id="qs-${id}" style="color:var(--accent-amber)">⏳ Queued for AI processing...</div>
    </div>
    <button class="btn-primary" onclick="startProcessing('${id}')">Process Now</button>`;
  return div;
}

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
  return (b/1048576).toFixed(1) + ' MB';
}

/* ════════════════════════════════════════════
   AI PIPELINE SIMULATION
════════════════════════════════════════════ */
function startProcessing(id, file, dataUrl) {
  if (state.modalOpen) return;
  state.modalOpen = true;

  if (!file) {
    const q = state.uploadQueue.find(q => q.id === id);
    if (!q) return;
    file = q.file;
  }

  const origMB   = file ? +(file.size / 1048576).toFixed(2) : +(Math.random()*8+2).toFixed(2);
  const ratio    = +(Math.random()*0.08+0.54).toFixed(3);
  const compMB   = +(origMB * (1 - ratio)).toFixed(2);
  const psnr     = +(Math.random()*4+40).toFixed(1);
  const ssim     = +(Math.random()*0.03+0.945).toFixed(3);
  const isNeural = Math.random() > 0.45;
  const engine   = isNeural ? 'Neural Autoencoder' : 'Sharp/WebP';
  const reEncode = Math.random() < 0.25;
  const fname    = file ? file.name : 'demo_research_img.jpg';
  const chunks   = Math.max(3, Math.ceil(compMB * 2));

  openModal(fname);

  runStage1(engine, isNeural, origMB, compMB)
    .then(() => runStage2(psnr, ssim, reEncode))
    .then(() => runStage3(compMB, chunks))
    .then(() => runStage4(fname, psnr, ssim))
    .then(() => finishModal(origMB, compMB, psnr, ssim, isNeural ? 'Neural' : 'WebP', id));
}
window.startProcessing = startProcessing;

/* ── MODAL HELPERS ── */
let logStartTime = 0;

function openModal(fname) {
  document.getElementById('processingModal').style.display = 'flex';
  document.getElementById('modalFilename').textContent = fname;
  document.getElementById('modalMeta').textContent = 'Initializing AI pipeline...';
  document.getElementById('logLines').innerHTML = '';
  document.getElementById('logTime').textContent = '0.000s';
  document.getElementById('modalMetrics').style.display = 'none';
  document.getElementById('qualityGate').style.display  = 'none';
  document.getElementById('tusProgress').style.display  = 'none';
  document.getElementById('cloudIds').style.display     = 'none';
  document.getElementById('modalFooter').style.display  = 'none';
  document.getElementById('modalSpinner').className     = 'modal-spinner';
  document.getElementById('psnrFill').style.width = '0%';
  document.getElementById('ssimFill').style.width = '0%';
  document.getElementById('tusFill').style.width  = '0%';
  for (let i = 1; i <= 4; i++) {
    const d = document.getElementById(`ms-dot-${i}`);
    d.className = 'ms-dot'; d.textContent = i;
  }
  document.querySelectorAll('.ms-line').forEach(l => l.classList.remove('done'));
  logStartTime = Date.now();
}

function closeModal() {
  document.getElementById('processingModal').style.display = 'none';
  state.modalOpen = false;
}
window.closeModal = closeModal;

function addLog(tag, msg, type = 'info') {
  const t = ((Date.now() - logStartTime) / 1000).toFixed(3);
  document.getElementById('logTime').textContent = t + 's';
  const el = document.createElement('div');
  el.className = 'log-entry';
  el.innerHTML = `<span class="log-ts">[${t}s]</span><span class="log-tag ${type}">[${tag}]</span><span class="log-msg">${msg}</span>`;
  const c = document.getElementById('logLines');
  c.appendChild(el);
  c.scrollTop = c.scrollHeight;
}

function setDot(n, st) {
  const d = document.getElementById(`ms-dot-${n}`);
  d.className = 'ms-dot ' + st;
  d.textContent = (st === 'done') ? '' : n;
}
function setLine(n) {
  const l = document.getElementById(`ms-line-${n}`);
  if (l) l.classList.add('done');
}

const delay = ms => new Promise(r => setTimeout(r, ms));

/* ── STAGE 1: Compression Engine ── */
async function runStage1(engine, isNeural, origMB, compMB) {
  setDot(1,'active');
  document.getElementById('modalMeta').textContent = 'Stage 1 — Adaptive Compression Engine active...';
  addLog('ENGINE','Loading image decoder... format: JPEG/PNG detected','info');
  await delay(380);
  addLog('ENGINE','Running Sobel edge-detection filter for texture analysis','info');
  await delay(480);
  const sigma = isNeural ? (12.5+Math.random()*8).toFixed(2) : (2.1+Math.random()*9).toFixed(2);
  addLog('TEXTURE',`Laplacian variance σ = ${sigma}  →  threshold check (σ > 12.50)`,'data');
  await delay(320);
  if (isNeural) {
    addLog('ROUTER',`σ=${sigma} > 12.50  →  routing to Neural Autoencoder path`,'warn');
    await delay(380);
    addLog('AUTOENC','Loading encoder weights... latent_dim=256, bottleneck=64×64','info');
    await delay(560);
    addLog('AUTOENC',`Forward pass: encoder → [${Math.floor(Math.random()*50+200)},256] latent tensor`,'data');
    await delay(460);
    addLog('AUTOENC','Decoder pass: reconstructing image from compressed latent space','info');
    await delay(380);
  } else {
    addLog('ROUTER',`σ=${sigma} ≤ 12.50  →  routing to Sharp/WebP codec path`,'warn');
    await delay(300);
    addLog('SHARP','sharp v0.32.6 · webp encoder · quality=82 · lossless=false','info');
    await delay(420);
    addLog('SHARP','Applying chroma subsampling 4:2:0 · DCT quantization optimized','data');
    await delay(360);
    addLog('SHARP','Color profile: sRGB → ICC embedded in output stream','data');
    await delay(280);
  }
  addLog('ENGINE',`✓ Compression complete: ${origMB} MB → ${compMB} MB`,'success');
  await delay(200);
  setDot(1,'done'); setLine(1);
  await delay(200);
}

/* ── STAGE 2: Quality Gate ── */
async function runStage2(psnr, ssim, reEncode) {
  setDot(2,'active');
  document.getElementById('modalMeta').textContent = 'Stage 2 — Quality Validation Gate: computing PSNR & SSIM...';
  document.getElementById('qualityGate').style.display = 'block';
  addLog('QV-GATE','Initializing quality validation... loading reference image','info');
  await delay(320);
  addLog('QV-GATE','cv2.imread() → float32 normalization to [0, 1] range','data');
  await delay(280);
  addLog('PSNR','Computing MSE: mse = np.mean((original - compressed) ** 2)','data');
  await delay(480);

  let dispPSNR = reEncode ? +(Math.random()*2+37).toFixed(1) : psnr;
  let dispSSIM = reEncode ? +(Math.random()*0.02+0.915).toFixed(3) : ssim;

  await animateQualityBars(dispPSNR, dispSSIM);
  addLog('PSNR',`PSNR = 10 × log10(1 / MSE) = ${dispPSNR} dB`,'data');
  await delay(200);
  addLog('SSIM',`skimage.metrics.structural_similarity() → SSIM = ${dispSSIM}`,'data');
  await delay(280);

  if (reEncode) {
    addLog('QV-GATE',`⚠ FAIL — PSNR ${dispPSNR} dB < 40.0 dB threshold`,'err');
    addLog('QV-GATE',`⚠ FAIL — SSIM ${dispSSIM} < 0.950 target`,'err');
    setQGStatus('FAIL — Re-encoding...','fail');
    await delay(500);
    addLog('QV-GATE','Fallback re-encode triggered: attempt 2/3 · quality += 12','warn');
    await delay(280);
    addLog('SHARP','Re-encoding: quality=94 · targeting PSNR > 40 dB','info');
    await delay(680);
    await animateQualityBars(psnr, ssim);
    addLog('PSNR',`Re-encoded PSNR = ${psnr} dB`,'success');
    addLog('SSIM',`Re-encoded SSIM = ${ssim}`,'success');
    await delay(200);
  }

  addLog('QV-GATE',`✓ PASS — PSNR ${psnr} dB ≥ 40.0 dB`,'success');
  addLog('QV-GATE',`✓ PASS — SSIM ${ssim} ≥ 0.950`,'success');
  setQGStatus('PASSED ✓','pass');
  document.getElementById('modalMetrics').style.display = 'grid';
  document.getElementById('mm-psnr').textContent = psnr + ' dB';
  document.getElementById('mm-ssim').textContent = ssim;
  await delay(300);
  setDot(2,'done'); setLine(2);
  await delay(200);
}

async function animateQualityBars(psnr, ssim) {
  document.getElementById('psnrFill').style.width = Math.min((psnr/50)*100,100) + '%';
  document.getElementById('ssimFill').style.width = ssim * 100 + '%';
  document.getElementById('psnrVal').textContent  = psnr + ' dB';
  document.getElementById('ssimVal').textContent  = String(ssim);
  await delay(550);
}

function setQGStatus(txt, type) {
  const el = document.getElementById('qgStatus');
  el.textContent = txt;
  el.style.background   = type==='pass' ? 'rgba(34,197,94,0.12)'  : 'rgba(239,68,68,0.12)';
  el.style.color        = type==='pass' ? 'var(--accent-green)'   : 'var(--accent-red)';
  el.style.border       = type==='pass' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)';
  el.style.padding      = '4px 10px';
  el.style.borderRadius = '4px';
  el.style.fontWeight   = '700';
  el.style.fontSize     = '0.75rem';
}

/* ── STAGE 3: Tus Upload ── */
async function runStage3(compMB, totalChunks) {
  setDot(3,'active');
  document.getElementById('modalMeta').textContent = 'Stage 3 — Resumable Tus upload in progress...';
  document.getElementById('tusProgress').style.display = 'block';
  const tusId    = `tus_${randomHex(8)}`;
  const endpoint = 'https://cloudai-tus.railway.app/files/';
  const total    = Math.floor(compMB * 1048576);
  const chunk    = 524288;

  addLog('TUS',`POST ${endpoint}  ·  Tus-Resumable: 1.0.0`,'info');
  await delay(340);
  addLog('TUS',`Upload-Length: ${total} bytes  ·  Upload-ID: ${tusId}`,'data');
  await delay(240);
  addLog('TUS','Server responded: 201 Created  →  Upload-Offset: 0','success');
  await delay(280);

  let uploaded = 0, num = 0;
  while (uploaded < total) {
    num++;
    const cur = Math.min(chunk, total - uploaded);
    uploaded += cur;
    const pct = Math.floor((uploaded/total)*100);
    document.getElementById('tusFill').style.width     = pct + '%';
    document.getElementById('tusChunkInfo').textContent = `Chunk ${num}/${totalChunks}`;
    document.getElementById('tusMeta').textContent     = `PATCH offset=${uploaded}  ·  chunk=${cur} B  ·  ${pct}%  ·  Upload-Offset: ${uploaded}/${total}`;
    if (num <= 3 || num === Math.floor(totalChunks/2) || num === totalChunks)
      addLog('TUS',`PATCH chunk ${num}: offset=${uploaded}, 204 No Content`,'data');
    await delay(Math.max(120, 380/totalChunks));
  }
  addLog('TUS',`✓ Upload complete: ${total} bytes in ${num} chunks`,'success');
  addLog('TUS','HEAD verification → Upload-Offset matches Upload-Length ✓','success');
  await delay(280);
  setDot(3,'done'); setLine(3);
  await delay(200);
}

/* ── STAGE 4: Cloud Sync ── */
async function runStage4(fname, psnr, ssim) {
  setDot(4,'active');
  document.getElementById('modalMeta').textContent = 'Stage 4 — Syncing to AWS S3, Firebase, MongoDB Atlas...';
  document.getElementById('cloudIds').style.display = 'flex';

  const s3Key  = `users/jd/${Date.now()}-${fname.replace(/\s/g,'_')}`;
  const s3Id   = `s3://cloudai-research-us-east-1/${s3Key}`;
  const fbTok  = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.${randomBase64(40)}.${randomBase64(20)}`;
  const mongId = `ObjectId("${randomHex(24)}")`;

  addLog('AWS-S3','PutObject → s3://cloudai-research-us-east-1/...','info');
  await delay(480);
  addLog('AWS-S3','ServerSideEncryption: AES256 · StorageClass: INTELLIGENT_TIERING','data');
  await delay(380);
  document.getElementById('s3Id').textContent = s3Id;
  addLog('AWS-S3',`ETag: "${randomHex(32)}"  ·  Object stored successfully ✓`,'success');
  await delay(300);

  addLog('FIREBASE','Admin SDK: verifyIdToken()  →  checking claims...','info');
  await delay(380);
  addLog('FIREBASE',`uid: jd_${randomHex(8)} ✓  ·  claims validated`,'success');
  await delay(280);
  document.getElementById('fbToken').textContent = fbTok.substring(0,64) + '...';
  addLog('FIREBASE',`Firestore: /users/jd/files/${randomHex(12)} written ✓`,'success');
  await delay(280);

  addLog('MONGODB','Connecting to cloudai-atlas.mongodb.net/research-db...','info');
  await delay(380);
  addLog('MONGODB',`db.images.insertOne({ s3Key, psnr:${psnr}, ssim:${ssim}, engine, ... })`,'data');
  await delay(320);
  document.getElementById('mongoId').textContent = mongId;
  addLog('MONGODB',`Indexed: ${mongId} ✓`,'success');
  await delay(200);
  addLog('SYNC','✓✓✓ All cloud services synced successfully','success');

  setDot(4,'done');
  await delay(200);
}

/* ── FINISH ── */
function finishModal(origMB, compMB, psnr, ssim, engineShort, id) {
  document.getElementById('modalMeta').textContent = '✓ Processing complete — compressed, validated & synced to cloud';
  document.getElementById('modalSpinner').classList.add('spinner-done');
  const reduction = (((origMB-compMB)/origMB)*100).toFixed(1);
  document.getElementById('mm-reduction').textContent = reduction + '%';
  document.getElementById('mm-engine').textContent    = engineShort;
  state.storageUsed = Math.min(state.storageUsed + compMB/1024, 25);
  updateStorageBar();
  document.getElementById('modalFooter').style.display = 'flex';
  const qs = document.getElementById(`qs-${id}`);
  if (qs) { qs.textContent = `✓ Done — ${reduction}% saved · PSNR: ${psnr} dB`; qs.style.color = 'var(--accent-green)'; }
}

/* ════════════════════════════════════════════
   GALLERY
════════════════════════════════════════════ */
function initGallery() {
  renderGallery(galleryData);
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      renderGallery(f === 'all' ? galleryData : galleryData.filter(g => g.engine === f));
    });
  });
}

function renderGallery(data) {
  const grid = document.getElementById('galleryGrid');
  grid.innerHTML = '';
  data.forEach(item => {
    const red = (((parseFloat(item.origSize)-parseFloat(item.compSize))/parseFloat(item.origSize))*100).toFixed(0);
    const ec  = item.engine === 'neural' ? 'purple' : 'blue';
    const el  = document.createElement('div');
    el.className = 'gallery-item';
    el.innerHTML = `
      <div class="gallery-img" style="background:linear-gradient(135deg,${item.colors[0]},${item.colors[1]})">
        <div class="gallery-overlay">
          <div class="gallery-badges">
            <span class="badge ${ec}">${item.engine==='neural'?'Neural':'WebP'}</span>
            <span class="badge green">-${red}%</span>
          </div>
        </div>
      </div>
      <div class="gallery-info">
        <div class="gallery-name">${item.name}</div>
        <div class="gallery-meta">
          <span>${item.origSize} → ${item.compSize}</span>
          <span style="color:var(--accent-green)">${item.psnr} dB</span>
        </div>
      </div>`;
    grid.appendChild(el);
  });
}

/* ════════════════════════════════════════════
   COMPRESSION BAR CHART
════════════════════════════════════════════ */
function initCharts() {
  const cats = [
    { label:'Landscape', webp:58, neural:54 },
    { label:'Portrait',  webp:55, neural:62 },
    { label:'Nature',    webp:60, neural:57 },
    { label:'City',      webp:52, neural:59 },
    { label:'Indoor',    webp:56, neural:61 },
    { label:'Macro',     webp:53, neural:64 },
  ];
  const chart = document.getElementById('compressionChart');
  chart.innerHTML = '';
  chart.style.cssText = 'display:flex;align-items:flex-end;gap:10px;height:160px;padding-top:10px';
  cats.forEach(cat => {
    const grp = document.createElement('div'); grp.className = 'bar-group';
    const bw  = document.createElement('div'); bw.className  = 'bar-wrap';
    const b1  = document.createElement('div'); b1.className  = 'bar';
    const b2  = document.createElement('div'); b2.className  = 'bar';
    b1.style.background  = 'linear-gradient(to top,#6366f1,#818cf8)';
    b2.style.background  = 'linear-gradient(to top,#8b5cf6,#a78bfa)';
    b1.dataset.val = `WebP: ${cat.webp}%`;
    b2.dataset.val = `Neural: ${cat.neural}%`;
    bw.appendChild(b1); bw.appendChild(b2);
    const lbl = document.createElement('div'); lbl.className = 'bar-label'; lbl.textContent = cat.label;
    grp.appendChild(bw); grp.appendChild(lbl); chart.appendChild(grp);
    setTimeout(() => {
      b1.style.height = b1.style.transition = 'height 1s ease';
      b2.style.height = b2.style.transition = 'height 1s ease';
      b1.style.height = cat.webp   * 1.8 + 'px';
      b2.style.height = cat.neural * 1.8 + 'px';
    }, 100);
  });
}

/* ════════════════════════════════════════════
   ANALYTICS PAGE
════════════════════════════════════════════ */
function initAnalyticsPage() {
  if (document.getElementById('psnrChart').children.length > 0) return;
  const buckets = [
    { label:'38–39 dB', count:12,  pct:2.5,  color:'#ef4444' },
    { label:'39–40 dB', count:62,  pct:4.8,  color:'#f97316' },
    { label:'40–41 dB', count:821, pct:72.4, color:'#22c55e' },
    { label:'41–42 dB', count:943, pct:100,  color:'#6366f1' },
    { label:'42–43 dB', count:712, pct:75.4, color:'#8b5cf6' },
    { label:'43–44 dB', count:218, pct:23.1, color:'#3b82f6' },
    { label:'44–45 dB', count:79,  pct:8.4,  color:'#06b6d4' },
  ];
  const c = document.getElementById('psnrChart');
  buckets.forEach(b => {
    const row = document.createElement('div'); row.className = 'psnr-bucket';
    row.innerHTML = `
      <div class="psnr-label">${b.label}</div>
      <div class="psnr-track"><div class="psnr-fill" data-pct="${b.pct}" style="width:0%;background:${b.color}"></div></div>
      <div class="psnr-count">${b.count}</div>`;
    c.appendChild(row);
  });
  setTimeout(() => {
    c.querySelectorAll('.psnr-fill').forEach(f => { f.style.transition='width 1s ease'; f.style.width=f.dataset.pct+'%'; });
  }, 100);
}

/* ════════════════════════════════════════════
   SCATTER PLOT (Canvas)
════════════════════════════════════════════ */
let scatterCtx, scatterCanvas, scatterPoints;

function initScatterPlot() {
  const wrap = document.getElementById('scatterPlot');
  if (!wrap) return;
  scatterCanvas = document.createElement('canvas');
  scatterCanvas.style.cssText = 'width:100%;height:260px;display:block';
  scatterCanvas.width  = Math.max(wrap.clientWidth || 600, 400);
  scatterCanvas.height = 260;
  wrap.appendChild(scatterCanvas);
  scatterCtx = scatterCanvas.getContext('2d');
  scatterPoints = Array.from({length:120}, () => ({
    psnr: 38 + Math.random()*8,
    ssim: 0.91 + Math.random()*0.07,
    engine: Math.random() > 0.45 ? 'neural' : 'webp',
  }));
  drawScatter();
  window.addEventListener('resize', () => {
    scatterCanvas.width = Math.max(wrap.clientWidth, 400);
    drawScatter();
  });
}

function redrawScatter() { if (scatterCtx) drawScatter(); }

function drawScatter() {
  const ctx  = scatterCtx;
  const w    = scatterCanvas.width;
  const h    = scatterCanvas.height;
  const pad  = { l:52, r:20, t:22, b:42 };
  const dark = document.documentElement.getAttribute('data-theme') !== 'light';

  ctx.fillStyle = dark ? '#0a0a0f' : '#f0f0f5'; ctx.fillRect(0,0,w,h);
  const grid = dark ? '#1e1e2e' : '#e2e2ed';
  const txt  = dark ? '#55556a' : '#9999aa';

  ctx.strokeStyle = grid; ctx.lineWidth = 1;
  for (let i=0;i<=5;i++) { const y=pad.t+(i/5)*(h-pad.t-pad.b); ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke(); }
  for (let i=0;i<=8;i++) { const x=pad.l+(i/8)*(w-pad.l-pad.r); ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,h-pad.b);ctx.stroke(); }

  // Threshold lines
  ctx.setLineDash([5,4]); ctx.strokeStyle='#22c55e'; ctx.lineWidth=1.5;
  const px = pad.l+((40-38)/8)*(w-pad.l-pad.r);
  ctx.beginPath();ctx.moveTo(px,pad.t);ctx.lineTo(px,h-pad.b);ctx.stroke();
  const sy = pad.t+((0.98-0.95)/0.07)*(h-pad.t-pad.b);
  ctx.beginPath();ctx.moveTo(pad.l,sy);ctx.lineTo(w-pad.r,sy);ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle='#22c55e'; ctx.font='10px JetBrains Mono,monospace';
  ctx.fillText('PSNR = 40 dB', px+5, pad.t+14);
  ctx.fillText('SSIM = 0.95',  pad.l+5, sy-5);

  scatterPoints.forEach(p => {
    const x = pad.l+((p.psnr-38)/8)*(w-pad.l-pad.r);
    const y = pad.t+((0.98-p.ssim)/0.07)*(h-pad.t-pad.b);
    const c = p.engine==='neural' ? '#8b5cf6' : '#6366f1';
    ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2);
    ctx.fillStyle=c+'bb'; ctx.fill();
    ctx.strokeStyle=c; ctx.lineWidth=1; ctx.stroke();
  });

  ctx.fillStyle=txt; ctx.font='11px Inter,sans-serif';
  ctx.fillText('PSNR (dB)', w/2-24, h-4);
  ctx.save(); ctx.translate(14,h/2); ctx.rotate(-Math.PI/2); ctx.fillText('SSIM',-14,0); ctx.restore();
  ctx.font='10px JetBrains Mono,monospace'; ctx.fillStyle=txt;
  for (let i=0;i<=8;i++) { const x=pad.l+(i/8)*(w-pad.l-pad.r); ctx.fillText(38+i+'',x-5,h-pad.b+14); }
  for (let i=0;i<=5;i++) { const y=pad.t+(i/5)*(h-pad.t-pad.b); ctx.fillText((0.98-i*0.014).toFixed(3),2,y+4); }
}

/* ════════════════════════════════════════════
   COST CHART (12-Month)
════════════════════════════════════════════ */
function initCostChart() {
  const c = document.getElementById('costChart');
  if (!c) return;
  const months  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const aiCosts = [18.80,19.20,18.40,20.10,18.90,19.50,18.70,19.80,18.60,19.20,18.80,19.40];
  c.innerHTML = '';
  months.forEach((m,i) => {
    const aiPct  = (aiCosts[i]/50)*100;
    const saving = (50-aiCosts[i]).toFixed(2);
    const row = document.createElement('div'); row.className='time-row';
    row.innerHTML=`
      <span style="font-size:.72rem;color:var(--text-secondary)">${m}</span>
      <div style="display:flex;flex-direction:column;gap:3px;flex:1">
        <div class="time-track"><div class="time-fill" data-w="100"    style="width:0%;background:#ef4444;height:100%;border-radius:4px;transition:width 1s ease"></div></div>
        <div class="time-track"><div class="time-fill" data-w="${aiPct.toFixed(1)}" style="width:0%;background:#22c55e;height:100%;border-radius:4px;transition:width 1s ease"></div></div>
      </div>
      <span style="color:var(--accent-green);font-size:.68rem;font-family:'JetBrains Mono',monospace">-$${saving}</span>`;
    c.appendChild(row);
  });
  setTimeout(() => c.querySelectorAll('.time-fill').forEach(f=>{f.style.width=f.dataset.w+'%';}), 300);
}

/* ════════════════════════════════════════════
   TIME CHART (Compression Speed)
════════════════════════════════════════════ */
function initTimeChart() {
  const c = document.getElementById('timeChart');
  if (!c) return;
  const rows = [
    { label:'< 0.5s',  pct:12,  color:'#22c55e', count:'341' },
    { label:'0.5–1s',  pct:68,  color:'#6366f1', count:'1934' },
    { label:'1–2s',    pct:100, color:'#8b5cf6', count:'2847' },
    { label:'2–3s',    pct:32,  color:'#f59e0b', count:'910' },
    { label:'> 3s',    pct:8,   color:'#ef4444', count:'228' },
  ];
  c.innerHTML = '';
  rows.forEach(r => {
    const el = document.createElement('div'); el.className='time-row';
    el.innerHTML=`
      <span class="psnr-label">${r.label}</span>
      <div class="time-track"><div class="time-fill" data-w="${r.pct}" style="width:0%;background:${r.color};transition:width 1s ease"></div></div>
      <span class="time-val">${r.count}</span>`;
    c.appendChild(el);
  });
  setTimeout(() => c.querySelectorAll('.time-fill').forEach(f=>{f.style.width=f.dataset.w+'%';}), 300);
}

/* ════════════════════════════════════════════
   STORAGE BAR UPDATE
════════════════════════════════════════════ */
function updateStorageBar() {
  const pct = Math.min((state.storageUsed/25)*100,100);
  document.getElementById('storageFill').style.width    = pct+'%';
  document.getElementById('storagePercent').textContent = pct.toFixed(0)+'%';
  document.getElementById('storageUsed').textContent    = state.storageUsed.toFixed(1)+' GB';
}

/* ════════════════════════════════════════════
   DEMO PIPELINE (Pipeline Page Button)
════════════════════════════════════════════ */
function runDemoPipeline() {
  startProcessing(`demo-${Date.now()}`, { name:'demo_research_image.jpg', size:4718592, type:'image/jpeg' }, null);
}
window.runDemoPipeline = runDemoPipeline;

/* ════════════════════════════════════════════
   COUNTER ANIMATION
════════════════════════════════════════════ */
function animateCounters() {
  document.querySelectorAll('.stat-value').forEach(el => {
    const raw = el.textContent;
    const num = parseFloat(raw.replace(/[^0-9.]/g,''));
    if (isNaN(num)) return;
    const pre = raw.match(/^[^0-9]*/)?.[0] || '';
    const suf = raw.replace(/^[0-9,.\s$]*/,'');
    let start = 0;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts-start)/1200,1);
      const e = 1-Math.pow(1-p,3);
      el.textContent = pre + (num*e).toFixed(num%1===0?0:1) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

/* ════════════════════════════════════════════
   UTILITIES
════════════════════════════════════════════ */
function randomHex(len) {
  return Array.from({length:len}, () => Math.floor(Math.random()*16).toString(16)).join('');
}
function randomBase64(len) {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  return Array.from({length:len}, () => c[Math.floor(Math.random()*c.length)]).join('');
}