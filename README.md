# G.H.O.S.T. IA

**G**lobal **H**azard **O**perations & **S**trategic **T**hreat Intelligence Assistant

An AI-powered command terminal interface built with React, styled as a military operations center. Integrates with the Claude API to deliver immersive, personality-driven conversations in Spanish.

## Features

- 🤖 **AI Chat** — Powered by Claude (Sonnet), with four selectable personalities: sarcastic, military protocol, professional/humorous, and warm/encouraging
- 🛡️ **Armor Diagnostics** — Real-time status panel for suits Mark I–LXXXV (power, shields, weapons)
- ⚠️ **Threat Monitor** — Global threat detection with criticality levels, coordinates, and neutralization controls
- 💓 **Vital Signs** — Live biometric simulation (heart rate, O₂, temperature, stress) updated every 3 seconds
- 🔊 **Text-to-Speech** — Spanish voice synthesis matched to the active personality

- 🤝 **Agent tool use** — GHOST controls the panel directly (deploy/retire armor, neutralize threats, switch tabs, query live status) via Claude tool calling, instead of guessing actions from text

## Tech Stack

- React + Vite
- Claude API (`claude-sonnet-4-20250514`, tool use)
- Web Speech API
- CSS animations (scanlines, glow, grid overlay)

## Getting Started

```bash
npm install
npm run dev
```

Open the app in your browser, click **🔑 SIN API KEY** in the header, and paste your
[Anthropic API key](https://console.anthropic.com/settings/keys). The key is stored only in
your browser's `localStorage` and is sent directly to `api.anthropic.com` — never to any
other server.

```bash
npm run build    # production build in dist/
npm run preview  # preview the production build locally
```

## Live Demo

[ghost-ia.vercel.app](https://ghost-ia.vercel.app)

## License

MIT
