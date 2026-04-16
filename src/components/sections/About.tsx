'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import SectionTitle from '@/components/SectionTitle';

export default function About() {
  const t = useTranslations('about');

  return (
    <motion.section
      id="about"
      className="scroll-mt-16 px-6 py-32 max-w-6xl mx-auto w-full"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <SectionTitle
        text={t('title')}
        className="font-mono text-terminal-accent mb-8 text-base"
      />

      <div className="border-l-2 border-terminal-accent/50 pl-6">
        <p className="font-sans text-terminal-text leading-relaxed max-w-2xl">
          {t('body')}
        </p>
      </div>
    </motion.section>
  );
}
