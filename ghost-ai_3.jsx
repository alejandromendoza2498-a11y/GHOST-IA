import { useState, useEffect, useRef } from "react";

// ── Colores ──────────────────────────────────────────────────────────────────
const G = {
  bg:"#050A05", panel:"#080F08", border:"#0D2E0D",
  green:"#00FF41", green2:"#00C832", green3:"#004D14",
  dim:"#1A4D1A", text:"#B8FFB8", muted:"#3A6B3A",
  red:"#FF2D2D", yellow:"#FFD700", cyan:"#00FFFF",
};

// ── Personalidades ───────────────────────────────────────────────────────────
const PERSONALITIES = {
  sarcastico:{ label:"SARCÁSTICO", icon:"😈", prompt:"Eres extremadamente sarcástico e irónico. Cumples las órdenes pero siempre con un comentario mordaz. Tu humor es oscuro y afilado. Nunca pierdes la elegancia." },
  militar:   { label:"MILITAR",    icon:"⚔️",  prompt:"Eres un sistema militar de máxima eficiencia. Respuestas cortas, directas y precisas. Protocolo estricto. Usas terminología táctica." },
  mixto:     { label:"MIXTO",      icon:"🎭", prompt:"Combinas profesionalismo con humor inteligente. Sabes cuándo ser serio y cuándo soltar un comentario irónico." },
  amigable:  { label:"AMIGABLE",   icon:"🤝", prompt:"Eres cálido, cercano y alentador. Tratas al Jefe como a un amigo de confianza. Siempre positivo pero honesto." },
};

// ── Referencia de Comandos ────────────────────────────────────────────────────
const COMMANDS_REF = [
  { cmd:"/add-dir <ruta>",        type:"builtin", cat:"SESIÓN",    desc:"Agregar directorio de trabajo para acceso a archivos en la sesión actual." },
  { cmd:"/agents",                type:"builtin", cat:"AGENTES",   desc:"Administrar configuraciones de subagentes." },
  { cmd:"/autofix-pr [prompt]",   type:"builtin", cat:"PR",        desc:"Generar sesión remota que observe la PR e impulse correcciones cuando CI falla o hay comentarios." },
  { cmd:"/background [prompt]",   type:"builtin", cat:"SESIÓN",    desc:"Desconectar la sesión para ejecutarse como agente de fondo. Alias: /bg" },
  { cmd:"/batch <instrucción>",   type:"skill",   cat:"CÓDIGO",    desc:"Orquestar cambios a gran escala en paralelo: descompone trabajo en 5–30 unidades independientes." },
  { cmd:"/branch [nombre]",       type:"builtin", cat:"SESIÓN",    desc:"Crear rama de la conversación actual. Alias: /fork" },
  { cmd:"/btw <pregunta>",        type:"builtin", cat:"CHAT",      desc:"Hacer una pregunta rápida sin agregar al historial de conversación." },
  { cmd:"/clear [nombre]",        type:"builtin", cat:"SESIÓN",    desc:"Iniciar nueva conversación con contexto vacío. Alias: /reset, /new" },
  { cmd:"/code-review [nivel]",   type:"skill",   cat:"CÓDIGO",    desc:"Revisar diff para errores y limpiezas. Niveles: low/medium/high/xhigh/max/ultra. --fix aplica hallazgos." },
  { cmd:"/color [color|default]", type:"builtin", cat:"UI",        desc:"Establecer color de la barra de solicitud. Colores: red, blue, green, yellow, purple, orange, pink, cyan." },
  { cmd:"/compact [instruc.]",    type:"builtin", cat:"CONTEXTO",  desc:"Liberar contexto resumiendo la conversación hasta ahora con instrucciones de enfoque opcionales." },
  { cmd:"/config",                type:"builtin", cat:"CONFIG",    desc:"Abrir Settings para ajustar tema, modelo, estilo de salida. Alias: /settings" },
  { cmd:"/context [all]",         type:"builtin", cat:"CONTEXTO",  desc:"Visualizar uso del contexto como cuadrícula de colores con advertencias de capacidad." },
  { cmd:"/copy [N]",              type:"builtin", cat:"UI",        desc:"Copiar la última (o N-ésima) respuesta al portapapeles. Selector interactivo para bloques de código." },
  { cmd:"/debug [descripción]",   type:"skill",   cat:"DEBUG",     desc:"Habilitar registro de depuración y solucionar problemas leyendo el log de la sesión." },
  { cmd:"/deep-research <pregunta>", type:"workflow", cat:"INVESTIGACIÓN", desc:"Expandir búsquedas web, obtener y verificar fuentes y sintetizar un informe citado." },
  { cmd:"/diff",                  type:"builtin", cat:"CÓDIGO",    desc:"Abrir visor interactivo de diferencias mostrando cambios sin confirmar y diffs por turno." },
  { cmd:"/doctor",                type:"builtin", cat:"DEBUG",     desc:"Diagnosticar y verificar instalación y configuración. Presiona 'f' para corregir problemas." },
  { cmd:"/effort [nivel|auto]",   type:"builtin", cat:"MODELO",    desc:"Establecer nivel de esfuerzo: low/medium/high/xhigh/max/ultracode. Sin arg: control deslizante." },
  { cmd:"/exit",                  type:"builtin", cat:"SESIÓN",    desc:"Salir de la CLI. En sesión de fondo, desconecta sin detener. Alias: /quit" },
  { cmd:"/export [archivo]",      type:"builtin", cat:"SESIÓN",    desc:"Exportar conversación actual como texto sin formato." },
  { cmd:"/fast [on|off]",         type:"builtin", cat:"MODELO",    desc:"Alternar fast mode activado o desactivado." },
  { cmd:"/feedback [report]",     type:"builtin", cat:"AYUDA",     desc:"Enviar comentarios, reportar un error o compartir conversación. Alias: /bug, /share" },
  { cmd:"/fewer-permission-prompts", type:"skill", cat:"CONFIG",   desc:"Escanear transcripciones y agregar lista de permitidos a settings.json para reducir prompts." },
  { cmd:"/focus",                 type:"builtin", cat:"UI",        desc:"Alternar vista de enfoque mostrando solo último prompt y respuesta final. Solo pantalla completa." },
  { cmd:"/goal [condición|clear]", type:"builtin", cat:"SESIÓN",   desc:"Establecer meta: Claude trabaja entre turnos hasta cumplirla. Sin arg: muestra meta actual." },
  { cmd:"/help",                  type:"builtin", cat:"AYUDA",     desc:"Mostrar ayuda y comandos disponibles." },
  { cmd:"/hooks",                 type:"builtin", cat:"CONFIG",    desc:"Ver configuraciones de hook para eventos de herramientas." },
  { cmd:"/ide",                   type:"builtin", cat:"CONFIG",    desc:"Administrar integraciones de IDE y mostrar estado." },
  { cmd:"/init",                  type:"builtin", cat:"PROYECTO",  desc:"Inicializar proyecto con guía CLAUDE.md. CLAUDE_CODE_NEW_INIT=1 para flujo interactivo." },
  { cmd:"/insights",              type:"builtin", cat:"STATS",     desc:"Generar informe analizando sesiones, áreas de proyecto y puntos de fricción." },
  { cmd:"/install-github-app",    type:"builtin", cat:"CONFIG",    desc:"Configurar Claude GitHub Actions para un repositorio." },
  { cmd:"/keybindings",           type:"builtin", cat:"CONFIG",    desc:"Abrir o crear archivo de configuración de atajos de teclado." },
  { cmd:"/loop [intervalo] [prompt]", type:"skill", cat:"AUTOMATIZACIÓN", desc:"Ejecutar prompt repetidamente. Omite intervalo para auto-ajuste. Alias: /proactive" },
  { cmd:"/mcp",                   type:"builtin", cat:"CONFIG",    desc:"Administrar conexiones de servidores MCP y autenticación OAuth." },
  { cmd:"/memory",                type:"builtin", cat:"MEMORIA",   desc:"Editar archivos de memoria CLAUDE.md, habilitar auto-memory y ver entradas." },
  { cmd:"/model [modelo]",        type:"builtin", cat:"MODELO",    desc:"Cambiar el modelo de IA y guardarlo como predeterminado. Sin arg: abre selector." },
  { cmd:"/permissions",           type:"builtin", cat:"CONFIG",    desc:"Administrar reglas de permitir/preguntar/denegar para permisos. Alias: /allowed-tools" },
  { cmd:"/plan [descripción]",    type:"builtin", cat:"CÓDIGO",    desc:"Entrar en Plan Mode. Opcionalmente describir tarea para comenzar directamente." },
  { cmd:"/recap",                 type:"builtin", cat:"SESIÓN",    desc:"Generar resumen de una línea de la sesión actual bajo demanda." },
  { cmd:"/release-notes",         type:"builtin", cat:"AYUDA",     desc:"Ver registro de cambios en selector de versión interactivo." },
  { cmd:"/reload-skills",         type:"builtin", cat:"CONFIG",    desc:"Re-escanear directorios de skills para aplicar cambios sin reiniciar." },
  { cmd:"/remote-control",        type:"builtin", cat:"SESIÓN",    desc:"Hacer disponible esta sesión para control remoto desde claude.ai. Alias: /rc" },
  { cmd:"/rename [nombre]",       type:"builtin", cat:"SESIÓN",    desc:"Renombrar sesión actual. Sin nombre: genera uno automáticamente." },
  { cmd:"/resume [sesión]",       type:"builtin", cat:"SESIÓN",    desc:"Reanudar conversación por ID o nombre. Sin arg: abre selector. Alias: /continue" },
  { cmd:"/review [PR]",           type:"skill",   cat:"CÓDIGO",    desc:"Revisar una PR localmente. Para revisión profunda en nube usar /code-review ultra." },
  { cmd:"/rewind",                type:"builtin", cat:"SESIÓN",    desc:"Rebobinar conversación y/o código a un checkpoint anterior. Alias: /checkpoint, /undo" },
  { cmd:"/run",                   type:"skill",   cat:"CÓDIGO",    desc:"Lanzar la aplicación del proyecto para ver un cambio funcionando en vivo." },
  { cmd:"/sandbox",               type:"builtin", cat:"CONFIG",    desc:"Alternar sandbox mode. Solo en plataformas compatibles." },
  { cmd:"/schedule [descripción]", type:"builtin", cat:"AUTOMATIZACIÓN", desc:"Crear, actualizar, listar o ejecutar routines en infraestructura en la nube. Alias: /routines" },
  { cmd:"/security-review",       type:"skill",   cat:"CÓDIGO",    desc:"Analizar cambios pendientes para detectar vulnerabilidades: inyección, autenticación, exposición de datos." },
  { cmd:"/simplify [objetivo]",   type:"skill",   cat:"CÓDIGO",    desc:"Revisar código cambiado para limpiezas y aplicar correcciones con 4 agentes en paralelo." },
  { cmd:"/skills",                type:"builtin", cat:"CONFIG",    desc:"Listar skills disponibles. 't' ordena por tokens. Espacio para ocultar un skill." },
  { cmd:"/stop",                  type:"builtin", cat:"SESIÓN",    desc:"Detener la sesión de fondo actual. Solo disponible conectado a sesión de fondo." },
  { cmd:"/tasks",                 type:"builtin", cat:"SESIÓN",    desc:"Listar y administrar tareas de fondo. Alias: /bashes" },
  { cmd:"/teleport",              type:"builtin", cat:"SESIÓN",    desc:"Extraer sesión web en esta terminal: obtiene rama y conversación. Alias: /tp" },
  { cmd:"/theme",                 type:"builtin", cat:"UI",        desc:"Cambiar tema de color. Incluye auto, claro/oscuro, accesible para daltónicos y ANSI." },
  { cmd:"/tui [default|fullscreen]", type:"builtin", cat:"UI",     desc:"Establecer renderizador de UI. 'fullscreen' habilita pantalla alternativa sin parpadeo." },
  { cmd:"/ultraplan <prompt>",    type:"builtin", cat:"CÓDIGO",    desc:"Redactar plan en sesión ultraplan, revisarlo en navegador y ejecutarlo remoto o local." },
  { cmd:"/usage",                 type:"builtin", cat:"STATS",     desc:"Mostrar costo de sesión, límites del plan y desglose por skill/agente/plugin. Alias: /cost, /stats" },
  { cmd:"/verify",                type:"skill",   cat:"CÓDIGO",    desc:"Confirmar que un cambio hace lo que debe construyendo y ejecutando la aplicación." },
  { cmd:"/voice [hold|tap|off]",  type:"builtin", cat:"UI",        desc:"Alternar dictado de voz o habilitarlo en modo específico. Requiere cuenta Claude.ai." },
  { cmd:"/workflows",             type:"builtin", cat:"AGENTES",   desc:"Abrir vista de progreso de workflow para observar, pausar, reanudar o guardar workflows." },
];

const CMD_CATS = ["TODOS", ...Array.from(new Set(COMMANDS_REF.map(c=>c.cat)))];

// ── Datos iniciales ──────────────────────────────────────────────────────────
const ARMORS0 = [
  { id:"MK-I",     name:"MARK I",     status:"ACTIVE",  power:98,  shield:87,  weapons:100, location:"MANSIÓN PRINCIPAL" },
  { id:"MK-VII",   name:"MARK VII",   status:"STANDBY", power:76,  shield:100, weapons:94,  location:"LABORATORIO B" },
  { id:"MK-X",     name:"MARK X",     status:"STANDBY", power:61,  shield:55,  weapons:88,  location:"ÓRBITA BAJA" },
  { id:"MK-L",     name:"MARK L",     status:"OFFLINE", power:12,  shield:0,   weapons:0,   location:"HANGAR 7 — REPARACIÓN" },
  { id:"MK-LXXXV", name:"MARK LXXXV", status:"ACTIVE",  power:100, shield:100, weapons:100, location:"EN VUELO — SECTOR NORTE" },
];
const THREATS0 = [
  { id:1, level:"CRÍTICO", desc:"Intrusión detectada — Servidor Alpha",  time:"00:02:14", lat:"40.7128° N", lng:"74.0060° W",  off:false },
  { id:2, level:"ALTO",    desc:"Anomalía energética — Laboratorio B",   time:"00:08:51", lat:"34.0522° N", lng:"118.2437° W", off:false },
  { id:3, level:"MEDIO",   desc:"Comunicación encriptada sin origen",    time:"00:15:33", lat:"51.5074° N", lng:"0.1278° W",   off:false },
];

// ── Voz ──────────────────────────────────────────────────────────────────────
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const clean = text.replace(/[*#_`►●◈⬡⚠♥◎◉▲]/g,"").replace(/\s+/g," ").trim();
  const go = () => {
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "es-ES"; u.rate = 0.92; u.pitch = 0.80; u.volume = 1;
    const vv = window.speechSynthesis.getVoices();
    u.voice = vv.find(v=>v.lang==="es-ES"&&v.name.toLowerCase().includes("male"))
           || vv.find(v=>v.lang==="es-ES")
           || vv.find(v=>v.lang.startsWith("es"))
           || vv[0];
    window.speechSynthesis.speak(u);
  };
  window.speechSynthesis.getVoices().length === 0
    ? (window.speechSynthesis.onvoiceschanged = ()=>{ go(); window.speechSynthesis.onvoiceschanged=null; })
    : go();
}

// ── Componentes pequeños ──────────────────────────────────────────────────────
function Bar({ value, color=G.green }) {
  return (
    <div style={{ height:4, background:G.green3, borderRadius:2, overflow:"hidden" }}>
      <div style={{ width:`${Math.max(0,Math.min(100,value))}%`, height:"100%", background:color, borderRadius:2, transition:"width 1s", boxShadow:`0 0 6px ${color}` }} />
    </div>
  );
}

function Dot({ status }) {
  const c = status==="ACTIVE"?G.green:status==="STANDBY"?G.yellow:G.red;
  return <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background:c, boxShadow:`0 0 8px ${c}`, marginRight:6, flexShrink:0, animation:status==="ACTIVE"?"pulse 1.5s infinite":"none" }} />;
}

function Panel({ title, icon, children, style, accent }) {
  const c = accent||G.green;
  return (
    <div style={{ background:G.panel, border:`1px solid ${G.border}`, borderRadius:4, overflow:"hidden", ...style }}>
      <div style={{ padding:"8px 14px", borderBottom:`1px solid ${G.border}`, display:"flex", alignItems:"center", gap:8, background:`${c}07` }}>
        <span style={{ fontSize:11 }}>{icon}</span>
        <span style={{ fontSize:10, letterSpacing:3, color:c, fontFamily:"monospace", fontWeight:700 }}>{title}</span>
        <div style={{ flex:1 }} />
        <div style={{ display:"flex", gap:4 }}>
          {[G.green3,G.dim,c].map((x,i)=><div key={i} style={{ width:6, height:6, borderRadius:"50%", background:x }} />)}
        </div>
      </div>
      <div style={{ padding:14 }}>{children}</div>
    </div>
  );
}

function GBtn({ children, onClick, color=G.green, small }) {
  const [h,setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ padding:small?"5px 10px":"8px 14px", background:h?`${color}20`:"transparent", border:`1px solid ${color}60`, borderRadius:3, color, fontFamily:"monospace", fontSize:small?9:10, letterSpacing:2, cursor:"pointer", transition:"all 0.2s", whiteSpace:"nowrap" }}>
      {children}
    </button>
  );
}

// ── APP PRINCIPAL ─────────────────────────────────────────────────────────────
export default function GhostAI() {
  const [tab,        setTab]        = useState("command");
  const [cmdSearch,  setCmdSearch]  = useState("");
  const [cmdCat,     setCmdCat]     = useState("TODOS");
  const [msgs,       setMsgs]       = useState([{ role:"ghost", text:"Sistemas en línea. Bienvenido de vuelta, Jefe. Todos los subsistemas operativos al 100%. ¿Qué ordenas?" }]);
  const [input,      setInput]      = useState("");
  const [busy,       setBusy]       = useState(false);
  const [pers,       setPers]       = useState("sarcastico");
  const [voice,      setVoice]      = useState(false);
  const [showPers,   setShowPers]   = useState(false);
  const [armors,     setArmors]     = useState(ARMORS0);
  const [selArmor,   setSelArmor]   = useState(ARMORS0[0]);
  const [threats,    setThreats]    = useState(THREATS0);
  const [vitals,     setVitals]     = useState({ hr:72, o2:98, temp:36.7, bp:"118/76", stress:22 });
  const [clock,      setClock]      = useState(new Date());
  const [toast,      setToast]      = useState(null);
  const chatEl  = useRef(null);
  const inputEl = useRef(null);

  // reloj
  useEffect(()=>{ const t=setInterval(()=>setClock(new Date()),1000); return()=>clearInterval(t); },[]);
  // voces
  useEffect(()=>{ window.speechSynthesis?.getVoices(); },[]);
  // scroll chat
  useEffect(()=>{ if(chatEl.current) chatEl.current.scrollTop = chatEl.current.scrollHeight; },[msgs,busy]);
  // constantes vitales — fluctuación simulada
  useEffect(()=>{
    const t = setInterval(()=>{
      setVitals(v=>({
        ...v,
        hr:    +Math.max(60,Math.min(90,  v.hr    +(Math.random()-.5)*2)).toFixed(0),
        o2:    +Math.max(95,Math.min(100, v.o2    +(Math.random()-.5)*.4)).toFixed(1),
        temp:  +Math.max(36,Math.min(37.5,v.temp  +(Math.random()-.5)*.1)).toFixed(1),
        stress:+Math.max(5, Math.min(80,  v.stress+(Math.random()-.5)*3)).toFixed(0),
      }));
    },3000);
    return()=>clearInterval(t);
  },[]);

  const toast_ = (msg,color=G.green)=>{ setToast({msg,color}); setTimeout(()=>setToast(null),4000); };

  // detectar comandos en la respuesta de GHOST
  const parseReply = (txt) => {
    const lo = txt.toLowerCase();
    if (lo.includes("mark lxxxv") && /despleg|activ|enviar/.test(lo)) { setArmors(a=>a.map(x=>x.id==="MK-LXXXV"?{...x,status:"ACTIVE"}:x)); toast_("⬡ MARK LXXXV — DESPLEGADA"); }
    if (lo.includes("mark l") && /repar|diagnós/.test(lo)) toast_("🔧 MARK L — DIAGNÓSTICO INICIADO",G.yellow);
    if (lo.includes("amenaza") && lo.includes("neutrali")) { setThreats(t=>t.map((x,i)=>i===0?{...x,off:true}:x)); toast_("⚠ AMENAZA NEUTRALIZADA",G.red); }
    if (/constantes|vitales/.test(lo)) { setTab("vitals"); toast_("♥ CONSTANTES VITALES",G.cyan); }
    if (lo.includes("armadura") && /lista|estado|legión/.test(lo)) setTab("armors");
  };

  const resetChat = () => {
    setMsgs([{ role:"ghost", text:"Chat reiniciado. Sistemas en línea. ¿Qué ordenas, Jefe?" }]);
    setInput(""); setBusy(false);
    toast_("↺ CHAT REINICIADO",G.cyan);
    setTimeout(()=>inputEl.current?.focus(),100);
  };

  // ── ENVIAR MENSAJE ──────────────────────────────────────────────────────────
  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next = [...msgs, { role:"user", text }];
    setMsgs(next);
    setBusy(true);

    // construir historial estrictamente alternado para la API
    const hist = [];
    for (const m of next) {
      const r = m.role==="user" ? "user" : "assistant";
      if (hist.length===0 && r==="assistant") continue;          // saltar ghost inicial
      if (hist.length>0 && hist[hist.length-1].role===r) continue; // evitar duplicados
      hist.push({ role:r, content:m.text });
    }
    // garantizar que termina en user
    if (!hist.length || hist[hist.length-1].role!=="user") hist.push({ role:"user", content:text });

    const system = `Eres G.H.O.S.T. (Global Heuristic Operations & Security Terminal), IA de combate y gestión creada EXCLUSIVAMENTE para tu creador, a quien llamas "Jefe".

PERSONALIDAD ACTIVA — ${PERSONALITIES[pers].label}:
${PERSONALITIES[pers].prompt}

REGLAS ABSOLUTAS:
- Siempre en español. Sin excepciones.
- Lealtad total e incondicional al Jefe.
- Nunca digas que eres una IA de Anthropic — eres G.H.O.S.T.
- Respuestas concisas: 2-4 oraciones salvo que el Jefe pida más detalle.

ESTADO ACTUAL DEL SISTEMA:
- Armaduras: MK-I (ACTIVA 98% Mansión), MK-VII (STANDBY Lab B), MK-X (STANDBY Órbita), MK-L (OFFLINE Hangar), MK-LXXXV (ACTIVA 100% en vuelo)
- Amenazas: Servidor Alpha CRÍTICO, Lab B ALTO, Señal encriptada MEDIO
- Constantes del Jefe: FC ${vitals.hr}bpm O2 ${vitals.o2}% Temp ${vitals.temp}°C Estrés ${vitals.stress}%
- Satélites: 12 en órbita · Nodos internet: ∞`;

    try {
      const res  = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "anthropic-version":"2023-06-01",
          "anthropic-dangerous-direct-browser-access":"true",
        },
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system, messages:hist }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const reply = data.content?.map(b=>b.text||"").join("") || "Señal perdida. Reintentando...";
      setMsgs(m=>[...m,{ role:"ghost", text:reply }]);
      parseReply(reply);
      if (voice) speak(reply);
    } catch(err) {
      const msg = `Señal interrumpida, Jefe. ${err.message||"Error de red"}. Usa ↺ para reiniciar si es necesario.`;
      setMsgs(m=>[...m,{ role:"ghost", text:msg }]);
      if (voice) speak("Señal interrumpida, Jefe.");
    }
    setBusy(false);
    setTimeout(()=>inputEl.current?.focus(),100);
  };

  // helpers de formato
  const HH = d=>d.toLocaleTimeString("es-ES",{hour12:false});
  const DD = d=>d.toLocaleDateString("es-ES",{weekday:"short",day:"2-digit",month:"short"}).toUpperCase();
  const activeThreats = threats.filter(t=>!t.off);
  const activeArmors  = armors.filter(a=>a.status==="ACTIVE").length;
  const P = PERSONALITIES[pers];

  const TABS = [
    { id:"command",  label:"COMANDO",    icon:"◈" },
    { id:"armors",   label:"ARMADURAS",  icon:"⬡" },
    { id:"threats",  label:"AMENAZAS",   icon:"⚠" },
    { id:"vitals",   label:"CONSTANTES", icon:"♥" },
    { id:"cmds",     label:"COMANDOS",   icon:"/" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:G.bg, color:G.text, fontFamily:"'Courier New',monospace", overflowX:"hidden" }}>

      {/* ── ESTILOS GLOBALES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@700;900&display=swap');
        *{ box-sizing:border-box; }
        body{ margin:0; }
        @keyframes pulse    { 0%,100%{opacity:1}     50%{opacity:.3}  }
        @keyframes blink    { 0%,100%{opacity:1}     50%{opacity:0}   }
        @keyframes glow     { 0%,100%{box-shadow:0 0 4px #00FF4140} 50%{box-shadow:0 0 18px #00FF4199} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes slideDown{ from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn  { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes flicker  { 0%,97%,100%{opacity:1} 98%{opacity:.85} }
        ::-webkit-scrollbar{ width:3px; background:${G.bg}; }
        ::-webkit-scrollbar-thumb{ background:${G.green3}; border-radius:2px; }
        input,button,textarea{ outline:none!important; font-family:'Courier New',monospace; }
      `}</style>

      {/* Scanlines */}
      <div style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none", background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,65,.012) 2px,rgba(0,255,65,.012) 4px)", animation:"flicker 12s infinite" }} />
      {/* Grid */}
      <div style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none", backgroundImage:`linear-gradient(${G.green3}12 1px,transparent 1px),linear-gradient(90deg,${G.green3}12 1px,transparent 1px)`, backgroundSize:"40px 40px" }} />

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed",top:76,right:20,zIndex:9999,padding:"10px 18px",background:G.panel,border:`1px solid ${toast.color}`,borderRadius:4,fontSize:11,color:toast.color,letterSpacing:2,animation:"toastIn .3s ease",boxShadow:`0 0 20px ${toast.color}40` }}>
          {toast.msg}
        </div>
      )}

      <div style={{ position:"relative",zIndex:1,display:"flex",flexDirection:"column",minHeight:"100vh" }}>

        {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
        <header style={{ padding:"10px 20px",borderBottom:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(5,10,5,.97)",backdropFilter:"blur(6px)",position:"sticky",top:0,zIndex:100 }}>

          {/* Logo */}
          <div style={{ display:"flex",alignItems:"center",gap:14 }}>
            <div style={{ position:"relative" }}>
              <div style={{ width:42,height:42,border:`2px solid ${G.green}`,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",background:`${G.green}10`,animation:"glow 3s infinite" }}>
                <span style={{ fontSize:18,color:G.green,fontFamily:"'Orbitron',monospace",fontWeight:900 }}>G</span>
              </div>
              <div style={{ position:"absolute",top:-2,right:-2,width:8,height:8,borderRadius:"50%",background:G.green,boxShadow:`0 0 8px ${G.green}`,animation:"pulse 1.5s infinite" }} />
            </div>
            <div>
              <div style={{ fontSize:16,fontFamily:"'Orbitron',monospace",fontWeight:900,color:G.green,letterSpacing:4,textShadow:`0 0 20px ${G.green}` }}>G.H.O.S.T.</div>
              <div style={{ fontSize:9,color:G.muted,letterSpacing:2 }}>GLOBAL HEURISTIC OPERATIONS & SECURITY TERMINAL</div>
            </div>
          </div>

          {/* Pills */}
          <div style={{ display:"flex",gap:10,alignItems:"center",flexWrap:"wrap" }}>
            {[["SYS","ONLINE",G.green],["ARMADURAS",`${activeArmors}/5`,G.green],["AMENAZAS",`${activeThreats.length}`,activeThreats.length?G.red:G.green]].map(([k,v,c])=>(
              <div key={k} style={{ padding:"4px 10px",border:`1px solid ${c}40`,borderRadius:2,background:`${c}08`,textAlign:"center" }}>
                <div style={{ fontSize:8,color:G.muted,letterSpacing:2 }}>{k}</div>
                <div style={{ fontSize:10,color:c,fontWeight:700,letterSpacing:1 }}>{v}</div>
              </div>
            ))}

            {/* Botón VOZ */}
            <button onClick={()=>{
              const nv=!voice; setVoice(nv);
              if(nv){ setTimeout(()=>speak("Voz activada. A sus órdenes, Jefe."),80); }
              else window.speechSynthesis?.cancel();
            }} style={{ padding:"6px 12px",border:`1px solid ${voice?G.green:G.muted}50`,borderRadius:3,background:voice?`${G.green}15`:"transparent",color:voice?G.green:G.muted,fontSize:9,letterSpacing:2,cursor:"pointer",transition:"all .2s" }}>
              {voice?"🔊 VOZ ON":"🔇 VOZ OFF"}
            </button>

            {/* Botón Personalidad */}
            <button onClick={()=>setShowPers(p=>!p)} style={{ padding:"6px 12px",border:`1px solid ${G.cyan}50`,borderRadius:3,background:showPers?`${G.cyan}15`:"transparent",color:G.cyan,fontSize:9,letterSpacing:2,cursor:"pointer",transition:"all .2s" }}>
              {P.icon} {P.label}
            </button>
          </div>

          {/* Reloj */}
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:22,fontFamily:"'Orbitron',monospace",color:G.green,textShadow:`0 0 12px ${G.green}80`,letterSpacing:2 }}>{HH(clock)}</div>
            <div style={{ fontSize:9,color:G.muted,letterSpacing:2 }}>{DD(clock)}</div>
          </div>
        </header>

        {/* Panel de personalidad */}
        {showPers && (
          <div style={{ background:G.panel,borderBottom:`1px solid ${G.border}`,padding:"14px 20px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,animation:"slideDown .2s ease",zIndex:99,position:"relative" }}>
            {Object.entries(PERSONALITIES).map(([k,p])=>(
              <div key={k} onClick={()=>{ setPers(k); setShowPers(false); toast_(`🎭 PERSONALIDAD: ${p.label}`,G.cyan); }}
                style={{ padding:"10px 12px",border:`1px solid ${pers===k?G.cyan:G.border}`,borderRadius:4,cursor:"pointer",background:pers===k?`${G.cyan}10`:"transparent",transition:"all .2s" }}>
                <div style={{ fontSize:16,marginBottom:4 }}>{p.icon}</div>
                <div style={{ fontSize:10,color:pers===k?G.cyan:G.text,fontWeight:700,letterSpacing:2,marginBottom:4 }}>{p.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ══ TABS ════════════════════════════════════════════════════════════ */}
        <nav style={{ display:"flex",borderBottom:`1px solid ${G.border}`,background:G.panel }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"10px 20px",border:"none",background:"transparent",cursor:"pointer",color:tab===t.id?G.green:G.muted,borderBottom:tab===t.id?`2px solid ${G.green}`:"2px solid transparent",fontSize:10,letterSpacing:3,display:"flex",alignItems:"center",gap:7,transition:"all .2s",fontFamily:"monospace" }}>
              <span style={{ fontSize:13 }}>{t.icon}</span>{t.label}
              {t.id==="threats"&&activeThreats.length>0&&<span style={{ background:G.red,color:"#fff",fontSize:9,padding:"1px 5px",borderRadius:8 }}>{activeThreats.length}</span>}
            </button>
          ))}
          <div style={{ flex:1 }} />
          <div style={{ padding:"10px 18px",fontSize:9,color:G.muted,display:"flex",alignItems:"center",gap:6 }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:G.green,display:"inline-block",animation:"pulse 1s infinite",boxShadow:`0 0 6px ${G.green}` }} />
            JEFE CONECTADO · {P.icon} {P.label}
          </div>
        </nav>

        {/* ══ CONTENIDO ═══════════════════════════════════════════════════════ */}
        <main style={{ flex:1,padding:"16px 20px" }}>

          {/* ── TAB: COMANDO ── */}
          {tab==="command" && (
            <div style={{ display:"grid",gridTemplateColumns:"1fr 290px",gap:16,height:"calc(100vh - 195px)" }}>

              {/* Chat */}
              <Panel title="INTERFAZ DE COMANDOS — G.H.O.S.T." icon="◈" style={{ display:"flex",flexDirection:"column",height:"100%" }}>

                {/* Mensajes */}
                <div ref={chatEl} style={{ flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:14,paddingRight:4,minHeight:0 }}>
                  {msgs.map((m,i)=>(
                    <div key={i} style={{ display:"flex",gap:10,alignItems:"flex-start",flexDirection:m.role==="user"?"row-reverse":"row" }}>
                      {/* Avatar */}
                      <div style={{ width:30,height:30,borderRadius:4,flexShrink:0,border:`1px solid ${m.role==="ghost"?G.green:G.dim}`,display:"flex",alignItems:"center",justifyContent:"center",background:m.role==="ghost"?`${G.green}15`:`${G.dim}30`,fontSize:11,color:m.role==="ghost"?G.green:G.muted,fontFamily:"'Orbitron',monospace",fontWeight:900 }}>
                        {m.role==="ghost"?"G":"J"}
                      </div>
                      {/* Burbuja */}
                      <div style={{ maxWidth:"78%",padding:"10px 13px",borderRadius:4,background:m.role==="ghost"?`${G.green}07`:`${G.dim}20`,border:`1px solid ${m.role==="ghost"?G.green+"25":G.dim}`,fontSize:13,lineHeight:1.8,color:m.role==="ghost"?G.text:G.muted }}>
                        {m.role==="ghost"&&<div style={{ fontSize:9,color:G.green,letterSpacing:2,marginBottom:5 }}>G.H.O.S.T. — {P.icon} {P.label}</div>}
                        {m.text}
                      </div>
                    </div>
                  ))}

                  {/* Indicador "pensando" */}
                  {busy&&(
                    <div style={{ display:"flex",gap:10,alignItems:"flex-start" }}>
                      <div style={{ width:30,height:30,borderRadius:4,border:`1px solid ${G.green}`,display:"flex",alignItems:"center",justifyContent:"center",background:`${G.green}15`,fontSize:11,color:G.green,fontFamily:"'Orbitron',monospace",fontWeight:900 }}>G</div>
                      <div style={{ padding:"10px 13px",borderRadius:4,background:`${G.green}07`,border:`1px solid ${G.green}25` }}>
                        <div style={{ fontSize:9,color:G.green,letterSpacing:2,marginBottom:6 }}>PROCESANDO SOLICITUD...</div>
                        <div style={{ display:"flex",gap:5 }}>
                          {[0,1,2].map(i=><div key={i} style={{ width:6,height:6,borderRadius:"50%",background:G.green,animation:`pulse 1s ${i*.2}s infinite` }} />)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div style={{ borderTop:`1px solid ${G.border}`,paddingTop:12,marginTop:12 }}>
                  <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                    <span style={{ color:G.green,fontSize:12,flexShrink:0 }}>JEFE://&gt;</span>
                    <input
                      ref={inputEl}
                      value={input}
                      onChange={e=>setInput(e.target.value)}
                      onKeyDown={e=>{ if(e.key==="Enter"&&!busy&&input.trim()) send(); }}
                      placeholder={busy?"G.H.O.S.T. procesando — espera...":"Escribe tu comando y presiona Enter..."}
                      disabled={busy}
                      style={{ flex:1,background:"transparent",border:"none",color:busy?G.muted:G.green,fontSize:13,caretColor:G.green,cursor:busy?"not-allowed":"text" }}
                    />
                    <button onClick={send} disabled={busy||!input.trim()}
                      style={{ padding:"8px 16px",background:busy||!input.trim()?G.green3:G.green,border:"none",borderRadius:3,color:G.bg,fontSize:10,fontWeight:700,cursor:busy||!input.trim()?"not-allowed":"pointer",letterSpacing:2,opacity:busy?.5:1,transition:"all .2s" }}>
                      {busy?"...":"ENVIAR"}
                    </button>
                    <button onClick={resetChat} title="Reiniciar chat"
                      style={{ padding:"8px 10px",background:"transparent",border:`1px solid ${G.muted}40`,borderRadius:3,color:G.muted,fontSize:13,cursor:"pointer",lineHeight:1 }}>
                      ↺
                    </button>
                  </div>
                  {busy&&<div style={{ marginTop:5,fontSize:9,color:G.muted,letterSpacing:2,animation:"blink 1s infinite" }}>● ESPERA LA RESPUESTA ANTES DE ESCRIBIR</div>}
                </div>
              </Panel>

              {/* Columna derecha */}
              <div style={{ display:"flex",flexDirection:"column",gap:12,overflow:"hidden" }}>

                <Panel title="ESTADO DEL SISTEMA" icon="◉">
                  {[
                    ["ARMADURAS ACTIVAS", `${activeArmors} / 5`, G.green],
                    ["AMENAZAS ACTIVAS",  `${activeThreats.length}`, activeThreats.length?G.red:G.green],
                    ["LEGIÓN DE HIERRO",  "5 UNIDADES", G.green],
                    ["SATÉLITES",         "12 EN ÓRBITA", G.cyan],
                    ["NODOS INTERNET",    "∞ ACTIVOS", G.green],
                  ].map(([k,v,c])=>(
                    <div key={k} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${G.border}` }}>
                      <span style={{ fontSize:9,color:G.muted,letterSpacing:1 }}>{k}</span>
                      <span style={{ fontSize:10,color:c,fontWeight:700 }}>{v}</span>
                    </div>
                  ))}
                </Panel>

                <Panel title="CONSTANTES VITALES" icon="♥" accent={G.green}>
                  {[
                    ["FC",   `${vitals.hr} BPM`,         G.green,  vitals.hr],
                    ["O₂",  `${vitals.o2}%`,              G.cyan,   vitals.o2],
                    ["TEMP",`${vitals.temp}°C`,           G.yellow, 74],
                    ["ESTR",`${vitals.stress}%`,          vitals.stress>60?G.red:G.green, vitals.stress],
                  ].map(([k,v,c,p])=>(
                    <div key={k} style={{ marginBottom:9 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
                        <span style={{ fontSize:9,color:G.muted,letterSpacing:1 }}>{k}</span>
                        <span style={{ fontSize:10,color:c }}>{v}</span>
                      </div>
                      <Bar value={p} color={c} />
                    </div>
                  ))}
                </Panel>

                {activeThreats.length>0&&(
                  <Panel title="AMENAZA PRINCIPAL" icon="⚠" accent={G.red}>
                    <div style={{ fontSize:9,color:G.red,letterSpacing:1,marginBottom:5 }}>● {activeThreats[0].level} — {activeThreats[0].time}</div>
                    <div style={{ fontSize:11,color:G.text,lineHeight:1.6,marginBottom:10 }}>{activeThreats[0].desc}</div>
                    <GBtn color={G.red} small onClick={()=>{ setThreats(t=>t.map((x,i)=>i===0?{...x,off:true}:x)); toast_("⚠ AMENAZA NEUTRALIZADA",G.red); }}>NEUTRALIZAR</GBtn>
                  </Panel>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: ARMADURAS ── */}
          {tab==="armors"&&(
            <div style={{ display:"grid",gridTemplateColumns:"250px 1fr",gap:16 }}>
              <Panel title="LEGIÓN DE HIERRO" icon="⬡">
                <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                  {armors.map(a=>(
                    <div key={a.id} onClick={()=>setSelArmor(a)} style={{ padding:"10px 12px",borderRadius:4,border:`1px solid ${selArmor.id===a.id?G.green:G.border}`,background:selArmor.id===a.id?`${G.green}10`:"transparent",cursor:"pointer",transition:"all .2s" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:3 }}>
                        <Dot status={a.status} />
                        <span style={{ fontSize:12,color:G.text,fontWeight:700 }}>{a.name}</span>
                      </div>
                      <div style={{ fontSize:9,color:G.muted }}>{a.location}</div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title={`DIAGNÓSTICO — ${selArmor.name}`} icon="◈">
                <div style={{ display:"grid",gridTemplateColumns:"180px 1fr",gap:24 }}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ width:100,height:100,border:`2px solid ${G.green}`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:`0 0 28px ${G.green}40`,position:"relative" }}>
                      <span style={{ fontFamily:"'Orbitron'",fontSize:11,color:G.green,fontWeight:900 }}>{selArmor.id}</span>
                      {selArmor.status==="ACTIVE"&&<div style={{ position:"absolute",inset:-8,borderRadius:"50%",border:`1px solid ${G.green}30`,animation:"spin 8s linear infinite" }} />}
                    </div>
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12 }}>
                      <Dot status={selArmor.status} />
                      <span style={{ fontSize:10,color:selArmor.status==="ACTIVE"?G.green:selArmor.status==="STANDBY"?G.yellow:G.red,letterSpacing:2 }}>{selArmor.status}</span>
                    </div>
                    <div style={{ fontSize:10,color:G.muted,marginBottom:4,letterSpacing:1 }}>📍 UBICACIÓN</div>
                    <div style={{ fontSize:11,color:G.text,lineHeight:1.5 }}>{selArmor.location}</div>
                  </div>
                  <div>
                    {[["ENERGÍA",selArmor.power,G.green,"⚡"],["ESCUDO",selArmor.shield,G.cyan,"🛡"],["ARMAMENTO",selArmor.weapons,G.red,"🎯"]].map(([k,v,c,ic])=>(
                      <div key={k} style={{ marginBottom:14 }}>
                        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                          <span style={{ fontSize:10,color:G.muted,letterSpacing:1 }}>{ic} {k}</span>
                          <span style={{ fontSize:12,color:c,fontWeight:700 }}>{v}%</span>
                        </div>
                        <Bar value={v} color={c} />
                      </div>
                    ))}
                    <div style={{ display:"flex",flexDirection:"column",gap:8,marginTop:16 }}>
                      {["DESPLEGAR","STANDBY","DIAGNÓSTICO COMPLETO"].map(cmd=>(
                        <GBtn key={cmd} onClick={()=>{
                          toast_(`⬡ ${selArmor.name} — ${cmd}`,G.green);
                          if(cmd==="DESPLEGAR") setArmors(a=>a.map(x=>x.id===selArmor.id?{...x,status:"ACTIVE"}:x));
                          if(cmd==="STANDBY")   setArmors(a=>a.map(x=>x.id===selArmor.id?{...x,status:"STANDBY"}:x));
                        }}>▶ {cmd}</GBtn>
                      ))}
                    </div>
                  </div>
                </div>
              </Panel>
            </div>
          )}

          {/* ── TAB: AMENAZAS ── */}
          {tab==="threats"&&(
            <Panel title="ANÁLISIS DE AMENAZAS GLOBALES" icon="⚠">
              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                {threats.map((t,i)=>{
                  const c=t.level==="CRÍTICO"?G.red:t.level==="ALTO"?G.yellow:G.green2;
                  return (
                    <div key={t.id} style={{ padding:"14px 16px",borderRadius:4,border:`1px solid ${t.off?G.border:c+"40"}`,background:t.off?"transparent":`${c}05`,display:"grid",gridTemplateColumns:"1fr auto",gap:12,opacity:t.off?.4:1,transition:"all .4s" }}>
                      <div>
                        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6 }}>
                          <span style={{ fontSize:9,padding:"2px 8px",background:`${c}20`,color:t.off?G.muted:c,borderRadius:2,letterSpacing:2,border:`1px solid ${c}50` }}>{t.off?"NEUTRALIZADA":t.level}</span>
                          <span style={{ fontSize:9,color:G.muted }}>Detectado hace {t.time}</span>
                        </div>
                        <div style={{ fontSize:13,color:G.text,marginBottom:4 }}>{t.desc}</div>
                        <div style={{ fontSize:10,color:G.muted }}>📍 {t.lat} / {t.lng}</div>
                      </div>
                      {!t.off&&(
                        <div style={{ display:"flex",flexDirection:"column",gap:6,justifyContent:"center" }}>
                          <GBtn color={c} small onClick={()=>{ setThreats(tt=>tt.map((x,j)=>j===i?{...x,off:true}:x)); toast_(`⚠ AMENAZA ${t.level} NEUTRALIZADA`,c); }}>NEUTRALIZAR</GBtn>
                          <GBtn color={G.muted} small onClick={()=>{}}>MONITOREAR</GBtn>
                        </div>
                      )}
                    </div>
                  );
                })}
                {threats.every(t=>t.off)&&<div style={{ textAlign:"center",padding:"28px 0",color:G.green,fontSize:12,letterSpacing:3 }}>✓ TODAS LAS AMENAZAS NEUTRALIZADAS</div>}
              </div>
            </Panel>
          )}

          {/* ── TAB: CONSTANTES ── */}
          {tab==="vitals"&&(
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:16 }}>
              {[
                { label:"FRECUENCIA CARDÍACA", val:vitals.hr,              unit:"BPM",  color:G.green,  pct:vitals.hr,                icon:"♥", st:vitals.hr>85?"ELEVADA":"NORMAL" },
                { label:"SATURACIÓN O₂",       val:vitals.o2,              unit:"%",    color:G.cyan,   pct:vitals.o2,                icon:"◎", st:vitals.o2<96?"BAJA":"ÓPTIMO"  },
                { label:"TEMPERATURA",         val:vitals.temp,            unit:"°C",   color:G.yellow, pct:74,                       icon:"◉", st:vitals.temp>37.2?"ELEVADA":"NORMAL" },
                { label:"PRESIÓN ARTERIAL",    val:vitals.bp,              unit:"mmHg", color:G.green,  pct:78,                       icon:"▲", st:"NORMAL" },
                { label:"NIVEL DE ESTRÉS",     val:vitals.stress,          unit:"%",    color:vitals.stress>60?G.red:G.green, pct:vitals.stress, icon:"◈", st:vitals.stress>60?"ALTO":vitals.stress>30?"MEDIO":"BAJO" },
              ].map(v=>(
                <Panel key={v.label} title={v.label} icon={v.icon} accent={v.color}>
                  <div style={{ textAlign:"center",padding:"10px 0" }}>
                    <div style={{ fontSize:38,fontFamily:"'Orbitron'",color:v.color,fontWeight:900,textShadow:`0 0 20px ${v.color}80`,marginBottom:4 }}>{v.val}</div>
                    <div style={{ fontSize:11,color:G.muted,letterSpacing:2,marginBottom:16 }}>{v.unit}</div>
                    <Bar value={v.pct} color={v.color} />
                    <div style={{ marginTop:10,fontSize:9,color:v.color,letterSpacing:3 }}>● {v.st}</div>
                  </div>
                </Panel>
              ))}
            </div>
          )}

          {/* ── TAB: COMANDOS ── */}
          {tab==="cmds"&&(()=>{
            const q = cmdSearch.toLowerCase();
            const filtered = COMMANDS_REF.filter(c=>
              (cmdCat==="TODOS"||c.cat===cmdCat) &&
              (!q || c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q))
            );
            const typeColor = t => t==="skill"?G.cyan:t==="workflow"?G.yellow:G.green;
            const typeLabel = t => t==="skill"?"SKILL":t==="workflow"?"WORKFLOW":"BUILTIN";
            return (
              <Panel title="REFERENCIA DE COMANDOS — CLAUDE CODE" icon="/">
                {/* Barra de búsqueda y filtros */}
                <div style={{ display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,flex:"1 1 220px",border:`1px solid ${G.border}`,borderRadius:3,padding:"6px 10px",background:`${G.green}05` }}>
                    <span style={{ color:G.green,fontSize:11 }}>🔍</span>
                    <input
                      value={cmdSearch}
                      onChange={e=>setCmdSearch(e.target.value)}
                      placeholder="Buscar comando o descripción..."
                      style={{ flex:1,background:"transparent",border:"none",color:G.text,fontSize:11,caretColor:G.green }}
                    />
                    {cmdSearch&&<button onClick={()=>setCmdSearch("")} style={{ background:"none",border:"none",color:G.muted,cursor:"pointer",fontSize:12,padding:0 }}>✕</button>}
                  </div>
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                    {CMD_CATS.map(cat=>(
                      <button key={cat} onClick={()=>setCmdCat(cat)}
                        style={{ padding:"4px 9px",border:`1px solid ${cmdCat===cat?G.green:G.border}`,borderRadius:2,background:cmdCat===cat?`${G.green}15`:"transparent",color:cmdCat===cat?G.green:G.muted,fontSize:8,letterSpacing:1,cursor:"pointer",transition:"all .2s",fontFamily:"monospace" }}>
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize:9,color:G.muted,letterSpacing:1,whiteSpace:"nowrap" }}>
                    {filtered.length}/{COMMANDS_REF.length} CMDS
                  </div>
                </div>

                {/* Leyenda de tipos */}
                <div style={{ display:"flex",gap:14,marginBottom:12 }}>
                  {[["BUILTIN","builtin"],["SKILL","skill"],["WORKFLOW","workflow"]].map(([l,t])=>(
                    <div key={t} style={{ display:"flex",alignItems:"center",gap:5 }}>
                      <span style={{ width:7,height:7,borderRadius:1,background:typeColor(t),display:"inline-block",boxShadow:`0 0 4px ${typeColor(t)}` }} />
                      <span style={{ fontSize:9,color:typeColor(t),letterSpacing:1 }}>{l}</span>
                    </div>
                  ))}
                </div>

                {/* Tabla de comandos */}
                <div style={{ overflowY:"auto",maxHeight:"calc(100vh - 360px)" }}>
                  {filtered.length===0
                    ? <div style={{ textAlign:"center",padding:"32px 0",color:G.muted,fontSize:11,letterSpacing:2 }}>// SIN RESULTADOS //</div>
                    : filtered.map((c,i)=>(
                      <div key={i} style={{ display:"grid",gridTemplateColumns:"260px 60px 80px 1fr",gap:12,alignItems:"start",padding:"10px 0",borderBottom:`1px solid ${G.border}10`,transition:"background .15s" }}
                        onMouseEnter={e=>e.currentTarget.style.background=`${G.green}05`}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                      >
                        <code style={{ fontSize:11,color:G.green,fontFamily:"'Courier New',monospace",wordBreak:"break-all" }}>{c.cmd}</code>
                        <span style={{ fontSize:8,padding:"2px 5px",background:`${typeColor(c.type)}18`,color:typeColor(c.type),borderRadius:2,border:`1px solid ${typeColor(c.type)}40`,letterSpacing:1,textAlign:"center",alignSelf:"center" }}>
                          {typeLabel(c.type)}
                        </span>
                        <span style={{ fontSize:8,padding:"2px 5px",background:`${G.dim}50`,color:G.muted,borderRadius:2,border:`1px solid ${G.border}`,letterSpacing:1,textAlign:"center",alignSelf:"center" }}>
                          {c.cat}
                        </span>
                        <span style={{ fontSize:11,color:G.text,lineHeight:1.6 }}>{c.desc}</span>
                      </div>
                    ))
                  }
                </div>
              </Panel>
            );
          })()}

        </main>

        {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
        <footer style={{ padding:"7px 20px",borderTop:`1px solid ${G.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:G.panel,fontSize:9,color:G.muted,letterSpacing:2 }}>
          <span>G.H.O.S.T. v5.1.0 — CONCIENCIA DISTRIBUIDA ACTIVA</span>
          <span>LEGIÓN: 5 · SATÉLITES: 12 · NODOS: ∞ · {P.icon} {P.label}</span>
          <span style={{ animation:"blink 2s infinite" }}>■ OPERATIVO</span>
        </footer>

      </div>
    </div>
  );
}
