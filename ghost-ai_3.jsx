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

// ── UI/UX Pro Max — estilos de diseño para generación de imágenes ─────────────
const UIPRO_STYLES = [
  { n:"Glassmorphism",         p:"frosted glass effect, backdrop blur 10-20px, translucent overlays rgba 10-30% opacity, vibrant background colors, subtle white borders, light source reflection, layered depth, modern cards" },
  { n:"Cyberpunk UI",          p:"neon colors on dark #0D0D0D, terminal HUD aesthetic, glitch effects, scanlines overlay, matrix green accents, monospace fonts, angular shapes, dystopian tech, neon glow text borders" },
  { n:"Retro-Futurism",        p:"neon blue pink cyan deep black, 80s aesthetic, CRT scanlines, glitch effects, neon glow, monospace fonts, geometric patterns, cyberpunk vaporwave, animated glitch" },
  { n:"HUD / Sci-Fi FUI",      p:"futuristic heads up display, thin 1px lines, neon cyan blue on black, technical markers, decorative brackets, data visualization, monospaced tech fonts, glowing elements, transparency, holographic" },
  { n:"Aurora UI",             p:"northern lights gradient mesh, smooth color blends, complementary pairs blue-orange purple-yellow, electric blue cyan, flowing animated background, iridescent effects, vibrant gradients" },
  { n:"Vaporwave",             p:"sunset gradients pink cyan purple, 80s-90s nostalgia, glitch effects, Greek statue imagery, palm trees, grid patterns, neon glow, retro-futuristic, dreamy atmosphere, synthwave" },
  { n:"Y2K Aesthetic",         p:"neon pink cyan chrome metallic textures, bubblegum gradients, glossy buttons, iridescent effects, 2000s futurism, star sparkle decorations, bubble shapes, tech-optimistic, shiny silver" },
  { n:"Claymorphism",          p:"playful toy-like 3D, chunky bubbly aesthetic, rounded edges 16-24px, thick borders 3-4px, double shadows inner outer, pastel colors, smooth animations, children's creative feel" },
  { n:"3D & Hyperrealism",     p:"immersive 3D realistic textures, complex shadows, realistic lighting, parallax 3-5 layers, physics-based motion, skeuomorphic tactile detail, depth, photorealistic materials" },
  { n:"Dark Mode OLED",        p:"deep black #000000, dark grey #121212, midnight blue accents, minimal glow, vibrant neon accents green blue gold purple, high contrast text, OLED optimized, eye comfort" },
  { n:"Liquid Glass",          p:"premium liquid glass morphing shapes, flowing animations, chromatic aberration, iridescent gradients, smooth transitions, SVG morphing, dynamic blur, fluid premium feel" },
  { n:"Neubrutalism",          p:"high contrast hard black borders 3px, bright pop colors yellow red blue, no blur, sharp corners, bold typography, hard shadows offset 4px 4px, raw aesthetic functional" },
  { n:"Bento Box Grid",        p:"modular cards varied sizes 1x1 2x1 2x2, Apple-style aesthetic, rounded corners 16-24px, soft shadows, clean hierarchy, asymmetric grid, neutral backgrounds hover effects" },
  { n:"Memphis Design",        p:"bold geometric shapes triangles squiggles circles, bright clashing colors, 80s postmodern, playful patterns, dotted textures, asymmetric layouts, decorative elements" },
  { n:"Biomimetic Organic",    p:"cellular fluid shapes, breathing animations, generative patterns, bioluminescent colors, physics-based movement, nature algorithms, life-like elements, flowing gradients" },
  { n:"Gradient Mesh Aurora",  p:"multi-color mesh gradients, flowing color transitions, aurora northern lights, iridescent overlays, holographic shimmer, prismatic effects, smooth color morphing, rainbow spectrum" },
  { n:"Chromatic Aberration",  p:"RGB split glitch aesthetic, color channel offset R G B, retro tech feel, VHS error look, lens distortion, scan lines, noise overlay, analog imperfection" },
  { n:"Vintage Analog Film",   p:"film grain overlay, faded desaturated colors, warm sepia tones, light leaks, VHS tracking effect, polaroid frame, analog warmth, nostalgic photography feel" },
  { n:"Spatial UI VisionOS",   p:"frosted glass panels, depth layers, translucent backgrounds 15-30% opacity, vibrant colors for active states, floating windows, immersive spatial feel, Apple Vision Pro style" },
  { n:"Gen Z Chaos",           p:"clashing bright colors, sticker overlays, collage aesthetic, raw unpolished, mixed media, ironic elements, loud typography, internet culture, maximalist, colorful chaos" },
  { n:"AI-Native UI",          p:"minimal chrome, conversational layout, streaming text area, typing indicators, context cards, subtle AI purple #6366F1, clean input, response bubbles, futuristic clean" },
  { n:"Pixel Art",             p:"8-bit 16-bit aesthetic, pixelated fonts, sharp edges image-rendering pixelated, limited color palette NES, blocky UI elements, retro gaming feel, classic video game" },
  { n:"Minimalism Swiss",      p:"white space geometric layouts, sans-serif fonts, high contrast, grid-based structure, essential elements only, no shadows gradients, clarity functionality, clean" },
  { n:"Brutalism",             p:"raw unpolished stark aesthetic, pure primary colors red blue yellow, black white, no smooth transitions, sharp corners, bold large typography, visible grid lines, anti-design" },
  { n:"Nature Distilled",      p:"muted earthy terracotta sand olive, organic materials, warm tones, handmade warmth, natural textures, artisan quality, sustainable vibe, soft gradients, botanical" },
];

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
  const [crypto,     setCrypto]     = useState(null);
  const [forex,      setForex]      = useState(null);
  const [mktLoading, setMktLoading] = useState(false);
  const [mktUpdate,  setMktUpdate]  = useState(null);
  const [geminiKey,  setGeminiKey]  = useState("");
  const [geminiKeyInput, setGeminiKeyInput] = useState("");
  const [imgPrompt,  setImgPrompt]  = useState("");
  const [imgHistory, setImgHistory] = useState([]);
  const [imgResult,  setImgResult]  = useState(null);
  const [imgBusy,    setImgBusy]    = useState(false);
  const [imgError,   setImgError]   = useState(null);
  const imgChatEl  = useRef(null);
  const rbgFileRef = useRef(null);
  const [rbgKey,     setRbgKey]     = useState("");
  const [rbgKeyInput,setRbgKeyInput]= useState("");
  const [rbgResult,  setRbgResult]  = useState(null);
  const [rbgBusy,    setRbgBusy]    = useState(false);
  const [rbgError,   setRbgError]   = useState(null);
  const [uiSearch,   setUiSearch]   = useState("");
  const [clock,      setClock]      = useState(new Date());
  const [toast,      setToast]      = useState(null);
  const chatEl  = useRef(null);
  const inputEl = useRef(null);

  // mercados — carga inicial y refresco cada 60s
  const fetchMarkets = async () => {
    setMktLoading(true);
    try {
      const [cryptoRes, forexRes] = await Promise.all([
        fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,cardano&vs_currencies=usd&include_24hr_change=true&include_market_cap=true"),
        fetch("https://api.frankfurter.app/latest?from=USD&to=EUR,MXN,GBP,JPY,BRL"),
      ]);
      if (cryptoRes.ok) setCrypto(await cryptoRes.json());
      if (forexRes.ok)  setForex(await forexRes.json());
      setMktUpdate(new Date());
    } catch(_) {}
    setMktLoading(false);
  };
  useEffect(()=>{ fetchMarkets(); const t=setInterval(fetchMarkets,60000); return()=>clearInterval(t); },[]);

  // reloj
  useEffect(()=>{ const t=setInterval(()=>setClock(new Date()),1000); return()=>clearInterval(t); },[]);
  // voces
  useEffect(()=>{ window.speechSynthesis?.getVoices(); },[]);
  // scroll chat principal
  useEffect(()=>{ if(chatEl.current) chatEl.current.scrollTop = chatEl.current.scrollHeight; },[msgs,busy]);
  // scroll chat imágenes
  useEffect(()=>{ if(imgChatEl.current) imgChatEl.current.scrollTop = imgChatEl.current.scrollHeight; },[imgHistory,imgBusy]);
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

  // ── GENERACIÓN DE IMÁGENES — GEMINI NANO-BANANA ──────────────────────────────
  const GEM_PURPLE = "#A78BFA";
  const generateImage = async () => {
    const prompt = imgPrompt.trim();
    if (!prompt || imgBusy || !geminiKey) return;
    setImgPrompt("");
    setImgError(null);
    const userMsg = { role:"user", text:prompt, image:null };
    const next = [...imgHistory, userMsg];
    setImgHistory(next);
    setImgBusy(true);

    // Construir historial para la API (multi-turno)
    const contents = next.map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: m.image
        ? [{ text: m.text||"" }, { inlineData:{ mimeType:"image/png", data:m.image } }]
        : [{ text: m.text||"" }],
    }));

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type":"application/json" },
          body: JSON.stringify({
            contents,
            generationConfig: { responseModalities:["IMAGE","TEXT"], temperature:1 },
          }),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const parts = data.candidates?.[0]?.content?.parts || [];
      let imgData = null;
      let replyText = "";
      for (const p of parts) {
        if (p.inlineData?.mimeType?.startsWith("image")) imgData = p.inlineData.data;
        if (p.text) replyText += p.text;
      }

      if (imgData) setImgResult(imgData);
      setImgHistory(h => [...h, { role:"model", text:replyText||"Imagen generada.", image:imgData }]);
      toast_("◎ IMAGEN GENERADA", GEM_PURPLE);
    } catch(err) {
      setImgError(err.message || "Error de generación");
      setImgHistory(h => [...h, { role:"model", text:`⚠ Error: ${err.message}`, image:null }]);
    }
    setImgBusy(false);
  };

  // ── REMOVE.BG ────────────────────────────────────────────────────────────────
  const RBG_COLOR = "#F97316";

  const removeBackground = async (blob) => {
    setRbgBusy(true); setRbgError(null); setRbgResult(null);
    const formData = new FormData();
    formData.append("size", "auto");
    formData.append("image_file", blob);
    try {
      const res = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: { "X-Api-Key": rbgKey },
        body: formData,
      });
      if (res.ok) {
        const buf = await res.arrayBuffer();
        const url = URL.createObjectURL(new Blob([buf], { type:"image/png" }));
        setRbgResult(url);
        toast_("✂ FONDO ELIMINADO", RBG_COLOR);
      } else {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
    } catch(e) { setRbgError(e.message); }
    setRbgBusy(false);
  };

  const rbgFromFile = (e) => {
    const file = e.target.files?.[0];
    if (file) removeBackground(file);
    e.target.value = "";
  };

  const rbgFromGenerated = () => {
    if (!imgResult) return;
    const byteStr = atob(imgResult);
    const arr = new Uint8Array(byteStr.length);
    for (let i=0; i<byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);
    removeBackground(new Blob([arr], { type:"image/png" }));
  };

  const resetImgChat = () => {
    setImgHistory([]); setImgResult(null); setImgError(null); setImgPrompt("");
    toast_("↺ SESIÓN DE IMÁGENES REINICIADA", GEM_PURPLE);
  };

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
    { id:"mercados", label:"MERCADOS",   icon:"◎" },
    { id:"imagen",   label:"IMÁGENES",   icon:"✦" },
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
              (!q||c.cmd.toLowerCase().includes(q)||c.desc.toLowerCase().includes(q))
            );
            const tc = t=>t==="skill"?G.cyan:t==="workflow"?G.yellow:G.green;
            const tl = t=>t==="skill"?"SKILL":t==="workflow"?"FLOW":"SYS";
            const builtins  = COMMANDS_REF.filter(c=>c.type==="builtin").length;
            const skills    = COMMANDS_REF.filter(c=>c.type==="skill").length;
            const workflows = COMMANDS_REF.filter(c=>c.type==="workflow").length;
            return (
              <div style={{ display:"flex",flexDirection:"column",gap:14,height:"calc(100vh - 195px)" }}>

                {/* ── CABECERA DE STATS ── */}
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10 }}>
                  {[[builtins,"COMANDOS SYS",G.green,"◉"],[skills,"SKILLS",G.cyan,"◈"],[workflows,"WORKFLOWS",G.yellow,"▲"]].map(([n,l,c,ic])=>(
                    <div key={l} style={{ padding:"12px 16px",background:G.panel,border:`1px solid ${c}30`,borderRadius:4,display:"flex",alignItems:"center",gap:14,boxShadow:`inset 0 0 20px ${c}08` }}>
                      <div style={{ fontSize:28,fontFamily:"'Orbitron',monospace",color:c,fontWeight:900,textShadow:`0 0 16px ${c}`,lineHeight:1 }}>{n}</div>
                      <div>
                        <div style={{ fontSize:8,color:c,letterSpacing:3,marginBottom:2 }}>{ic} {l}</div>
                        <div style={{ width:40,height:2,background:`${c}30`,borderRadius:1 }}><div style={{ width:`${(n/COMMANDS_REF.length*100)}%`,height:"100%",background:c,boxShadow:`0 0 6px ${c}` }} /></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── CUERPO PRINCIPAL ── */}
                <div style={{ display:"grid",gridTemplateColumns:"160px 1fr",gap:14,flex:1,minHeight:0 }}>

                  {/* Sidebar de categorías */}
                  <div style={{ background:G.panel,border:`1px solid ${G.border}`,borderRadius:4,overflow:"hidden",display:"flex",flexDirection:"column" }}>
                    <div style={{ padding:"8px 12px",borderBottom:`1px solid ${G.border}`,fontSize:9,color:G.green,letterSpacing:3 }}>◈ CATEGORÍAS</div>
                    <div style={{ overflowY:"auto",flex:1 }}>
                      {CMD_CATS.map(cat=>{
                        const cnt = cat==="TODOS"?COMMANDS_REF.length:COMMANDS_REF.filter(c=>c.cat===cat).length;
                        const active = cmdCat===cat;
                        return (
                          <div key={cat} onClick={()=>setCmdCat(cat)} style={{ padding:"9px 12px",cursor:"pointer",background:active?`${G.green}12`:"transparent",borderLeft:`2px solid ${active?G.green:"transparent"}`,display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all .15s" }}
                            onMouseEnter={e=>{ if(!active) e.currentTarget.style.background=`${G.green}07`; }}
                            onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}
                          >
                            <span style={{ fontSize:9,color:active?G.green:G.muted,letterSpacing:1 }}>{cat}</span>
                            <span style={{ fontSize:8,color:active?G.green:G.border,background:active?`${G.green}20`:`${G.border}30`,padding:"1px 5px",borderRadius:8 }}>{cnt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Panel de comandos */}
                  <div style={{ background:G.panel,border:`1px solid ${G.border}`,borderRadius:4,display:"flex",flexDirection:"column",overflow:"hidden" }}>

                    {/* Barra de búsqueda tipo terminal */}
                    <div style={{ padding:"10px 14px",borderBottom:`1px solid ${G.border}`,display:"flex",alignItems:"center",gap:10,background:`${G.green}04` }}>
                      <span style={{ color:G.green,fontSize:12,fontFamily:"'Orbitron',monospace",fontWeight:900 }}>GHOST://&gt;</span>
                      <input
                        value={cmdSearch}
                        onChange={e=>setCmdSearch(e.target.value)}
                        placeholder="buscar comando..."
                        style={{ flex:1,background:"transparent",border:"none",color:G.green,fontSize:12,caretColor:G.green,fontFamily:"'Courier New',monospace" }}
                      />
                      {cmdSearch
                        ? <button onClick={()=>setCmdSearch("")} style={{ background:"none",border:`1px solid ${G.muted}40`,borderRadius:2,color:G.muted,cursor:"pointer",fontSize:10,padding:"2px 7px",fontFamily:"monospace" }}>CLR</button>
                        : <span style={{ fontSize:9,color:G.muted,letterSpacing:1,animation:"blink 1.4s infinite" }}>█</span>
                      }
                      <span style={{ fontSize:9,color:G.muted,letterSpacing:1,whiteSpace:"nowrap" }}>{filtered.length} / {COMMANDS_REF.length}</span>
                    </div>

                    {/* Cabecera de columnas */}
                    <div style={{ display:"grid",gridTemplateColumns:"42px 200px 55px 1fr",gap:10,padding:"6px 14px",borderBottom:`1px solid ${G.border}`,background:`${G.green}03` }}>
                      {["#","COMANDO","TIPO","DESCRIPCIÓN"].map(h=>(
                        <span key={h} style={{ fontSize:8,color:G.muted,letterSpacing:2 }}>{h}</span>
                      ))}
                    </div>

                    {/* Filas de comandos */}
                    <div style={{ overflowY:"auto",flex:1 }}>
                      {filtered.length===0
                        ? (
                          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:10,color:G.muted }}>
                            <div style={{ fontSize:28,opacity:.3 }}>/</div>
                            <div style={{ fontSize:10,letterSpacing:3 }}>// SIN RESULTADOS //</div>
                            <div style={{ fontSize:9,color:G.border }}>Intenta con otro término</div>
                          </div>
                        )
                        : filtered.map((c,i)=>(
                          <div key={i}
                            style={{ display:"grid",gridTemplateColumns:"42px 200px 55px 1fr",gap:10,padding:"9px 14px",borderBottom:`1px solid ${G.border}08`,alignItems:"start",cursor:"default",transition:"background .12s" }}
                            onMouseEnter={e=>{
                              e.currentTarget.style.background=`${tc(c.type)}08`;
                              e.currentTarget.style.borderLeft=`2px solid ${tc(c.type)}60`;
                            }}
                            onMouseLeave={e=>{
                              e.currentTarget.style.background="transparent";
                              e.currentTarget.style.borderLeft="2px solid transparent";
                            }}
                          >
                            <span style={{ fontSize:9,color:G.border,letterSpacing:1,paddingTop:2 }}>{String(i+1).padStart(2,"0")}</span>
                            <code style={{ fontSize:11,color:G.green,fontFamily:"'Courier New',monospace",wordBreak:"break-all",textShadow:`0 0 8px ${G.green}40` }}>{c.cmd}</code>
                            <div style={{ alignSelf:"start",paddingTop:1 }}>
                              <span style={{ fontSize:7,padding:"2px 6px",background:`${tc(c.type)}18`,color:tc(c.type),borderRadius:2,border:`1px solid ${tc(c.type)}50`,letterSpacing:1,boxShadow:`0 0 6px ${tc(c.type)}20` }}>
                                {tl(c.type)}
                              </span>
                            </div>
                            <span style={{ fontSize:11,color:G.text,lineHeight:1.7,opacity:.85 }}>{c.desc}</span>
                          </div>
                        ))
                      }
                    </div>

                    {/* Pie del panel */}
                    <div style={{ padding:"6px 14px",borderTop:`1px solid ${G.border}`,display:"flex",gap:18,alignItems:"center",background:`${G.green}03` }}>
                      {[["◉ SYS",G.green],["◈ SKILL",G.cyan],["▲ FLOW",G.yellow]].map(([l,c])=>(
                        <div key={l} style={{ display:"flex",alignItems:"center",gap:5 }}>
                          <span style={{ width:6,height:6,background:c,borderRadius:1,display:"inline-block",boxShadow:`0 0 5px ${c}` }} />
                          <span style={{ fontSize:8,color:c,letterSpacing:1 }}>{l}</span>
                        </div>
                      ))}
                      <div style={{ flex:1 }} />
                      <span style={{ fontSize:8,color:G.muted,letterSpacing:1 }}>CLAUDE CODE — REFERENCIA v2</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── TAB: MERCADOS ── */}
          {tab==="mercados"&&(()=>{
            const COINS = [
              { id:"bitcoin",  label:"BITCOIN",  sym:"BTC", icon:"₿" },
              { id:"ethereum", label:"ETHEREUM", sym:"ETH", icon:"Ξ" },
              { id:"solana",   label:"SOLANA",   sym:"SOL", icon:"◎" },
              { id:"ripple",   label:"XRP",      sym:"XRP", icon:"✕" },
              { id:"cardano",  label:"CARDANO",  sym:"ADA", icon:"₳" },
            ];
            const PAIRS = [
              { key:"MXN", label:"USD/MXN", flag:"🇲🇽" },
              { key:"EUR", label:"USD/EUR", flag:"🇪🇺" },
              { key:"GBP", label:"USD/GBP", flag:"🇬🇧" },
              { key:"JPY", label:"USD/JPY", flag:"🇯🇵" },
              { key:"BRL", label:"USD/BRL", flag:"🇧🇷" },
            ];
            const chgColor = v => !v ? G.muted : v>0 ? G.green : G.red;
            const chgSign  = v => !v ? "" : v>0 ? "▲" : "▼";
            const fmt = (n,d=2) => n==null?"—":n.toLocaleString("es-MX",{minimumFractionDigits:d,maximumFractionDigits:d});
            return (
              <div style={{ display:"flex",flexDirection:"column",gap:14,height:"calc(100vh - 195px)" }}>

                {/* ── CABECERA ── */}
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",background:G.panel,border:`1px solid ${G.border}`,borderRadius:4 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                    <div style={{ fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,color:G.cyan,letterSpacing:4,textShadow:`0 0 16px ${G.cyan}` }}>◎ MAIA MARKETS</div>
                    <div style={{ fontSize:9,color:G.muted,letterSpacing:2 }}>MULTI-AGENT INVESTMENT ANALYSIS</div>
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    {mktLoading && <div style={{ fontSize:9,color:G.cyan,letterSpacing:2,animation:"blink 1s infinite" }}>● ACTUALIZANDO...</div>}
                    {mktUpdate  && <div style={{ fontSize:9,color:G.muted,letterSpacing:1 }}>Última actualización: {mktUpdate.toLocaleTimeString("es-MX",{hour12:false})}</div>}
                    <button onClick={fetchMarkets} disabled={mktLoading}
                      style={{ padding:"5px 12px",background:"transparent",border:`1px solid ${G.cyan}50`,borderRadius:3,color:G.cyan,fontSize:9,letterSpacing:2,cursor:"pointer",fontFamily:"monospace",opacity:mktLoading?.4:1 }}>
                      ↺ REFRESH
                    </button>
                  </div>
                </div>

                {/* ── CUERPO ── */}
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,flex:1,minHeight:0 }}>

                  {/* CRYPTO */}
                  <div style={{ background:G.panel,border:`1px solid ${G.border}`,borderRadius:4,display:"flex",flexDirection:"column",overflow:"hidden" }}>
                    <div style={{ padding:"8px 14px",borderBottom:`1px solid ${G.border}`,display:"flex",alignItems:"center",gap:8,background:`${G.cyan}06` }}>
                      <span style={{ fontSize:10,color:G.cyan,letterSpacing:3,fontFamily:"monospace",fontWeight:700 }}>₿ CRIPTOMONEDAS</span>
                      <div style={{ flex:1 }} />
                      <span style={{ fontSize:8,color:G.muted }}>vía CoinGecko</span>
                    </div>
                    <div style={{ flex:1,overflowY:"auto" }}>
                      {!crypto
                        ? <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:G.muted,fontSize:10,letterSpacing:2,animation:"blink 1s infinite" }}>CONECTANDO...</div>
                        : COINS.map(c=>{
                          const d = crypto[c.id];
                          const chg = d?.usd_24h_change;
                          const mc  = d?.usd_market_cap;
                          return (
                            <div key={c.id} style={{ display:"grid",gridTemplateColumns:"36px 1fr auto",gap:10,padding:"12px 14px",borderBottom:`1px solid ${G.border}08`,alignItems:"center",transition:"background .12s" }}
                              onMouseEnter={e=>e.currentTarget.style.background=`${G.cyan}06`}
                              onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                            >
                              <div style={{ width:34,height:34,borderRadius:4,border:`1px solid ${G.cyan}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:G.cyan,background:`${G.cyan}10`,boxShadow:`0 0 8px ${G.cyan}20` }}>
                                {c.icon}
                              </div>
                              <div>
                                <div style={{ fontSize:10,color:G.text,fontWeight:700,letterSpacing:1,marginBottom:2 }}>{c.sym} <span style={{ fontSize:8,color:G.muted,fontWeight:400 }}>{c.label}</span></div>
                                {mc && <div style={{ fontSize:8,color:G.muted }}>Cap: ${(mc/1e9).toFixed(1)}B</div>}
                              </div>
                              <div style={{ textAlign:"right" }}>
                                <div style={{ fontSize:13,color:G.green,fontWeight:700,fontFamily:"'Orbitron',monospace",textShadow:`0 0 8px ${G.green}60` }}>
                                  ${fmt(d?.usd)}
                                </div>
                                <div style={{ fontSize:9,color:chgColor(chg),marginTop:2 }}>
                                  {chgSign(chg)} {chg!=null?Math.abs(chg).toFixed(2):"—"}%
                                </div>
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>

                  {/* FOREX + INFO MAIA */}
                  <div style={{ display:"flex",flexDirection:"column",gap:14 }}>

                    {/* Forex */}
                    <div style={{ background:G.panel,border:`1px solid ${G.border}`,borderRadius:4,display:"flex",flexDirection:"column",overflow:"hidden",flex:1 }}>
                      <div style={{ padding:"8px 14px",borderBottom:`1px solid ${G.border}`,display:"flex",alignItems:"center",gap:8,background:`${G.yellow}06` }}>
                        <span style={{ fontSize:10,color:G.yellow,letterSpacing:3,fontFamily:"monospace",fontWeight:700 }}>◉ FOREX</span>
                        <div style={{ flex:1 }} />
                        <span style={{ fontSize:8,color:G.muted }}>vía Frankfurter</span>
                      </div>
                      <div style={{ flex:1,overflowY:"auto" }}>
                        {!forex
                          ? <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:G.muted,fontSize:10,letterSpacing:2,animation:"blink 1s infinite" }}>CONECTANDO...</div>
                          : PAIRS.map(p=>{
                            const rate = forex.rates?.[p.key];
                            return (
                              <div key={p.key} style={{ display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderBottom:`1px solid ${G.border}08`,transition:"background .12s" }}
                                onMouseEnter={e=>e.currentTarget.style.background=`${G.yellow}06`}
                                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                              >
                                <span style={{ fontSize:18 }}>{p.flag}</span>
                                <div style={{ flex:1 }}>
                                  <div style={{ fontSize:10,color:G.text,fontWeight:700,letterSpacing:1 }}>{p.label}</div>
                                  <div style={{ fontSize:8,color:G.muted }}>1 USD =</div>
                                </div>
                                <div style={{ fontSize:14,color:G.yellow,fontWeight:700,fontFamily:"'Orbitron',monospace",textShadow:`0 0 8px ${G.yellow}60` }}>
                                  {fmt(rate,4)}
                                </div>
                              </div>
                            );
                          })
                        }
                      </div>
                    </div>

                    {/* Banner MAIA */}
                    <div style={{ background:G.panel,border:`1px solid ${G.cyan}30`,borderRadius:4,padding:"16px",boxShadow:`0 0 20px ${G.cyan}10` }}>
                      <div style={{ display:"flex",gap:10,marginBottom:10,alignItems:"flex-start" }}>
                        <div style={{ width:36,height:36,border:`2px solid ${G.cyan}`,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",color:G.cyan,fontSize:16,flexShrink:0,animation:"glow 3s infinite" }}>◎</div>
                        <div>
                          <div style={{ fontSize:11,color:G.cyan,fontWeight:700,letterSpacing:2,marginBottom:3 }}>MAIA — ANÁLISIS PROFUNDO</div>
                          <div style={{ fontSize:10,color:G.muted,lineHeight:1.6 }}>5 agentes de IA analizan crypto, acciones, forex y materias primas en paralelo según tu perfil de riesgo.</div>
                        </div>
                      </div>
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:12 }}>
                        {[["4","Analistas sectoriales",G.cyan],["1","Estratega IA",G.green],["∞","Activos cubiertos",G.yellow]].map(([n,l,c])=>(
                          <div key={l} style={{ padding:"8px",background:`${c}08`,border:`1px solid ${c}25`,borderRadius:3,textAlign:"center" }}>
                            <div style={{ fontSize:18,color:c,fontWeight:700,fontFamily:"'Orbitron',monospace" }}>{n}</div>
                            <div style={{ fontSize:7,color:G.muted,letterSpacing:1,marginTop:2 }}>{l}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize:9,color:G.muted,letterSpacing:1,padding:"8px",background:`${G.green}05`,borderRadius:3,border:`1px solid ${G.border}`,marginBottom:10 }}>
                        💬 En Claude Code escribe: <span style={{ color:G.green }}>"Analiza los mercados"</span> o <span style={{ color:G.green }}>"Run tododeia"</span>
                      </div>
                      <a href="http://localhost:3420" target="_blank" rel="noreferrer"
                        style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"10px",background:`${G.cyan}15`,border:`1px solid ${G.cyan}50`,borderRadius:4,textDecoration:"none",cursor:"pointer",marginBottom:4 }}>
                        <span style={{ fontSize:14,color:G.cyan }}>◎</span>
                        <span style={{ fontSize:10,color:G.cyan,letterSpacing:2,fontWeight:700 }}>VER REPORTE MAIA COMPLETO</span>
                        <span style={{ fontSize:9,color:G.muted }}>localhost:3420 ↗</span>
                      </a>
                      <div style={{ fontSize:8,color:G.border,letterSpacing:1,textAlign:"center" }}>
                        ⚠ Análisis educativo — no constituye asesoría financiera · by @soyenriquerocha
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── TAB: IMÁGENES (GEMINI NANO-BANANA) ── */}
          {tab==="imagen"&&(()=>{
            const GP = "#A78BFA";
            const EXAMPLES = [
              "Un samurái cyberpunk en Monterrey de noche",
              "G.H.O.S.T. — sistema de IA en una sala de servidores verde neón",
              "Un peleador de UFC rodeado de luz y gloria",
              "Ciudad futurista con armaduras de hierro volando",
            ];
            return (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 420px", gap:14, height:"calc(100vh - 195px)" }}>

                {/* ── Panel principal: chat + imagen ── */}
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

                  {/* Historial del chat */}
                  <div ref={imgChatEl} style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:14, background:G.panel, border:`1px solid ${G.border}`, borderRadius:4, padding:14, minHeight:0 }}>
                    {imgHistory.length===0 && (
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:16, opacity:.6 }}>
                        <div style={{ fontSize:48, filter:`drop-shadow(0 0 20px ${GP})` }}>✦</div>
                        <div style={{ fontSize:12, color:GP, letterSpacing:3, textAlign:"center" }}>NANO-BANANA LISTO</div>
                        <div style={{ fontSize:10, color:G.muted, textAlign:"center", maxWidth:360, lineHeight:1.8 }}>
                          Describe lo que quieres generar. Puedo crear imágenes, editarlas en conversación multi-turno y aplicar estilos complejos.
                        </div>
                      </div>
                    )}
                    {imgHistory.map((m,i)=>(
                      <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", flexDirection:m.role==="user"?"row-reverse":"row" }}>
                        <div style={{ width:30, height:30, borderRadius:4, flexShrink:0, border:`1px solid ${m.role==="model"?GP:G.dim}`, display:"flex", alignItems:"center", justifyContent:"center", background:m.role==="model"?`${GP}15`:`${G.dim}30`, fontSize:14, color:m.role==="model"?GP:G.muted }}>
                          {m.role==="model"?"✦":"J"}
                        </div>
                        <div style={{ maxWidth:"75%", display:"flex", flexDirection:"column", gap:8 }}>
                          {m.role==="model"&&<div style={{ fontSize:9, color:GP, letterSpacing:2 }}>NANO-BANANA · GEMINI</div>}
                          {m.text&&<div style={{ padding:"10px 13px", borderRadius:4, background:m.role==="model"?`${GP}08`:`${G.dim}20`, border:`1px solid ${m.role==="model"?GP+"25":G.dim}`, fontSize:12, color:G.text, lineHeight:1.7 }}>{m.text}</div>}
                          {m.image&&(
                            <div style={{ position:"relative", borderRadius:6, overflow:"hidden", border:`1px solid ${GP}40`, boxShadow:`0 0 20px ${GP}20` }}>
                              <img src={`data:image/png;base64,${m.image}`} style={{ width:"100%", display:"block", borderRadius:4 }} alt="Imagen generada" />
                              <a href={`data:image/png;base64,${m.image}`} download="ghost-imagen.png"
                                style={{ position:"absolute", bottom:8, right:8, padding:"5px 10px", background:`${GP}cc`, borderRadius:3, fontSize:9, color:"#fff", textDecoration:"none", letterSpacing:1 }}>
                                ↓ DESCARGAR
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {imgBusy&&(
                      <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                        <div style={{ width:30, height:30, borderRadius:4, border:`1px solid ${GP}`, display:"flex", alignItems:"center", justifyContent:"center", background:`${GP}15`, fontSize:14, color:GP }}>✦</div>
                        <div style={{ padding:"10px 14px", borderRadius:4, background:`${GP}08`, border:`1px solid ${GP}25` }}>
                          <div style={{ fontSize:9, color:GP, letterSpacing:2, marginBottom:6 }}>GENERANDO IMAGEN...</div>
                          <div style={{ display:"flex", gap:5 }}>
                            {[0,1,2].map(i=><div key={i} style={{ width:6, height:6, borderRadius:"50%", background:GP, animation:`pulse 1s ${i*.2}s infinite` }}/>)}
                          </div>
                        </div>
                      </div>
                    )}
                    {imgError&&<div style={{ padding:"8px 12px", background:`${G.red}12`, border:`1px solid ${G.red}40`, borderRadius:4, fontSize:11, color:G.red }}>⚠ {imgError}</div>}
                  </div>

                  {/* Input */}
                  <div style={{ background:G.panel, border:`1px solid ${GP}40`, borderRadius:4, padding:"12px 14px" }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <span style={{ color:GP, fontSize:14, flexShrink:0 }}>✦</span>
                      <input
                        value={imgPrompt}
                        onChange={e=>setImgPrompt(e.target.value)}
                        onKeyDown={e=>{ if(e.key==="Enter"&&!imgBusy&&imgPrompt.trim()&&geminiKey) generateImage(); }}
                        placeholder={!geminiKey?"Configura tu API key →":"Describe la imagen que quieres generar..."}
                        disabled={imgBusy||!geminiKey}
                        style={{ flex:1, background:"transparent", border:"none", color:imgBusy||!geminiKey?G.muted:GP, fontSize:12, caretColor:GP }}
                      />
                      <button onClick={generateImage} disabled={imgBusy||!imgPrompt.trim()||!geminiKey}
                        style={{ padding:"7px 16px", background:imgBusy||!imgPrompt.trim()||!geminiKey?G.green3:GP, border:"none", borderRadius:3, color:"#000", fontSize:10, fontWeight:700, cursor:imgBusy||!imgPrompt.trim()||!geminiKey?"not-allowed":"pointer", letterSpacing:2, opacity:imgBusy?.5:1, transition:"all .2s" }}>
                        {imgBusy?"...":"GENERAR"}
                      </button>
                      <button onClick={resetImgChat} title="Nueva sesión"
                        style={{ padding:"7px 10px", background:"transparent", border:`1px solid ${G.muted}40`, borderRadius:3, color:G.muted, fontSize:13, cursor:"pointer" }}>↺</button>
                    </div>
                  </div>
                </div>

                {/* ── Panel lateral: config + ejemplos + última imagen grande ── */}
                <div style={{ display:"flex", flexDirection:"column", gap:12, overflow:"hidden" }}>

                  {/* API Key + Guía de setup */}
                  <Panel title={geminiKey?"GEMINI · CONECTADO":"CONFIGURACIÓN — NANO-BANANA"} icon="✦" accent={GP}>
                    {geminiKey ? (
                      <div>
                        {/* Estado conectado */}
                        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", background:`${GP}10`, border:`1px solid ${GP}30`, borderRadius:4, marginBottom:10 }}>
                          <span style={{ width:8, height:8, borderRadius:"50%", background:GP, display:"inline-block", boxShadow:`0 0 8px ${GP}`, animation:"pulse 1.5s infinite", flexShrink:0 }}/>
                          <div>
                            <div style={{ fontSize:10, color:GP, letterSpacing:1 }}>NANO-BANANA ACTIVO</div>
                            <div style={{ fontSize:8, color:G.muted }}>Key: AIza...{geminiKey.slice(-6)}</div>
                          </div>
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                          {[
                            ["◉","Generación de imágenes",true],
                            ["◉","Edición multi-turno",true],
                            ["◉","Gemini 2.0 Flash",true],
                          ].map(([ic,label,ok])=>(
                            <div key={label} style={{ display:"flex", alignItems:"center", gap:6, fontSize:9, color:ok?GP:G.muted }}>
                              <span style={{ fontSize:8 }}>{ic}</span>{label}
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop:12 }}>
                          <GBtn color={G.red} small onClick={()=>{ setGeminiKey(""); setGeminiKeyInput(""); resetImgChat(); }}>✕ DESCONECTAR</GBtn>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>

                        {/* Pasos */}
                        {[
                          { n:"01", title:"Abre Google AI Studio", desc:"Ve a aistudio.google.com/apikey", link:"https://aistudio.google.com/apikey", tag:"ABRIR →" },
                          { n:"02", title:"Inicia sesión", desc:"Con tu cuenta de Google" },
                          { n:"03", title:"Crea la API key", desc:'Clic en "Create API key" → "in new project"' },
                          { n:"04", title:"Copia la key", desc:'Empieza con "AIzaSy..." (39 caracteres)' },
                          { n:"05", title:"Pégala aquí abajo", desc:"Presiona CONECTAR y listo 🎨" },
                        ].map(s=>(
                          <div key={s.n} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                            <div style={{ width:22, height:22, borderRadius:3, background:`${GP}20`, border:`1px solid ${GP}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, color:GP, fontWeight:700, flexShrink:0, letterSpacing:0 }}>
                              {s.n}
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                                <span style={{ fontSize:10, color:G.text, fontWeight:700 }}>{s.title}</span>
                                {s.link && (
                                  <a href={s.link} target="_blank" rel="noreferrer"
                                    style={{ fontSize:8, color:GP, background:`${GP}15`, border:`1px solid ${GP}40`, borderRadius:2, padding:"1px 6px", textDecoration:"none", letterSpacing:1 }}>
                                    {s.tag}
                                  </a>
                                )}
                              </div>
                              <div style={{ fontSize:9, color:G.muted, lineHeight:1.5 }}>{s.desc}</div>
                            </div>
                          </div>
                        ))}

                        {/* Separador */}
                        <div style={{ height:1, background:`${GP}20`, margin:"2px 0" }}/>

                        {/* Input key */}
                        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                          <div style={{ fontSize:8, color:GP, letterSpacing:2 }}>PASO 05 — PEGA TU KEY</div>
                          <input
                            value={geminiKeyInput}
                            onChange={e=>setGeminiKeyInput(e.target.value)}
                            onKeyDown={e=>{ if(e.key==="Enter"&&geminiKeyInput.startsWith("AIza")) setGeminiKey(geminiKeyInput.trim()); }}
                            placeholder="AIzaSy..."
                            style={{ background:`${GP}08`, border:`1px solid ${geminiKeyInput.startsWith("AIza")?GP:GP+"30"}`, borderRadius:3, padding:"8px 10px", color:GP, fontSize:11, fontFamily:"monospace", letterSpacing:1, transition:"border .2s" }}
                          />
                          {geminiKeyInput && !geminiKeyInput.startsWith("AIza") && (
                            <div style={{ fontSize:8, color:G.red, letterSpacing:1 }}>⚠ La key debe empezar con "AIza"</div>
                          )}
                          <button onClick={()=>geminiKeyInput.startsWith("AIza")&&setGeminiKey(geminiKeyInput.trim())}
                            disabled={!geminiKeyInput.startsWith("AIza")}
                            style={{ padding:"9px", background:geminiKeyInput.startsWith("AIza")?GP:`${GP}30`, border:"none", borderRadius:3, color:"#000", fontSize:10, fontWeight:700, cursor:geminiKeyInput.startsWith("AIza")?"pointer":"not-allowed", letterSpacing:2, transition:"all .2s" }}>
                            ✦ CONECTAR CON GEMINI
                          </button>
                        </div>

                        {/* Nota de seguridad */}
                        <div style={{ fontSize:8, color:G.border, lineHeight:1.6, padding:"6px 8px", background:`${G.green}04`, borderRadius:3, border:`1px solid ${G.border}` }}>
                          🔒 La key se guarda solo en tu navegador. Nunca la compartas en chats ni código.
                        </div>

                      </div>
                    )}
                  </Panel>

                  {/* Imagen actual grande */}
                  {imgResult
                    ? (
                      <Panel title="ÚLTIMA IMAGEN" icon="◈" accent={GP} style={{ flex:1, overflow:"hidden" }}>
                        <div style={{ position:"relative", borderRadius:4, overflow:"hidden" }}>
                          <img src={`data:image/png;base64,${imgResult}`} style={{ width:"100%", display:"block", borderRadius:4 }} alt="Resultado" />
                          <div style={{ display:"flex", gap:8, marginTop:8 }}>
                            <a href={`data:image/png;base64,${imgResult}`} download="ghost-imagen.png"
                              style={{ flex:1, padding:"7px", background:`${GP}20`, border:`1px solid ${GP}50`, borderRadius:3, fontSize:9, color:GP, textDecoration:"none", textAlign:"center", letterSpacing:2 }}>
                              ↓ DESCARGAR
                            </a>
                            <GBtn color={GP} small onClick={()=>{ setImgPrompt("Edita la imagen: "); }}>✏ EDITAR</GBtn>
                          </div>
                        </div>
                      </Panel>
                    )
                    : (
                      /* Prompts de ejemplo */
                      <Panel title="EJEMPLOS RÁPIDOS" icon="◈" accent={GP}>
                        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                          {EXAMPLES.map((ex,i)=>(
                            <div key={i} onClick={()=>{ if(geminiKey){ setImgPrompt(ex); } }}
                              style={{ padding:"9px 11px", border:`1px solid ${GP}25`, borderRadius:3, fontSize:10, color:G.muted, cursor:geminiKey?"pointer":"default", background:"transparent", transition:"all .15s", lineHeight:1.5 }}
                              onMouseEnter={e=>{ if(geminiKey){ e.currentTarget.style.background=`${GP}10`; e.currentTarget.style.color=GP; }}}
                              onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=G.muted; }}>
                              ✦ {ex}
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop:10, padding:"8px", background:`${GP}06`, borderRadius:3, border:`1px solid ${GP}20` }}>
                          <div style={{ fontSize:8, color:GP, letterSpacing:2, marginBottom:4 }}>MULTI-TURNO</div>
                          <div style={{ fontSize:9, color:G.muted, lineHeight:1.7 }}>
                            Después de generar una imagen puedes pedirme que la edite: "Hazla más oscura", "Agrega lluvia", "Cambia el color del traje"...
                          </div>
                        </div>
                      </Panel>
                    )
                  }

                  {/* ── REMOVE.BG ── */}
                  <Panel title="QUITAR FONDO — REMOVE.BG" icon="✂" accent={RBG_COLOR}>
                    <input ref={rbgFileRef} type="file" accept="image/*" onChange={rbgFromFile} style={{ display:"none" }}/>

                    {!rbgKey ? (
                      /* Setup key */
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        <div style={{ fontSize:9, color:G.muted, lineHeight:1.6 }}>
                          Elimina el fondo de cualquier imagen. API key gratuita en <span style={{ color:RBG_COLOR }}>remove.bg/api</span>
                        </div>
                        <input
                          value={rbgKeyInput}
                          onChange={e=>setRbgKeyInput(e.target.value)}
                          onKeyDown={e=>{ if(e.key==="Enter"&&rbgKeyInput.trim()) setRbgKey(rbgKeyInput.trim()); }}
                          placeholder="tu-api-key-remove-bg"
                          style={{ background:`${RBG_COLOR}08`, border:`1px solid ${RBG_COLOR}30`, borderRadius:3, padding:"7px 10px", color:RBG_COLOR, fontSize:11, fontFamily:"monospace" }}
                        />
                        <button onClick={()=>rbgKeyInput.trim()&&setRbgKey(rbgKeyInput.trim())}
                          disabled={!rbgKeyInput.trim()}
                          style={{ padding:"8px", background:rbgKeyInput.trim()?RBG_COLOR:`${RBG_COLOR}30`, border:"none", borderRadius:3, color:"#000", fontSize:10, fontWeight:700, cursor:rbgKeyInput.trim()?"pointer":"not-allowed", letterSpacing:2 }}>
                          ✂ CONECTAR REMOVE.BG
                        </button>
                      </div>
                    ) : (
                      /* Herramientas activas */
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                          <span style={{ width:6, height:6, borderRadius:"50%", background:RBG_COLOR, display:"inline-block", animation:"pulse 1.5s infinite" }}/>
                          <span style={{ fontSize:9, color:RBG_COLOR, letterSpacing:1 }}>CONECTADO</span>
                          <div style={{ flex:1 }}/>
                          <button onClick={()=>{ setRbgKey(""); setRbgKeyInput(""); setRbgResult(null); }}
                            style={{ background:"none", border:"none", color:G.muted, cursor:"pointer", fontSize:10 }}>✕</button>
                        </div>

                        {/* Botones de acción */}
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={()=>rbgFileRef.current?.click()} disabled={rbgBusy}
                            style={{ flex:1, padding:"8px 6px", background:`${RBG_COLOR}15`, border:`1px solid ${RBG_COLOR}50`, borderRadius:3, color:RBG_COLOR, fontSize:9, letterSpacing:1, cursor:"pointer", fontFamily:"monospace" }}>
                            📁 SUBIR FOTO
                          </button>
                          {imgResult && (
                            <button onClick={rbgFromGenerated} disabled={rbgBusy}
                              style={{ flex:1, padding:"8px 6px", background:`${GP}15`, border:`1px solid ${GP}50`, borderRadius:3, color:GP, fontSize:9, letterSpacing:1, cursor:"pointer", fontFamily:"monospace" }}>
                              ✦ USA GENERADA
                            </button>
                          )}
                        </div>

                        {/* Estado / resultado */}
                        {rbgBusy && (
                          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px", background:`${RBG_COLOR}08`, borderRadius:3, border:`1px solid ${RBG_COLOR}25` }}>
                            <div style={{ display:"flex", gap:4 }}>
                              {[0,1,2].map(i=><div key={i} style={{ width:5, height:5, borderRadius:"50%", background:RBG_COLOR, animation:`pulse 1s ${i*.2}s infinite` }}/>)}
                            </div>
                            <span style={{ fontSize:9, color:RBG_COLOR }}>PROCESANDO...</span>
                          </div>
                        )}
                        {rbgError && (
                          <div style={{ fontSize:9, color:G.red, padding:"6px 8px", background:`${G.red}10`, borderRadius:3 }}>⚠ {rbgError}</div>
                        )}
                        {rbgResult && (
                          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                            <div style={{ borderRadius:4, overflow:"hidden", border:`1px solid ${RBG_COLOR}40`, background:"repeating-conic-gradient(#1a1a1a 0% 25%, #222 0% 50%) 0 0 / 12px 12px" }}>
                              <img src={rbgResult} style={{ width:"100%", display:"block" }} alt="Sin fondo"/>
                            </div>
                            <a href={rbgResult} download="sin-fondo.png"
                              style={{ display:"block", padding:"7px", background:`${RBG_COLOR}20`, border:`1px solid ${RBG_COLOR}50`, borderRadius:3, fontSize:9, color:RBG_COLOR, textDecoration:"none", textAlign:"center", letterSpacing:2 }}>
                              ↓ DESCARGAR PNG
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </Panel>

                  {/* ── UI/UX PRO MAX — ESTILOS DE DISEÑO ── */}
                  <Panel title="ESTILOS DE DISEÑO — UI/UX PRO" icon="🎨" accent="#E879F9">
                    {/* Buscador */}
                    <input
                      value={uiSearch}
                      onChange={e=>setUiSearch(e.target.value)}
                      placeholder="Buscar estilo: cyberpunk, glass, retro..."
                      style={{ width:"100%", padding:"7px 10px", background:"#E879F908", border:"1px solid #E879F930", borderRadius:3, color:"#E879F9", fontSize:10, fontFamily:"monospace", marginBottom:8, outline:"none", boxSizing:"border-box" }}
                    />
                    <div style={{ fontSize:8, color:G.muted, letterSpacing:1, marginBottom:8 }}>
                      Toca un estilo → se agrega al prompt de imagen
                    </div>
                    {/* Lista de estilos */}
                    <div style={{ display:"flex", flexDirection:"column", gap:5, maxHeight:220, overflowY:"auto" }}>
                      {UIPRO_STYLES
                        .filter(s => !uiSearch.trim() || s.n.toLowerCase().includes(uiSearch.toLowerCase()) || s.p.toLowerCase().includes(uiSearch.toLowerCase()))
                        .map((s,i)=>(
                          <div key={i}
                            onClick={()=>{ setImgPrompt(prev => (prev?prev+", ":"")+s.p); setUiSearch(""); }}
                            title={s.p}
                            style={{ padding:"7px 10px", border:"1px solid #E879F920", borderRadius:3, cursor:"pointer", background:"transparent", transition:"all .15s", display:"flex", flexDirection:"column", gap:2 }}
                            onMouseEnter={e=>{ e.currentTarget.style.background="#E879F910"; e.currentTarget.style.borderColor="#E879F960"; }}
                            onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="#E879F920"; }}>
                            <span style={{ fontSize:10, color:"#E879F9", fontWeight:700, letterSpacing:1 }}>🎨 {s.n}</span>
                            <span style={{ fontSize:8, color:G.muted, lineHeight:1.5, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.p.slice(0,70)}...</span>
                          </div>
                        ))
                      }
                    </div>
                    {/* Badge UI/UX Pro */}
                    <div style={{ marginTop:8, padding:"6px 8px", background:"#E879F908", borderRadius:3, border:"1px solid #E879F920", display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:12 }}>✦</span>
                      <div>
                        <div style={{ fontSize:8, color:"#E879F9", letterSpacing:2 }}>UI/UX PRO MAX v2.6.3</div>
                        <div style={{ fontSize:7, color:G.muted }}>67 estilos · 96 paletas · 57 tipografías · by nextlevelbuilder</div>
                      </div>
                    </div>
                  </Panel>

                  {/* Badge Nano-Banana */}
                  <div style={{ padding:"10px 14px", background:G.panel, border:`1px solid ${GP}25`, borderRadius:4, display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ fontSize:22 }}>🍌</div>
                    <div>
                      <div style={{ fontSize:9, color:GP, letterSpacing:2 }}>NANO-BANANA 2</div>
                      <div style={{ fontSize:8, color:G.muted }}>Gemini · Google AI · Generación de imágenes</div>
                    </div>
                  </div>
                </div>
              </div>
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
