/**
 * Expert System — Diagnóstico de Suspensión Mazda
 * Lógica de la aplicación (JavaScript puro, sin dependencias)
 * Autor: Eyvar Adriel 
 */
'use strict';

/* =======================================================
1. BASE DE CONOCIMIENTO
========================================================== */

/** Hechos del dominio de suspensión automotriz. */
const FACT_DEFINITIONS = [
  // Síntomas iniciales
  { id: 'VIBRATION_NOISE', description: 'Vibración o ruido metálico' },
  { id: 'KNOCKING_BOUNCE', description: 'Golpeteo al pasar baches y rebote excesivo' },
  { id: 'VEHICLE_LEANS', description: 'Vehículo se inclina hacia un lado' },
  { id: 'DIFFICULT_CONTROL', description: 'Dificultad para controlar el vehículo' },
  { id: 'KNOCKING_SOUND', description: 'Se escucha golpeteo' },

  // Verificaciones físicas
  { id: 'BUSHING_CRACKS_PLAY', description: 'Bujes con grietas o juego excesivo' },
  { id: 'NO_COMPRESSION_RESISTANCE', description: 'Amortiguador sin resistencia al comprimir' },
  { id: 'OIL_PRESENCE', description: 'Presencia de aceite en amortiguador' },
  { id: 'BALL_JOINT_PLAY', description: 'Rótulas con juego axial o radial' },
  { id: 'SHOCK_HAS_LEAK', description: 'Amortiguador tiene fuga' },

  // Diagnósticos intermedios
  { id: 'POSSIBLE_BUSHING_WEAR', description: 'Posible desgaste de bujes' },
  { id: 'POSSIBLE_SHOCK_DAMAGE', description: 'Posible daño en amortiguadores' },
  { id: 'POSSIBLE_SHOCK_LEAK', description: 'Posible fuga en amortiguador' },
  { id: 'POSSIBLE_BALL_JOINT_FAIL', description: 'Posible falla en rótulas' },

  // Conclusiones finales
  { id: 'BUSHING_FAILURE_CONFIRMED', description: 'Falla confirmada en bujes' },
  { id: 'SHOCK_DEFECTIVE', description: 'Amortiguador defectuoso' },
  { id: 'SHOCK_LEAK_CONFIRMED', description: 'Fuga confirmada en amortiguador' },
  { id: 'BALL_JOINT_DAMAGED', description: 'Rótula dañada' },
  { id: 'SHOCK_TYPE_S', description: 'Amortiguador con fuga es tipo S' },
];

/** Reglas "Si [premisas] entonces [conclusión]"; mayor prioridad se evalúa primero. */
const RULE_DEFINITIONS = [
  {
    id: 'R1',
    description: 'Si hay vibración/ruido Y bujes dañados, entonces falla confirmada en bujes',
    premises: { facts: ['VIBRATION_NOISE', 'BUSHING_CRACKS_PLAY'], operator: 'AND' },
    conclusion: 'BUSHING_FAILURE_CONFIRMED',
    priority: 10,
  },
  {
    id: 'R2',
    description: 'Si hay golpeteo/rebote Y sin resistencia, entonces amortiguador defectuoso',
    premises: { facts: ['KNOCKING_BOUNCE', 'NO_COMPRESSION_RESISTANCE'], operator: 'AND' },
    conclusion: 'SHOCK_DEFECTIVE',
    priority: 10,
  },
  {
    id: 'R3',
    description: 'Si el vehículo se inclina Y hay aceite, entonces fuga confirmada',
    premises: { facts: ['VEHICLE_LEANS', 'OIL_PRESENCE'], operator: 'AND' },
    conclusion: 'SHOCK_LEAK_CONFIRMED',
    priority: 10,
  },
  {
    id: 'R4',
    description: 'Si hay dificultad de control Y juego en rótulas, entonces rótula dañada',
    premises: { facts: ['DIFFICULT_CONTROL', 'BALL_JOINT_PLAY'], operator: 'AND' },
    conclusion: 'BALL_JOINT_DAMAGED',
    priority: 10,
  },
  {
    id: 'R5',
    description: 'SILOGISMO: Si golpeteo Y fuga, entonces amortiguador es tipo S',
    premises: { facts: ['KNOCKING_SOUND', 'SHOCK_HAS_LEAK'], operator: 'AND' },
    conclusion: 'SHOCK_TYPE_S',
    priority: 9,
  },
  {
    id: 'R6',
    description: 'Si hay vibración/ruido, posible desgaste de bujes',
    premises: { facts: ['VIBRATION_NOISE'], operator: 'AND' },
    conclusion: 'POSSIBLE_BUSHING_WEAR',
    priority: 5,
  },
  {
    id: 'R7',
    description: 'Si hay golpeteo/rebote, posible daño en amortiguadores',
    premises: { facts: ['KNOCKING_BOUNCE'], operator: 'AND' },
    conclusion: 'POSSIBLE_SHOCK_DAMAGE',
    priority: 5,
  },
  {
    id: 'R8',
    description: 'Si el vehículo se inclina, posible fuga',
    premises: { facts: ['VEHICLE_LEANS'], operator: 'AND' },
    conclusion: 'POSSIBLE_SHOCK_LEAK',
    priority: 5,
  },
  {
    id: 'R9',
    description: 'Si hay dificultad de control, posible falla en rótulas',
    premises: { facts: ['DIFFICULT_CONTROL'], operator: 'AND' },
    conclusion: 'POSSIBLE_BALL_JOINT_FAIL',
    priority: 5,
  },
];

/** Hechos que representan un diagnóstico final. */
const FINAL_CONCLUSIONS = [
  'BUSHING_FAILURE_CONFIRMED',
  'SHOCK_DEFECTIVE',
  'SHOCK_LEAK_CONFIRMED',
  'BALL_JOINT_DAMAGED',
  'SHOCK_TYPE_S',
];

class KnowledgeBase {
  constructor() {
    this.facts = new Map(FACT_DEFINITIONS.map((fact) => [fact.id, { ...fact, value: false }]));
    this.rules = RULE_DEFINITIONS.map((rule) => ({ ...rule }));
  }

  getFact(id) {
    return this.facts.get(id);
  }

  setFact(id, value) {
    const fact = this.facts.get(id);
    if (fact) fact.value = value;
  }

  getRules() {
    return this.rules;
  }

  reset() {
    this.facts.forEach((fact) => {
      fact.value = false;
    });
  }
}


/* =======================================================
2. MOTOR DE INFERENCIA (Forward Chaining)
========================================================== */

class InferenceEngine {
  constructor() {
    this.knowledgeBase = new KnowledgeBase();
    this.maxIterations = 10;
  }

  /** AND: todas las premisas verdaderas. OR: al menos una. */
  evaluatePremises(rule) {
    const values = rule.premises.facts.map((id) => this.knowledgeBase.getFact(id)?.value === true);
    return rule.premises.operator === 'AND' ? values.every(Boolean) : values.some(Boolean);
  }

  applyRule(rule) {
    if (!this.evaluatePremises(rule)) return false;
    this.knowledgeBase.setFact(rule.conclusion, true);
    return true;
  }

  /** Aplica reglas repetidamente hasta que ya no se deduzcan hechos nuevos. */
  infer() {
    const appliedRules = [];
    const reasoning = [];
    const sortedRules = [...this.knowledgeBase.getRules()].sort((a, b) => b.priority - a.priority);
    let changesMade = true;
    let iterations = 0;

    while (changesMade && iterations < this.maxIterations) {
      changesMade = false;
      iterations += 1;

      for (const rule of sortedRules) {
        if (appliedRules.includes(rule.id)) continue;
        if (this.applyRule(rule)) {
          appliedRules.push(rule.id);
          reasoning.push(`${rule.id}: ${rule.description}`);
          changesMade = true;
        }
      }
    }

    const conclusionId =
      FINAL_CONCLUSIONS.find((id) => this.knowledgeBase.getFact(id)?.value) ?? 'NO_CONCLUSION';

    return {
      conclusionReached: conclusionId !== 'NO_CONCLUSION',
      conclusionId,
      reasoning,
      appliedRules,
    };
  }

  setFacts(facts) {
    Object.entries(facts).forEach(([id, value]) => this.knowledgeBase.setFact(id, value));
  }

  reset() {
    this.knowledgeBase.reset();
  }
}


/* =======================================================
3. FLUJO DE DIAGNÓSTICO
Cada nodo es una pantalla. Las ramas "yes" registran el hecho
observado en el motor y la condicion en el historial.
========================================================== */

const FLOW = {
  start: { type: 'start' },

  // --- Rama 1: Bujes -------------------------------------------------------
  'vibration-noise': {
    type: 'question',
    number: 1,
    title: '¿El vehículo presenta vibración o ruido metálico en la suspensión?',
    description: 'Diagnóstico de Bujes - Detección inicial de síntomas',
    yes: { next: 'check-bushings', fact: 'VIBRATION_NOISE', history: 'Vibración/ruido metálico detectado' },
    no: { next: 'knocking-bounce' },
  },
  'check-bushings': {
    type: 'diagnosis',
    title: 'Posible desgaste de bujes',
    recommendation: 'Revisar gomas, bujes y soportes. Buscar grietas o juego excesivo en los componentes.',
    question: '¿Los bujes presentan grietas o juego excesivo?',
    yes: { next: 'bushing-confirmed', fact: 'BUSHING_CRACKS_PLAY', history: 'Bujes con grietas Y juego excesivo' },
    no: { next: 'no-issue' },
  },
  'bushing-confirmed': {
    type: 'result',
    title: 'Falla confirmada en bujes',
    recommendation: 'Sustituir los bujes afectados. Verificar también los soportes y gomas de montaje.',
  },

  // --- Rama 2: Amortiguadores ---------------------------------------------
  'knocking-bounce': {
    type: 'question',
    number: 2,
    title: '¿Se escucha golpeteo al pasar baches o un rebote excesivo?',
    description: 'Diagnóstico de Amortiguadores - Evaluación de comportamiento',
    yes: { next: 'check-shock-compression', fact: 'KNOCKING_BOUNCE', history: 'Golpeteo al pasar baches Y rebote excesivo' },
    no: { next: 'vehicle-leans' },
  },
  'check-shock-compression': {
    type: 'diagnosis',
    title: 'Posible daño en amortiguadores',
    recommendation: 'Evaluar comportamiento del amortiguador en rebote y compresión. Probar resistencia manual.',
    question: '¿El amortiguador NO tiene resistencia al comprimir?',
    yes: { next: 'shock-defective', fact: 'NO_COMPRESSION_RESISTANCE', history: 'Amortiguador sin resistencia al comprimir' },
    no: { next: 'knocking-sound' },
  },
  'shock-defective': {
    type: 'result',
    title: 'Amortiguador defectuoso',
    recommendation: 'Reemplazar el amortiguador defectuoso. Verificar el par opuesto para garantizar balance.',
  },

  // --- Rama 3: Fugas -------------------------------------------------------
  'vehicle-leans': {
    type: 'question',
    number: 3,
    title: '¿El vehículo se inclina hacia un lado al conducir?',
    description: 'Diagnóstico de Fugas - Detección de pérdida de presión',
    yes: { next: 'check-shock-leak', fact: 'VEHICLE_LEANS', history: 'Vehículo se inclina hacia un lado' },
    no: { next: 'difficult-control' },
  },
  'check-shock-leak': {
    type: 'diagnosis',
    title: 'Posible fuga o pérdida de presión',
    recommendation: 'Inspeccionar el amortiguador en busca de manchas de aceite, líquido o sellos dañados.',
    question: '¿Hay presencia de aceite en el amortiguador?',
    yes: { next: 'leak-confirmed', fact: 'OIL_PRESENCE', history: 'Presencia de aceite O fuga detectada' },
    no: { next: 'no-issue' },
  },
  'leak-confirmed': {
    type: 'result',
    title: 'Fuga confirmada en amortiguador',
    recommendation: 'Reemplazar el amortiguador con fuga de aceite. No intentar reparar el sello.',
  },

  // --- Rama 4: Rótulas -----------------------------------------------------
  'difficult-control': {
    type: 'question',
    number: 4,
    title: '¿Tiene dificultad para controlar el vehículo?',
    description: 'Diagnóstico de Rótulas - Evaluación de dirección',
    yes: { next: 'check-ball-joint', fact: 'DIFFICULT_CONTROL', history: 'Dificultad para controlar el vehículo' },
    no: { next: 'no-issue' },
  },
  'check-ball-joint': {
    type: 'diagnosis',
    title: 'Posible falla en rótulas',
    recommendation: 'Inspeccionar rótulas buscando juego axial o radial. Verificar movimiento anormal.',
    question: '¿Las rótulas presentan juego axial o radial?',
    yes: { next: 'ball-joint-damaged', fact: 'BALL_JOINT_PLAY', history: 'Rótulas con juego axial O radial' },
    no: { next: 'no-issue' },
  },
  'ball-joint-damaged': {
    type: 'result',
    title: 'Rótula dañada',
    recommendation: 'Sustituir rótula dañada. Verificar alineación y geometría de la suspensión.',
  },

  // --- Rama 5: Silogismo (tipo S) -----------------------------------------
  'knocking-sound': {
    type: 'question',
    number: 5,
    title: '¿Se escucha golpeteo específico?',
    description: 'Diagnóstico adicional - Verificación de síntomas específicos',
    yes: { next: 'check-shock-has-leak', fact: 'KNOCKING_SOUND', history: 'Golpeteo específico detectado' },
    no: { next: 'no-issue' },
  },
  'check-shock-has-leak': {
    type: 'diagnosis',
    title: 'Verificación de fuga en amortiguador',
    recommendation: 'Inspeccionar visualmente el amortiguador en busca de fugas de aceite o gas.',
    question: '¿El amortiguador tiene fuga?',
    yes: { next: 'knocking-shock-type-s', fact: 'SHOCK_HAS_LEAK', history: 'Amortiguador con fuga Y golpeteo - Tipo S' },
    no: { next: 'no-issue' },
  },
  'knocking-shock-type-s': {
    type: 'result',
    title: 'Amortiguador con fuga tipo S',
    recommendation: 'Reemplazar amortiguador tipo S. Este tipo específico requiere piezas originales.',
  },

  // --- Sin falla -----------------------------------------------------------
  'no-issue': { type: 'no-issue' },
};


/* =======================================================
4. ESTADO DE LA APLICACIÓN
========================================================== */

const engine = new InferenceEngine();

const state = {
  current: 'start',
  history: [],
};

const dom = {
  app: document.getElementById('app'),
  views: {
    diagnostic: document.getElementById('view-diagnostic'),
    rules: document.getElementById('view-rules'),
  },
  rulesTitle: document.getElementById('rules-title'),
  themeToggle: document.getElementById('theme-toggle'),
  templates: {
    start: document.getElementById('tpl-start'),
    question: document.getElementById('tpl-question'),
    diagnosis: document.getElementById('tpl-diagnosis'),
    result: document.getElementById('tpl-result'),
    noIssue: document.getElementById('tpl-no-issue'),
    conditionItem: document.getElementById('tpl-condition-item'),
  },
};


/* =======================================================
5. RENDERIZADO DE VISTAS
Se usa textContent (nunca innerHTML) para insertar textos.
========================================================== */

function cloneTemplate(template) {
  return template.content.firstElementChild.cloneNode(true);
}

function setSlot(root, slot, text) {
  const element = root.querySelector(`[data-slot="${slot}"]`);
  if (element) element.textContent = text;
}

function buildConditionItems(items) {
  return items.map((text) => {
    const item = cloneTemplate(dom.templates.conditionItem);
    setSlot(item, 'text', text);
    return item;
  });
}

function buildTraceItems(lines) {
  return lines.map((line) => {
    const item = document.createElement('li');
    item.textContent = line;
    return item;
  });
}

const BUILDERS = {
  start: () => cloneTemplate(dom.templates.start),

  question: (node) => {
    const view = cloneTemplate(dom.templates.question);
    setSlot(view, 'badge', `PREGUNTA ${node.number}`);
    setSlot(view, 'title', node.title);
    setSlot(view, 'description', node.description);
    return view;
  },

  diagnosis: (node) => {
    const view = cloneTemplate(dom.templates.diagnosis);
    setSlot(view, 'title', node.title);
    setSlot(view, 'recommendation', node.recommendation);
    setSlot(view, 'question', node.question);
    return view;
  },

  result: (node) => {
    const view = cloneTemplate(dom.templates.result);
    const { reasoning } = engine.infer();
    setSlot(view, 'title', node.title);
    setSlot(view, 'recommendation', node.recommendation);
    view.querySelector('[data-slot="conditions"]').replaceChildren(...buildConditionItems(state.history));
    view.querySelector('[data-slot="trace"]').replaceChildren(...buildTraceItems(reasoning));
    return view;
  },

  'no-issue': () => cloneTemplate(dom.templates.noIssue),
};

function render({ moveFocus = true } = {}) {
  const node = FLOW[state.current];
  dom.app.replaceChildren(BUILDERS[node.type](node));

  if (moveFocus) {
    window.scrollTo({ top: 0 });
    dom.app.querySelector('[data-focus]')?.focus({ preventScroll: true });
  }
}


/* =======================================================
6. MANEJO DE ACCIONES DEL USUARIO
Un único listener delegado para todos los botones [data-action].
========================================================== */

function goTo(nodeId) {
  state.current = nodeId;
  render();
}

function resetSystem() {
  engine.reset();
  state.history = [];
  goTo('start');
}

function answer(choice) {
  const branch = FLOW[state.current][choice];
  if (!branch) return;

  if (branch.fact) engine.setFacts({ [branch.fact]: true });
  if (branch.history) state.history.push(branch.history);

  goTo(branch.next);
}

function handleAppClick(event) {
  const trigger = event.target.closest('[data-action]');
  if (!trigger) return;

  switch (trigger.dataset.action) {
    case 'start':
      goTo('vibration-noise');
      break;
    case 'yes':
    case 'no':
      answer(trigger.dataset.action);
      break;
    case 'home':
      resetSystem();
      break;
    default:
      break;
  }
}


/* =======================================================
7. NAVEGACIÓN ENTRE VISTAS
#reglas muestra la página de reglas; cualquier otro hash, el diagnóstico.
========================================================== */

function applyRoute({ moveFocus = true } = {}) {
  const showRules = window.location.hash === '#reglas';

  dom.views.rules.hidden = !showRules;
  dom.views.diagnostic.hidden = showRules;
  document.title = showRules
    ? 'Reglas del Sistema - Sistema Experto de Suspensión Mazda'
    : 'Sistema Experto - Diagnóstico de Suspensión Mazda';

  if (!moveFocus) return;

  window.scrollTo({ top: 0 });
  const heading = showRules ? dom.rulesTitle : dom.app.querySelector('[data-focus]');
  heading?.focus({ preventScroll: true });
}



/* =======================================================
8. TEMA CLARO / OSCURO
La preferencia se guarda en localStorage (solo preferencia visual).
========================================================== */
const THEME_KEY = 'expert-system-theme';

function readSavedTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Almacenamiento no disponible (modo privado): el tema solo dura la sesión.
  }
}

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  dom.themeToggle.setAttribute('aria-pressed', String(isDark));
  dom.themeToggle.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
}

function toggleTheme() {
  const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  applyTheme(next);
  saveTheme(next);
}



/* =======================================================
9. INICIALIZACIÓN
========================================================== */

function init() {
  applyTheme(readSavedTheme() ?? 'light');
  render({ moveFocus: false });
  applyRoute({ moveFocus: false });

  dom.app.addEventListener('click', handleAppClick);
  dom.themeToggle.addEventListener('click', toggleTheme);
  window.addEventListener('hashchange', () => applyRoute());
}

init();
