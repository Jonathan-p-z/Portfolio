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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLATFORMS.map((p) => (
          <PlatformCard
            key={p.name}
            name={p.name}
            url={p.url}
            label={t('profile')}
          />
        ))}
      </div>
    </section>
  );
}
