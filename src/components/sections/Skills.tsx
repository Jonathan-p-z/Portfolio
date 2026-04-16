'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import SectionTitle from '@/components/SectionTitle';

const DEFENSIVE = [
  'SIEM', 'Suricata', 'Wireshark', 'Splunk', 'Nmap',
  'Forensic', 'Hardening Linux', 'Lynis', 'Analyse de logs',
  'IDS/IPS', 'Malware Analysis', 'YARA', 'FakeNet-NG',
];

const OFFENSIVE = [
  'CTF', 'Pentest Web', 'Metasploit', 'Burp Suite',
  'SQLi', 'XSS', 'OSINT', 'Sherlock', 'Maigret',
  'Ghidra', 'x64dbg', 'Binary Ninja', 'ProcMon',
];

const pillVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

function SkillTag({ label }: { label: string }) {
  return (
    <motion.span
      variants={pillVariants}
      className="
        inline-block font-mono text-sm
        border border-terminal-accent/25
        bg-terminal-accent/5
        text-terminal-text
        px-3 py-1
        rounded-sm
      "
    >
      {label}
    </motion.span>
  );
}

function SkillColumn({
  title,
  skills,
}: {
  title: string;
  skills: string[];
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-mono text-sm text-terminal-accent tracking-wide">
        {title}
      </h3>
      <motion.div
        className="flex flex-wrap gap-2"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {skills.map((skill) => (
          <SkillTag key={skill} label={skill} />
        ))}
      </motion.div>
    </div>
  );
}

export default function Skills() {
  const t = useTranslations('skills');

  return (
    <motion.section
      id="skills"
      className="scroll-mt-16 px-6 py-32 max-w-6xl mx-auto w-full"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <SectionTitle
        text={t('title')}
        className="font-mono text-terminal-accent mb-10 text-base"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <SkillColumn title={t('defensive')} skills={DEFENSIVE} />
        <SkillColumn title={t('offensive')} skills={OFFENSIVE} />
      </div>
    </motion.section>
  );
}
