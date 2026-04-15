'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import SectionTitle from '@/components/SectionTitle';

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = 'logs' | 'ioc';

type WasmMod = {
  default: (wasmUrl?: string) => Promise<unknown>;
  analyze_logs: (input: string) => string;
  extract_iocs: (input: string) => string;
};

type LogResult = {
  total_lines: number;
  top_ips: [string, number][];
  error_codes: Record<string, number>;
  bruteforce: string[];
};

type IocResult = {
  ips: string[];
  domains: string[];
  hashes: Record<string, string[]>;
  cves: string[];
  emails: string[];
};

// ─── Output formatters ───────────────────────────────────────────────────────

function formatLogResult(json: string): string[] {
  const d: LogResult = JSON.parse(json);
  const topIps = d.top_ips
    .slice(0, 8)
    .map(([ip, c]) => `${ip} (${c})`)
    .join(', ');
  const codes = Object.entries(d.error_codes)
    .sort((a, b) => b[1] - a[1])
    .map(([code, c]) => `${code} (${c})`)
    .join(', ');
  return [
    `total_lines: ${d.total_lines}`,
    `top_ips: ${topIps || 'none'}`,
    `error_codes: ${codes || 'none'}`,
    `bruteforce detected: ${d.bruteforce.join(', ') || 'none'}`,
  ];
}

function formatIocResult(json: string): string[] {
  const d: IocResult = JSON.parse(json);
  const lines: string[] = [
    `ips: ${d.ips.join(', ') || 'none'}`,
    `domains: ${d.domains.join(', ') || 'none'}`,
  ];
  const hashKeys = Object.keys(d.hashes);
  if (hashKeys.length === 0) {
    lines.push('hashes: none');
  } else {
    for (const k of hashKeys) {
      lines.push(`hashes [${k}]: ${d.hashes[k].join(', ')}`);
    }
  }
  lines.push(
    `cves: ${d.cves.join(', ') || 'none'}`,
    `emails: ${d.emails.join(', ') || 'none'}`,
  );
  return lines;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Tools() {
  const t = useTranslations('tools');

  const wasmRef = useRef<WasmMod | null>(null);
  const [wasmReady, setWasmReady] = useState(false);
  const [wasmError, setWasmError] = useState('');

  const [tab, setTab] = useState<Tab>('logs');

  const [logsInput, setLogsInput] = useState(
    '192.168.1.50 - - [15/Apr/2026] "GET /admin HTTP/1.1" 401 512\n' +
    '192.168.1.50 - - [15/Apr/2026] "GET /admin HTTP/1.1" 401 512\n' +
    '192.168.1.1 - - [15/Apr/2026] "GET /index.html HTTP/1.1" 200 1024\n' +
    'Failed password for root from 10.0.0.5 port 22\n' +
    'Failed password for root from 10.0.0.5 port 22',
  );
  const [iocInput, setIocInput] = useState(
    'Suspicious connection from 192.168.1.100 to evil.com\n' +
    'File hash: 44d88612fea8a8f36de82e1278abb02f\n' +
    'CVE-2021-44228 exploited, contact: attacker@evil.com\n' +
    'SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  );

  const [logsOutput, setLogsOutput] = useState<string[]>([]);
  const [iocOutput, setIocOutput] = useState<string[]>([]);

  const [logsError, setLogsError] = useState('');
  const [iocError, setIocError] = useState('');

  // Load WASM module once on mount — client-side only
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // @ts-expect-error — /public asset, not a bundled module
    import(/* webpackIgnore: true */ '/wasm/wasm_tools.js')
      .then((mod: WasmMod) =>
        // init the wasm binary, then forward the module reference
        mod.default().then(() => mod),
      )
      .then((mod: WasmMod) => {
        wasmRef.current = mod;
        setWasmReady(true);
      })
      .catch((err: unknown) => {
        console.error('WASM load error:', err);
        setWasmError(String(err));
      });
  }, []);

  function runAnalyze() {
    setLogsError('');
    setLogsOutput([]);
    if (!logsInput.trim()) {
      setLogsError(t('no_input'));
      return;
    }
    try {
      const json = wasmRef.current!.analyze_logs(logsInput);
      setLogsOutput(formatLogResult(json));
    } catch (e) {
      setLogsError(`${t('error_prefix')} ${String(e)}`);
    }
  }

  function runExtract() {
    setIocError('');
    setIocOutput([]);
    if (!iocInput.trim()) {
      setIocError(t('no_input'));
      return;
    }
    try {
      const json = wasmRef.current!.extract_iocs(iocInput);
      setIocOutput(formatIocResult(json));
    } catch (e) {
      setIocError(`${t('error_prefix')} ${String(e)}`);
    }
  }

  return (
    <motion.section
      id="tools"
      className="scroll-mt-16 px-6 py-20 max-w-5xl mx-auto w-full"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <SectionTitle
        text={t('title')}
        className="font-mono text-terminal-accent mb-2 text-base"
      />

      <span className="font-mono text-xs text-terminal-muted block mb-8">
        {'// exploring rust/wasm — experimental'}
      </span>

      {/* WASM load state */}
      {wasmError && (
        <p className="font-mono text-xs text-red-400 mb-6">{wasmError}</p>
      )}
      {!wasmReady && !wasmError && (
        <p className="font-mono text-xs text-terminal-muted mb-6 animate-pulse">
          {t('loading')}
        </p>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {(['logs', 'ioc'] as Tab[]).map((id) => {
          const label = id === 'logs' ? t('tab_logs') : t('tab_ioc');
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={[
                'font-mono text-xs px-3 py-1.5 border rounded-sm transition-colors',
                active
                  ? 'border-terminal-accent text-terminal-accent bg-terminal-accent/10'
                  : 'border-terminal-border text-terminal-muted hover:border-terminal-accent/50 hover:text-terminal-text',
              ].join(' ')}
            >
              [{label}]
            </button>
          );
        })}
      </div>

      {/* ── Log Analyzer ─────────────────────────────────────────── */}
      {tab === 'logs' && (
        <TabPanel
          placeholder={t('placeholder_logs')}
          value={logsInput}
          onChange={setLogsInput}
          btnLabel={t('btn_analyze')}
          onRun={runAnalyze}
          disabled={!wasmReady}
          output={logsOutput}
          error={logsError}
        />
      )}

      {/* ── IOC Extractor ────────────────────────────────────────── */}
      {tab === 'ioc' && (
        <TabPanel
          placeholder={t('placeholder_ioc')}
          value={iocInput}
          onChange={setIocInput}
          btnLabel={t('btn_extract')}
          onRun={runExtract}
          disabled={!wasmReady}
          output={iocOutput}
          error={iocError}
        />
      )}
    </motion.section>
  );
}

// ─── Shared tab layout ────────────────────────────────────────────────────────

interface TabPanelProps {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  btnLabel: string;
  onRun: () => void;
  disabled: boolean;
  output: string[];
  error: string;
}

function TabPanel({
  placeholder,
  value,
  onChange,
  btnLabel,
  onRun,
  disabled,
  output,
  error,
}: TabPanelProps) {
  return (
    <div className="space-y-4">
      {/* Input */}
      <textarea
        className="
          w-full h-36 resize-none
          font-mono text-xs text-terminal-text
          bg-terminal-surface/60 border border-terminal-border rounded-sm
          px-4 py-3 outline-none
          placeholder:text-terminal-muted/50
          focus:border-terminal-accent/60
          transition-colors
        "
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />

      {/* Run button */}
      <button
        onClick={onRun}
        disabled={disabled}
        className="
          font-mono text-sm
          border border-terminal-accent text-terminal-accent
          px-5 py-2
          hover:bg-terminal-accent hover:text-terminal-bg
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors
        "
      >
        {btnLabel}
      </button>

      {/* Output block */}
      {(output.length > 0 || error) && (
        <div
          className="
            border border-terminal-border rounded-sm
            bg-terminal-surface/40
            px-4 py-3
            overflow-y-auto
          "
          style={{ height: 200 }}
        >
          {error ? (
            <p className="font-mono text-xs text-red-400">{error}</p>
          ) : (
            output.map((line, i) => (
              <p key={i} className="font-mono text-xs text-terminal-text leading-relaxed">
                <span className="text-terminal-accent select-none">{'> '}</span>
                {line}
              </p>
            ))
          )}
        </div>
      )}
    </div>
  );
}
