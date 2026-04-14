import Hero             from '@/components/sections/Hero';
import Skills           from '@/components/sections/Skills';
import TerminalProjects from '@/components/sections/TerminalProjects';
import CTF              from '@/components/sections/CTF';
import About            from '@/components/sections/About';
import Contact          from '@/components/sections/Contact';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Skills />
      <TerminalProjects />
      <CTF />
      <About />
      <Contact />
    </>
  );
}
