import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';

const NAV_LINKS = [
  { href: '#about',    key: 'about'    },
  { href: '#skills',   key: 'skills'   },
  { href: '#projects', key: 'projects' },
  { href: '#ctf',      key: 'ctf'      },
  { href: '#contact',  key: 'contact'  },
] as const;

export default function Navbar() {
  const t = useTranslations('nav');

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-terminal-bg border-b border-terminal-border">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 h-14">

        {/* Logo */}
        <Link
          href="/"
          className="font-mono text-terminal-accent text-sm shrink-0 select-none"
        >
          <span className="text-terminal-muted">~/</span>yaiito
        </Link>

        {/* Nav links */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, key }) => (
            <li key={key}>
              <a
                href={href}
                className="
                  font-sans text-sm text-terminal-muted px-3 py-1.5 rounded
                  hover:text-terminal-text hover:bg-terminal-surface
                  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terminal-accent
                "
              >
                {t(key)}
              </a>
            </li>
          ))}
        </ul>

        {/* Language switcher */}
        <LanguageSwitcher />

      </nav>
    </header>
  );
}
