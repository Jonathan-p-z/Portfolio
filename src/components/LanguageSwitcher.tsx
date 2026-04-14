'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (next: 'fr' | 'en') => {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {(['fr', 'en'] as const).map((lang, i) => (
        <span key={lang} className="flex items-center gap-0.5">
          {i > 0 && (
            <span className="text-terminal-border text-xs select-none mx-0.5">/</span>
          )}
          <button
            onClick={() => switchLocale(lang)}
            disabled={isPending}
            aria-label={lang === 'fr' ? 'Passer en français' : 'Switch to English'}
            className={[
              'font-mono text-xs px-1.5 py-1 rounded',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terminal-accent',
              locale === lang
                ? 'text-terminal-accent font-semibold'
                : 'text-terminal-muted hover:text-terminal-text',
            ].join(' ')}
          >
            {lang.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
