import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import Hero             from '@/components/sections/Hero';
import Skills           from '@/components/sections/Skills';
import TerminalProjects from '@/components/sections/TerminalProjects';
import CTF              from '@/components/sections/CTF';
import Tools            from '@/components/sections/Tools';
import About            from '@/components/sections/About';
import Contact          from '@/components/sections/Contact';

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Skills />
      <TerminalProjects />
      <CTF />
      <Tools />
      <About />
      <Contact />
    </>
  );
}
