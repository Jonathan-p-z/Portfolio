# yaiito.fr

Mon portfolio personnel. Terminal theme, bilingue FR/EN, construit avec Next.js 14.

## Stack

- **Next.js 14** App Router avec le segment `[locale]` pour l'i18n
- **next-intl** — locale détectée via cookie, pas de `/fr/` dans l'URL
- **Tailwind CSS** — palette terminal custom (`#0d1117` / `#c9d1d9` / `#39d353`)
- **TypeScript** strict

## Structure

```
src/
├── app/[locale]/       # layout + page principale
├── components/
│   ├── Navbar.tsx
│   ├── LanguageSwitcher.tsx
│   └── sections/       # Hero, Skills, TerminalProjects, CTF, About, Contact
├── i18n/               # routing, request, navigation next-intl
└── middleware.ts
messages/               # fr.json + en.json
```

## Lancer en local

```bash
npm install
npm run dev
```

## Ce qui mérite une explication

**TerminalProjects** — terminal interactif simulé (`ls`, `cd`, `cat README.md`, `clear`, historique flèches). Les projets sont des "dossiers" avec leurs propres README traduits dans `messages/*.json`.

**Typewriter Hero** — deux `useEffect` séparés : un pour l'animation caractère par caractère, un pour le fade-in des boutons. Un seul effect causait une race condition où le timeout du CTA se faisait cancel au moment où `done` passait à `true`.

**Locale sans préfixe** — `localePrefix: 'never'` dans next-intl, la locale vit dans un cookie `NEXT_LOCALE`. Ça évite d'avoir `/fr/` dans toutes les URLs.
