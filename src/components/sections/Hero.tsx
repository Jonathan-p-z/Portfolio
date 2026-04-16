'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const TYPING_SPEED = 42; // ms per character
const LINE_PAUSE = 380; // ms between lines

// Split "> rest" into a green ">" and plain " rest"
function TerminalLine({ text }: { text: string }) {
  if (text.startsWith('>')) {
    return (
      <>
        <span className="text-terminal-accent">{'>'}</span>
        <span className="text-terminal-text">{text.slice(1)}</span>
      </>
    );
  }
  return <span className="text-terminal-text">{text}</span>;
}

function GlitchText({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      className="inline-block"
      animate={{ x: [0, -1.5, 1.5, -1, 0.5, 0] }}
      transition={{
        duration: 0.1,
        ease: 'linear',
        repeat: Infinity,
        repeatDelay: 3.9,
      }}
    >
      {children}
    </motion.span>
  );
}

export default function Hero() {
  const t = useTranslations('hero');

  const lines = useRef([t('line0'), t('line1'), t('line2'), t('line3')]);

  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [partial, setPartial] = useState('');
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    if (done) return;

    const all = lines.current;

    if (lineIdx >= all.length) {
      setDone(true);
      return;
    }

    const line = all[lineIdx];

    if (charIdx < line.length) {
      const id = setTimeout(() => {
        setPartial(line.slice(0, charIdx + 1));
        setCharIdx((c) => c + 1);
      }, TYPING_SPEED);
      return () => clearTimeout(id);
    }

    const id = setTimeout(() => {
      setCompletedLines((prev) => [...prev, line]);
      setPartial('');
      setCharIdx(0);
      setLineIdx((i) => i + 1);
    }, LINE_PAUSE);
    return () => clearTimeout(id);
  }, [lineIdx, charIdx, done]);

  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setShowCTA(true), 500);
    return () => clearTimeout(id);
  }, [done]);

  return (
    <section className="relative flex-1 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl mx-auto px-6">

        <div className="font-mono leading-relaxed space-y-3">
          {completedLines.map((line, i) => (
            <p key={i} className={i === 0 ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-base sm:text-lg md:text-xl'}>
              {i === 0 ? (
                <GlitchText>
                  <TerminalLine text={line} />
                </GlitchText>
              ) : (
                <TerminalLine text={line} />
              )}
            </p>
          ))}

          {lineIdx < lines.current.length && (
            <p className={lineIdx === 0 ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-base sm:text-lg md:text-xl'}>
              <TerminalLine text={partial} />
              <span className="text-terminal-accent animate-blink" aria-hidden>
                █
              </span>
            </p>
          )}
        </div>

        <div
          className={[
            'flex flex-wrap gap-4 mt-10',
            'transition-opacity duration-700',
            showCTA ? 'opacity-100' : 'opacity-0 pointer-events-none',
          ].join(' ')}
        >
          <a
            href="#contact"
            className="
              font-mono text-sm
              border border-terminal-accent text-terminal-accent
              px-5 py-2.5
              hover:bg-terminal-accent hover:text-terminal-bg
              transition-colors
            "
          >
            {t('cta_contact')}
          </a>
          <a
            href="https://github.com/Jonathan-p-z"
            target="_blank"
            rel="noopener noreferrer"
            className="
              font-mono text-sm
              border border-terminal-border text-terminal-muted
              px-5 py-2.5
              hover:border-terminal-text hover:text-terminal-text
              transition-colors
            "
          >
            {t('cta_github')} ↗
          </a>
        </div>

        {showCTA && (
          <p className="font-mono text-xs text-terminal-muted mt-6 animate-pulse">
            ▶ disponible pour alternance — septembre 2026
          </p>
        )}

      </div>

      {showCTA && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="font-mono text-xs text-terminal-muted"
          >
            scroll ↓
          </motion.div>
        </div>
      )}
    </section>
  );
}
