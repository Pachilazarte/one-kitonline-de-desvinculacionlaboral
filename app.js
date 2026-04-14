/* ═══════════════════════════════════════════════════════════════
   Kit Online de Desvinculación Laboral
   app.js | Parámetros con localStorage | jsPDF puro
   ═══════════════════════════════════════════════════════════════ */

// ─── DATOS ────────────────────────────────────────────────────────────────────

const CASES = [
  { id:'renuncia',         icon:'🙋', title:'Renuncia',          desc:'Salida voluntaria. Foco en fecha de cese, liquidación final y documentación básica.',                       color:'#22d9df' },
  { id:'despido_sin_causa',icon:'📨', title:'Despido sin causa',  desc:'Preaviso, integración, indemnización por antigüedad y posible negociación.',                              color:'#c1ff72' },
  { id:'despido_con_causa',icon:'⚖️', title:'Despido con causa',  desc:'Exige revisar hechos, antecedentes, proporcionalidad y soporte documental.',                             color:'#1effff' },
  { id:'mutuo_acuerdo',    icon:'🤝', title:'Mutuo acuerdo',      desc:'Cierre acordado: voluntad de partes, instrumentación y monto de salida.',                                color:'#c0c0c0' },
  { id:'art_247',          icon:'🏭', title:'Art. 247 / crisis',  desc:'Fuerza mayor o disminución de trabajo. Alta exigencia de justificación.',                                color:'#F97316' },
  { id:'caso_conflictivo', icon:'🔥', title:'Caso conflictivo',   desc:'Intimaciones, tensión previa, reclamo posible o necesidad de estrategia reforzada.',                     color:'#EF4444' },
];

const DIAG_OPTIONS = [
  { key:'telegramas',           label:'Hubo intercambio telegráfico previo',                         score:2  },
  { key:'intimaciones',         label:'Existen intimaciones o reclamos previos',                     score:2  },
  { key:'antecedentes',         label:'Hay antecedentes disciplinarios o hechos documentados',       score:-1 },
  { key:'controvertido',        label:'El caso tiene hechos controvertidos',                         score:3  },
  { key:'doc_incompleta',       label:'La documentación del caso está incompleta',                   score:3  },
  { key:'riesgo_discriminacion',label:'Hay riesgo de planteo por discriminación, acoso o violencia', score:4  },
  { key:'crisis',               label:'Existe contexto de crisis o reestructuración',                score:2  },
  { key:'posible_reclamo',      label:'Se prevé reclamo o instancia conciliatoria',                  score:2  },
];

const ROUTES = {
  renuncia:          ['Confirmar fecha de cese y recepción de la comunicación escrita.','Revisar rubros de liquidación final (vacaciones no gozadas, SAC proporcional).','Controlar que no queden deudas salariales pendientes.','Conservar soporte documental básico del cierre.'],
  despido_sin_causa: ['Validar fecha de notificación y fecha efectiva de egreso.','Calcular preaviso, integración del mes e indemnización por antigüedad.','Revisar documentación de comunicación y respaldo del caso.','Evaluar si existe margen de negociación o instancia conciliatoria.','Preparar hoja de liquidación con criterio claro y consistente.'],
  despido_con_causa: ['Revisar hechos concretos, antecedentes y proporcionalidad de la medida.','Validar cronología y coherencia del intercambio telegráfico.','Ordenar prueba documental antes de comunicar o responder.','Estimar liquidación final sin rubros indemnizatorios principales.','No avanzar sin tener el soporte probatorio en orden.'],
  mutuo_acuerdo:     ['Confirmar y documentar la voluntad libre de ambas partes.','Estimar monto de salida y definir forma de instrumentación.','Revisar consistencia documental y texto del acuerdo.','Conservar trazabilidad del pago y del cierre.'],
  art_247:           ['Revisar si la causal de crisis o fuerza mayor es técnicamente sostenible.','Ordenar soporte económico y documental de la situación empresarial.','Evaluar con cuidado la exposición jurídica del encuadre elegido.','Estimar impacto económico y necesidad de revisión reforzada.'],
  caso_conflictivo:  ['Reconstruir cronología completa del conflicto desde el inicio.','Revisar intercambio telegráfico, intimaciones y soporte disponible.','Estimar pretensión económica máxima y puntos de mayor sensibilidad.','Preparar estrategia de negociación y defensa documental.','Evaluar si conviene buscar acuerdo antes de llegar a instancia judicial.'],
};

const DOCS = {
  renuncia:          [{ group:'Imprescindible', items:['Comunicación de renuncia firmada','Fecha cierta de cese','Legajo básico completo','Recibos de haberes al día','Liquidación final'] },{ group:'Recomendable', items:['Control de vacaciones pendientes','Cálculo de SAC proporcional','Respaldo de entrega o recepción de documentación'] }],
  despido_sin_causa: [{ group:'Imprescindible', items:['Texto de la comunicación de despido','Control de domicilio vigente','Fecha de notificación fehaciente','Mejor remuneración y tope convencional','Liquidación final completa'] },{ group:'Crítico si hay conflicto', items:['Soporte del criterio económico adoptado','Cronología del caso','Resumen para negociación o CECLO','Control de período de prueba (si aplica)'] }],
  despido_con_causa: [{ group:'Imprescindible', items:['Hechos concretos y específicos','Antecedentes disciplinarios previos','Telegrama o notificación de despido','Coherencia temporal entre hecho y medida'] },{ group:'Crítico si hay conflicto', items:['Prueba documental de soporte','Resumen de hechos controvertidos','Revisión de proporcionalidad de la sanción','Testigos o elementos corroborantes'] }],
  mutuo_acuerdo:     [{ group:'Imprescindible', items:['Constancia de voluntad clara de ambas partes','Texto del acuerdo con todos los términos','Monto pactado y condiciones de pago','Constancia de pago documentada'] },{ group:'Recomendable', items:['Trazabilidad documental del proceso','Respaldo del cierre definitivo','Resumen para el legajo del caso'] }],
  art_247:           [{ group:'Imprescindible', items:['Justificación objetiva del contexto de crisis','Documentación económica de la empresa','Soporte de disminución de trabajo o fuerza mayor','Liquidación calculada bajo el criterio elegido'] },{ group:'Crítico si hay conflicto', items:['Análisis reforzado del encuadre jurídico','Orden cronológico de hechos y decisiones','Resumen estratégico para eventual audiencia'] }],
  caso_conflictivo:  [{ group:'Imprescindible', items:['Cronología completa del conflicto','Intimaciones y telegramas previos','Domicilios actualizados y notificaciones','Legajo y antecedentes del trabajador'] },{ group:'Crítico si hay conflicto', items:['Resumen económico del posible reclamo','Puntos de negociación identificados','Alertas de máxima exposición','Estrategia para audiencia o conciliación'] }],
};

// ─── ESTADO ───────────────────────────────────────────────────────────────────

let selectedCase   = null;
let diagnosisState = { level:'Pendiente', text:'', variables:[], score:0 };
let economics      = { antiguedadAnios:0, rows:[], total:0 };

// ─── PARÁMETROS ───────────────────────────────────────────────────────────────

const CACHE_KEY = 'desv_params_v1';

const PARAMS_DEFAULT = {
  // Base de cálculo
  coefActualizacion: { group:'base',      label:'Coef. de actualización',              value:1.000, type:'number', step:0.001, min:0.001,      desc:'Multiplicador sobre la base remuneratoria (RIPTE, DNU, índice oficial). 1.000 = sin actualización.' },
  divisorMes:        { group:'base',      label:'Divisor días del mes',                value:30,    type:'number', step:1,     min:1,           desc:'Para proporcionales diarios. LCT: 30.' },
  divisorVacaciones: { group:'base',      label:'Divisor vacaciones no gozadas',       value:25,    type:'number', step:1,     min:1,           desc:'LCT Art. 155: 25 días hábiles.' },
  divisorSAC:        { group:'base',      label:'Divisor SAC',                         value:12,    type:'number', step:1,     min:1,           desc:'SAC = remuneración / este valor. Normalmente 12.' },
  diasAnio:          { group:'base',      label:'Días del año (SAC proporcional)',      value:365,   type:'number', step:1,     min:360,         desc:'Base para el SAC proporcional por días trabajados. Normalmente 365.' },
  topeCoefActivo:    { group:'base',      label:'Aplicar coef. también al tope',       value:false, type:'checkbox',                           desc:'Si el tope convencional también se actualiza por el coeficiente.' },
  // Preaviso
  prevMeses1:        { group:'preaviso',  label:'Preaviso tramo 1 (meses)',            value:1,     type:'number', step:1,     min:1,           desc:'Meses de preaviso para antigüedad < umbral. LCT: 1 mes.' },
  prevMeses2:        { group:'preaviso',  label:'Preaviso tramo 2 (meses)',            value:2,     type:'number', step:1,     min:1,           desc:'Meses de preaviso para antigüedad ≥ umbral. LCT: 2 meses.' },
  prevUmbralMeses:   { group:'preaviso',  label:'Umbral tramo 2 (meses antigüedad)',   value:60,    type:'number', step:1,     min:1,           desc:'Desde cuántos meses de antigüedad aplica el tramo 2. LCT: 60 meses (5 años).' },
  // Indemnización
  indemMinAnios:     { group:'indem',     label:'Años mínimos computables',            value:1,     type:'number', step:1,     min:1,           desc:'Mínimo de años computados para la indemnización. LCT Art. 245: 1 año.' },
  fraccionUmbral:    { group:'indem',     label:'Fracción para redondear año (meses)', value:3,     type:'number', step:1,     min:1, max:11,    desc:'Si la fracción de año supera estos meses, se computa un año adicional. LCT: > 3 meses.' },
  reduccionArt247:   { group:'indem',     label:'Reducción Art. 247 (%)',              value:50,    type:'number', step:1,     min:1, max:100,   desc:'Porcentaje de reducción en fuerza mayor o disminución de trabajo. LCT: 50%.' },
  dobleIndemActiva:  { group:'indem',     label:'Doble indemnización activa',          value:false, type:'checkbox',                           desc:'Decreto de emergencia o prohibición de despidos vigente (Ej. DNU 34/2019).' },
  dobleIndemFactor:  { group:'indem',     label:'Factor doble indemnización',          value:2,     type:'number', step:0.1,   min:1,           desc:'Multiplicador cuando está activa. Normalmente 2. Puede ser 1.5, 2, etc.' },
  // Multas
  smvm:              { group:'multas',    label:'SMVM vigente ($)',                    value:0,     type:'number', step:1000,  min:0,           desc:'Salario Mínimo Vital y Móvil actual. Usado para multas y topes.' },
  multa80Activa:     { group:'multas',    label:'Incluir multa Art. 80 LCT',          value:false, type:'checkbox',                           desc:'3 mejores remuneraciones por no entrega de certificados de trabajo.' },
  multa80Factor:     { group:'multas',    label:'Factor multa Art. 80 (x mejores rem.)',value:3,   type:'number', step:1,     min:1,           desc:'Cuántas mejores remuneraciones componen la multa. LCT: 3.' },
  multa9Activa:      { group:'multas',    label:'Incluir multa Art. 9 Ley 24.013',    value:false, type:'checkbox',                           desc:'Empleo no registrado. 25% de remuneraciones devengadas desde el inicio.' },
  multa9Pct:         { group:'multas',    label:'Porcentaje multa Art. 9 (%)',         value:25,    type:'number', step:1,     min:1, max:100,   desc:'Porcentaje aplicado sobre remuneraciones devengadas. Ley 24.013: 25%.' },
  multa9Meses:       { group:'multas',    label:'Meses a computar Art. 9',            value:0,     type:'number', step:1,     min:0,           desc:'Cantidad de meses para calcular la multa por falta de registración.' },
  multa10Activa:     { group:'multas',    label:'Incluir multa Art. 10 Ley 24.013',   value:false, type:'checkbox',                           desc:'Registro deficiente. 25% de remuneraciones devengadas en el período mal registrado.' },
  multa10Pct:        { group:'multas',    label:'Porcentaje multa Art. 10 (%)',        value:25,    type:'number', step:1,     min:1, max:100,   desc:'Porcentaje sobre remuneraciones del período mal registrado. Ley 24.013: 25%.' },
  multa10Meses:      { group:'multas',    label:'Meses a computar Art. 10',           value:0,     type:'number', step:1,     min:0,           desc:'Meses con registro deficiente a considerar.' },
  multa132bisActiva: { group:'multas',    label:'Incluir multa Art. 132 bis LCT',     value:false, type:'checkbox',                           desc:'1 SMVM por mes hasta regularización de retenciones no ingresadas.' },
  multa132bisMeses:  { group:'multas',    label:'Meses a computar Art. 132 bis',      value:0,     type:'number', step:1,     min:0,           desc:'Meses adeudados para calcular esta multa.' },
  // Intereses
  interesesActivos:  { group:'intereses', label:'Calcular intereses orientativos',     value:false, type:'checkbox',                           desc:'Agrega una estimación de intereses sobre el total liquidado.' },
  tasaMensual:       { group:'intereses', label:'Tasa mensual (%)',                    value:8,     type:'number', step:0.1,   min:0,           desc:'Tasa mensual de interés aplicable (ex. tasa activa BCRA). Solo orientativo.' },
  mesesInteres:      { group:'intereses', label:'Meses de interés',                   value:0,     type:'number', step:1,     min:0,           desc:'Meses transcurridos desde el devengamiento hasta hoy.' },
};

let PARAMS = loadParamsFromCache();

function getParam(key){ return PARAMS[key]?.value ?? PARAMS_DEFAULT[key]?.value; }

// ─── CACHE LOCAL ──────────────────────────────────────────────────────────────

function loadParamsFromCache(){
  try{
    const raw=localStorage.getItem(CACHE_KEY);
    if(!raw)return JSON.parse(JSON.stringify(PARAMS_DEFAULT));
    const saved=JSON.parse(raw);
    const merged=JSON.parse(JSON.stringify(PARAMS_DEFAULT));
    Object.entries(saved).forEach(([k,v])=>{ if(merged[k])merged[k].value=v; });
    return merged;
  }catch(e){ return JSON.parse(JSON.stringify(PARAMS_DEFAULT)); }
}

function saveParamsToCache(){
  try{
    const data={};
    Object.entries(PARAMS).forEach(([k,p])=>{ data[k]=p.value; });
    localStorage.setItem(CACHE_KEY,JSON.stringify(data));
    showCacheBadge(true);
  }catch(e){ console.warn('localStorage no disponible'); }
}

function clearCache(){
  try{ localStorage.removeItem(CACHE_KEY); }catch(e){}
  PARAMS=JSON.parse(JSON.stringify(PARAMS_DEFAULT));
  renderParams();
  showCacheBadge(false);
  showToast('Datos borrados. Parámetros restablecidos a valores por defecto.');
}

function showCacheBadge(visible){
  const el=document.getElementById('cacheBadge');
  if(el){ el.classList.toggle('visible',visible); el.classList.toggle('hidden',!visible); }
}

// ─── UTILS ────────────────────────────────────────────────────────────────────

function money(v){ return new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:2}).format(Number(v||0)); }
function numberFrom(id){ return Number(document.getElementById(id).value||0); }
function round2(v){ return Math.round((Number(v||0)+Number.EPSILON)*100)/100; }
function formatDate(d){ if(!d||d==='-')return '-'; const[y,m,dd]=d.split('-'); return `${dd}/${m}/${y}`; }
function today(){ return new Date().toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit',year:'numeric'}); }
function val(id){ return document.getElementById(id)?.value||'-'; }

// ─── OVERLAY ONE ──────────────────────────────────────────────────────────────

const OVERLAY_ID='oneLoadingOverlay';
function showOverlay(msg){
  let el=document.getElementById(OVERLAY_ID);
  if(!el){
    el=document.createElement('div');el.id=OVERLAY_ID;
    el.innerHTML=`<div class="overlay-inner">
      <div class="overlay-logo-wrap">
        <div class="overlay-glow"></div><div class="overlay-arc-outer"></div>
        <div class="overlay-arc-inner"></div><div class="overlay-arc-base"></div>
        <img src="img/one-iconocolor.png" alt="ONE" class="overlay-logo" onerror="this.src='img/one-icononegro.png'">
      </div>
      <div class="overlay-text">
        <p class="overlay-msg" id="overlayMsg">Cargando...</p>
        <p class="overlay-sub" id="overlaySub"></p>
      </div>
    </div>`;
    document.body.appendChild(el);
    if(!document.getElementById('oneOverlayStyles')){
      const s=document.createElement('style');s.id='oneOverlayStyles';
      s.textContent=`
        #oneLoadingOverlay{position:fixed;inset:0;z-index:9999;background:rgba(2,15,39,.85);backdrop-filter:blur(14px) saturate(1.3);-webkit-backdrop-filter:blur(14px) saturate(1.3);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .25s ease;pointer-events:none;}
        #oneLoadingOverlay.visible{opacity:1;pointer-events:auto;}
        .overlay-inner{display:flex;flex-direction:column;align-items:center;gap:16px;}
        .overlay-logo-wrap{position:relative;width:90px;height:90px;}
        .overlay-glow{position:absolute;inset:-10px;border-radius:50%;background:radial-gradient(circle,rgba(34,217,223,.25) 0%,transparent 70%);animation:ovGlow 2s ease-in-out infinite;pointer-events:none;}
        .overlay-arc-outer{position:absolute;inset:-4px;border-radius:50%;border:2.5px solid transparent;border-top-color:#22d9df;border-right-color:rgba(34,217,223,.5);animation:ovSpin .8s linear infinite;}
        .overlay-arc-inner{position:absolute;inset:-4px;border-radius:50%;border:2.5px solid transparent;border-bottom-color:rgba(30,255,255,.3);animation:ovSpin 1.8s linear infinite reverse;}
        .overlay-arc-base{position:absolute;inset:-4px;border-radius:50%;border:2.5px solid rgba(34,217,223,.1);}
        .overlay-logo{width:90px;height:90px;border-radius:50%;object-fit:cover;position:relative;z-index:2;display:block;filter:drop-shadow(0 0 8px rgba(34,217,223,.3));}
        .overlay-text{text-align:center;line-height:1.4;}
        .overlay-msg{margin:0;font-size:.93rem;font-weight:600;color:rgba(255,255,255,.9);font-family:'Exo 2',system-ui,sans-serif;letter-spacing:.02em;}
        .overlay-sub{margin:3px 0 0;font-size:.75rem;color:rgba(34,217,223,.8);font-family:'Exo 2',system-ui,sans-serif;letter-spacing:.03em;min-height:16px;}
        @keyframes ovSpin{to{transform:rotate(360deg);}}
        @keyframes ovGlow{0%,100%{opacity:.6;transform:scale(1);}50%{opacity:1;transform:scale(1.1);}}
      `;
      document.head.appendChild(s);
    }
  }
  document.getElementById('overlayMsg').textContent=msg||'Cargando...';
  document.getElementById('overlaySub').textContent='';
  el.getBoundingClientRect();
  requestAnimationFrame(()=>el.classList.add('visible'));
}
function updateOverlay(sub){ const el=document.getElementById('overlaySub'); if(el)el.textContent=sub||''; }
function hideOverlay(){ const el=document.getElementById(OVERLAY_ID); if(!el)return; el.classList.remove('visible'); setTimeout(()=>el?.parentNode?.removeChild(el),300); }

// ─── TOAST ────────────────────────────────────────────────────────────────────

function showToast(msg,isErr=false){
  document.getElementById('oneToast')?.remove();
  const t=document.createElement('div');t.id='oneToast';
  t.style.cssText=`position:fixed;bottom:24px;right:24px;z-index:10000;display:flex;align-items:center;gap:10px;background:${isErr?'#dc2626':'#020f27'};color:white;border-radius:14px;padding:12px 18px;font-size:13.5px;font-family:'Outfit',sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.25);max-width:380px;`;
  t.innerHTML=`${isErr?'⚠️':'✓'} <span>${msg}</span>`;
  if(!document.getElementById('toastStyle')){
    const s=document.createElement('style');s.id='toastStyle';
    s.textContent=`@keyframes toastIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}`;
    document.head.appendChild(s);
  }
  t.style.animation='toastIn .25s ease';
  document.body.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity .3s';setTimeout(()=>t.remove(),350);},3500);
}

// ─── NAVEGACIÓN ───────────────────────────────────────────────────────────────

function activateTab(tab){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active-tab'));
  document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active-tab');
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.add('hidden'));
  document.getElementById(`tab-${tab}`)?.classList.remove('hidden');
  updateProgress();
}

function updateProgress(){
  let s=0;
  if(selectedCase)s+=25;
  if(diagnosisState.score>0||diagnosisState.variables.length)s+=25;
  if(economics.total>0)s+=25;
  if(val('dNombre')!=='-')s+=12;
  if(val('dEgreso')!=='-')s+=13;
  document.getElementById('progressBar').style.width=s+'%';
  document.getElementById('progressPct').textContent=s+'%';
  const labels=['Sin caso seleccionado','Caso seleccionado','Diagnóstico en curso','Caso completo'];
  document.getElementById('progressLabel').textContent=labels[Math.min(3,Math.floor(s/26))];
  const meta=CASES.find(c=>c.id===selectedCase);
  document.getElementById('sidebarCaseBadge').textContent=meta?meta.title:'Sin definir';
}

// ─── TARJETAS DE CASO ─────────────────────────────────────────────────────────

function renderCaseCards(){
  const c=document.getElementById('caseCards');c.innerHTML='';
  CASES.forEach(ca=>{
    const sel=selectedCase===ca.id;
    const btn=document.createElement('button');
    btn.className=`case-card rounded-3xl border-2 border-e-silver bg-e-white p-5 text-left${sel?' selected':''}`;
    btn.innerHTML=`
      <div class="flex items-start gap-3 mb-3">
        <div class="case-icon w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${sel?'':'bg-e-cream'}">${ca.icon}</div>
        <div class="flex-1">
          <p class="font-semibold text-sm leading-tight">${ca.title}</p>
          <div class="mt-1 h-0.5 w-8 rounded" style="background:${ca.color}"></div>
        </div>
        ${sel?`<svg class="w-5 h-5 flex-shrink-0" style="color:#22d9df" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`:''}
      </div>
      <p class="text-e-dark text-xs leading-5">${ca.desc}</p>`;
    btn.addEventListener('click',()=>{
      selectedCase=ca.id;
      document.getElementById('selectedCaseBadge').textContent=ca.title;
      renderCaseCards();renderRoute();renderDocs();renderRisk();renderStrategy();buildReport();updateProgress();
      activateTab('diagnostico');
    });
    c.appendChild(btn);
  });
}

// ─── CHECKBOXES ───────────────────────────────────────────────────────────────

function renderDiagnosticChecks(){
  document.getElementById('diagnosticChecks').innerHTML=DIAG_OPTIONS.map(o=>`
    <label class="flex items-start gap-3 p-3 rounded-2xl border border-e-silver bg-e-cream cursor-pointer hover:border-e-cyan transition-colors" style="--tw-border-opacity:1">
      <input type="checkbox" id="chk_${o.key}" class="mt-0.5 w-4 h-4" onchange="evaluateDiagnosis()">
      <div>
        <span class="text-sm font-medium leading-5">${o.label}</span>
        <span class="ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-semibold ${o.score>0?'bg-orange-50 text-orange-600':'bg-green-50 text-green-700'}">${o.score>0?'+'+o.score:o.score}</span>
      </div>
    </label>`).join('');
}

// ─── DIAGNÓSTICO ──────────────────────────────────────────────────────────────

function evaluateDiagnosis(){
  let score=0;const variables=[];
  DIAG_OPTIONS.forEach(o=>{ const el=document.getElementById(`chk_${o.key}`); if(el?.checked){score+=o.score;variables.push(o.label);} });
  if(selectedCase==='despido_con_causa')score+=1;
  if(selectedCase==='art_247')score+=2;
  if(selectedCase==='caso_conflictivo')score+=3;
  score=Math.max(0,score);
  const levels=[
    {max:2, label:'Caso simple',             color:'#22C55E', text:'No se observan elementos suficientes para clasificar el caso como sensible. Gestión directa posible.'},
    {max:5, label:'Caso con observaciones',  color:'#EAB308', text:'Existen aspectos que conviene revisar antes de comunicar, liquidar o negociar el cierre.'},
    {max:9, label:'Caso sensible',            color:'#F97316', text:'El caso presenta variables que pueden escalar el conflicto si no se ordena bien la documentación y la estrategia.'},
    {max:999,label:'Caso de alto riesgo',    color:'#EF4444', text:'Hay factores de exposición suficientes para evitar decisiones improvisadas y reforzar la revisión integral.'},
  ];
  const lv=levels.find(l=>score<=l.max);
  diagnosisState={level:lv.label,text:lv.text,variables,score};
  const dn=document.getElementById('diagNivel');
  if(dn){dn.textContent=lv.label;dn.style.color=lv.color;}
  document.getElementById('diagTexto').textContent=lv.text;
  document.getElementById('diagScoreBar').style.width=Math.min(100,(score/15)*100)+'%';
  document.getElementById('diagVariables').innerHTML=variables.length
    ?variables.map(v=>`<li class="flex items-start gap-2"><span class="text-orange-500 mt-0.5">•</span><span>${v}</span></li>`).join('')
    :`<li class="flex items-start gap-2"><span class="text-green-500 mt-0.5">•</span><span>Sin variables marcadas.</span></li>`;
  renderRoute();renderDocs();renderRisk();renderStrategy();buildReport();updateProgress();
}

// ─── RUTA ─────────────────────────────────────────────────────────────────────

function renderRoute(){
  const g=document.getElementById('rutaGrid');
  if(!selectedCase){g.innerHTML=emptyState('Primero seleccioná un tipo de caso en el Paso 1.');return;}
  const extra=[];
  if(diagnosisState.score>=6)extra.push('No avanzar sin ordenar primero los puntos sensibles del caso.');
  if(diagnosisState.variables.includes('Existen intimaciones o reclamos previos'))extra.push('Revisar el intercambio previo antes de definir el siguiente movimiento.');
  if(diagnosisState.variables.includes('Hay riesgo de planteo por discriminación, acoso o violencia'))extra.push('Reforzar la lectura preventiva antes de cualquier comunicación.');
  const steps=[...(ROUTES[selectedCase]||[]),...extra];
  g.innerHTML=steps.map((s,i)=>`
    <div class="rounded-3xl border border-e-silver bg-e-cream p-5 card-hover">
      <div class="flex items-center gap-2 mb-2">
        <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style="background:#020f27;">${i+1}</span>
        <p class="text-xs uppercase tracking-wide font-ui text-e-dark">Paso ${i+1}</p>
        ${i>=(ROUTES[selectedCase]||[]).length?`<span class="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 font-semibold">⚠ Alerta</span>`:''}
      </div>
      <p class="text-sm font-medium leading-6">${s}</p>
    </div>`).join('');
}

// ─── DOCUMENTACIÓN ────────────────────────────────────────────────────────────

function renderDocs(){
  const g=document.getElementById('docGrid');
  if(!selectedCase){g.innerHTML=emptyState('Primero seleccioná un tipo de caso en el Paso 1.');return;}
  const colors={'Imprescindible':{bg:'#f0fcfd',border:'#22d9df',dot:'#22d9df'},'Recomendable':{bg:'#f0fff4',border:'#6b9432',dot:'#6b9432'},'Crítico si hay conflicto':{bg:'#fff8f0',border:'#F97316',dot:'#F97316'}};
  g.innerHTML=(DOCS[selectedCase]||[]).map(group=>{
    const c=colors[group.group]||{bg:'#faf1f1',border:'#c0c0c0',dot:'#c0c0c0'};
    return `<div class="rounded-3xl border-2 p-5" style="border-color:${c.border};background:${c.bg};">
      <p class="text-xs font-bold uppercase tracking-wider mb-4" style="color:${c.dot};">${group.group}</p>
      <ul class="space-y-3 text-sm">${group.items.map(item=>`<li class="flex items-start gap-3"><input type="checkbox" class="mt-0.5 w-4 h-4 flex-shrink-0 cursor-pointer"><span class="leading-5">${item}</span></li>`).join('')}</ul>
    </div>`;
  }).join('');
}

// ─── CÁLCULO ECONÓMICO ────────────────────────────────────────────────────────

function yearsForIndemnizacion(s,e){
  if(!s||!e||s==='-'||e==='-')return{years:0,months:0,totalMonths:0};
  const start=new Date(s+'T00:00:00'),end=new Date(e+'T00:00:00');
  if(isNaN(start)||isNaN(end)||end<start)return{years:0,months:0,totalMonths:0};
  let months=(end.getFullYear()-start.getFullYear())*12+(end.getMonth()-start.getMonth());
  if(end.getDate()<start.getDate())months--;
  months=Math.max(0,months);
  const fracUmbral=Math.max(1,Number(getParam('fraccionUmbral'))||3);
  const yb=Math.floor(months/12),rm=months%12;
  return{years:rm>fracUmbral?yb+1:yb,months:rm,totalMonths:months};
}
function calcIntegDays(e){
  if(!e||e==='-')return 0;
  const d=new Date(e+'T00:00:00');
  return isNaN(d)?0:Math.max(0,new Date(d.getFullYear(),d.getMonth()+1,0).getDate()-d.getDate());
}

function calculateEconomic(){
  if(!selectedCase){activateTab('inicio');return;}
  showOverlay('Calculando rubros...');
  setTimeout(()=>{
    const ingreso=val('dIngreso'),egreso=val('dEgreso');
    const sueldo=numberFrom('eSueldo'),variablesRem=numberFrom('eVariables');
    const mejorRem=numberFrom('eMejorRem'),tope=numberFrom('eTope');
    const diasMes=numberFrom('eDiasMes'),vacPend=numberFrom('eVacPend');
    const diasSem=numberFrom('eDiasSem'),mutuoM=numberFrom('eMutuo');
    const pNO=Number(document.getElementById('ePreavisoNoOtorgado').value);

    // Parámetros
    const coef        = Math.max(0.001, Number(getParam('coefActualizacion'))||1);
    const divMes      = Math.max(1, Number(getParam('divisorMes'))||30);
    const divVac      = Math.max(1, Number(getParam('divisorVacaciones'))||25);
    const divSAC      = Math.max(1, Number(getParam('divisorSAC'))||12);
    const diasAnio    = Math.max(1, Number(getParam('diasAnio'))||365);
    const topeCoef    = Boolean(getParam('topeCoefActivo'));
    const prev1       = Math.max(1, Number(getParam('prevMeses1'))||1);
    const prev2       = Math.max(1, Number(getParam('prevMeses2'))||2);
    const prevUmbral  = Math.max(1, Number(getParam('prevUmbralMeses'))||60);
    const indemMin    = Math.max(1, Number(getParam('indemMinAnios'))||1);
    const pctArt247   = (Number(getParam('reduccionArt247'))||50)/100;
    const dobleActiva = Boolean(getParam('dobleIndemActiva'));
    const dobleFactor = Math.max(1, Number(getParam('dobleIndemFactor'))||2);
    const smvm        = Number(getParam('smvm'))||0;
    const m80         = Boolean(getParam('multa80Activa'));
    const m80factor   = Number(getParam('multa80Factor'))||3;
    const m9          = Boolean(getParam('multa9Activa'));
    const m9pct       = (Number(getParam('multa9Pct'))||25)/100;
    const m9meses     = Number(getParam('multa9Meses'))||0;
    const m10         = Boolean(getParam('multa10Activa'));
    const m10pct      = (Number(getParam('multa10Pct'))||25)/100;
    const m10meses    = Number(getParam('multa10Meses'))||0;
    const m132        = Boolean(getParam('multa132bisActiva'));
    const m132meses   = Number(getParam('multa132bisMeses'))||0;
    const intereses   = Boolean(getParam('interesesActivos'));
    const tasaMens    = (Number(getParam('tasaMensual'))||8)/100;
    const mesesInt    = Number(getParam('mesesInteres'))||0;

    const antig=yearsForIndemnizacion(ingreso,egreso);
    const baseVar    = round2((sueldo+variablesRem)*coef);
    const mRem       = round2(mejorRem*coef);
    const topeBase   = tope>0?(topeCoef?round2(tope*coef):tope):0;
    const integDays  = calcIntegDays(egreso);
    const preavisoM  = antig.totalMonths>=prevUmbral?prev2:prev1;
    const baseIndem  = topeBase>0?Math.min(mRem,topeBase):mRem;

    let diasTrab=round2((sueldo/divMes)*diasMes);
    let prev=0,sacPrev=0,integ=0,sacInteg=0;
    let vacNG=round2((baseVar/divVac)*vacPend);
    let sacVac=round2(vacNG/divSAC);
    let sacProp=round2((mRem/diasAnio)*diasSem);
    let indem=0,mutuo=0;
    let mMul80=0,mMul9=0,mMul10=0,mMul132=0,mIntereses=0;

    if(['despido_sin_causa','caso_conflictivo','art_247'].includes(selectedCase)){
      if(pNO===1){
        prev=round2(baseVar*preavisoM);sacPrev=round2(prev/divSAC);
        integ=round2((baseVar/divMes)*integDays);sacInteg=round2(integ/divSAC);
      }
      const aniosComp=Math.max(indemMin,antig.years);
      indem=selectedCase==='art_247'
        ?round2(baseIndem*aniosComp*pctArt247*2)
        :round2(baseIndem*aniosComp);
      if(dobleActiva&&selectedCase!=='art_247')indem=round2(indem*dobleFactor);
    }
    if(selectedCase==='mutuo_acuerdo')mutuo=round2(mutuoM);

    if(m80)mMul80=round2(mRem*m80factor);
    if(m9&&m9meses>0)mMul9=round2((sueldo+variablesRem)*m9meses*m9pct);
    if(m10&&m10meses>0)mMul10=round2((sueldo+variablesRem)*m10meses*m10pct);
    if(m132&&m132meses>0&&smvm>0)mMul132=round2(smvm*m132meses);

    const subtotalAntes=round2(diasTrab+prev+sacPrev+integ+sacInteg+vacNG+sacVac+sacProp+indem+mutuo+mMul80+mMul9+mMul10+mMul132);
    if(intereses&&mesesInt>0&&tasaMens>0)
      mIntereses=round2(subtotalAntes*tasaMens*mesesInt);

    const allRows=[
      ['Días trabajados del mes',diasTrab],
      ['Preaviso ('+preavisoM+' mes'+( preavisoM>1?'es':'')+' — base actualizada)',prev],
      ['SAC sobre preaviso',sacPrev],
      ['Integración del mes ('+integDays+' días)',integ],
      ['SAC sobre integración',sacInteg],
      ['Vacaciones no gozadas ('+vacPend+' días)',vacNG],
      ['SAC sobre vacaciones',sacVac],
      ['SAC proporcional ('+diasSem+' días)',sacProp],
      dobleActiva&&indem>0?['Indemnización × '+dobleFactor+' (doble indem. activa)',indem]:['Indemnización por antigüedad ('+antig.years+' año'+( antig.years!==1?'s':'')+' comp.)',indem],
      ['Gratificación / mutuo acuerdo',mutuo],
      ...(mMul80>0?[['Multa Art. 80 LCT ('+m80factor+'× mejor rem.)',mMul80]]:[]),
      ...(mMul9>0?[['Multa Art. 9 Ley 24.013 ('+m9meses+' meses × '+( m9pct*100)+'%)',mMul9]]:[]),
      ...(mMul10>0?[['Multa Art. 10 Ley 24.013 ('+m10meses+' meses × '+(m10pct*100)+'%)',mMul10]]:[]),
      ...(mMul132>0?[['Multa Art. 132 bis ('+m132meses+' meses × SMVM)',mMul132]]:[]),
      ...(mIntereses>0?[['Intereses orientativos ('+mesesInt+' meses × '+(tasaMens*100).toFixed(1)+'%/mes)',mIntereses]]:[]),
    ];
    const filtered=allRows.filter(r=>r[1]!==0||['Días trabajados del mes','Vacaciones no gozadas','SAC proporcional ('+diasSem+' días)'].some(k=>r[0].startsWith(k)));
    const total=round2(filtered.reduce((a,r)=>a+r[1],0));
    economics={antiguedadAnios:antig.years,rows:filtered,total};

    document.getElementById('ecoAntiguedad').textContent=`${antig.years} año${antig.years!==1?'s':''}`;
    document.getElementById('ecoTotal').textContent=money(total);
    document.getElementById('ecoBreakdown').innerHTML=[...filtered,['Total estimado',total]].map((r,i,a)=>`
      <tr class="${i===a.length-1?'total-row':''}">
        <td>${r[0]}</td>
        <td style="text-align:right">${money(r[1])}</td>
      </tr>`).join('');

    renderRisk();renderStrategy();buildReport();updateProgress();
    hideOverlay();
  },400);
}

// ─── RIESGO ───────────────────────────────────────────────────────────────────

function renderRisk(){
  const factors=[];let score=diagnosisState.score;
  if(selectedCase==='despido_con_causa'){factors.push({t:'Exige revisar hechos, antecedentes y proporcionalidad.',e:'warn'});score+=1;}
  if(selectedCase==='art_247'){factors.push({t:'El encuadre de crisis o fuerza mayor requiere soporte especialmente sólido.',e:'warn'});score+=2;}
  if(selectedCase==='caso_conflictivo'){factors.push({t:'El caso ya nace con perfil de tensión o reclamo potencial.',e:'error'});score+=3;}
  if(economics.total>=10000000){factors.push({t:'El monto estimado del caso es económicamente relevante.',e:'warn'});score+=1;}
  if(diagnosisState.variables.includes('La documentación del caso está incompleta'))factors.push({t:'Faltan respaldos documentales relevantes.',e:'error'});
  if(diagnosisState.variables.includes('Hay riesgo de planteo por discriminación, acoso o violencia'))factors.push({t:'Variables especialmente sensibles: discriminación, acoso o violencia.',e:'error'});
  if(diagnosisState.variables.includes('Existen intimaciones o reclamos previos'))factors.push({t:'Ya hay intercambio previo o planteos anteriores.',e:'warn'});
  if(!factors.length)factors.push({t:'No se detectaron variables críticas en el diagnóstico inicial.',e:'ok'});
  score=Math.max(0,score);
  const rl=[{max:2,l:'Bajo',dc:'dot-bajo',c:'#22C55E',t:'El caso presenta una exposición controlada que admite gestión relativamente ordenada.'},{max:5,l:'Medio',dc:'dot-medio',c:'#EAB308',t:'Hay puntos de atención que conviene revisar antes de avanzar con la comunicación o el cierre.'},{max:9,l:'Alto',dc:'dot-alto',c:'#F97316',t:'El caso presenta inconsistencias o sensibilidad suficiente para reforzar la revisión técnica antes de avanzar.'},{max:999,l:'Crítico',dc:'dot-critico',c:'#EF4444',t:'Conviene evitar decisiones improvisadas y trabajar el caso con revisión integral, cronología y soporte reforzado.'}];
  const r=rl.find(x=>score<=x.max);
  const rLvl=document.getElementById('riskLevel'),rDot=document.getElementById('riskDotMain');
  if(rLvl){rLvl.textContent=r.l;rLvl.style.color=r.c;}
  if(rDot)rDot.className=`risk-dot ${r.dc}`;
  document.getElementById('riskText').textContent=r.t;
  document.getElementById('riskFactors').innerHTML=factors.map(f=>`<li class="flex items-start gap-2 text-sm"><span>${f.e==='error'?'🔴':f.e==='warn'?'🟡':'🟢'}</span><span>${f.t}</span></li>`).join('');
  document.getElementById('riskScoreBar').style.width=Math.min(100,(score/15)*100)+'%';
  document.getElementById('riskScoreLabel').textContent=`Score de exposición: ${score} pt${score!==1?'s':''}`;
}

// ─── ESTRATEGIA ───────────────────────────────────────────────────────────────

function renderStrategy(){
  const g=document.getElementById('strategyGrid');
  if(!selectedCase){g.innerHTML=emptyState('Primero seleccioná un tipo de caso en el Paso 1.');return;}
  const s=[
    {i:'📂',t:'Ordenar la documentación del caso antes de definir el siguiente paso.'},
    {i:'📝',t:'Conservar síntesis del criterio económico y documental utilizado.'},
    ...([{id:'renuncia',i:'📅',t:'Controlar fecha de cese, liquidación final y soporte de la comunicación.'},{id:'despido_sin_causa',i:'⚖️',t:'Revisar comunicación, rubros indemnizatorios y posible margen de negociación.'},{id:'despido_con_causa',i:'🔎',t:'No avanzar sin revisar hechos, antecedentes y proporcionalidad de la medida.'},{id:'mutuo_acuerdo',i:'🤝',t:'Definir con claridad texto, monto, trazabilidad y forma de instrumentación.'},{id:'art_247',i:'🏭',t:'Reforzar el análisis del encuadre antes de sostener una reducción indemnizatoria.'},{id:'caso_conflictivo',i:'🛡️',t:'Preparar cronología, soporte documental y eventual escenario conciliatorio.'}].filter(x=>x.id===selectedCase)),
  ];
  if(diagnosisState.score>=6)s.push({i:'⚠️',t:'Elevar el estándar de revisión antes de comunicar o responder cualquier planteo.'});
  if(diagnosisState.variables.includes('Existen intimaciones o reclamos previos'))s.push({i:'📨',t:'Releer el intercambio previo y evitar contradicciones en la estrategia actual.'});
  if(diagnosisState.variables.includes('Hay riesgo de planteo por discriminación, acoso o violencia'))s.push({i:'🚨',t:'Tratar el caso como sensible y reforzar el enfoque preventivo en toda comunicación.'});
  if(economics.total>0)s.push({i:'💰',t:`Total estimado del caso: ${money(economics.total)}. Considerarlo en la estrategia de cierre.`});
  g.innerHTML=s.map((x,i)=>`
    <div class="rounded-3xl border border-e-silver bg-e-cream p-5 card-hover flex items-start gap-3">
      <span class="text-2xl flex-shrink-0 mt-0.5">${x.i}</span>
      <div><p class="text-xs uppercase tracking-wider font-ui mb-1 text-e-dark">Acción ${i+1}</p><p class="text-sm font-medium leading-6">${x.t}</p></div>
    </div>`).join('');
}

// ─── INFORME ──────────────────────────────────────────────────────────────────

function buildReport(){
  const meta=CASES.find(c=>c.id===selectedCase);
  const nombre=val('dNombre'),empresa=val('dEmpresa'),convenio=val('dConvenio'),puesto=val('dPuesto');
  const ingreso=val('dIngreso'),egreso=val('dEgreso'),obs=val('dObs');
  const rl=document.getElementById('riskLevel')?.textContent||'Pendiente';
  const rt=document.getElementById('riskText')?.textContent||'-';
  const f=(label,v)=>`<p class="flex gap-2 flex-wrap"><span class="font-medium min-w-max">${label}:</span><span class="text-e-dark">${v}</span></p>`;
  document.getElementById('reportIdent').innerHTML=[f('Caso',nombre),f('Empresa',empresa),f('Tipo',meta?meta.title:'-'),f('Convenio',convenio),f('Puesto',puesto),f('Ingreso',formatDate(ingreso)),f('Egreso',formatDate(egreso))].join('');
  document.getElementById('reportDiag').innerHTML=[f('Lectura',diagnosisState.level),f('Descripción',diagnosisState.text||'-'),f('Variables',diagnosisState.variables.length?diagnosisState.variables.join('; '):'Sin variables marcadas.'),f('Observaciones',obs)].join('');
  document.getElementById('reportEco').innerHTML=economics.rows.length
    ?[...economics.rows.map(r=>f(r[0],money(r[1]))),`<p class="flex gap-2 mt-2 pt-2 border-t border-e-silver"><span class="font-bold min-w-max">Total estimado:</span><span class="font-bold">${money(economics.total)}</span></p>`].join('')
    :f('Estado','Sin cálculo económico realizado todavía.');
  document.getElementById('reportAlerts').innerHTML=[f('Nivel de exposición',rl),f('Lectura orientativa',rt),f('Recomendación','Ordenar documentación, validar comunicación y revisar antes de cerrar o negociar.')].join('');
  document.getElementById('reportText').value=[
    '═══════════════════════════════════════',`  INFORME DE DESVINCULACIÓN LABORAL`,`  Generado el ${today()}`,'═══════════════════════════════════════','',
    '1. IDENTIFICACIÓN',
    `   Caso:        ${nombre}`,`   Empresa:     ${empresa}`,`   Tipo:        ${meta?meta.title:'-'}`,`   Convenio:    ${convenio}`,`   Puesto:      ${puesto}`,`   Ingreso:     ${formatDate(ingreso)}`,`   Egreso:      ${formatDate(egreso)}`,'',
    '2. DIAGNÓSTICO',
    `   Lectura:     ${diagnosisState.level}`,`   Descripción: ${diagnosisState.text||'-'}`,`   Variables:   ${diagnosisState.variables.length?diagnosisState.variables.join('; '):'Sin variables marcadas.'}`,`   Obs:         ${obs}`,'',
    '3. RUBROS ECONÓMICOS',
    ...(economics.rows.length?[...economics.rows.map(r=>`   ${r[0].slice(0,38).padEnd(38)} ${money(r[1])}`),`   ${'─'.repeat(52)}`,`   ${'TOTAL ESTIMADO'.padEnd(38)} ${money(economics.total)}`]:['   Sin cálculo económico realizado todavía.']),'',
    '4. EXPOSICIÓN Y RECOMENDACIÓN',
    `   Nivel:       ${rl}`,`   Lectura:     ${rt}`,
    '───────────────────────────────────────',`  Documento orientativo — no reemplaza asesoramiento jurídico`,'───────────────────────────────────────'
  ].join('\n');
}

function copyReport(){
  navigator.clipboard.writeText(document.getElementById('reportText').value)
    .then(()=>showToast('Informe copiado al portapapeles'))
    .catch(()=>showToast('No se pudo copiar automáticamente',true));
}

// ─── EXPORTAR PDF (jsPDF puro) ────────────────────────────────────────────────

function exportPDF(){
  if(!selectedCase){showToast('Seleccioná un tipo de caso antes de exportar.',true);return;}
  showOverlay('Generando PDF...');updateOverlay('Dibujando documento...');
  setTimeout(()=>{
    try{
      const{jsPDF}=window.jspdf;
      const doc=new jsPDF({unit:'mm',format:'a4',orientation:'portrait'});
      const W=210,H=297,mL=18,mR=18,cW=174;let y=0;
      const meta=CASES.find(c=>c.id===selectedCase);
      const nombre=val('dNombre'),empresa=val('dEmpresa'),convenio=val('dConvenio'),puesto=val('dPuesto');
      const ingreso=val('dIngreso'),egreso=val('dEgreso'),obs=val('dObs');
      const rlText=document.getElementById('riskLevel')?.textContent||'Pendiente';
      const rtText=document.getElementById('riskText')?.textContent||'-';
      const riskRGBmap={Bajo:[34,197,94],Medio:[234,179,8],Alto:[249,115,22],'Crítico':[239,68,68],Pendiente:[192,192,192]};
      const rRGB=riskRGBmap[rlText]||[192,192,192];

      const checkPage=(n=10)=>{ if(y+n>H-14){doc.addPage();y=20;} };

      const sectionBar=(num,title,rgb)=>{
        checkPage(16);
        doc.setFillColor(...rgb);doc.rect(mL,y-1,3,8,'F');
        doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(80,100,120);
        doc.text(`${num}. ${title.toUpperCase()}`,mL+6,y+5);
        y+=10;
        doc.setDrawColor(200,210,215);doc.setLineWidth(0.25);doc.line(mL,y,W-mR,y);
        y+=4;
      };

      const fieldRow=(label,value,bold=false)=>{
        checkPage(7);
        doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(120,130,140);
        doc.text(label,mL+6,y);
        doc.setFont('helvetica',bold?'bold':'normal');doc.setTextColor(10,15,30);
        const lines=doc.splitTextToSize(String(value),cW-72);
        doc.text(lines,mL+72,y);
        y+=6+(lines.length-1)*4.5;
      };

      // ── HEADER ──
      doc.setFillColor(2,15,39);doc.rect(0,0,W,44,'F');
      doc.setFillColor(34,217,223);doc.rect(0,44,W*0.34,2.5,'F');
      doc.setFillColor(30,255,255);doc.rect(W*0.34,44,W*0.33,2.5,'F');
      doc.setFillColor(193,255,114);doc.rect(W*0.67,44,W*0.34,2.5,'F');

      doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(150,160,175);
      doc.text('Herramienta de gestión de RRHH',mL,13);
      doc.setFont('helvetica','bold');doc.setFontSize(17);doc.setTextColor(255,255,255);
      doc.text('Informe de Desvinculación Laboral',mL,24);
      doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(34,217,223);
      doc.text(meta?meta.title:'Sin definir',mL,33);

      doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(150,160,175);
      doc.text(today(),W-mR,13,{align:'right'});
      doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(200,210,220);
      doc.text('Caso:',W-mR,23,{align:'right'});
      doc.setFont('helvetica','bold');doc.setTextColor(255,255,255);
      const nLines=doc.splitTextToSize(nombre,70);
      doc.text(nLines,W-mR,30,{align:'right'});
      y=56;

      // ── SEC 1 ──
      sectionBar('1','Identificación del caso',[34,217,223]);
      fieldRow('Caso / Trabajador:',nombre,true);fieldRow('Empresa / cliente:',empresa);
      fieldRow('Tipo:',meta?meta.title:'-',true);fieldRow('Convenio / ref.:',convenio);
      fieldRow('Puesto / categoría:',puesto);fieldRow('Fecha de ingreso:',formatDate(ingreso));
      fieldRow('Fecha de egreso:',formatDate(egreso));y+=5;

      // ── SEC 2 ──
      sectionBar('2','Diagnóstico del caso',[11,74,110]);
      fieldRow('Lectura preliminar:',diagnosisState.level,true);
      checkPage(10);
      doc.setFont('helvetica','italic');doc.setFontSize(9);doc.setTextColor(60,70,80);
      const descL=doc.splitTextToSize(diagnosisState.text||'-',cW-8);
      doc.text(descL,mL+6,y);y+=descL.length*5+3;
      if(diagnosisState.variables.length){
        checkPage(8);
        doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(10,15,30);
        doc.text('Variables detectadas:',mL+6,y);y+=5;
        diagnosisState.variables.forEach(v=>{
          checkPage(6);
          doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(60,70,80);
          const vl=doc.splitTextToSize('• '+v,cW-14);doc.text(vl,mL+10,y);y+=vl.length*5+1;
        });y+=2;
      }
      if(obs&&obs!=='-'){
        checkPage(12);
        doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(10,15,30);
        doc.text('Observaciones:',mL+6,y);y+=5;
        doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(60,70,80);
        const ol=doc.splitTextToSize(obs,cW-14);doc.text(ol,mL+10,y);y+=ol.length*5+3;
      }
      y+=4;

      // ── SEC 3 ──
      sectionBar('3','Rubros económicos orientativos',[107,148,50]);
      if(economics.rows.length){
        checkPage(10);
        doc.setFillColor(240,248,250);doc.rect(mL+5,y-3,cW-5,7.5,'F');
        doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(80,100,120);
        doc.text('CONCEPTO',mL+9,y+2.5);doc.text('IMPORTE',W-mR-2,y+2.5,{align:'right'});
        y+=9;
        economics.rows.forEach((r,i)=>{
          checkPage(7);
          if(i%2===1){doc.setFillColor(245,250,252);doc.rect(mL+5,y-3,cW-5,7,'F');}
          doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.setTextColor(30,40,50);
          const label=r[0].length>50?r[0].slice(0,47)+'...':r[0];
          doc.text(label,mL+9,y+1);
          doc.setTextColor(10,15,30);doc.text(money(r[1]),W-mR-2,y+1,{align:'right'});
          doc.setDrawColor(220,230,235);doc.setLineWidth(0.2);doc.line(mL+5,y+4,W-mR,y+4);
          y+=7;
        });
        checkPage(11);
        doc.setFillColor(2,15,39);doc.rect(mL+5,y-3,cW-5,10,'F');
        doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(34,217,223);
        doc.text('TOTAL ESTIMADO',mL+9,y+4);
        doc.text(money(economics.total),W-mR-2,y+4,{align:'right'});
        y+=13;
        doc.setFont('helvetica','italic');doc.setFontSize(8);doc.setTextColor(150,160,175);
        doc.text(`Antigüedad computable: ${economics.antiguedadAnios} año${economics.antiguedadAnios!==1?'s':''}`,mL+9,y);y+=8;
      }else{
        doc.setFont('helvetica','italic');doc.setFontSize(9.5);doc.setTextColor(150,160,175);
        doc.text('Sin cálculo económico realizado.',mL+8,y);y+=8;
      }
      y+=4;

      // ── SEC 4 ──
      sectionBar('4','Exposición y recomendación',rRGB);
      checkPage(14);
      doc.setFillColor(...rRGB);doc.roundedRect(mL+5,y-3,55,9,2,2,'F');
      doc.setFont('helvetica','bold');doc.setFontSize(9.5);doc.setTextColor(255,255,255);
      doc.text(`Nivel de riesgo: ${rlText}`,mL+9,y+3.5);y+=13;
      checkPage(12);
      doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.setTextColor(50,60,70);
      const rtL=doc.splitTextToSize(rtText,cW-10);doc.text(rtL,mL+6,y);y+=rtL.length*5+4;
      checkPage(12);
      doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(10,15,30);
      doc.text('Recomendación:',mL+6,y);y+=5;
      doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(50,60,70);
      const recL=doc.splitTextToSize('Revisar documentación, comunicación, cronología del caso y consistencia del criterio adoptado antes de cerrar o negociar.',cW-12);
      doc.text(recL,mL+6,y);y+=recL.length*5+6;

      // ── FOOTER ──
      const totalP=doc.internal.getNumberOfPages();
      for(let i=1;i<=totalP;i++){
        doc.setPage(i);
        doc.setDrawColor(190,200,210);doc.setLineWidth(0.3);doc.line(mL,H-12,W-mR,H-12);
        doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(150,160,175);
        doc.text('Informe de Desvinculación Laboral',mL,H-7);
        doc.text(`Generado el ${today()} · Documento orientativo`,W-mR,H-7,{align:'right'});
        if(totalP>1)doc.text(`${i} / ${totalP}`,W/2,H-7,{align:'center'});
      }

      const filename=`desvinculacion_${nombre.replace(/[^a-zA-Z0-9\u00C0-\u024F]/g,'_').replace(/_+/g,'_')}_${new Date().toISOString().slice(0,10)}.pdf`;
      doc.save(filename);
      hideOverlay();showToast(`PDF generado: ${filename}`);
    }catch(err){
      console.error('PDF error:',err);
      hideOverlay();showToast('Error al generar el PDF: '+err.message,true);
    }
  },300);
}

// ─── PARÁMETROS ───────────────────────────────────────────────────────────────

const PARAM_GROUPS={
  base:'paramsBase', preaviso:'paramsPreaviso',
  indem:'paramsIndem', multas:'paramsMultas', intereses:'paramsIntereses'
};

function renderParams(){
  Object.values(PARAM_GROUPS).forEach(id=>{ const el=document.getElementById(id); if(el)el.innerHTML=''; });

  Object.entries(PARAMS).forEach(([key,p])=>{
    const containerId=PARAM_GROUPS[p.group];
    if(!containerId)return;
    const container=document.getElementById(containerId);
    if(!container)return;

    const card=document.createElement('div');
    card.className='param-card rounded-2xl border border-e-silver bg-e-cream p-4';

    if(p.type==='checkbox'){
      card.innerHTML=`
        <label class="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" id="param_${key}" ${p.value?'checked':''} class="mt-0.5 w-4 h-4 flex-shrink-0"
                 onchange="updateParam('${key}',this.checked)">
          <div>
            <p class="text-sm font-semibold leading-tight">${p.label}</p>
            <p class="text-xs text-e-dark mt-1 leading-4">${p.desc}</p>
          </div>
        </label>`;
    }else{
      const hasMax=p.max!==undefined,hasMin=p.min!==undefined;
      card.innerHTML=`
        <label class="block space-y-1.5">
          <span class="text-sm font-semibold">${p.label}</span>
          <input type="number" id="param_${key}" value="${p.value}"
                 step="${p.step||1}" ${hasMin?`min="${p.min}"`:''}  ${hasMax?`max="${p.max}"`:''} 
                 class="w-full rounded-xl border border-e-silver bg-white px-3 py-2.5 text-sm"
                 oninput="updateParam('${key}',+this.value)">
          <p class="text-xs text-e-dark leading-4">${p.desc}</p>
        </label>`;
    }
    container.appendChild(card);
  });

  refreshParamsResumen();
  // Check if any value differs from default to show badge
  const hasChanges=Object.entries(PARAMS).some(([k,p])=>p.value!==PARAMS_DEFAULT[k].value);
  showCacheBadge(hasChanges);
}

function updateParam(key,value){
  if(PARAMS[key]){
    PARAMS[key].value=value;
    saveParamsToCache();
    refreshParamsResumen();
  }
}

function refreshParamsResumen(){
  const el=document.getElementById('paramsResumenItems');if(!el)return;
  const activos=[];
  Object.entries(PARAMS).forEach(([k,p])=>{
    if(p.value!==PARAMS_DEFAULT[k].value){
      const dv=PARAMS_DEFAULT[k].value;
      const label=p.label.length>30?p.label.slice(0,27)+'...':p.label;
      const isWarn=p.group==='multas'||p.group==='indem';
      activos.push({label,val:p.type==='checkbox'?(p.value?'Activo':'Inactivo'):p.value,isWarn});
    }
  });
  if(!activos.length){
    el.innerHTML=`<p class="text-xs text-e-dark">Todos los parámetros están en sus valores por defecto.</p>`;
    return;
  }
  el.innerHTML=activos.map(a=>`
    <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium
                ${a.isWarn?'bg-orange-50 border border-orange-200 text-orange-700':'bg-e-cream border border-e-silver text-e-dark'}">
      <span>${a.label}:</span><span class="font-bold">${a.val}</span>
    </div>`).join('');
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function emptyState(msg){
  return `<div class="rounded-3xl border border-e-silver bg-e-cream p-6 text-sm text-e-dark flex items-center gap-3"><span class="text-2xl">👆</span><span>${msg}</span></div>`;
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.tab-btn').forEach(b=>b.addEventListener('click',()=>activateTab(b.dataset.tab)));
  document.getElementById('btnEvaluarDiagnostico').addEventListener('click',evaluateDiagnosis);
  document.getElementById('btnCalcularEconomico').addEventListener('click',calculateEconomic);
  document.getElementById('btnCopiarInforme').addEventListener('click',copyReport);
  document.getElementById('btnExportarPDF').addEventListener('click',exportPDF);
  document.getElementById('btnClearCache').addEventListener('click',()=>{
    if(confirm('¿Borrar todos los parámetros guardados y restablecer los valores por defecto?')){
      clearCache();
    }
  });
  renderCaseCards();renderDiagnosticChecks();renderRoute();renderDocs();
  renderRisk();renderStrategy();buildReport();renderParams();updateProgress();
});