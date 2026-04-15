# yaiito.fr

Mon portfolio personnel. Terminal theme, bilingue FR/EN, construit avec Next.js 14.

## Stack

- **Next.js 14** App Router avec le segment `[locale]` pour l'i18n
- **next-intl** — locale détectée via cookie, pas de `/fr/` dans l'URL
- **Tailwind CSS** — palette terminal custom (`#0d1117` / `#c9d1d9` / `#39d353`)
- **TypeScript** strict
- **Framer Motion** — scroll reveal, stagger, navbar scroll, glitch hero
- **Rust / WASM** — crate `wasm-tools` compilée avec wasm-pack, chargée dynamiquement côté client

## Structure

```
src/
├── app/[locale]/       # layout + page principale
├── components/
│   ├── Navbar.tsx
│   ├── LanguageSwitcher.tsx
│   ├── SectionTitle.tsx  # typewriter déclenché par IntersectionObserver
│   └── sections/         # Hero, Skills, TerminalProjects, CTF, Tools, About, Contact
└── i18n/               # routing, request, navigation next-intl
messages/               # fr.json + en.json
wasm-tools/             # crate Rust → compilée en WASM via wasm-pack
├── src/lib.rs          # analyze_logs() + extract_iocs()
├── Cargo.toml
└── (target/ ignoré)
public/wasm/            # artefacts générés : wasm_tools.js + wasm_tools_bg.wasm
```

## Lancer en local

```bash
npm install
npm run dev
```

Rebuilder le WASM après modification de `wasm-tools/src/lib.rs` :

```bash
cd wasm-tools
wasm-pack build --target web --out-dir ../public/wasm
```

## Ce qui mérite une explication

**TerminalProjects** — terminal interactif simulé (`ls`, `cd`, `cat README.md`, `clear`, historique flèches). Les projets sont des "dossiers" avec leurs propres README traduits dans `messages/*.json`.

**Typewriter Hero** — deux `useEffect` séparés : un pour l'animation caractère par caractère, un pour le fade-in des boutons. Un seul effect causait une race condition où le timeout du CTA se faisait cancel au moment où `done` passait à `true`.

**Locale sans préfixe** — `localePrefix: 'never'` dans next-intl, la locale vit dans un cookie `NEXT_LOCALE`. Ça évite d'avoir `/fr/` dans toutes les URLs.

**Tools (WASM)** — le module `/public/wasm/wasm_tools.js` est un artefact wasm-pack `--target web` : il ne peut pas être bundlé par webpack (pas dans `src/`, pas de types déclarés). Le chargement se fait avec `import(/* webpackIgnore: true */ ...)` pour court-circuiter webpack, côté client uniquement grâce au guard `typeof window === 'undefined'`. L'init du binaire `.wasm` est appelée explicitement via `mod.default()` avant d'utiliser les fonctions exportées.

**Animations Framer Motion** — les sections utilisent `whileInView` avec `viewport={{ once: true }}` pour déclencher le fade+slide une seule fois au scroll. Les pills Skills utilisent le système `variants` avec `staggerChildren: 0.05` sur le conteneur : chaque `motion.span` hérite automatiquement des variants `hidden/visible` du parent sans prop supplémentaire.
