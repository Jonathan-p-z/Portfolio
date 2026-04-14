import type { Metadata } from 'next';
import { JetBrains_Mono, Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/Navbar';
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

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${jetbrainsMono.variable} ${inter.variable} bg-bg text-text`}>
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main className="pt-16 min-h-[calc(100vh-4rem)] flex flex-col">
            {children}
          </main>
          <footer className="border-t border-terminal-border py-6 px-6">
            <p className="font-mono text-xs text-terminal-muted text-center">
              {/* Footer text is static — same in FR and EN */}
              © 2026 Jonathan Perez — yaiito.fr
            </p>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
