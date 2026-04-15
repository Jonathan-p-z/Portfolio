'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  text: string;
  className?: string;
}

export default function SectionTitle({ text, className }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  // Trigger when the element enters the viewport
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Type characters one by one at 30ms each
  useEffect(() => {
    if (!started || done) return;
    if (displayed.length >= text.length) {
      setDone(true);
      return;
    }
    const id = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, 30);
    return () => clearTimeout(id);
  }, [started, displayed, text, done]);

  return (
    <h2 ref={ref} className={className}>
      {displayed}
      {!done && (
        <span className="animate-blink text-terminal-accent ml-0.5" aria-hidden>
          █
        </span>
      )}
    </h2>
  );
}
