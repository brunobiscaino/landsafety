// =============================================
// LandSafety — app.js (CORRIGIDO v2 — compatível com novo HTML)
// IDs mapeados para: app-screen, user-nome, offline-badge,
// f-inicio-data, f-inicio-hora, f-contratada, isp-checklist,
// historico-lista, colabs-lista, users-lista, kpi-total/nc/ncgv/isp
// =============================================

let sb = null;
let isOnline = navigator.onLine;
let offlineQueue = JSON.parse(localStorage.getItem('sgoe_queue') || '[]');
let colaboradores = [];
let inspections = [];
let chartNC = null, chartISP = null;
const CICLO_DIAS = 30;

// =============================================
// CHECKLIST ISP — 97 itens
// =============================================
const ISP_GRAVISSIMAS = [
  {id:'GV01',text:'Durante a execução das tarefas os colaboradores estão sem adornos?'},
  {id:'GV02',text:'Durante a execução da tarefa as regras de ouro foram aplicadas na sequência correta? DESLIGAR, BLOQUEAR, TESTAR, ATERRAR, SINALIZAR E PROTEGER.'},
  {id:'GV03',text:'Os supervisores/colaboradores estão atentos à execução das tarefas?'},
  {id:'GV04',text:'Foi emitida "OS" ou outra autorização para execução da tarefa?'},
  {id:'GV05',text:'Os colaboradores são capacitados e autorizados para execução da tarefa?'},
  {id:'GV06',text:'Encontra-se sob controle do COI ou responsável da área (distribuidora) a tarefa e respectiva equipe?'},
  {id:'GV07',text:'A APR foi devidamente preenchida e contempla todos os riscos associados à atividade?'},
  {id:'GV08',text:'Foi criada a área de trabalho específica da equipe (trabalho entre dois aterramentos)?'},
  {id:'GV09',text:'Consumir bebida alcoólica ou qualquer agente com substância psicoativa durante a condução de veículos e/ou na execução das atividades.'},
  {id:'GV10',text:'O procedimento para içamento de equipamentos/ferramentas/máquinas está sendo cumprido?'},
  {id:'GV11',text:'Usar vestimentas inapropriadas/danificadas durante a execução de atividades de risco ou no SEP.'},
  {id:'GV12',text:'Durante a execução da tarefa todos estão usando luvas isolantes corretamente e de acordo com a classe de tensão?'},
  {id:'GV13',text:'Durante a execução da tarefa todos estão usando talabarte de acordo com a tarefa?'},
  {id:'GV14',text:'Durante a execução da tarefa a equipe está utilizando uma balaclava?'},
  {id:'GV15',text:'Durante a execução da tarefa todos estão usando cinto paraquedista?'},
  {id:'GV16',text:'Durante a execução da tarefa todos estão usando luvas de vaqueta?'},
  {id:'GV17',text:'Durante a execução da tarefa todos estão usando capacete com jugular passada?'},
  {id:'GV18',text:'Durante a execução com exposição ao sol a equipe está utilizando protetor solar FPS 30 ou 60?'},
  {id:'GV19',text:'Durante a execução todos estão usando manga isolante corretamente e de acordo com a classe de tensão?'},
  {id:'GV20',text:'Durante a execução a equipe está utilizando protetor facial, conforme ambiente de trabalho?'},
  {id:'GV21',text:'Antes de iniciar a tarefa a equipe obtém a validade dos ensaios de luvas/mangas isolantes?'},
  {id:'GV22',text:'Os ensaios dos EPIs estão em dia?'},
  {id:'GV23',text:'Durante a execução a equipe está fazendo uso do conjunto de aterramento rápido e temporário de acordo com a tensão?'},
  {id:'GV24',text:'Durante a execução a equipe está fazendo uso do freio ABS ou Descensor?'},
  {id:'GV25',text:'Os ensaios dos EPCs estão em dia?'},
  {id:'GV26',text:'As ferramentas estão de acordo com a NR 10?'},
  {id:'GV27',text:'Durante a execução a equipe está fazendo uso de linha de vida?'},
  {id:'GV28',text:'O colaborador responsável da motosserra/motopoda possui treinamento?'},
  {id:'GV29',text:'Os serviços de poda em linha viva foram realizados dentro da cesta aérea?'},
  {id:'GV30',text:'Durante a execução a equipe está fazendo uso da cobertura para condutor isolado para 36 kV?'},
  {id:'GV31',text:'Durante a execução a equipe está fazendo uso da cobertura para isolador de suspensão para 36 kV?'},
  {id:'GV32',text:'Durante a execução a equipe está fazendo uso de cobertura circular para poste isolado, conforme a classe de tensão?'},
  {id:'GV33',text:'Durante a execução a equipe está fazendo uso de cruzeta auxiliar (mão francesa)?'},
  {id:'GV34',text:'Durante a execução a equipe está fazendo o uso do aterramento para veículo?'},
  {id:'GV35',text:'Existem pessoas em contato com o caminho durante a execução da tarefa?'},
  {id:'GV36',text:'Durante a execução está sendo utilizada a banqueta isolada?'},
  {id:'GV37',text:'Durante a execução a equipe está fazendo uso da cobertura para cruzeta até 36 kV?'},
  {id:'GV38',text:'Durante a execução a equipe está usando kit de resgate?'},
  {id:'GV39',text:'Durante a execução a equipe está usando cobertura circular, conforme a proteção necessária?'},
  {id:'GV40',text:'Durante a execução a equipe está fazendo uso da cobertura para chave fusível isolada para 25 kV?'},
  {id:'GV41',text:'Durante a execução a equipe está usando coberturas específicas sem deixar aberturas entre elas?'},
];
const ISP_GRAVES = [
  {id:'G01',text:'Durante a execução, área de trabalho encontra-se isolada e sinalizada?'},
  {id:'G02',text:'A tarefa está sendo realizada com no mínimo dois colaboradores?'},
  {id:'G03',text:'Todos estão usando vestimenta FR conforme NR 10 no SEP?'},
  {id:'G04',text:'Usar vestimentas RF com as faixas refletivas danificadas.'},
  {id:'G05',text:'Todos os colaboradores estão utilizando o uniforme por dentro?'},
  {id:'G06',text:'Durante a execução com motosserra/motopoda a equipe está utilizando calça anticorte motosserrista?'},
  {id:'G07',text:'Durante a execução com insetos a equipe está utilizando macacão de apicultor com tela fina?'},
  {id:'G08',text:'Durante a execução a equipe está utilizando perneira, conforme ambiente de trabalho?'},
  {id:'G09',text:'Durante a execução, as luvas isolantes estão protegidas por luvas de cobertura?'},
  {id:'G10',text:'Durante a execução todos estão usando óculos de segurança?'},
  {id:'G11',text:'Durante a execução todos estão usando trava-queda?'},
  {id:'G12',text:'Durante a execução todos estão usando calçado de segurança?'},
  {id:'G13',text:'Durante a execução a equipe está utilizando protetor auricular, conforme ambiente de trabalho?'},
  {id:'G14',text:'Durante a execução a equipe está usando o dispositivo anti-queda de cartucho (DAQC)?'},
  {id:'G15',text:'Durante a execução a equipe está utilizando a corda para içar ferramentas e materiais?'},
  {id:'G16',text:'Durante a execução a equipe está fazendo uso do detector de tensão de acordo com a tensão?'},
  {id:'G17',text:'Durante a execução a equipe está usando placas de sinalização conforme procedimento?'},
  {id:'G18',text:'Durante a execução a equipe está usando sinalizador luminoso rotativo GIROFLEX?'},
  {id:'G19',text:'Durante a execução a equipe está usando vara de manobra em fibra de vidro?'},
  {id:'G20',text:'Durante a execução a equipe está usando bastão pega tudo?'},
  {id:'G21',text:'Todos os cones estão em bom estado de conservação?'},
  {id:'G22',text:'Arremessar materiais e/ou equipamentos entre o executor e o eletricista do solo.'},
  {id:'G23',text:'Não usar corda/bastão guia na movimentação de carga.'},
  {id:'G24',text:'Não utilização de EPI ou EPC homologados pelo Grupo Equatorial (quando previsto em contrato).'},
  {id:'G25',text:'Usar chapéu ou osso junto com o capacete de segurança.'},
  {id:'G26',text:'Durante a execução a escada está devidamente amarrada no topo e na base?'},
  {id:'G27',text:'As escadas estão compatíveis com a tarefa em execução?'},
  {id:'G28',text:'Durante o uso da escada foram observadas as condições da roldana?'},
  {id:'G29',text:'Durante o uso da escada foi observada a utilização de cordas e as condições das mesmas?'},
  {id:'G30',text:'Durante o uso da escada os degraus apresentavam defeitos de fixação ou sinais de falha estrutural?'},
  {id:'G31',text:'Durante o uso da escada a sapata e a ponteira de borracha apresentaram defeitos de fixação ou sinais de falha estrutural?'},
  {id:'G32',text:'Durante o uso da escada existem farpas, lascas, fissuras ou falhas de fixação nos montantes?'},
  {id:'G33',text:'Durante o uso da escada as catracas para travamento estão bem inseridas e suas molas funcionando?'},
  {id:'G34',text:'Durante a execução ocorreram rupturas nos estropos?'},
  {id:'G35',text:'Durante a execução o operador está verificando a capacidade dos estropos e eslingas?'},
  {id:'G36',text:'Durante a execução o estropo está sendo improvisado?'},
  {id:'G37',text:'Durante a execução foram observados maus tratos e nós nos estropos?'},
  {id:'G38',text:'Durante a execução o operador da motosserra/motopoda está portando licença ambiental?'},
  {id:'G39',text:'Durante a execução o operador da motosserra/motopoda está com os EPIs adequados?'},
  {id:'G40',text:'Os resíduos provenientes do serviço de poda foram coletados?'},
  {id:'G41',text:'Durante a execução foram adotadas medidas de controle para os galhos próximos ou em contato com a rede energizada?'},
  {id:'G42',text:'Os trabalhadores realizaram revezamento para trabalhos no cesto aéreo durante a execução da tarefa?'},
  {id:'G43',text:'Durante a execução a equipe está fazendo uso da cobertura rígida para poste isolado para 36,6 kV?'},
  {id:'G44',text:'Durante a execução a equipe está fazendo uso da cobertura para isolador de pino para 25 kV?'},
  {id:'G45',text:'Durante a execução a equipe está usando o indicador de ausência de tensão?'},
  {id:'G46',text:'Durante a execução a equipe está utilizando pregadores no fim das coberturas?'},
  {id:'G47',text:'A equipe fez a medição da corrente do circuito para escolha adequada do bypass?'},
];
const ISP_LEVES = [
  {id:'L01',text:'Durante a execução os empregados estão agindo com organização e calma?'},
  {id:'L02',text:'Os colaboradores possuem crachá à disposição?'},
  {id:'L03',text:'Após a realização da tarefa o local está sendo limpo?'},
  {id:'L04',text:'Durante a operação a equipe estava usando bandeirola em cor vermelha para sinalização de cada escada?'},
  {id:'L05',text:'Os EPI/EPC/materiais/ferramentas/máquinas estão devidamente acondicionados para o transporte?'},
  {id:'L06',text:'Durante a execução todos os equipamentos/ferramentas/máquinas estão em condições de uso?'},
  {id:'L07',text:'A escada está sendo transportada, manuseada e utilizada corretamente?'},
  {id:'L08',text:'Durante a execução o material da poda não impede o livre trânsito de pedestres, veículos e acesso a imóveis?'},
  {id:'L09',text:'Os trabalhadores estão em local seguro, livres de queda de material da poda?'},
];
// =============================================
// PERFIS E USUÁRIOS
// =============================================
const PERFIS = {
  admin:       { label:'Administrador', canDelete:true,  canEdit:true,  canExport:true  },
  gestor:      { label:'Gestor',        canDelete:false, canEdit:true,  canExport:true  },
  inspetor:    { label:'Inspetor',      canDelete:false, canEdit:false, canExport:false },
  supervisor:  { label:'Supervisor',    canDelete:false, canEdit:false, canExport:false },
  visualizador:{ label:'Visualizador',  canDelete:false, canEdit:false, canExport:true  },
};
let currentUser = null;

function getUsuarios() {
  const s = localStorage.getItem('landsafety_usuarios');
  if (s) return JSON.parse(s);
  return [{ matricula:'admin', senha:'land2025', nome:'Administrador', perfil:'admin' }];
}
function salvarUsuarios(lista) { localStorage.setItem('landsafety_usuarios', JSON.stringify(lista)); }
function getPerfil(key) { return PERFIS[key] || PERFIS.visualizador; }
function canDelete() { return !!(currentUser && getPerfil(currentUser.perfil).canDelete); }
function canEdit()   { return !!(currentUser && getPerfil(currentUser.perfil).canEdit);   }
function canExport() { return !!(currentUser && getPerfil(currentUser.perfil).canExport); }
function isAdmin()   { return currentUser?.perfil === 'admin'; }

// =============================================
// LOGIN / LOGOUT
// =============================================
function doLogin() {
  const mat   = (document.getElementById('login-mat').value   || '').trim();
  const senha = (document.getElementById('login-senha').value || '').trim();
  let erroEl = document.getElementById('login-erro');
  if (!erroEl) {
    erroEl = document.createElement('div');
    erroEl.id = 'login-erro';
    erroEl.style.cssText = 'display:none;color:#ff6b6b;font-size:13px;margin-top:10px;padding:8px 12px;background:rgba(255,100,100,0.15);border-radius:6px;border:1px solid rgba(255,100,100,0.3)';
    const btn = document.querySelector('#login-screen button');
    if (btn && btn.parentNode) btn.parentNode.insertBefore(erroEl, btn.nextSibling);
  }
  erroEl.style.display = 'none';
  if (!mat || !senha) { erroEl.textContent = 'Preencha matrícula e senha.'; erroEl.style.display='block'; return; }
  const user = getUsuarios().find(u => u.matricula.toLowerCase()===mat.toLowerCase() && u.senha===senha);
  if (!user) { erroEl.textContent = 'Matrícula ou senha incorreta.'; erroEl.style.display='block'; return; }
  currentUser = user;
  sessionStorage.setItem('landsafety_session', JSON.stringify(user));
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app-screen').style.display   = 'block';
  const nomeEl = document.getElementById('user-nome');
  if (nomeEl) nomeEl.textContent = user.nome + ' · ' + getPerfil(user.perfil).label;
  init();
}

function doLogout() {
  currentUser = null;
  sessionStorage.removeItem('landsafety_session');
  document.getElementById('app-screen').style.display  = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-mat').value  = '';
  document.getElementById('login-senha').value = '';
}

window.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('landsafety_session');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('app-screen').style.display   = 'block';
      const nomeEl = document.getElementById('user-nome');
      if (nomeEl) nomeEl.textContent = currentUser.nome + ' · ' + getPerfil(currentUser.perfil).label;
      init();
    } catch(e) { /* sessão inválida */ }
  }
});

// =============================================
// INIT
// =============================================
async function init() {
  registerSW();
  initSupabase();
  setupOnlineListeners();
  initForm();
  await loadData();
  renderDashboard();
  renderHistorico();
  renderColabs();
  renderUsers();
}

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(()=>{});
    navigator.serviceWorker.addEventListener('message', e => { if(e.data?.type==='SYNC_NOW') syncQueue(); });
  }
}

function initSupabase() {
  if (typeof SUPABASE_URL === 'undefined' || SUPABASE_URL.includes('COLE_SEU')) return;
  try { sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } catch(e) {}
}

function setupOnlineListeners() {
  const update = () => {
    isOnline = navigator.onLine;
    const b = document.getElementById('offline-badge');
    if (!b) return;
    if (!isOnline) { b.style.display='inline-block'; b.textContent='OFFLINE'; }
    else if (offlineQueue.length > 0) { b.style.display='inline-block'; b.textContent=offlineQueue.length+' pendente(s)'; }
    else { b.style.display='none'; }
    if (isOnline && offlineQueue.length > 0) syncQueue();
  };
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

// =============================================
// DADOS SUPABASE / LOCAL
// =============================================
async function loadData() {
  if (!sb) {
    colaboradores = JSON.parse(localStorage.getItem('sgoe_colabs')      || '[]');
    inspections   = JSON.parse(localStorage.getItem('sgoe_inspections') || '[]');
    populateSelects(); return;
  }
  try {
    const { data: cols, error: e1 } = await sb.from('colaboradores').select('*').order('nome');
    if (e1) throw e1;
    colaboradores = cols || [];
    localStorage.setItem('sgoe_colabs', JSON.stringify(colaboradores));
  } catch(e) { colaboradores = JSON.parse(localStorage.getItem('sgoe_colabs') || '[]'); }
  try {
    const { data: insps, error: e2 } = await sb.from('inspecoes').select('*, nao_conformidades(*)').order('created_at',{ascending:false});
    if (e2) throw e2;
    const totalItens = ISP_GRAVISSIMAS.length + ISP_GRAVES.length + ISP_LEVES.length;
    inspections = (insps||[]).map(i => ({
      ...i, ncs: i.nao_conformidades||[],
      tz: i.tolerancia_zero, colabNome: i.colab_nome||'-',
      inspetorNome: i.inspetor_nome||'-', local: i.local_insp||i.local||'—', totalItens,
    }));
    localStorage.setItem('sgoe_inspections', JSON.stringify(inspections));
  } catch(e) { inspections = JSON.parse(localStorage.getItem('sgoe_inspections') || '[]'); }
  populateSelects();
}

async function saveToSupabase(insp) {
  if (!sb) return false;
  try {
    const { data: row, error } = await sb.from('inspecoes').insert([{
      data: insp.data, hora: insp.hora, inspetor_nome: insp.inspetorNome,
      colab_nome: insp.colabNome, contratada: insp.contratada,
      local_insp: insp.local, atividade: insp.atividade,
      total_ncs: insp.ncs.length, tolerancia_zero: insp.tz,
      status: insp.status, observacoes: insp.obs,
    }]).select().single();
    if (error) throw error;
    if (insp.ncs.length > 0) {
      await sb.from('nao_conformidades').insert(insp.ncs.map(nc=>({
        inspecao_id: row.id, categoria: nc.categoria, pergunta: nc.pergunta, desvio: nc.desvio, tolerancia_zero: nc.tz,
      })));
    }
    return true;
  } catch(e) { return false; }
}

async function syncQueue() {
  if (!isOnline || offlineQueue.length===0) return;
  const pending = [...offlineQueue], saved = [];
  for (const insp of pending) { if (await saveToSupabase(insp)) { saved.push(insp.id); inspections.unshift({...insp,synced:true}); } }
  offlineQueue = offlineQueue.filter(i=>!saved.includes(i.id));
  localStorage.setItem('sgoe_queue',       JSON.stringify(offlineQueue));
  localStorage.setItem('sgoe_inspections', JSON.stringify(inspections));
  setupOnlineListeners(); renderHistorico(); renderDashboard();
}
// =============================================
// FORMULÁRIO — NOVA INSPEÇÃO
// =============================================
let checkState = {};
let empregados = [];

function initForm() {
  const d = new Date();
  const ed = document.getElementById('f-inicio-data'); if(ed) ed.value = d.toISOString().split('T')[0];
  const eh = document.getElementById('f-inicio-hora'); if(eh) eh.value = d.toTimeString().slice(0,5);
  checkState = {};
  empregados = [];
  renderEmpregados();
  const cont = document.getElementById('isp-checklist');
  if (!cont) return;
  cont.innerHTML = '';
  const bar = document.getElementById('nc-alert-bar');
  if (bar) bar.style.display = 'none';

  const secoes = [
    {key:'gravissimas', itens:ISP_GRAVISSIMAS, label:'Gravíssimas ('+ISP_GRAVISSIMAS.length+')', cor:'#b91c1c', bg:'#fef2f2', borda:'#fca5a5'},
    {key:'graves',      itens:ISP_GRAVES,      label:'Graves ('     +ISP_GRAVES.length     +')', cor:'#92400e', bg:'#fffbeb', borda:'#fcd34d'},
    {key:'leves',       itens:ISP_LEVES,       label:'Leves ('      +ISP_LEVES.length      +')', cor:'#065f46', bg:'#f0fdf4', borda:'#86efac'},
  ];

  secoes.forEach(sec => {
    checkState[sec.key] = {};
    const div = document.createElement('div');
    div.style.cssText = 'border:1px solid '+sec.borda+';border-radius:10px;margin-bottom:14px;overflow:hidden;';
    div.innerHTML =
      '<div style="background:'+sec.bg+';padding:11px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;" onclick="toggleSecao('body-'+sec.key+'')">' +
        '<span style="font-weight:700;color:'+sec.cor+';font-size:13px;">'+sec.label+'</span>' +
        '<span id="badge-'+sec.key+'" style="font-size:11px;font-weight:700;color:'+sec.cor+';background:#fff;padding:2px 10px;border-radius:20px;border:1px solid '+sec.borda+'">0 NC</span>' +
      '</div>' +
      '<div id="body-'+sec.key+'" style="display:none;padding:6px 16px 12px;">' +
        sec.itens.map(function(item) { return (
          '<div style="padding:10px 0;border-bottom:1px solid #f3f4f6;">' +
            '<div style="font-size:12px;color:#374151;margin-bottom:6px;">' +
              '<span style="font-size:10px;font-weight:700;color:'+sec.cor+';margin-right:5px;">'+item.id+'</span>'+item.text+
            '</div>' +
            '<div style="display:flex;gap:18px;flex-wrap:wrap;">' +
              '<label style="display:flex;align-items:center;gap:5px;font-size:12px;cursor:pointer;"><input type="radio" name="isp-'+item.id+'" value="C" onchange="onISP(''+item.id+'',''+sec.key+'','C')"> <span style="color:#065f46;font-weight:500;">C — Conforme</span></label>' +
              '<label style="display:flex;align-items:center;gap:5px;font-size:12px;cursor:pointer;"><input type="radio" name="isp-'+item.id+'" value="NC" onchange="onISP(''+item.id+'',''+sec.key+'','NC')"> <span style="color:#b91c1c;font-weight:500;">NC — Não Conforme</span></label>' +
              '<label style="display:flex;align-items:center;gap:5px;font-size:12px;cursor:pointer;"><input type="radio" name="isp-'+item.id+'" value="NA" onchange="onISP(''+item.id+'',''+sec.key+'','NA')"> <span style="color:#6b7280;font-weight:500;">NA — Não Aplica</span></label>' +
            '</div>' +
            '<div id="nc-extra-'+item.id+'" style="display:none;margin-top:6px;padding:7px 10px;background:'+sec.bg+';border-radius:6px;border:1px solid '+sec.borda+';font-size:11px;color:'+sec.cor+';font-weight:600;">⚠️ NC registrada: '+item.id+'</div>' +
          '</div>'
        ); }).join('') +
      '</div>';
    cont.appendChild(div);
  });
}

function toggleSecao(id) { const b=document.getElementById(id); if(b) b.style.display=b.style.display==='none'?'block':'none'; }

function onISP(itemId, secKey, status) {
  if (!checkState[secKey]) checkState[secKey]={};
  checkState[secKey][itemId] = status;
  const ex = document.getElementById('nc-extra-'+itemId);
  if (ex) ex.style.display = status==='NC'?'block':'none';
  updateBadge(secKey);
  updateNcAlert();
  renderPlanoAcao();
}

function countNC(secKey) { return Object.values(checkState[secKey]||{}).filter(v=>v==='NC').length; }

function updateBadge(secKey) {
  const n=countNC(secKey), b=document.getElementById('badge-'+secKey);
  if (!b) return;
  b.textContent = n+' NC';
  b.style.background = n>0?'#fee2e2':'#fff';
}

function updateNcAlert() {
  const gv=countNC('gravissimas'), total=gv+countNC('graves')+countNC('leves');
  let bar=document.getElementById('nc-alert-bar');
  if (!bar) {
    bar=document.createElement('div'); bar.id='nc-alert-bar';
    bar.style.cssText='display:none;padding:10px 16px;border-radius:8px;margin-bottom:12px;font-size:13px;font-weight:600;align-items:center;gap:8px;';
    const cont=document.getElementById('isp-checklist');
    if (cont && cont.parentNode) cont.parentNode.insertBefore(bar,cont);
  }
  if (total===0){bar.style.display='none';return;}
  bar.style.display='flex';
  bar.style.cssText += (gv>0?'background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;':'background:#fef3c7;color:#92400e;border:1px solid #fcd34d;');
  bar.innerHTML='<i class="ti ti-alert-triangle"></i> '+total+' NC'+(total>1?'s':'')+' marcada'+(total>1?'s':'')+(gv>0?' · ⚠️ '+gv+' GRAVÍSSIMA'+(gv>1?'S':'')+'!':'');
}

function collectNCs() {
  const ncs=[], rot={gravissimas:'Gravíssima',graves:'Grave',leves:'Leve'};
  const its={gravissimas:ISP_GRAVISSIMAS,graves:ISP_GRAVES,leves:ISP_LEVES};
  ['gravissimas','graves','leves'].forEach(sec=>{
    its[sec].forEach(item=>{
      if (checkState[sec]&&checkState[sec][item.id]==='NC')
        ncs.push({categoria:rot[sec],catId:sec,pergunta:item.text,desvio:item.id+' — NC',tz:false});
    });
  });
  return ncs;
}

function renderPlanoAcao() {
  const wrap=document.getElementById('plano-acao-lista'); if(!wrap) return;
  const ncs=collectNCs();
  if (ncs.length===0){wrap.innerHTML='<p style="color:#6b7280;font-size:13px;">Nenhuma NC marcada ainda.</p>';return;}
  wrap.innerHTML=ncs.map((nc,i)=>
    '<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:10px 14px;margin-bottom:8px;font-size:12px;">' +
      '<div style="font-weight:700;color:#b91c1c;margin-bottom:4px;">['+nc.categoria+'] '+nc.desvio+'</div>' +
      '<div style="color:#374151;">'+nc.pergunta+'</div>' +
    '</div>'
  ).join('');
}

function populateSelects() {
  ['f-inspetor','f-supervisor-contratante','f-supervisor-remo'].forEach(id=>{
    const el=document.getElementById(id); if(!el) return;
    const cur=el.value;
    el.innerHTML='<option value="">Selecione...</option>'+colaboradores.map(c=>'<option value="'+c.id+'">'+c.nome+(c.cargo?' ('+c.cargo+')':'')+'</option>').join('');
    if(cur) el.value=cur;
  });
}

// Empregados inspecionados (tabela dinâmica)
function renderEmpregados() {
  const tbody=document.getElementById('empregados-tbody'); if(!tbody) return;
  if (empregados.length===0){tbody.innerHTML='<tr><td colspan="4" style="text-align:center;color:#9ca3af;font-size:12px;padding:12px;">Nenhum empregado adicionado.</td></tr>';return;}
  tbody.innerHTML=empregados.map((e,i)=>
    '<tr>' +
      '<td>'+( i+1)+'</td>' +
      '<td>'+e.nome+'</td>' +
      '<td>'+e.funcao+'</td>' +
      '<td><button class="btn btn-sm btn-outline-danger" onclick="removerEmpregado('+i+')"><i class="ti ti-x"></i></button></td>' +
    '</tr>'
  ).join('');
}

function adicionarEmpregado() {
  const nome=(prompt('Nome do empregado:')||'').trim();
  if(!nome) return;
  const funcao=(prompt('Função:')||'').trim();
  empregados.push({nome,funcao});
  renderEmpregados();
}

function removerEmpregado(idx) { empregados.splice(idx,1); renderEmpregados(); }
// =============================================
// SALVAR INSPEÇÃO
// =============================================
async function saveInspection() {
  const contratada=(document.getElementById('f-contratada')?.value||'').trim();
  if (!contratada){showToast('Informe a contratada.','warn');return;}
  const ncs=collectNCs(), tz=ncs.some(n=>n.tz);
  const totalItens=ISP_GRAVISSIMAS.length+ISP_GRAVES.length+ISP_LEVES.length;
  const inspEl=document.getElementById('f-inspetor');
  const insp={
    id:'INS-'+Date.now().toString().slice(-8),
    data:  document.getElementById('f-inicio-data')?.value||'',
    hora:  document.getElementById('f-inicio-hora')?.value||'',
    dataFim: document.getElementById('f-termino-data')?.value||null,
    horaFim: document.getElementById('f-termino-hora')?.value||null,
    duracao: document.getElementById('f-duracao')?.value||null,
    hpri:    document.getElementById('f-hpri')?.value||null,
    nae:     document.getElementById('f-nae')?.value||null,
    orgao:   document.getElementById('f-orgao')?.value||'',
    base:    document.getElementById('f-base')?.value||'',
    local:   document.getElementById('f-local')?.value||'—',
    processo:document.getElementById('f-processo')?.value||'',
    atividade:document.getElementById('f-atividade')?.value||'',
    tipoInspecao:document.getElementById('f-tipo-inspecao')?.value||'',
    subtipo:     document.getElementById('f-subtipo')?.value||'',
    contratada,
    inspetorNome: inspEl?.options[inspEl.selectedIndex]?.text||'-',
    supervisorContratante:(()=>{const el=document.getElementById('f-supervisor-contratante');return el?.options[el.selectedIndex]?.text||'-';})(),
    supervisorRemo:(()=>{const el=document.getElementById('f-supervisor-remo');return el?.options[el.selectedIndex]?.text||'-';})(),
    colabNome: empregados.map(e=>e.nome).join(', ')||'-',
    obs: document.getElementById('f-observacao')?.value||'',
    ncs, totalItens, tz,
    status: ncs.length===0?'encerrada':'aberta',
    synced:false,
  };
  const btn=document.querySelector('[onclick="saveInspection()"]');
  if(btn){btn.disabled=true;btn.innerHTML='<i class="ti ti-loader"></i> Salvando...';}
  let saved=false;
  if (isOnline&&sb) { saved=await saveToSupabase(insp); }
  if (saved){insp.synced=true;inspections.unshift(insp);}
  else{offlineQueue.push(insp);localStorage.setItem('sgoe_queue',JSON.stringify(offlineQueue));}
  localStorage.setItem('sgoe_inspections',JSON.stringify(inspections));
  if(btn){btn.disabled=false;btn.innerHTML='<i class="ti ti-device-floppy"></i> SALVAR INSPEÇÃO';}
  setupOnlineListeners(); clearForm(); showTab('historico'); renderHistorico(); renderDashboard();
  showToast(saved?'Inspeção salva com sucesso!':'Salvo offline — será sincronizado.', saved?'success':'warn');
}

function clearForm() {
  ['f-orgao','f-base','f-local','f-processo','f-atividade','f-contratada',
   'f-duracao','f-hpri','f-nae','f-observacao','f-termino-data','f-termino-hora'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  ['f-tipo-inspecao','f-subtipo','f-inspetor','f-supervisor-contratante','f-supervisor-remo'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const bar=document.getElementById('nc-alert-bar'); if(bar)bar.style.display='none';
  const plano=document.getElementById('plano-acao-lista'); if(plano)plano.innerHTML='';
  initForm();
}

// =============================================
// HISTÓRICO
// =============================================
function renderHistorico() {
  const all=[...inspections,...offlineQueue.map(i=>({...i,synced:false}))];
  const wrap=document.getElementById('historico-lista'); if(!wrap) return;
  if(all.length===0){wrap.innerHTML='<div style="text-align:center;padding:50px 20px;color:#9ca3af;"><i class="ti ti-clipboard-off" style="font-size:40px;"></i><br><br>Nenhuma inspeção registrada.</div>';return;}
  const stC={aberta:'#dc2626',adequando:'#d97706',encerrada:'#16a34a'};
  const stL={aberta:'Aberta',adequando:'Em adequação',encerrada:'Encerrada'};
  wrap.innerHTML=all.map(i=>
    '<div style="background:#1e293b;border:1px solid #334155;border-radius:10px;padding:16px;margin-bottom:10px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">' +
        '<div style="flex:1;">' +
          '<div style="font-size:11px;color:#94a3b8;">' +i.id+' · '+i.data+' '+(i.hora||'')+(i.synced===false?'<span style="margin-left:8px;font-size:10px;background:#450a0a;color:#fca5a5;padding:1px 7px;border-radius:10px;">offline</span>':'')+'</div>'+
          '<div style="font-weight:700;font-size:15px;color:#f1f5f9;margin-top:4px;">'+(i.contratada||i.empresa||'—')+'</div>'+
          '<div style="font-size:12px;color:#94a3b8;margin-top:3px;"><i class="ti ti-map-pin"></i> '+(i.local||'—')+'</div>'+
        '</div>'+
        '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">' +
          '<span style="font-size:11px;font-weight:600;padding:3px 12px;border-radius:20px;background:'+(stC[i.status]||'#dc2626')+'22;color:'+(stC[i.status]||'#dc2626')+';border:1px solid '+(stC[i.status]||'#dc2626')+'55;">'+(stL[i.status]||'Aberta')+'</span>'+
          '<div style="display:flex;gap:6px;">' +
            (canEdit()?'<button class="btn btn-sm btn-outline-secondary" onclick="cycleStatus(''+i.id+'')"><i class="ti ti-refresh"></i></button>':'')+
            '<button class="btn btn-sm btn-outline-info" onclick="verInspecao(''+i.id+'')"><i class="ti ti-eye"></i></button>'+
            (canDelete()?'<button class="btn btn-sm btn-outline-danger" onclick="excluirInspecao(''+i.id+'')"><i class="ti ti-trash"></i></button>':'')+
          '</div>'+
        '</div>'+
      '</div>'+
      '<div style="display:flex;flex-wrap:wrap;gap:10px;font-size:11px;color:#64748b;">' +
        '<span><i class="ti ti-alert-circle"></i> '+(i.ncs||[]).length+' NC'+(( i.ncs||[]).length!==1?'s':'')+'</span>'+
        '<span><i class="ti ti-shield"></i> '+(i.inspetorNome||'—')+'</span>'+
        '<span><i class="ti ti-tool"></i> '+(i.atividade||'—')+'</span>'+
      '</div>'+
      (i.tz?'<div style="margin-top:8px;padding:4px 10px;background:#450a0a;border-radius:6px;font-size:11px;color:#fca5a5;font-weight:600;"><i class="ti ti-alert-triangle"></i> Tolerância Zero detectada</div>':'')+
    '</div>'
  ).join('');
}

function verInspecao(id) {
  const i=inspections.find(x=>x.id===id)||offlineQueue.find(x=>x.id===id); if(!i) return;
  const titulo=document.getElementById('modal-ver-titulo'), corpo=document.getElementById('modal-ver-corpo');
  if(!titulo||!corpo) return;
  titulo.textContent='Inspeção '+i.id;
  const ncs=i.ncs||[];
  corpo.innerHTML=
    '<div style="font-size:13px;line-height:1.9;color:#e2e8f0;">'+
      '<div class="row g-2 mb-3">'+
        '<div class="col-md-4"><strong>Data:</strong> '+i.data+' '+(i.hora||'')+'</div>'+
        '<div class="col-md-4"><strong>Status:</strong> '+i.status+'</div>'+
        '<div class="col-md-4"><strong>Contratada:</strong> '+(i.contratada||'—')+'</div>'+
        '<div class="col-md-4"><strong>Local:</strong> '+(i.local||'—')+'</div>'+
        '<div class="col-md-4"><strong>Atividade:</strong> '+(i.atividade||'—')+'</div>'+
        '<div class="col-md-4"><strong>Inspetor:</strong> '+(i.inspetorNome||'—')+'</div>'+
        (i.obs?'<div class="col-12"><strong>Observações:</strong> '+i.obs+'</div>':'')+
      '</div>'+
      '<hr style="border-color:#334155;">'+
      '<strong>'+ncs.length+' Não Conformidade'+(ncs.length!==1?'s':'')+'</strong>'+
      (ncs.length===0?'<div style="color:#4ade80;margin-top:8px;"><i class="ti ti-check"></i> Nenhuma NC — inspeção conforme.</div>':
        '<ul style="margin-top:8px;">'+ncs.map(nc=>'<li><strong>['+nc.categoria+']</strong> '+nc.desvio+'</li>').join('')+'</ul>')+
    '</div>';
  const modal=new bootstrap.Modal(document.getElementById('modal-ver')); modal.show();
}

async function excluirInspecao(id) {
  if(!canDelete()){showToast('Sem permissão para excluir.','warn');return;}
  if(!confirm('Excluir esta inspeção permanentemente? Esta ação não pode ser desfeita.')) return;
  if(sb){await sb.from('nao_conformidades').delete().eq('inspecao_id',id);await sb.from('inspecoes').delete().eq('id',id);}
  inspections=inspections.filter(i=>i.id!==id);
  localStorage.setItem('sgoe_inspections',JSON.stringify(inspections));
  renderHistorico(); renderDashboard();
}

async function cycleStatus(id) {
  const i=inspections.find(x=>x.id===id); if(!i) return;
  const seq=['aberta','adequando','encerrada'];
  i.status=seq[(seq.indexOf(i.status)+1)%3];
  if(sb) await sb.from('inspecoes').update({status:i.status}).eq('id',id);
  localStorage.setItem('sgoe_inspections',JSON.stringify(inspections));
  renderHistorico(); renderDashboard();
}
// =============================================
// DASHBOARD
// =============================================
function renderDashboard() {
  const all=[...inspections];
  const total=all.length;
  const totalNcs=all.reduce((s,i)=>s+(i.ncs||[]).length,0);
  const ncGv=all.reduce((s,i)=>s+(i.ncs||[]).filter(n=>n.categoria==='Gravíssima').length,0);
  const totalItens=all.reduce((s,i)=>s+(i.totalItens||97),0);
  const isp=totalItens>0?Math.round(((totalItens-totalNcs)/totalItens)*100):100;
  const el=function(id){return document.getElementById(id);};
  if(el('kpi-total')) el('kpi-total').textContent=total;
  if(el('kpi-nc'))    el('kpi-nc').textContent=totalNcs;
  if(el('kpi-ncgv'))  el('kpi-ncgv').textContent=ncGv;
  if(el('kpi-isp'))   el('kpi-isp').textContent=isp+'%';
  const ultEl=el('ultimas-inspecoes');
  if (ultEl) {
    const ultimas=all.slice(0,5);
    if(ultimas.length===0){ultEl.innerHTML='<div style="color:#94a3b8;font-size:13px;padding:10px 0;">Nenhuma inspeção ainda.</div>';return;}
    ultEl.innerHTML='<div class="table-responsive"><table class="table table-sm table-dark" style="font-size:12px;"><thead><tr><th>ID</th><th>Data</th><th>Contratada</th><th>NCs</th><th>ISP%</th><th>Status</th></tr></thead><tbody>'+
      ultimas.map(i=>{
        const t=i.totalItens||97, n=(i.ncs||[]).length, p=Math.round(((t-n)/t)*100);
        return '<tr><td>'+i.id+'</td><td>'+i.data+'</td><td>'+(i.contratada||i.empresa||'—')+'</td><td style="color:'+(n>0?'#f87171':'#4ade80')+';font-weight:700;">'+n+'</td><td style="font-weight:700;">'+p+'%</td><td>'+i.status+'</td></tr>';
      }).join('')+
    '</tbody></table></div>';
  }
  const ctxNC=el('chart-nc'), ctxISP=el('chart-isp');
  if(!ctxNC||!ctxISP) return;
  const ult10=[...all].slice(0,10).reverse();
  const labels=ult10.map(i=>i.id.slice(-5));
  const vNC=ult10.map(i=>(i.ncs||[]).length);
  const vISP=ult10.map(i=>{const t=i.totalItens||97,n=(i.ncs||[]).length;return Math.round(((t-n)/t)*100);});
  if(chartNC)  chartNC.destroy();
  if(chartISP) chartISP.destroy();
  chartNC=new Chart(ctxNC.getContext('2d'),{
    type:'bar',data:{labels,datasets:[{data:vNC,backgroundColor:'#e24b4a',borderRadius:4}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1},grid:{color:'#1e293b'}},x:{grid:{color:'#1e293b'}}}}
  });
  chartISP=new Chart(ctxISP.getContext('2d'),{
    type:'line',data:{labels,datasets:[{data:vISP,borderColor:'#1d9e75',backgroundColor:'rgba(29,158,117,0.15)',tension:0.3,fill:true,pointRadius:4,pointBackgroundColor:'#1d9e75'}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{min:0,max:100,ticks:{callback:v=>v+'%'},grid:{color:'#1e293b'}},x:{grid:{color:'#1e293b'}}}}
  });
}

// =============================================
// COLABORADORES
// =============================================
function renderColabs() {
  const wrap=document.getElementById('colabs-lista'); if(!wrap) return;
  if(colaboradores.length===0){wrap.innerHTML='<div style="text-align:center;padding:40px;color:#9ca3af;"><i class="ti ti-users" style="font-size:36px;"></i><br><br>Nenhum colaborador cadastrado.<br><br><small>Use o botão "Importar CSV" para adicionar em massa.</small></div>';return;}
  wrap.innerHTML='<table class="table table-sm table-dark table-hover" style="font-size:13px;"><thead><tr><th>Nome</th><th>Matrícula</th><th>Cargo</th><th>Empresa</th><th></th></tr></thead><tbody>'+
    colaboradores.map(c=>
      '<tr>'+
        '<td style="font-weight:600;">'+c.nome+'</td>'+
        '<td style="color:#94a3b8;">'+(c.matricula||'—')+'</td>'+
        '<td>'+(c.cargo||'—')+'</td>'+
        '<td style="font-size:11px;color:#94a3b8;">'+(c.empresa||'—')+'</td>'+
        '<td><button class="btn btn-sm btn-outline-danger" onclick="removeColab(''+c.id+'')"><i class="ti ti-trash"></i></button></td>'+
      '</tr>'
    ).join('')+
  '</tbody></table>';
}

async function removeColab(id) {
  if(!confirm('Remover este colaborador?')) return;
  if(sb) await sb.from('colaboradores').delete().eq('id',id);
  colaboradores=colaboradores.filter(c=>c.id!==id);
  localStorage.setItem('sgoe_colabs',JSON.stringify(colaboradores));
  renderColabs(); populateSelects();
}

function importarCSVColabs(input) {
  const file=input.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=async function(ev){
    const lines=(ev.target.result).split(/?
/).filter(l=>l.trim());
    if(lines.length<2){showToast('CSV vazio ou sem dados.','warn');return;}
    const sep=lines[0].includes(';')?';':',';
    const clean=s=>(s||'').trim().replace(/^"|"$/g,'').trim();
    const norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'');
    const headers=lines[0].split(sep).map(h=>norm(clean(h)));
    const idx=keys=>{ for(const k of keys){const i=headers.findIndex(h=>h.includes(k));if(i>=0)return i;} return -1; };
    const iN=idx(['nome']), iM=idx(['matricula','mat','cpf']), iC=idx(['cargo','funcao','func']), iE=idx(['empresa','prestadora']), iCt=idx(['contrato']);
    if(iN<0){showToast('Coluna "Nome" não encontrada.','warn');return;}
    const batch=[];
    lines.slice(1).forEach(line=>{
      const cols=line.split(sep).map(clean);
      const nome=cols[iN]||''; if(!nome) return;
      batch.push({nome,matricula:iM>=0?cols[iM]:'',cargo:iC>=0?cols[iC]:'',empresa:iE>=0?cols[iE]:'',contrato:iCt>=0?cols[iCt]:'',ultima_insp_data:null});
    });
    if(sb){
      const{data,error}=await sb.from('colaboradores').insert(batch).select();
      if(!error&&data) colaboradores.push(...data);
      else if(error){showToast('Erro: '+error.message,'error');return;}
    } else {
      batch.forEach((c,i)=>{c.id='COL-'+Date.now().toString().slice(-6)+i;colaboradores.push(c);});
      localStorage.setItem('sgoe_colabs',JSON.stringify(colaboradores));
    }
    renderColabs(); populateSelects();
    showToast(batch.length+' colaborador(es) importado(s)!','success');
  };
  reader.readAsText(file,'utf-8');
  input.value='';
}

// =============================================
// USUÁRIOS
// =============================================
function renderUsers() {
  const wrap=document.getElementById('users-lista'); if(!wrap) return;
  const lista=getUsuarios();
  wrap.innerHTML='<table class="table table-sm table-dark" style="font-size:13px;"><thead><tr><th>Nome</th><th>Matrícula</th><th>Perfil</th><th></th></tr></thead><tbody>'+
    lista.map((u,i)=>
      '<tr>'+
        '<td style="font-weight:600;">'+u.nome+'</td>'+
        '<td style="color:#94a3b8;">'+u.matricula+'</td>'+
        '<td><span style="font-size:11px;background:#1e293b;border:1px solid #334155;padding:2px 8px;border-radius:10px;color:#94a3b8;">'+getPerfil(u.perfil).label+'</span></td>'+
        '<td>'+(u.matricula!=='admin'?'<button class="btn btn-sm btn-outline-danger" onclick="removeUser('+i+')"><i class="ti ti-trash"></i></button>':'')+'</td>'+
      '</tr>'
    ).join('')+
  '</tbody></table>';
}

function adicionarUsuario() {
  const nome=(document.getElementById('nu-nome')?.value||'').trim();
  const mat=(document.getElementById('nu-matricula')?.value||'').trim();
  const senha=(document.getElementById('nu-senha')?.value||'').trim();
  const perfil=(document.getElementById('nu-perfil')?.value||'').trim();
  if(!nome||!mat||!senha||!perfil){showToast('Preencha todos os campos.','warn');return;}
  const lista=getUsuarios();
  if(lista.find(u=>u.matricula.toLowerCase()===mat.toLowerCase())){showToast('Matrícula já cadastrada.','warn');return;}
  lista.push({nome,matricula:mat,senha,perfil});
  salvarUsuarios(lista);
  ['nu-nome','nu-matricula','nu-senha'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const pEl=document.getElementById('nu-perfil');if(pEl)pEl.value='';
  renderUsers(); showToast('Usuário adicionado!','success');
}

function removeUser(idx) {
  if(!confirm('Remover este usuário?')) return;
  const lista=getUsuarios(); lista.splice(idx,1); salvarUsuarios(lista); renderUsers();
}

function toggleSenha(btn) {
  const inp=btn.previousElementSibling; if(!inp) return;
  inp.type=inp.type==='password'?'text':'password';
  btn.innerHTML=inp.type==='password'?'<i class="ti ti-eye"></i>':'<i class="ti ti-eye-off"></i>';
}

// =============================================
// EXPORTAR CSV
// =============================================
function exportarCSV() {
  if(!canExport()){showToast('Sem permissão para exportar.','warn');return;}
  const ts=new Date().toISOString().slice(0,10);
  const q=v=>'"'+String(v||'').replace(/"/g,'""')+'"';
  const all=[...inspections,...offlineQueue];
  const rows=[['ID','Data','Hora','Inspetor','Contratada','Local','Atividade','Total NCs','ISP %','Status','Sincronizado']];
  all.forEach(i=>{
    const t=i.totalItens||97,n=(i.ncs||[]).length,p=Math.round(((t-n)/t)*100);
    rows.push([i.id,i.data,i.hora||'',i.inspetorNome||'',i.contratada||i.empresa||'',i.local||'',i.atividade||'',n,p+'%',i.status,i.synced?'Sim':'Não (offline)']);
  });
  const csv=rows.map(r=>r.map(q).join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='landsafety_'+ts+'.csv'; a.click();
}

// =============================================
// NAVEGAÇÃO
// =============================================
function showTab(t) {
  document.querySelectorAll('.tab-content').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(el=>el.classList.remove('active'));
  const sec=document.getElementById('tab-'+t); if(sec) sec.classList.add('active');
  document.querySelectorAll('.nav-link').forEach(el=>{if((el.getAttribute('onclick')||'').includes("'"+t+"'"))el.classList.add('active');});
  if(t==='dashboard')    renderDashboard();
  if(t==='historico')    renderHistorico();
  if(t==='colaboradores')renderColabs();
  if(t==='usuarios')     renderUsers();
}

// =============================================
// TOAST
// =============================================
function showToast(msg, tipo) {
  let el=document.getElementById('toast-msg'); if(!el) return;
  el.textContent=msg;
  const cores={success:'#16a34a',warn:'#d97706',error:'#dc2626'};
  el.style.cssText='position:fixed;bottom:24px;right:24px;z-index:9999;padding:12px 20px;border-radius:8px;font-size:13px;font-weight:600;color:#fff;background:'+(cores[tipo]||'#334155')+';box-shadow:0 4px 12px rgba(0,0,0,0.3);transition:opacity 0.3s;opacity:1;';
  clearTimeout(el._t);
  el._t=setTimeout(()=>{el.style.opacity='0';},3000);
}

// =============================================
// FOTO DE EQUIPE (placeholder)
// =============================================
function handleTeamPhoto(input) {
  const file=input.files[0]; if(!file) return;
  const prev=document.getElementById('team-photo-preview'); if(!prev) return;
  const reader=new FileReader();
  reader.onload=function(e){prev.innerHTML='<img src="'+e.target.result+'" style="max-width:100%;border-radius:8px;margin-top:8px;" alt="Foto da equipe">';};
  reader.readAsDataURL(file);
}