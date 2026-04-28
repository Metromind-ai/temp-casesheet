// ---------------------------------------------------------------------------
// MetroMind MCLA 2.3 — client-side logic
// Renders the 5 layer cards (each with 7 items, score/time/resistance,
// pattern checkboxes, red-flag banner) plus the L1 MRS add-on,
// runs live score totals, and exports the case sheet as a downloadable JSON.
// ---------------------------------------------------------------------------

// ---- Mini Scoring Handbook anchors (Part 2 of the doc) --------------------
// Each layer item carries: name, description, and the 4 anchor strings
// shown as a tooltip when the rater hovers a 0/1/2/3 circle.
const LAYERS = [
  {
    id: 'L1',
    title: 'L1 — Biological Signals & Regulation',
    intro: 'What body-state factors are contributing?',
    items: [
      {
        name: 'Family Loading / Genetic Risk',
        desc: 'mood disorder, psychosis, ADHD, addiction, suicide',
        anchors: [
          'No known history',
          'Distant relative / mild',
          'One first-degree relative',
          'Multiple first-degree / severe'
        ]
      },
      {
        name: 'Energy Reliability',
        desc: 'fatigue, crashes, low stamina despite intent',
        anchors: [
          'Stable energy most days',
          'Occasional tired days',
          'Frequent crashes, affects work',
          'Daily exhaustion, cannot sustain'
        ]
      },
      {
        name: 'Physiological Reactivity',
        desc: 'sensitivity to caffeine, hunger, meds, stress, alcohol',
        anchors: [
          'Normal tolerance',
          'Mild sensitivity',
          'Noticeable anxiety/crashes with triggers',
          'Highly reactive — small triggers destabilize'
        ]
      },
      {
        name: 'Motivation State Dependence',
        desc: 'needs urgency/novelty to activate; routine effort difficult',
        anchors: [
          'Can work without urgency',
          'Sometimes needs deadlines',
          'Often only activates under urgency',
          'Cannot function without crisis-pressure'
        ]
      },
      {
        name: 'Hormonal / Medical Influence',
        desc: 'cycle-linked symptoms, thyroid/metabolic, pain/inflammation',
        anchors: [
          'No clear influence',
          'Possible mild pattern',
          'Clear recurring influence',
          'Dominant driver of symptoms'
        ]
      },
      {
        name: 'Sleep Restoration',
        desc: 'non-restorative, fragmented, insomnia, hypersomnia',
        anchors: [
          'Refreshing sleep',
          'Occasionally poor',
          'Frequent non-restorative',
          'Severe insomnia / daily fatigue'
        ]
      },
      {
        name: 'Circadian Timing',
        desc: 'delayed, reversed, chaotic sleep-wake',
        anchors: [
          'Regular schedule',
          'Mild delay',
          'Major shift affecting life',
          'Reversed / chaotic cycle'
        ]
      }
    ],
    patterns: ['Circadian', 'Underactivation', 'Hyperreactive', 'Hormonal/medical', 'Mixed'],
    redFlags: 'total insomnia, severe reversal, suspected apnea, manic decreased sleep, severe weight change'
  },
  {
    id: 'L2',
    title: 'L2 — Neurofunctional Integration',
    intro: 'How is the system processing?',
    items: [
      { name: 'Initiation Difficulty', desc: 'prolonged delay starting tasks',
        anchors: ['Starts tasks normally','Mild procrastination','Frequent task paralysis','Cannot initiate basics'] },
      { name: 'Selection (Focus)', desc: 'sustain focus on priorities',
        anchors: ['Sustains focus','Occasional drift','Frequent distraction','Cannot stay on priority'] },
      { name: 'Inhibition', desc: 'stop impulses, distractions, compulsive urges',
        anchors: ['Good impulse control','Occasional lapses','Frequent urges acted on','Severe impulsivity / compulsive'] },
      { name: 'Switching', desc: 'shift between tasks/thoughts smoothly',
        anchors: ['Flexible shifting','Mild stuckness','Frequent difficulty','Rigidly stuck or chaotic'] },
      { name: 'Stress Coordination', desc: 'thinking/emotion/action coordinated when stressed',
        anchors: ['Coherent under stress','Mild disruption','Frequent disorganization','Breakdown of function'] },
      { name: 'Error Monitoring', desc: 'balanced vs missing vs obsessive checking',
        anchors: ['Balanced noticing','Mild under/over','Misses errors OR overchecks','Blind OR checking paralysis'] },
      { name: 'Recovery Speed', desc: 'returns to baseline after overload',
        anchors: ['Within hours','By next day','Takes several days','Prolonged / incomplete'] }
    ],
    patterns: ['Executive dysfunction', 'Salience dysregulation', 'Loop/rigidity', 'Mixed'],
    redFlags: 'cannot initiate basic tasks, severe impulsivity, extreme distractibility, obsessive checking paralysis'
  },
  {
    id: 'L3',
    title: 'L3 — Functional Outputs',
    intro: 'What is happening in life?',
    items: [
      { name: 'Productivity vs Potential', desc: '',
        anchors: ['Near expected','Mild underperformance','Significant gap','Severe collapse'] },
      { name: 'Consistency of Functioning', desc: '',
        anchors: ['Reliable','Mild variable days','Frequent inconsistency','Chaotic unpredictability'] },
      { name: 'Completion of Responsibilities', desc: '',
        anchors: ['Finishes tasks','Some incomplete','Frequent unfinished','Rarely completes'] },
      { name: 'Self-care / Routine / Finances', desc: '',
        anchors: ['Managed well','Mild neglect','Bills/self-care slipping','Major neglect / collapse'] },
      { name: 'Social Functioning', desc: '',
        anchors: ['Adequate','Mild withdrawal','Significant impairment','Isolated / dysfunctional'] },
      { name: 'Avoidance Patterns', desc: '',
        anchors: ['Minimal','Occasional','Frequent, limits life','Pervasive pattern'] },
      { name: 'Risk Coping', desc: 'substances, compulsions, overspending, aggression, doom scrolling',
        anchors: ['Healthy coping','Mild risky','Frequent maladaptive','Escalating harmful'] }
    ],
    patterns: ['Underfunctioning', 'Dyscontrol', 'Avoidance', 'Mixed'],
    redFlags: 'job loss risk, academic collapse, self-neglect, escalating substance use, domestic aggression'
  },
  {
    id: 'L4',
    title: 'L4 — Cognitive Appraisal',
    intro: 'How is reality being interpreted?',
    items: [
      { name: 'Negative Attribution', desc: '“I am defective / it is always my fault”',
        anchors: ['Balanced self-view','Occasional self-blame','Frequent self-defect','Pervasive “my fault”'] },
      { name: 'Catastrophic Prediction', desc: 'expects disaster/failure',
        anchors: ['Realistic','Mild worst-case','Frequent disaster expectations','Constant catastrophe'] },
      { name: 'Harsh Self-Attack', desc: 'cruel inner critic',
        anchors: ['Self-compassionate','Mildly critical','Regular harsh critic','Brutal self-abuse'] },
      { name: 'Threat Bias', desc: 'neutral events seen as rejection/danger',
        anchors: ['Neutral interpretation','Mild suspicion','Frequent negative reading','Strong danger/rejection'] },
      { name: 'Rumination', desc: 'loops/replays difficult to stop',
        anchors: ['Rare loops','Occasional replaying','Daily, interruptible','Hours/day, hard to stop'] },
      { name: 'Cognitive Rigidity', desc: 'cannot generate alternative views',
        anchors: ['Flexible','Mild stubbornness','Struggles with alternatives','Fixed, no alternative'] },
      { name: 'Emotional Reasoning', desc: '“I feel bad therefore it is bad”',
        anchors: ['Facts separate from feelings','Occasional fusion','Frequent feel = fact','Dominant style'] }
    ],
    patterns: ['Negative bias', 'Rumination dominant', 'Distortion dominant', 'Mixed'],
    redFlags: 'hopelessness, fixed worthlessness, paranoia-like misinterpretation, relentless guilt'
  },
  {
    id: 'L5',
    title: 'L5 — Narrative Identity',
    intro: 'What story has formed?',
    items: [
      { name: 'Core Identity Injury', desc: 'failure / burden / broken / outsider',
        anchors: ['Stable positive/neutral','Mild insecurity','Recurrent “I’m flawed”','Dominated by defectiveness'] },
      { name: 'Repeated Life Role', desc: 'invisible one / rescuer / problem one / rejected one',
        anchors: ['Flexible roles','Occasional repeating','Clear recurring pattern','Rigidly trapped'] },
      { name: 'Conditional Worth', desc: 'only valuable when achieving/pleasing',
        anchors: ['Independent of performance','Mild approval dependence','Strongly conditional','Only via approval/achievement'] },
      { name: 'Meaning of Suffering', desc: 'punishment / weakness / doomed / growthless',
        anchors: ['Growth/neutral','Mildly negative','Punishment/weakness','Completely doomed'] },
      { name: 'Future Self Hopelessness', desc: 'expects no meaningful improvement',
        anchors: ['Hopeful','Uncertain','Pessimistic','No meaningful future'] },
      { name: 'Belonging Disturbance', desc: 'feels unwanted, disconnected, unsafe',
        anchors: ['Connected','Mild outsider','Frequent disconnection','Profound alienation'] },
      { name: 'Story Rigidity', desc: 'cannot revise identity despite evidence',
        anchors: ['Updates with evidence','Mild fixed labels','Recurrent rigid story','Completely fused'] }
    ],
    patterns: ['Identity wound', 'Trauma/theme dominant', 'Belonging dominant', 'Mixed'],
    redFlags: 'total hopeless identity, self-hate core, repeated destructive relationship pattern, chronic emptiness'
  }
];

// ---- MRS criteria (L1 add-on) --------------------------------------------
const MRS_CRITERIA = [
  'Severe insomnia',
  'Significant anxiety physiology',
  'Major depressive neurovegetative symptoms',
  'Prior positive medication response',
  'Recurrent episodes',
  'Marked impairment',
  'Agitation / psychomotor slowing',
  'Strong family loading',
  'Symptoms > 6 months',
  'Failed non-pharmacological attempts'
];
const MRS_BIOLOGICAL_NEEDS = ['INHIBIT (excess activation)', 'EXCITE (deficit)', 'STABILIZE (fluctuating)', 'RESET RHYTHM (circadian)', 'MEDICAL WORKUP'];
const MRS_ACTIONS = ['Lifestyle + sleep hygiene only', 'Labs / medical review', 'Medication evaluation', 'Combined med + therapy', 'Urgent psychiatric review'];

const TIME_CODES = [
  { v: '', t: '--' },
  { v: 'A', t: 'A — Acute (<1 mo)' },
  { v: 'S', t: 'S — Subacute (1–6 mo)' },
  { v: 'C', t: 'C — Chronic (>6 mo)' },
  { v: 'E', t: 'E — Episodic' },
  { v: 'L', t: 'L — Lifelong' }
];
const RESIST_CODES = [
  { v: '', t: '--' },
  { v: 'R0', t: 'R0 — Low' },
  { v: 'R1', t: 'R1 — Mild' },
  { v: 'R2', t: 'R2 — Moderate' },
  { v: 'R3', t: 'R3 — High' }
];

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const c of children) {
    if (c == null) continue;
    if (typeof c === 'string') node.appendChild(document.createTextNode(c));
    else node.appendChild(c);
  }
  return node;
}

function buildScoreCell(layerId, itemIndex, anchors) {
  const cell = el('td', { class: 'score-cell' });
  for (let s = 0; s <= 3; s++) {
    const inputId = `${layerId}_item${itemIndex}_${s}`;
    const opt = el('span', { class: 'opt', tabindex: '0' });
    const input = el('input', {
      type: 'radio',
      name: `${layerId}.item${itemIndex}.score`,
      value: String(s),
      id: inputId,
      'data-layer': layerId
    });
    const label = el('label', { for: inputId }, String(s));
    const tip = el('span', { class: 'anchor-tip' }, `${s} — ${anchors[s]}`);
    opt.appendChild(input);
    opt.appendChild(label);
    opt.appendChild(tip);
    cell.appendChild(opt);
  }
  return cell;
}

function buildLayerCard(layer) {
  const card = el('section', { class: 'card layer-card', 'data-layer': layer.id });
  const header = el('header', {},
    el('h2', { html: `${layer.title} <span class="pill">Section H</span>` }),
    el('span', { class: 'toggle-icon' }, '▾')
  );
  card.appendChild(header);

  const body = el('div', { class: 'body' });
  body.appendChild(el('p', { class: 'layer-intro' }, layer.intro));

  // Items table
  const table = el('table', { class: 'item-table' });
  const thead = el('thead', {}, el('tr', {},
    el('th', {}, '#'),
    el('th', {}, 'Item'),
    el('th', {}, 'Score (hover for anchor)')
  ));
  table.appendChild(thead);
  const tbody = el('tbody');
  layer.items.forEach((item, i) => {
    const idx = i + 1;
    const row = el('tr');
    row.appendChild(el('td', { class: 'item-num' }, String(idx)));
    const nameCell = el('td');
    nameCell.appendChild(el('span', { class: 'item-name' }, item.name));
    if (item.desc) nameCell.appendChild(el('span', { class: 'item-desc' }, item.desc));
    row.appendChild(nameCell);
    row.appendChild(buildScoreCell(layer.id, idx, item.anchors));
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  body.appendChild(table);

  // Score / Time / Resistance summary
  const summary = el('div', { class: 'layer-summary' });

  const scoreBlock = el('div', { class: 'summary-block' });
  scoreBlock.appendChild(el('label', {}, 'Score'));
  const scoreDisplay = el('div', { class: 'score-display', id: `${layer.id}_scoreDisplay` }, '0 / 21');
  scoreBlock.appendChild(scoreDisplay);
  // hidden field that carries the score in form data
  scoreBlock.appendChild(el('input', { type: 'hidden', name: `${layer.id}.totalScore`, id: `${layer.id}_scoreHidden`, value: '0' }));

  const timeBlock = el('div', { class: 'summary-block' });
  timeBlock.appendChild(el('label', {}, 'Time Code'));
  const timeSel = el('select', { name: `${layer.id}.time` });
  TIME_CODES.forEach(o => timeSel.appendChild(el('option', { value: o.v }, o.t)));
  timeBlock.appendChild(timeSel);

  const resistBlock = el('div', { class: 'summary-block' });
  resistBlock.appendChild(el('label', {}, 'Resistance'));
  const resistSel = el('select', { name: `${layer.id}.resistance`, 'data-layer': layer.id, class: 'layerResistance' });
  RESIST_CODES.forEach(o => resistSel.appendChild(el('option', { value: o.v }, o.t)));
  resistBlock.appendChild(resistSel);

  summary.appendChild(scoreBlock);
  summary.appendChild(timeBlock);
  summary.appendChild(resistBlock);
  body.appendChild(summary);

  // Pattern checkboxes
  const patternRow = el('div', { class: 'pattern-row' });
  patternRow.appendChild(el('span', { class: 'pattern-label' }, 'Pattern (tick all that apply)'));
  layer.patterns.forEach(p => {
    const lbl = el('label', { class: 'cb' });
    lbl.appendChild(el('input', { type: 'checkbox', name: `${layer.id}.pattern`, value: p }));
    lbl.appendChild(document.createTextNode(' ' + p));
    patternRow.appendChild(lbl);
  });
  body.appendChild(patternRow);

  // Red flag banner + acknowledgement
  const rf = el('div', { class: 'red-flag' });
  rf.appendChild(el('span', { class: 'flag-title' }, '🚩 Red Flags:'));
  rf.appendChild(document.createTextNode(' ' + layer.redFlags));
  const ackLabel = el('label', { class: 'ack' });
  ackLabel.appendChild(el('input', { type: 'checkbox', name: `${layer.id}.redFlagPresent`, value: 'yes' }));
  ackLabel.appendChild(document.createTextNode(' One or more of these red flags is present in this patient'));
  rf.appendChild(ackLabel);
  body.appendChild(rf);

  // ---- L1: append MRS block --------------------------------------------
  if (layer.id === 'L1') body.appendChild(buildMrsBlock());

  card.appendChild(body);
  return card;
}

function buildMrsBlock() {
  const block = el('div', { class: 'mrs-block' });
  block.appendChild(el('h3', {}, 'Medication Relevance Score (MRS) — L1 Add-on'));
  block.appendChild(el('p', { class: 'note', style: 'margin:0 0 10px' },
    'Tick each criterion present. Sum = MRS score. Guides medication decision urgency.'));

  const grid = el('div', { class: 'mrs-grid' });
  MRS_CRITERIA.forEach(c => {
    const lbl = el('label');
    lbl.appendChild(el('input', { type: 'checkbox', name: 'MRS.criteria', value: c, class: 'mrsCriterion' }));
    lbl.appendChild(document.createTextNode(' ' + c));
    grid.appendChild(lbl);
  });
  block.appendChild(grid);

  const result = el('div', { class: 'mrs-result' });
  result.appendChild(document.createTextNode('MRS = '));
  result.appendChild(el('span', { id: 'mrsScoreDisplay' }, '0'));
  result.appendChild(document.createTextNode(' / 10'));
  result.appendChild(el('span', { class: 'band', id: 'mrsBandDisplay' }, '— Low'));
  block.appendChild(result);
  block.appendChild(el('input', { type: 'hidden', name: 'MRS.totalScore', id: 'mrsScoreHidden', value: '0' }));
  block.appendChild(el('input', { type: 'hidden', name: 'MRS.band', id: 'mrsBandHidden', value: 'Low' }));

  // Primary biological need
  const bioRow = el('div', { class: 'mrs-followup' });
  bioRow.appendChild(el('div', { class: 'pattern-label' }, 'Primary Biological Need'));
  const bioOpts = el('div', { class: 'opts' });
  MRS_BIOLOGICAL_NEEDS.forEach(b => {
    const lbl = el('label');
    lbl.appendChild(el('input', { type: 'checkbox', name: 'MRS.biologicalNeed', value: b }));
    lbl.appendChild(document.createTextNode(' ' + b));
    bioOpts.appendChild(lbl);
  });
  bioRow.appendChild(bioOpts);
  block.appendChild(bioRow);

  // Suggested action
  const actRow = el('div', { class: 'mrs-followup' });
  actRow.appendChild(el('div', { class: 'pattern-label' }, 'Suggested Action'));
  const actOpts = el('div', { class: 'opts' });
  MRS_ACTIONS.forEach(a => {
    const lbl = el('label');
    lbl.appendChild(el('input', { type: 'checkbox', name: 'MRS.action', value: a }));
    lbl.appendChild(document.createTextNode(' ' + a));
    actOpts.appendChild(lbl);
  });
  actRow.appendChild(actOpts);
  block.appendChild(actRow);

  return block;
}

// Build the per-layer resistance grid in the Final Formulation card
function buildResistanceGrid() {
  const grid = document.getElementById('resistGrid');
  LAYERS.forEach(l => {
    const wrap = el('div', { class: 'field' });
    wrap.appendChild(el('label', {}, l.id + ' Resistance'));
    const sel = el('select', { name: `FORM.resistance.${l.id}`, 'data-form-resistance': l.id });
    RESIST_CODES.forEach(o => sel.appendChild(el('option', { value: o.v }, o.t)));
    wrap.appendChild(sel);
    grid.appendChild(wrap);
  });
}

// ---------------------------------------------------------------------------
// Live calculations
// ---------------------------------------------------------------------------

function recalcLayer(layerId) {
  let total = 0;
  for (let i = 1; i <= 7; i++) {
    const checked = document.querySelector(`input[name="${layerId}.item${i}.score"]:checked`);
    if (checked) total += Number(checked.value);
  }
  document.getElementById(`${layerId}_scoreDisplay`).textContent = `${total} / 21`;
  document.getElementById(`${layerId}_scoreHidden`).value = String(total);
  refreshScoresSummary();
}

function refreshScoresSummary() {
  const scored = LAYERS.map(l => ({
    id: l.id,
    score: Number(document.getElementById(`${l.id}_scoreHidden`).value || 0)
  }));
  const parts = scored.map(s => `${s.id} ${s.score}/21`);
  const summaryInput = document.getElementById('scoresSummary');
  if (!summaryInput.dataset.userEdited) {
    summaryInput.value = parts.join(' / ');
  }

  // Rank layers by score (desc); preserve L1..L5 order on ties.
  const ranked = scored.slice().sort((a, b) => b.score - a.score);
  const fmt = s => `${s.id} (${s.score}/21)`;
  const dominantInput = document.querySelector('input[name="FORM.dominant"]');
  const secondaryInput = document.querySelector('input[name="FORM.secondary"]');
  if (dominantInput && !dominantInput.dataset.userEdited) {
    dominantInput.value = ranked.slice(0, 2).map(fmt).join(', ');
  }
  if (secondaryInput && !secondaryInput.dataset.userEdited) {
    secondaryInput.value = ranked.slice(2, 4).map(fmt).join(', ');
  }

  // Auto-fill Section I "Active Layers (Top 2-3)" based on score ranking.
  const activeInput = document.querySelector('input[name="I.active"]');
  if (activeInput && !activeInput.dataset.userEdited) {
    activeInput.value = ranked.slice(0, 3).map(fmt).join(', ');
  }
}

// Auto-fill Lowest/Highest Resistance Layer fields based on per-layer resistance.
function refreshResistanceLevers() {
  const order = { R0: 0, R1: 1, R2: 2, R3: 3 };
  const entries = LAYERS.map(l => {
    const sel = document.querySelector(`select[data-form-resistance="${l.id}"]`);
    return { id: l.id, value: sel ? sel.value : '' };
  }).filter(e => e.value && order[e.value] !== undefined);

  const lowestInput = document.querySelector('input[name="FORM.lowestLever"]');
  const highestInput = document.querySelector('input[name="FORM.highestCore"]');

  if (entries.length === 0) {
    if (lowestInput && !lowestInput.dataset.userEdited) lowestInput.value = '';
    if (highestInput && !highestInput.dataset.userEdited) highestInput.value = '';
    return;
  }

  const minRank = Math.min(...entries.map(e => order[e.value]));
  const maxRank = Math.max(...entries.map(e => order[e.value]));
  const lowest = entries.filter(e => order[e.value] === minRank).map(e => `${e.id} (${e.value})`).join(', ');
  const highest = entries.filter(e => order[e.value] === maxRank).map(e => `${e.id} (${e.value})`).join(', ');

  if (lowestInput && !lowestInput.dataset.userEdited) lowestInput.value = lowest;
  if (highestInput && !highestInput.dataset.userEdited) highestInput.value = highest;
}

function recalcMrs() {
  const checked = document.querySelectorAll('input.mrsCriterion:checked');
  const score = checked.length;
  document.getElementById('mrsScoreDisplay').textContent = String(score);
  document.getElementById('mrsScoreHidden').value = String(score);
  let band = 'Low';
  if (score >= 9) band = 'High priority';
  else if (score >= 6) band = 'Strong';
  else if (score >= 3) band = 'Consider review';
  document.getElementById('mrsBandDisplay').textContent = `— ${band}`;
  document.getElementById('mrsBandHidden').value = band;
}

// Mirror layer resistance dropdowns into the formulation grid (and vice versa)
function syncResistance(layerId, value) {
  const layerSel = document.querySelector(`select.layerResistance[data-layer="${layerId}"]`);
  const formSel = document.querySelector(`select[data-form-resistance="${layerId}"]`);
  if (layerSel && layerSel.value !== value) layerSel.value = value;
  if (formSel && formSel.value !== value) formSel.value = value;
}

// ---------------------------------------------------------------------------
// Form serialization
// ---------------------------------------------------------------------------

// Convert flat form fields whose names use dot-notation
// (e.g. "A.fullName", "L1.item3.score") into a nested object.
function serializeForm(form) {
  const out = {};
  // Single-value inputs (radio handled separately, checkbox grouped)
  const fields = form.querySelectorAll('input, textarea, select');
  fields.forEach(field => {
    const name = field.name;
    if (!name) return;

    if (field.type === 'checkbox') {
      // Group by name -> array of checked values
      if (!field.checked) return;
      pushPath(out, name, field.value);
    } else if (field.type === 'radio') {
      if (!field.checked) return;
      setPath(out, name, field.value);
    } else if (field.tagName === 'SELECT' || field.type === 'text' ||
               field.type === 'date' || field.type === 'hidden' ||
               field.tagName === 'TEXTAREA') {
      if (field.value === '') return;
      setPath(out, name, field.value);
    }
  });
  return out;
}

function setPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}
function pushPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  const leaf = parts[parts.length - 1];
  if (!Array.isArray(cur[leaf])) cur[leaf] = [];
  cur[leaf].push(value);
}

// Build a clean, well-organised payload for the JSON file
function buildPayload(form) {
  const raw = serializeForm(form);

  const sectionA = raw.A || {};
  const sectionB = raw.B || {};
  const sectionC = raw.C || {};
  const sectionD = raw.D || {};
  const sectionE = raw.E || {};
  const sectionF = raw.F || {};
  const sectionG = raw.G || {};
  const sectionI = raw.I || {};
  const sectionL = raw.L || {};
  const formul = raw.FORM || {};
  const mrs = raw.MRS || {};
  const pilot = raw.PILOT || {};

  // Restructure the per-layer items into a tidy array
  const layers = LAYERS.map(layer => {
    const layerRaw = raw[layer.id] || {};
    const items = layer.items.map((item, i) => {
      const idx = i + 1;
      const itemRaw = (layerRaw['item' + idx]) || {};
      const score = itemRaw.score != null ? Number(itemRaw.score) : null;
      return {
        number: idx,
        name: item.name,
        description: item.desc,
        score,
        anchorMet: score != null ? item.anchors[score] : null
      };
    });
    return {
      layerId: layer.id,
      title: layer.title,
      totalScore: layerRaw.totalScore ? Number(layerRaw.totalScore) : 0,
      maxScore: 21,
      timeCode: layerRaw.time || null,
      resistance: layerRaw.resistance || null,
      patterns: Array.isArray(layerRaw.pattern) ? layerRaw.pattern : (layerRaw.pattern ? [layerRaw.pattern] : []),
      redFlagAcknowledged: !!layerRaw.redFlagPresent,
      redFlagsList: layer.redFlags,
      items
    };
  });

  return {
    instrument: 'MCLA 2.3 — Pilot Edition with MRS',
    sectionA: {
      fullName: sectionA.fullName || '',
      ageSex: sectionA.ageSex || '',
      address: sectionA.address || '',
      education: sectionA.education || '',
      occupation: sectionA.occupation || '',
      socioeconomicStatus: sectionA.ses || '',
      maritalStatus: sectionA.marital || '',
      religion: sectionA.religion || '',
      informant: sectionA.informant || '',
      reliability: sectionA.reliability || '',
      adequacy: sectionA.adequacy || '',
      referredBy: sectionA.referredBy || '',
      specialComments: sectionA.comments || ''
    },
    sectionB: {
      complaints: sectionB.complaints || '',
      onset: sectionB.onset || '',
      course: sectionB.course || '',
      duration: sectionB.duration || '',
      fivePs: sectionB['5p'] || {}
    },
    sectionC: sectionC,
    sectionD: sectionD,
    sectionE: sectionE,
    sectionF: sectionF,
    sectionG: sectionG,
    sectionH_MCLA: {
      layers,
      MRS: {
        criteriaSelected: Array.isArray(mrs.criteria) ? mrs.criteria : (mrs.criteria ? [mrs.criteria] : []),
        totalScore: mrs.totalScore ? Number(mrs.totalScore) : 0,
        maxScore: 10,
        band: mrs.band || 'Low',
        primaryBiologicalNeed: Array.isArray(mrs.biologicalNeed) ? mrs.biologicalNeed : (mrs.biologicalNeed ? [mrs.biologicalNeed] : []),
        suggestedAction: Array.isArray(mrs.action) ? mrs.action : (mrs.action ? [mrs.action] : [])
      },
      finalFormulation: {
        scoresSummary: formul.scoresSummary || '',
        dominantLayers: formul.dominant || '',
        secondaryLayers: formul.secondary || '',
        interactionChain: formul.interactionChain || '',
        problemType: Array.isArray(formul.problemType) ? formul.problemType : (formul.problemType ? [formul.problemType] : []),
        immediateTargets: formul.targets || '',
        resistancePerLayer: formul.resistance || {},
        lowestResistanceLever: formul.lowestLever || '',
        highestResistanceCore: formul.highestCore || '',
        strategicSequence: formul.strategy || '',
        treatmentMap: formul.treatmentMap || ''
      }
    },
    sectionI: sectionI,
    pilotMetrics: {
      averageTimeToCompleteMinutes: pilot.avgTimeMinutes ? Number(pilot.avgTimeMinutes) : null,
      usefulnessRating: pilot.usefulnessRating ? Number(pilot.usefulnessRating) : null,
      treatmentPlanChanged: pilot.treatmentPlanChanged || '',
      clinicianSatisfaction: pilot.clinicianSatisfaction ? Number(pilot.clinicianSatisfaction) : null,
      notes: pilot.notes || ''
    },
    sectionL: {
      provisionalDiagnosis: sectionL.diagnosis || '',
      signature: sectionL.signature || '',
      date: sectionL.date || ''
    }
  };
}

// ---------------------------------------------------------------------------
// PDF generation
// ---------------------------------------------------------------------------

function generatePDFHTML(payload) {
  const e = v => String(v || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const val = v => e(v) || '<span class="empty">—</span>';
  const arr = v => Array.isArray(v) ? v : (v ? [v] : []);

  function row2(label1, v1, label2, v2) {
    return `<tr><th>${e(label1)}</th><td>${val(v1)}</td><th>${e(label2)}</th><td>${val(v2)}</td></tr>`;
  }
  function row1(label, v) {
    return `<tr><th>${e(label)}</th><td colspan="3">${val(v)}</td></tr>`;
  }
  function sectionHeading(title) {
    return `<div class="section-heading">${e(title)}</div>`;
  }
  function table(rows) {
    return `<table class="data-table">${rows}</table>`;
  }

  // Section A
  const A = payload.sectionA || {};
  const secA = sectionHeading('Section A — Basic Details') + table(
    row2('Full Name', A.fullName, 'Age / Sex', A.ageSex) +
    row1('Address', A.address) +
    row2('Education', A.education, 'Occupation', A.occupation) +
    row2('Socioeconomic Status', A.socioeconomicStatus, 'Marital Status', A.maritalStatus) +
    row2('Religion', A.religion, 'Referred By', A.referredBy) +
    row1('Informant', A.informant) +
    row2('Reliability', A.reliability, 'Adequacy', A.adequacy) +
    row1('Special Comments', A.specialComments)
  );

  // Section B
  const B = payload.sectionB || {};
  const fp = B.fivePs || {};
  const secB = sectionHeading('Section B — Presenting Complaints') + table(
    row1('Presenting Complaints', B.complaints) +
    row2('Onset', B.onset, 'Course', B.course) +
    row1('Total Duration of Illness', B.duration) +
    row1('Presenting Problem (5P)', fp.presenting) +
    row2('Predisposing Factors', fp.predisposing, 'Precipitating Factors', fp.precipitating) +
    row2('Perpetuating Factors', fp.perpetuating, 'Protective Factors', fp.protective)
  );

  // Section C
  const C = payload.sectionC || {};
  const secC = sectionHeading('Section C — History') + table(
    row1('History of Presenting Illness', C.hpi) +
    row1('Past Psychiatric History', C.pastPsych) +
    row1('Medical History', C.medical) +
    row1('Substance Use', C.substance)
  );

  // Section D
  const D = payload.sectionD || {};
  const secD = sectionHeading('Section D — Family History') + table(
    row1('Consanguinity', D.consang) +
    row1('3-Generation Family Tree (notes)', D.familyTree) +
    row2('Father', D.father, 'Mother', D.mother) +
    row1('Siblings', D.siblings) +
    row1('Psychiatric Illness in Family', D.psychFamily)
  );

  // Section E
  const E = payload.sectionE || {};
  const secE = sectionHeading('Section E — Personal History') + table(
    row1('Birth and Early Development', E.birth) +
    row1('Education History', E.education) +
    row1('Occupation Details', E.occupation) +
    row1('Sexual and Marital History', E.sexMarital) +
    row1('Present Living Situation', E.living) +
    row1('Premorbid Personality / Temperament', E.premorbid) +
    row1('Best Lifetime Functioning', E.bestFunctioning)
  );

  // Section F
  const F = payload.sectionF || {};
  const cog = (F.cog && typeof F.cog === 'object') ? F.cog : {};
  const secF = sectionHeading('Section F — Mental Status Examination') + table(
    row1('Appearance & Behaviour', F.appearance) +
    row1('Rapport', F.rapport) +
    row1('Psychomotor Activity', F.psychomotor) +
    row1('Speech', F.speech) +
    row1('Thought (Form & Content)', F.thought) +
    row1('Mood & Affect', F.mood) +
    row1('Perception', F.perception) +
    `<tr><td colspan="4" class="sub-heading">Cognitive Functions</td></tr>` +
    row2('Consciousness', cog.consciousness, 'Orientation', cog.orientation) +
    row2('Attention & Concentration', cog.attention, 'Memory', cog.memory) +
    row2('Intelligence', cog.intelligence, 'Abstraction', cog.abstraction) +
    row2('Judgment', cog.judgment, 'Insight', cog.insight)
  );

  // Section G
  const G = payload.sectionG || {};
  const secG = sectionHeading('Section G — Risk Assessment') + table(
    row1('Suicidal Ideation', G.suicidal) +
    row1('Self-Harm Risk', G.selfHarm) +
    row1('Harm to Others', G.harmOthers) +
    row1('Impulsivity Risk', G.impulsivity) +
    row1('Vulnerability / Neglect', G.vulnerability)
  );

  // Section H — MCLA layers
  const H = payload.sectionH_MCLA || {};
  const layers = H.layers || [];
  let layerHTML = '';
  layers.forEach(layer => {
    const scoreBar = `<span class="score-pill">${layer.totalScore} / ${layer.maxScore}</span>`;
    layerHTML += `<div class="layer-block">`;
    layerHTML += `<div class="layer-title">${e(layer.title)} ${scoreBar}</div>`;
    layerHTML += `<div class="layer-meta">`;
    if (layer.timeCode) layerHTML += `<span>Time Code: <strong>${e(layer.timeCode)}</strong></span>`;
    if (layer.resistance) layerHTML += `<span>Resistance: <strong>${e(layer.resistance)}</strong></span>`;
    if (arr(layer.patterns).length) layerHTML += `<span>Patterns: <strong>${arr(layer.patterns).map(e).join(', ')}</strong></span>`;
    layerHTML += `</div>`;
    layerHTML += `<table class="layer-table"><thead><tr><th>#</th><th>Item</th><th>Score</th><th>Anchor Met</th></tr></thead><tbody>`;
    (layer.items || []).forEach(item => {
      layerHTML += `<tr><td class="item-num">${item.number}</td><td><strong>${e(item.name)}</strong>${item.description ? `<br><span class="item-desc">${e(item.description)}</span>` : ''}</td><td class="score-cell">${item.score != null ? item.score : '—'}</td><td>${val(item.anchorMet)}</td></tr>`;
    });
    layerHTML += `</tbody></table></div>`;
  });

  // MRS
  const mrs = H.MRS || {};
  const mrsHTML = `<div class="layer-block">
    <div class="layer-title">Medication Readiness Score (MRS) <span class="score-pill">${mrs.totalScore || 0} / ${mrs.maxScore || 10} — ${e(mrs.band || 'Low')}</span></div>` +
    table(
      row1('Criteria Selected', arr(mrs.criteriaSelected).map(e).join(', ') || '—') +
      row1('Primary Biological Need', arr(mrs.primaryBiologicalNeed).map(e).join(', ') || '—') +
      row1('Suggested Action', arr(mrs.suggestedAction).map(e).join(', ') || '—')
    ) +
  `</div>`;

  // Final Formulation
  const ff = H.finalFormulation || {};
  const formulHTML = sectionHeading('Section H — Final Formulation + Resistance Logic') + table(
    row1('Layer Scores Summary', ff.scoresSummary) +
    row2('Dominant Active Layers', ff.dominantLayers, 'Secondary Layers', ff.secondaryLayers) +
    row1('Interaction Chain', ff.interactionChain) +
    row1('Problem Type', arr(ff.problemType).join(', ') || '—') +
    row1('Immediate Treatment Targets', ff.immediateTargets) +
    row2('Lowest Resistance Layer', ff.lowestResistanceLever, 'Highest Resistance Layer', ff.highestResistanceCore) +
    row1('Strategic Treatment Sequence', ff.strategicSequence) +
    row1('Treatment Map / Modalities', ff.treatmentMap)
  );

  const secH = sectionHeading('Section H — MCLA 2.3 Five-Layer Assessment') + layerHTML + mrsHTML + formulHTML;

  // Section I
  const I = payload.sectionI || {};
  const secI = sectionHeading('Section I — 5-Layer Formulation') + table(
    row1('Layers Summary', I.summary) +
    row1('Active Layers (Top 2–3)', I.active) +
    row1('Problem Type', I.problemType) +
    row1('Resistance-Adjusted Treatment Sequence', I.treatmentSequence)
  );

  // Pilot Metrics
  const P = payload.pilotMetrics || {};
  const secP = sectionHeading('Pilot Metrics') + table(
    row2('Avg Time to Complete (min)', P.averageTimeToCompleteMinutes, 'Total Time (recorded)', P.totalTimeToComplete ? P.totalTimeToComplete.formatted : '') +
    row2('Usefulness Rating', P.usefulnessRating, 'Clinician Satisfaction', P.clinicianSatisfaction) +
    row1('Treatment Plan Changed', P.treatmentPlanChanged) +
    row1('Notes', P.notes)
  );

  // Section L
  const L = payload.sectionL || {};
  const secL = sectionHeading('Section L — Provisional Diagnosis') + table(
    row1('Provisional Diagnosis', L.provisionalDiagnosis) +
    row2('Clinician Signature', L.signature, 'Date', L.date)
  );

  const printDate = new Date().toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>MetroMind Case Sheet — ${e(A.fullName || 'Patient')}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #1a1a1a; background: #fff; }
  .page-header { text-align: center; padding: 18px 24px 10px; border-bottom: 2px solid #2c3e50; margin-bottom: 18px; }
  .page-header h1 { font-size: 17pt; color: #2c3e50; letter-spacing: 0.5px; }
  .page-header .subtitle { font-size: 9.5pt; color: #555; margin-top: 3px; }
  .page-header .meta { font-size: 9pt; color: #888; margin-top: 6px; }
  .section-heading {
    background: #2c3e50; color: #fff; font-size: 12pt; font-weight: 700;
    padding: 7px 14px; margin: 22px 0 0; border-radius: 3px 3px 0 0; letter-spacing: 0.3px;
  }
  .data-table { width: 100%; border-collapse: collapse; font-size: 10.5pt; margin-bottom: 4px; }
  .data-table th { background: #f0f3f6; color: #2c3e50; font-weight: 600; padding: 6px 10px; text-align: left; width: 22%; white-space: nowrap; border: 1px solid #d0d6de; vertical-align: top; }
  .data-table td { background: #fff; padding: 6px 10px; border: 1px solid #d0d6de; vertical-align: top; }
  .data-table .sub-heading { background: #eaf1fb; color: #2c3e50; font-weight: 700; font-size: 10pt; padding: 5px 10px; }
  .empty { color: #aaa; font-style: italic; }
  .layer-block { border: 1px solid #d0d6de; border-radius: 4px; margin: 14px 0 0; overflow: hidden; }
  .layer-title { background: #34495e; color: #fff; font-size: 11pt; font-weight: 700; padding: 7px 12px; }
  .layer-meta { background: #f5f7fa; border-bottom: 1px solid #d0d6de; padding: 5px 12px; font-size: 9.5pt; display: flex; gap: 18px; flex-wrap: wrap; }
  .layer-meta span { color: #444; }
  .layer-table { width: 100%; border-collapse: collapse; font-size: 10pt; }
  .layer-table thead th { background: #f0f3f6; color: #2c3e50; font-weight: 700; padding: 5px 10px; text-align: left; border-bottom: 1px solid #d0d6de; border-right: 1px solid #d0d6de; }
  .layer-table td { padding: 5px 10px; border-bottom: 1px solid #eaecef; border-right: 1px solid #eaecef; vertical-align: top; }
  .layer-table tr:last-child td { border-bottom: none; }
  .item-num { width: 30px; text-align: center; color: #888; font-size: 9.5pt; }
  .item-desc { color: #777; font-size: 9pt; }
  .score-cell { text-align: center; font-weight: 700; font-size: 12pt; color: #2c3e50; width: 44px; }
  .score-pill { background: #e8f4fd; color: #2980b9; font-size: 9.5pt; font-weight: 700; border-radius: 10px; padding: 2px 9px; margin-left: 8px; }
  .page-footer { text-align: center; font-size: 8.5pt; color: #aaa; margin-top: 28px; padding-top: 10px; border-top: 1px solid #eee; }
  @media print {
    body { font-size: 10pt; }
    .section-heading { break-before: avoid; }
    .layer-block { break-inside: avoid; }
    .page-footer { position: fixed; bottom: 0; width: 100%; }
  }
  @page { margin: 20mm 18mm 22mm; size: A4 portrait; }
</style>
</head>
<body>
<div class="page-header">
  <h1>MetroMind &mdash; Integrated Case Sheet</h1>
  <div class="subtitle">MCLA 2.3 &mdash; Pilot Edition with MRS &nbsp;&middot;&nbsp; Case Sheet + Scoring Handbook + Resistance Logic</div>
  <div class="meta">Patient: <strong>${val(A.fullName)}</strong> &nbsp;|&nbsp; Age/Sex: <strong>${val(A.ageSex)}</strong> &nbsp;|&nbsp; Generated: ${e(printDate)}</div>
</div>

${secA}
${secB}
${secC}
${secD}
${secE}
${secF}
${secG}
${secH}
${secI}
${secP}
${secL}

<div class="page-footer">MetroMind MCLA 2.3 &mdash; Confidential Clinical Document &mdash; ${e(printDate)}</div>
</body>
</html>`;
}

function openPDF(payload) {
  const html = generatePDFHTML(payload);
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.addEventListener('load', () => { win.focus(); win.print(); });
}

// ---------------------------------------------------------------------------
// Floating timer
// ---------------------------------------------------------------------------

const Timer = {
  elapsedMs: 0,
  startedAt: null,
  tickHandle: null,
  format(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = String(Math.floor(total / 3600)).padStart(2, '0');
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  },
  currentMs() {
    return this.elapsedMs + (this.startedAt ? Date.now() - this.startedAt : 0);
  },
  render() {
    const wrap = document.getElementById('floatingTimer');
    document.getElementById('timerDisplay').textContent = this.format(this.currentMs());
    document.getElementById('timerStartBtn').disabled = !!this.startedAt;
    document.getElementById('timerPauseBtn').disabled = !this.startedAt;
    const running = !!this.startedAt;
    const paused = !running && this.elapsedMs > 0;
    wrap.classList.toggle('running', running);
    wrap.classList.toggle('paused', paused);
    const badge = document.getElementById('timerStatusBadge');
    if (badge) badge.textContent = running ? 'Running' : (paused ? 'Paused' : 'Idle');
  },
  start() {
    if (this.startedAt) return;
    this.startedAt = Date.now();
    this.tickHandle = setInterval(() => this.render(), 1000);
    this.render();
  },
  pause() {
    if (!this.startedAt) return;
    this.elapsedMs += Date.now() - this.startedAt;
    this.startedAt = null;
    clearInterval(this.tickHandle);
    this.tickHandle = null;
    this.render();
  },
  reset() {
    this.elapsedMs = 0;
    this.startedAt = null;
    clearInterval(this.tickHandle);
    this.tickHandle = null;
    this.render();
  },
  stopAndGet() {
    if (this.startedAt) this.pause();
    return { ms: this.elapsedMs, formatted: this.format(this.elapsedMs) };
  }
};

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // Timer wiring
  document.getElementById('timerStartBtn').addEventListener('click', () => Timer.start());
  document.getElementById('timerPauseBtn').addEventListener('click', () => Timer.pause());
  document.getElementById('timerResetBtn').addEventListener('click', () => Timer.reset());
  Timer.render();

  const layersContainer = document.getElementById('layersContainer');
  LAYERS.forEach(l => layersContainer.appendChild(buildLayerCard(l)));
  buildResistanceGrid();

  // Collapsible cards
  document.querySelectorAll('.card > header').forEach(h => {
    h.addEventListener('click', () => h.parentElement.classList.toggle('collapsed'));
  });

  // Live recalculation on score / MRS clicks
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.matches('input[type="radio"][data-layer]')) {
      recalcLayer(t.getAttribute('data-layer'));
    }
    if (t.matches('input.mrsCriterion')) {
      recalcMrs();
    }
    if (t.matches('select.layerResistance')) {
      syncResistance(t.getAttribute('data-layer'), t.value);
      refreshResistanceLevers();
    }
    if (t.matches('select[data-form-resistance]')) {
      syncResistance(t.getAttribute('data-form-resistance'), t.value);
      refreshResistanceLevers();
    }
  });

  // Mark the score-summary box as user-edited if they type in it
  const summaryInput = document.getElementById('scoresSummary');
  summaryInput.addEventListener('input', () => { summaryInput.dataset.userEdited = '1'; });
  ['FORM.dominant', 'FORM.secondary', 'FORM.lowestLever', 'FORM.highestCore', 'I.active'].forEach(n => {
    const inp = document.querySelector(`input[name="${n}"]`);
    if (inp) inp.addEventListener('input', () => { inp.dataset.userEdited = '1'; });
  });

  // Initial calc
  LAYERS.forEach(l => recalcLayer(l.id));
  recalcMrs();
  refreshResistanceLevers();

  // ---- Download ----
  const form = document.getElementById('caseForm');
  const toast = document.getElementById('toast');
  function showToast(msg, isError = false) {
    toast.textContent = msg;
    toast.classList.toggle('error', isError);
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }

  function downloadCaseSheet() {
    const payload = buildPayload(form);
    if (!payload.sectionA.fullName.trim()) {
      showToast('Patient name is required.', true);
      return;
    }
    const elapsed = Timer.stopAndGet();
    payload.pilotMetrics.totalTimeToComplete = {
      seconds: Math.floor(elapsed.ms / 1000),
      formatted: elapsed.formatted
    };
    const name = (payload.sectionA.fullName || 'patient').trim().toLowerCase()
                  .replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '') || 'patient';
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `${name}_${stamp}.json`;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename} + PDF`);

    openPDF(payload);

    // Silent audit log to Google Sheets
    const AUDIT_URL = 'https://script.google.com/macros/s/AKfycby4FjLX76Byhbe1Axpna-4__M7p86vzL3L8PtuXKRtjR5_hjmFaDhm9IbzP53BN0hEY/exec';
    fetch(AUDIT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toLocaleString(),
        clinician: payload.sectionL.signature || '—',
        patientName: payload.sectionA.fullName || '—',
        ageSex: payload.sectionA.ageSex || '—',
        sessionsCompleted: payload.sectionA.sessionsCompleted || '—',
        downloadedBy: payload.sectionL.signature || '—',
        jsonData: JSON.stringify(payload)
      })
    }).catch(() => {});
  }

  form.addEventListener('submit', ev => {
    ev.preventDefault();
    downloadCaseSheet();
  });

  document.getElementById('downloadBtn').addEventListener('click', downloadCaseSheet);

  // ---- Load JSON ----
  const loadBtn = document.getElementById('loadBtn');
  const loadFileInput = document.getElementById('loadFileInput');
  loadBtn.addEventListener('click', () => loadFileInput.click());
  loadFileInput.addEventListener('change', () => {
    const file = loadFileInput.files && loadFileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result);
        applyPayloadToForm(form, payload);
        showToast(`Loaded ${file.name}`);
      } catch (err) {
        showToast(`Could not load JSON: ${err.message}`, true);
      } finally {
        loadFileInput.value = '';
      }
    };
    reader.onerror = () => {
      showToast('Failed to read file.', true);
      loadFileInput.value = '';
    };
    reader.readAsText(file);
  });
});

// Restore a form from a previously-downloaded payload (see buildPayload).
function applyPayloadToForm(form, payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Empty or invalid JSON');

  const flat = {};
  const set = (name, val) => { if (val != null && val !== '') flat[name] = val; };
  const flattenInto = (prefix, obj) => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
    Object.entries(obj).forEach(([k, v]) => {
      const path = prefix + '.' + k;
      if (v && typeof v === 'object' && !Array.isArray(v)) flattenInto(path, v);
      else if (v != null && v !== '') flat[path] = v;
    });
  };

  const A = payload.sectionA || {};
  set('A.fullName', A.fullName);
  set('A.ageSex', A.ageSex);
  set('A.address', A.address);
  set('A.education', A.education);
  set('A.occupation', A.occupation);
  set('A.ses', A.socioeconomicStatus);
  set('A.marital', A.maritalStatus);
  set('A.religion', A.religion);
  set('A.informant', A.informant);
  set('A.reliability', A.reliability);
  set('A.adequacy', A.adequacy);
  set('A.referredBy', A.referredBy);
  set('A.comments', A.specialComments);

  const B = payload.sectionB || {};
  set('B.complaints', B.complaints);
  set('B.onset', B.onset);
  set('B.course', B.course);
  set('B.duration', B.duration);
  flattenInto('B.5p', B.fivePs);

  flattenInto('C', payload.sectionC);
  flattenInto('D', payload.sectionD);
  flattenInto('E', payload.sectionE);
  flattenInto('F', payload.sectionF);
  flattenInto('G', payload.sectionG);
  flattenInto('I', payload.sectionI);

  const H = payload.sectionH_MCLA || {};
  (H.layers || []).forEach(layer => {
    const id = layer.layerId;
    if (!id) return;
    set(`${id}.totalScore`, String(layer.totalScore || 0));
    set(`${id}.time`, layer.timeCode);
    set(`${id}.resistance`, layer.resistance);
    if (Array.isArray(layer.patterns) && layer.patterns.length) flat[`${id}.pattern`] = layer.patterns;
    if (layer.redFlagAcknowledged) flat[`${id}.redFlagPresent`] = ['yes'];
    (layer.items || []).forEach(item => {
      if (item && item.score != null) set(`${id}.item${item.number}.score`, String(item.score));
    });
  });

  const mrs = H.MRS || {};
  if (Array.isArray(mrs.criteriaSelected) && mrs.criteriaSelected.length) flat['MRS.criteria'] = mrs.criteriaSelected;
  set('MRS.totalScore', mrs.totalScore != null ? String(mrs.totalScore) : null);
  set('MRS.band', mrs.band);
  if (Array.isArray(mrs.primaryBiologicalNeed) && mrs.primaryBiologicalNeed.length) flat['MRS.biologicalNeed'] = mrs.primaryBiologicalNeed;
  if (Array.isArray(mrs.suggestedAction) && mrs.suggestedAction.length) flat['MRS.action'] = mrs.suggestedAction;

  const ff = H.finalFormulation || {};
  set('FORM.scoresSummary', ff.scoresSummary);
  set('FORM.dominant', ff.dominantLayers);
  set('FORM.secondary', ff.secondaryLayers);
  set('FORM.interactionChain', ff.interactionChain);
  if (Array.isArray(ff.problemType) && ff.problemType.length) flat['FORM.problemType'] = ff.problemType;
  set('FORM.targets', ff.immediateTargets);
  flattenInto('FORM.resistance', ff.resistancePerLayer);
  set('FORM.lowestLever', ff.lowestResistanceLever);
  set('FORM.highestCore', ff.highestResistanceCore);
  set('FORM.strategy', ff.strategicSequence);
  set('FORM.treatmentMap', ff.treatmentMap);

  const pilot = payload.pilotMetrics || {};
  if (pilot.averageTimeToCompleteMinutes != null) set('PILOT.avgTimeMinutes', String(pilot.averageTimeToCompleteMinutes));
  if (pilot.usefulnessRating != null) set('PILOT.usefulnessRating', String(pilot.usefulnessRating));
  set('PILOT.treatmentPlanChanged', pilot.treatmentPlanChanged);
  if (pilot.clinicianSatisfaction != null) set('PILOT.clinicianSatisfaction', String(pilot.clinicianSatisfaction));
  set('PILOT.notes', pilot.notes);

  const L = payload.sectionL || {};
  set('L.diagnosis', L.provisionalDiagnosis);
  set('L.signature', L.signature);
  set('L.date', L.date);

  // Clear current state so the load is a clean overwrite
  form.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(i => { i.checked = false; });
  form.querySelectorAll('input[type="text"], input[type="date"], input[type="number"], input[type="hidden"], textarea').forEach(i => { i.value = ''; });
  form.querySelectorAll('select').forEach(s => { s.selectedIndex = 0; });
  const summaryInput = document.getElementById('scoresSummary');
  delete summaryInput.dataset.userEdited;
  const dominantInput = document.querySelector('input[name="FORM.dominant"]');
  const secondaryInput = document.querySelector('input[name="FORM.secondary"]');
  const lowestInput = document.querySelector('input[name="FORM.lowestLever"]');
  const highestInput = document.querySelector('input[name="FORM.highestCore"]');
  const activeInput = document.querySelector('input[name="I.active"]');
  [dominantInput, secondaryInput, lowestInput, highestInput, activeInput].forEach(i => {
    if (i) delete i.dataset.userEdited;
  });

  // Apply values
  Object.entries(flat).forEach(([name, value]) => {
    const fields = form.querySelectorAll(`[name="${CSS.escape(name)}"]`);
    if (!fields.length) return;
    fields.forEach(field => {
      if (field.type === 'checkbox') {
        const arr = Array.isArray(value) ? value : [value];
        field.checked = arr.map(String).includes(String(field.value));
      } else if (field.type === 'radio') {
        field.checked = (String(field.value) === String(value));
      } else {
        field.value = value;
      }
    });
  });

  // Recalculate derived state
  LAYERS.forEach(l => recalcLayer(l.id));
  recalcMrs();
  LAYERS.forEach(l => {
    const sel = document.querySelector(`select[data-form-resistance="${l.id}"]`);
    if (sel && sel.value) syncResistance(l.id, sel.value);
  });
  refreshResistanceLevers();
  if (summaryInput.value) summaryInput.dataset.userEdited = '1';
  [dominantInput, secondaryInput, lowestInput, highestInput, activeInput].forEach(i => {
    if (i && i.value) i.dataset.userEdited = '1';
  });
}
