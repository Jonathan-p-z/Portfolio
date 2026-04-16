import type { Metadata } from 'next';
import { JetBrains_Mono, Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/Navbar';
import MouseTracker from '@/components/MouseTracker';
import '../globals.css';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
    icons: {
      icon: '/avatar.png',
      apple: '/avatar.png',
    },
    openGraph: {
      title: 'Jonathan Perez — Yaiito',
      description: 'Étudiant Cybersécurité — SOC / Analyste Sécurité — Aix-Marseille-Provence',
      url: 'https://yaiito.fr',
      siteName: 'yaiito.fr',
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: 'Jonathan Perez — Yaiito',
      description: 'Étudiant Cybersécurité — SOC / Analyste Sécurité — Aix-Marseille-Provence',
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'fr' | 'en')) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${jetbrainsMono.variable} ${inter.variable} bg-bg text-text`}>
        <NextIntlClientProvider messages={messages}>
          <MouseTracker />
          <Navbar />
          <main className="pt-16 min-h-[calc(100vh-4rem)] flex flex-col">
            {children}
          </main>
          <footer className="border-t border-terminal-border py-6 px-6">
            <p className="font-mono text-xs text-terminal-muted text-center">
              © 2026 Jonathan Perez — yaiito.fr
            </p>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
