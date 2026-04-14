import { useTranslations } from 'next-intl';

const PLATFORMS = [
  {
    name: 'Root-Me',
    url: 'https://www.root-me.org/Yaiito',
  },
  {
    name: 'TryHackMe',
    url: 'https://tryhackme.com/p/Yaiito',
  },
  {
    name: 'HackTheBox',
    url: 'https://app.hackthebox.com/profile/Yaiito',
  },
] as const;

const WRITEUP_PLACEHOLDERS = [
  'bastion-web-sqli.md',
  'thm-advent-of-cyber-2024.md',
  'htb-machine-analysis.md',
] as const;

function PlatformCard({ name, url, label }: { name: string; url: string; label: string }) {
  return (
    <article className="
      flex flex-col gap-4
      border border-terminal-border
      bg-terminal-surface/40
      p-5 rounded-sm
      hover:border-terminal-accent/40
      transition-colors
    ">
      <h3 className="font-mono text-terminal-accent text-base font-semibold">
        {name}
      </h3>

      <p className="font-mono text-xs text-terminal-muted break-all flex-1">
        {url}
      </p>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="
          self-start font-mono text-xs
          border border-terminal-accent/40
          bg-terminal-accent/5
          text-terminal-accent
          px-3 py-1.5 rounded-sm
          hover:bg-terminal-accent hover:text-terminal-bg
          transition-colors
        "
      >
        {label}
      </a>
    </article>
  );
}

export default function CTF() {
  const t = useTranslations('ctf');

  return (
    <section
      id="ctf"
      className="scroll-mt-16 px-6 py-20 max-w-5xl mx-auto w-full"
    >
      <h2 className="font-mono text-terminal-accent mb-10 text-base">
        {t('title')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {PLATFORMS.map((p) => (
          <PlatformCard
            key={p.name}
            name={p.name}
            url={p.url}
            label={t('profile')}
          />
        ))}
      </div>

      <div className="border border-terminal-border rounded-sm">
        <div className="px-4 py-2 border-b border-terminal-border bg-terminal-surface/60">
          <span className="font-mono text-sm text-terminal-accent">
            {t('writeups_title')}
          </span>
        </div>
        <ul className="p-4 space-y-2">
          {WRITEUP_PLACEHOLDERS.map((name) => (
            <li key={name} className="flex items-center gap-3 font-mono text-sm">
              <span className="text-terminal-border">—</span>
              <span className="text-terminal-muted line-through opacity-40">{name}</span>
              <span className="text-terminal-muted/60 text-xs">{t('coming_soon')}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
