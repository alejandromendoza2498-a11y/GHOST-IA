# MEIGEN.AI — ANÁLISIS COMPLETO + PROMPTS A MI MANERA
## Referencia de diseño para GHOST-IA · Alejandro Mendoza

> Guardado: 2026-06-22 | Fuente: meigen.ai + docs.meigen.ai + múltiples fuentes

---

## 1. QUÉ ES MEIGEN.AI

Galería curada de +3,000 prompts de IA con su imagen generada. La filosofía core:
**"Ve el resultado antes de generar. Copia, pega, genera — sin ingeniería de prompts."**

Cada prompt tiene:
- Imagen de resultado real
- Texto del prompt completo (nunca truncado)
- Botón "Use as Prompt" → sidebar de generación con prompt pre-llenado
- "Describe Image" → IA extrae el prompt inverso de cualquier imagen

---

## 2. DISEÑO DE LA PLATAFORMA

### Paleta oficial (dark-first, Vercel/Linear aesthetic)
```
Background:    #09090b (zinc-950)
Surface card:  #18181b (zinc-900)
Border:        #27272a (zinc-800)
Text primary:  #fafafa (zinc-50)
Text muted:    #a1a1aa (zinc-400)
Accent ⚡:     Amber/yellow (créditos)
```

### Tipografía
- **Geist** (fuente de Vercel) para headings y body
- **Geist Mono** para bloques de prompt text
- Escala: hero 3xl-5xl bold → sección 2xl semibold → body sm-base → prompt 14px mono

### Layout
```
[Navbar: logo | search | ⚡N créditos | Sign in]
[Sidebar filtros] | [Masonry grid galería] | [Sidebar generación]
[Floating dock bottom: RUN + chips de modelos]
```

### Interacciones clave
- Cards arrastrables al sidebar de generación
- Hover revela: autor + likes + "Use as Prompt"
- Dock flotante siempre visible con botón RUN
- Búsqueda híbrida: texto + semántica visual

---

## 3. CATEGORÍAS DE PROMPTS MEIGEN

1. **Ads & Product** — foto de producto, packaging, marketing
2. **Brand & Logo** — logos, identidad de marca
3. **Illustration & 3D** — arte digital, renders 3D, diseño de personajes
4. **Posters & Visuals** — posters, key visuals, diseño gráfico
5. **Portraits** — personas, retratos, estilos fotográficos
6. **Videos** — videos IA de top creators

### Tags extendidos
Photography · Cinematic · Editorial · Cyberpunk · Vintage · Surreal · Miniature · Fashion

---

## 4. MODELOS SOPORTADOS

**Imágenes:** GPT Image 2 · NanoBanana 2 Pro · Seedream 5.0 · Midjourney V8.1 · Flux 2 Klein · Gemini Omni

**Videos:** Seedance 2.0 · Veo 3.1 · Grok Video

---

## 5. ESTRUCTURA DE PROMPTS MEIGEN (orden canónico)

```
PREMISA → SUJETO → AMBIENTE → ILUMINACIÓN → ACABADO → RATIO
```

Ejemplo base:
```
[Rol artístico si aplica]. [Descripción del sujeto]. [Entorno/fondo]. 
[Iluminación específica]. [Estilo visual/técnica]. [Detalles técnicos: ratio, calidad].
```

---

## 6. PROMPTS ORIGINALES MEIGEN (los mejores)

### [NanoBanana] 3D Floating Head Portrait
```
A hyper-stylized dynamic 3D floating head portrait with no neck or shoulder edges, 
clean cut-out, subject floating in white space with a predominantly white background 
enhanced with subtle tonal gradients and soft volumetric glow, and a thin luminous 
neon halo ring glowing behind the head.
```

### [NanoBanana] 3D Product Visualization
```
Act as a Senior 3D Product Visualization Artist and Cinematic Art Director. 
A 3D extruded logo with hyper-polished liquid chrome coating with reflectance 
value 0.98 and full ray-traced environment reflections.
```

### [NanoBanana] Pixar 3D Animated Poster
```
A Pixar/Disney 3D CGI animated movie poster with soft volumetric lighting, 
smooth subsurface skin shading, and expressive Pixar-style faces in a vertical 3:4 ratio.
```

### [GPT Image] Cinematic Couple Movie Poster
```
Generate a romantic couple movie poster image with two subjects standing close under 
soft rain light, cinematic back glow, expressive eyes, elegant outfits, realistic 
facial detail, atmospheric bokeh, emotional storytelling, no readable text, no logos, 
and a polished poster look without copying any existing film.
```

### [GPT Image] Vintage Portrait
```
Transform the subject into a vintage cafe portrait with warm lamps, wooden tables, 
film photography texture, reflective window light, elegant casual styling, natural pose, 
soft brown and teal color grading, sharp eyes, realistic hands, no text overlays, 
and a nostalgic cinematic AI photo style.
```

### [NanoBanana] Luxury Fashion Editorial
```
A luxury fashion moodboard editorial featuring [prenda/color] with minimal 
supporting elements, hyper-clean background, editorial lighting.
```

### [NanoBanana] Brand Object Interaction
```
What object do fans of this brand collect, use daily, or photograph? 
Choose a real, large, tangible object that can physically occupy space next to a person, 
then determine the most natural and visually dynamic way the real model can directly 
interact with the object.
```

---

## 7. PROMPTS ADAPTADOS — A MI MANERA (Alejandro Mendoza x GHOST)

> Estilo personal: UFC · Monterrey · México · GHOST terminal · Familia · Gloria

### 🥊 FIGHTER HERO SHOT
```
Cinematic sports portrait of a welterweight UFC fighter, 7-0 undefeated record, 
standing in a dramatic octagon corner, golden hour light from above casting sharp 
shadows, body glistening, championship mindset in the eyes, Monterrey Mexico city 
skyline glowing in the background through arena fog, neon green accent lights 
framing the fighter, editorial Sports Illustrated style, hyper-realistic skin detail, 
intense composition, no text, 9:16 vertical poster ratio.
```

### 🤖 GHOST-IA HUD PORTRAIT (GHOST aesthetic sobre foto real)
```
Futuristic HUD heads-up display overlay on a fighter portrait, thin neon green 
lines (#00FF41) scanning the subject, floating data panels with fighter stats 
(7-0, 170 lbs, Monterrey MX), matrix green particle grid background fading to 
deep black (#050A05), monospaced terminal font readouts, tactical brackets framing 
the face, holographic cyan (#00FFFF) accent elements, G.H.O.S.T. system aesthetic, 
cinematic 16:9 widescreen.
```

### 🇲🇽 POSTER UFC — MONTERREY GLORY
```
Epic UFC fight poster design for a Mexican welterweight champion from Monterrey. 
Subject posed with championship belt, Mexican flag colors subtly integrated (red, 
white, green), golden dramatic back lighting (#C8A23A gold accent), dark atmospheric 
arena background, floating fighter stats in clean modern typography, cinematic dust 
particles in light beams, motivational energy, no actual logos, movie poster 
composition, 2:3 vertical ratio.
```

### 👨‍👩‍👧‍👦 FAMILIA — EMOTIONAL CINEMATIC
```
Intimate cinematic family portrait with warm golden hour natural light, a strong 
athletic man surrounded by his beautiful family, genuine laughter and emotion, 
soft bokeh background suggesting home or nature, film photography warmth with 
subtle grain, teal and orange color grade, no text, emotional storytelling, 
luxury editorial lifestyle photography, horizontal 16:9.
```

### 🏋️ TRAINING MONTAGE POSTER
```
Dark and dramatic training montage poster composition: fighter shadowboxing in 
a dimly lit gym, single overhead spotlight creating dramatic chiaroscuro shadows, 
sweat particles frozen in motion, hyper-detailed knuckles and muscle definition, 
gritty textured background (worn gym walls), deep blacks with neon green light 
leaks on edges, motivational warrior energy, Sports Photography award-winning 
composition, vertical 2:3 poster ratio.
```

### 💎 LUXURY BRAND — GHOST TERMINAL
```
Premium tech brand visual identity design: dark terminal interface (#050A05 background), 
phosphor green text (#00FF41) in monospace font, geometric HUD grid overlay, 
glowing G logo in center with neon border animation frames, cyberpunk meets luxury 
corporate aesthetic, gold (#C8A23A) accent lines for premium feel, holographic depth, 
clean editorial product photography style, 16:9 widescreen.
```

### 🎥 VIDEO PROMPT — HIGHLIGHT REEL (Seedance/Veo)
```
Cinematic slow-motion UFC training highlight video: fighter throwing precise 
combinations, camera orbits 360 degrees, motion blur on fast strikes, dramatic 
arena lighting with Mexican flag colors in background, crowd energy, epic orchestral 
score implied in visual pacing, slow ramp to normal speed on finishing strike, 
gold sparks and particle effects at impact point, IMAX-quality, 16:9.
```

### 🌃 MONTERREY NOCTURNO — CIUDAD Y CAMPEÓN
```
Cinematic aerial nighttime photograph of Monterrey Mexico skyline, iconic 
Cerro de la Silla mountain silhouetted against purple-teal city glow, 
a lone fighter silhouette on a rooftop in foreground, stadium lights in distance, 
atmospheric humidity haze creating lens flares, dramatic wide angle perspective, 
golden street light reflections, Mexican pride, cinematic Blade Runner aesthetic 
with Latin warmth, 21:9 cinematic ultra-wide.
```

### 🏆 CHAMPIONSHIP MOMENT
```
Hyper-cinematic split-second victory moment: fighter with fist raised after 
knockout, referee stopping the fight in background, arena explosion of confetti 
and Mexican flags, crowd roaring in blur, golden championship spotlight from above, 
genuine tears and triumph on fighter's face, Sports Illustrated magazine cover 
composition, editorial flash photography with motion blur on crowd, frozen glory 
in sharp focus, vertical 2:3.
```

### 🤖 AI SELF-PORTRAIT (GHOST personalidad)
```
Dramatic portrait of an AI entity made physical: a figure composed of holographic 
green data streams (#00FF41) forming a human silhouette, wearing tactical armor 
with circuit patterns, face partially revealed through digital static/glitch effect, 
neon cyan eyes glowing, G.H.O.S.T. terminal readouts floating around figure, 
deep black background with matrix rain particles, sci-fi cinematic composition, 
vertical 9:16.
```

---

## 8. TIPS DE MEIGEN PARA MEJORES RESULTADOS

### Fórmula de prompt de alto rendimiento:
```
[Rol artístico] + [Sujeto con detalle] + [Entorno específico] + 
[Iluminación técnica] + [Estilo visual/referencia] + [Técnica/materiales] + 
[Detalles a evitar] + [Ratio]
```

### Palabras clave que mejoran calidad:
- `hyper-realistic skin detail` — piel ultrarrealista
- `cinematic depth of field` — bokeh cinematográfico
- `volumetric lighting` — luz volumétrica dramática
- `subsurface scattering` — piel con profundidad 3D
- `ray-traced reflections` — reflejos fotorrealistas
- `atmospheric bokeh` — fondo suave artístico
- `editorial photography` — calidad revista
- `no text, no logos` — limpia la imagen de texto no deseado
- `sharp eyes, realistic hands` — evita defectos comunes IA

### Para estilo GHOST personal:
```
neon green #00FF41, matrix terminal aesthetic, 
HUD overlay, tactical brackets, monospaced readouts, 
deep black #050A05, holographic cyan, G.H.O.S.T. system
```

### Para estilo UFC/Fighter personal:
```
welterweight champion, 7-0 undefeated, Monterrey Mexico,
championship belt, octagon corner, arena lighting,
Mexican flag colors, Cerro de la Silla, gold accent #C8A23A
```

---

## 9. ESTRUCTURA DEL PANEL IMÁGENES EN GHOST

Los prompts de arriba están listos para usar directamente en la pestaña **✦ IMÁGENES** del dashboard GHOST-IA. Cópialos al campo de texto y ejecuta con Gemini NanoBanana.

Para guardar un prompt favorito como ejemplo rápido, edita el array `EXAMPLES` en `ghost-ai_3.jsx`.

---

*Análisis generado por GHOST-IA · Referencia basada en meigen.ai docs y fuentes públicas*
*No usar para reproducción comercial de prompts ajenos sin atribución*
