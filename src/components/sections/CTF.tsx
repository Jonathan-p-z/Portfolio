'use client';

import { useTranslations } from 'next-intl';
import { motion, useAnimate } from 'framer-motion';
import SectionTitle from '@/components/SectionTitle';

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
  const [scanRef, animate] = useAnimate();

  const handleMouseEnter = async () => {
    // Reset to top instantly, then sweep down and fade out
    await animate(scanRef.current, { top: '-2px', opacity: 1 }, { duration: 0 });
    await animate(
      scanRef.current,
      { top: '105%', opacity: [1, 1, 0] },
      { duration: 0.6, ease: 'linear' },
    );
  };

  return (
    <article
      className="
        relative overflow-hidden
        flex flex-col gap-4
        border border-terminal-border
        bg-terminal-surface/40
        p-5 rounded-sm
        hover:border-terminal-accent/40
        transition-colors
      "
      onMouseEnter={handleMouseEnter}
    >
      {/* Scan line */}
      <motion.div
        ref={scanRef}
        className="absolute left-0 right-0 pointer-events-none"
        style={{ height: 2, backgroundColor: '#39d353', top: '-2px', opacity: 0 }}
      />

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
    <motion.section
      id="ctf"
      className="scroll-mt-16 px-6 py-20 max-w-5xl mx-auto w-full"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <SectionTitle
        text={t('title')}
        className="font-mono text-terminal-accent mb-10 text-base"
      />

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
    </motion.section>
  );
}
