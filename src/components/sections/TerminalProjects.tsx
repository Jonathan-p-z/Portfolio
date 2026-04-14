'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

const PROJECTS = ['bastion', 'orbis', 'dropin', 'keyvault', 'valorant'] as const;
type ProjectSlug = (typeof PROJECTS)[number];

type ReadmeKey = 'readme_bastion' | 'readme_orbis' | 'readme_dropin' | 'readme_keyvault' | 'readme_valorant';

const README_KEY: Record<ProjectSlug, ReadmeKey> = {
  bastion: 'readme_bastion',
  orbis: 'readme_orbis',
  dropin: 'readme_dropin',
  keyvault: 'readme_keyvault',
  valorant: 'readme_valorant',
};

type LineKind = 'command' | 'output' | 'error' | 'accent' | 'muted';

type Line =
  | { id: number; kind: 'command'; prompt: string; cmd: string }
  | { id: number; kind: Exclude<LineKind, 'command'>; text: string };

const QUICK_CMDS = ['help', 'ls', 'cd bastion', 'cd orbis', 'cd dropin', 'cd keyvault', 'cd valorant', 'cd ..', 'clear'] as const;

let _id = 0;
const uid = () => ++_id;

export default function TerminalProjects() {
  const t = useTranslations('terminal');

  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState<ProjectSlug | null>(null);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null); // TODO: handle resize

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const focusInput = () => inputRef.current?.focus();

  const prompt = cwd ? `visitor@yaiito:~/projects/${cwd}$` : 'visitor@yaiito:~/projects$';

  const push = useCallback((kind: Exclude<LineKind, 'command'>, text: string) => {
    setLines(prev => [...prev, { id: uid(), kind, text }]);
  }, []);

  const pushAll = useCallback((texts: string[], kind: Exclude<LineKind, 'command'> = 'output') => {
    const batch = texts.map(text => ({ id: uid(), kind, text } as Line));
    setLines(prev => [...prev, ...batch]);
  }, []);

  const execute = useCallback((raw: string) => {
    const cmdStr = raw.trim();

    setLines(prev => [...prev, { id: uid(), kind: 'command', prompt, cmd: cmdStr }]);

    if (!cmdStr) return;

    setCmdHistory(prev => [cmdStr, ...prev]);
    setHistIdx(-1);

    const [command, ...args] = cmdStr.split(/\s+/);

    switch (command) {
      case 'help':
        pushAll([
          t('help_title'),
          `  help          — ${t('help_help')}`,
          `  ls            — ${t('help_ls')}`,
          `  cd <name>     — ${t('help_cd')}`,
          `  cd ..         — ${t('help_cdup')}`,
          `  cat README.md — ${t('help_cat')}`,
          `  clear         — ${t('help_clear')}`,
        ]);
        break;

      case 'ls':
        push('accent', cwd ? 'README.md' : 'bastion/  orbis/  dropin/  keyvault/  valorant/');
        break;

      case 'cd': {
        const target = args[0];
        if (!target) break;
        if (target === '..') {
          setCwd(null);
        } else if ((PROJECTS as readonly string[]).includes(target)) {
          if (cwd) {
            push('error', `cd: ${target}: ${t('no_such_dir')}`);
          } else {
            setCwd(target as ProjectSlug);
          }
        } else {
          push('error', `cd: ${target}: ${t('no_such_dir')}`);
        }
        break;
      }

      case 'cat': {
        const file = args[0];
        if (file === 'README.md') {
          if (cwd) {
            pushAll(t(README_KEY[cwd]).split('\n'));
          } else {
            push('error', t('no_readme_here'));
          }
        } else {
          push('error', `cat: ${file ?? ''}: ${t('no_such_file')}`);
        }
        break;
      }

      case 'clear':
        setLines([]);
        break;

      default:
        push('error', `${command}: ${t('cmd_not_found')}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cwd, prompt, push, pushAll, t]);

  // TODO: add tab completion maybe
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      execute(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(next);
      if (next >= 0) setInput(cmdHistory[next]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? '' : cmdHistory[next]);
    }
  };

  return (
    <section
      id="projects"
      className="scroll-mt-16 px-6 py-20 max-w-5xl mx-auto w-full"
    >
      <h2 className="font-mono text-terminal-accent mb-6 text-base">
        {t('section_title')}
      </h2>

      <div
        className="border border-terminal-border rounded-sm cursor-text select-none"
        onClick={focusInput}
      >
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-terminal-border bg-terminal-surface/60">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="font-mono text-xs text-terminal-muted ml-3 select-text">
            {t('hint')}
          </span>
        </div>

        <div
          ref={scrollRef}
          className="h-[400px] overflow-y-auto p-4 space-y-0.5 bg-terminal-bg"
        >
          {lines.map(line =>
            line.kind === 'command' ? (
              <p key={line.id} className="font-mono text-sm leading-relaxed">
                <span className="text-terminal-accent">{line.prompt}</span>
                <span className="text-terminal-text"> {line.cmd}</span>
              </p>
            ) : (
              <p
                key={line.id}
                className={[
                  'font-mono text-sm leading-relaxed select-text',
                  line.kind === 'error'  ? 'text-red-400' :
                  line.kind === 'accent' ? 'text-terminal-accent' :
                  line.kind === 'muted'  ? 'text-terminal-muted' :
                  'text-terminal-text',
                ].join(' ')}
              >
                {/* empty lines from README splits need to take up space */}
                {line.text || '\u00a0'}
              </p>
            )
          )}

          <div className="flex items-center font-mono text-sm">
            <span className="text-terminal-accent shrink-0">{prompt}&nbsp;</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-terminal-text caret-terminal-accent select-text"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label="terminal input"
            />
          </div>
        </div>
      </div>

      {/* boutons mobiles — le clavier virtuel rend le terminal difficile à utiliser */}
      <div className="flex flex-wrap gap-2 mt-3 md:hidden">
        {QUICK_CMDS.map(cmd => (
          <button
            key={cmd}
            onClick={() => { execute(cmd); focusInput(); }}
            className="
              font-mono text-xs
              border border-terminal-border text-terminal-muted
              px-3 py-1.5 rounded-sm
              hover:border-terminal-accent/50 hover:text-terminal-text
              active:bg-terminal-surface
              transition-colors
            "
          >
            {cmd}
          </button>
        ))}
      </div>
    </section>
  );
}
