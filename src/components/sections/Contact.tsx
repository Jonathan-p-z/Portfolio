'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import SectionTitle from '@/components/SectionTitle';

const LINKS = [
  {
    label: 'email',
    value: 'perez.jonathan.secu@gmail.com',
    href: 'mailto:perez.jonathan.secu@gmail.com',
  },
  {
    label: 'linkedin',
    value: 'linkedin.com/in/jonathan-perez-b4b919330',
    href: 'https://www.linkedin.com/in/jonathan-perez-b4b919330/',
  },
  {
    label: 'github',
    value: 'github.com/Jonathan-p-z',
    href: 'https://github.com/Jonathan-p-z',
  },
] as const;

export default function Contact() {
  const t = useTranslations('contact');

  return (
    <motion.section
      id="contact"
      className="scroll-mt-16 px-6 py-20 max-w-5xl mx-auto w-full"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <SectionTitle
        text={t('title')}
        className="font-mono text-terminal-accent mb-8 text-base"
      />

      <div className="border-l-2 border-terminal-accent/50 pl-6 space-y-3">
        {LINKS.map(({ label, value, href }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith('mailto') ? undefined : '_blank'}
            rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
            className="flex items-baseline gap-4 group w-fit"
          >
            <span className="font-mono text-sm text-terminal-muted w-16 shrink-0">
              {label}
            </span>
            <span className="font-mono text-sm text-terminal-accent group-hover:underline underline-offset-4">
              {value}
            </span>
          </a>
        ))}
      </div>

      <a
        href="/CV.pdf"
        download
        className="
          inline-block mt-8 font-mono text-sm
          border border-terminal-accent text-terminal-accent
          px-5 py-2.5
          hover:bg-terminal-accent hover:text-terminal-bg
          transition-colors
        "
      >
        {t('download_cv')}
      </a>
    </motion.section>
  );
}
