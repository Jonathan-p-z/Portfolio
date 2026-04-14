import { useTranslations } from 'next-intl';

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

function SkillTag({ label }: { label: string }) {
  return (
    <span className="
      inline-block font-mono text-sm
      border border-terminal-accent/25
      bg-terminal-accent/5
      text-terminal-text
      px-3 py-1
      rounded-sm
    ">
      {label}
    </span>
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
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <SkillTag key={skill} label={skill} />
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  const t = useTranslations('skills');

  return (
    <section
      id="skills"
      className="scroll-mt-16 px-6 py-20 max-w-5xl mx-auto w-full"
    >
      <h2 className="font-mono text-terminal-accent mb-10 text-base">
        {t('title')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <SkillColumn title={t('defensive')} skills={DEFENSIVE} />
        <SkillColumn title={t('offensive')} skills={OFFENSIVE} />
      </div>
    </section>
  );
}
