import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SimpleSplitText } from '../../../utils/SimpleSplitText';

gsap.registerPlugin(ScrollTrigger);

export const useHome = () => {
  const location = useLocation();
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 900px)", () => {
      const splits: SimpleSplitText[] = [];

      const h1s = gsap.utils.toArray<HTMLElement>("h1:not([data-no-animate])");
      h1s.forEach(el => {
        const split = new SimpleSplitText(el, { type: "lines,words,chars" });
        splits.push(split);

        gsap.from(split.words, {
          yPercent: 100,
          autoAlpha: 0,
          duration: 0.7,
          ease: "power2.inOut",
          stagger: 0.05,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        });
      });

      const h2s = gsap.utils.toArray<HTMLElement>("h2:not([data-no-animate])");
      h2s.forEach(el => {
        const split = new SimpleSplitText(el, { type: "lines,words,chars" });
        splits.push(split);

        gsap.from(split.words, {
          yPercent: 100,
          autoAlpha: 0,
          duration: 0.7,
          ease: "power2.inOut",
          stagger: 0.05,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        });
      });

      const h2h3s = gsap.utils.toArray<HTMLElement>("h3");
      h2h3s.forEach(el => {
        const split = new SimpleSplitText(el, { type: "lines,words,chars" });
        splits.push(split);

        gsap.from(split.lines, {
          yPercent: 100,
          autoAlpha: 0,
          duration: 0.55,
          ease: "power1.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        });
      });

      gsap.utils.toArray<HTMLElement>("p").forEach(el => {
        gsap.from(el, {
          autoAlpha: 0,
          y: 20,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        });
      });

      return () => {
        splits.forEach(split => split.revert());
      };
    });
  }, { scope: container });

  useEffect(() => {
    if (location.hash) {
      const elementId = location.hash.substring(1);
      const scrollToSection = () => {
        const element = document.getElementById(elementId);
        if (element) {
          const header = document.querySelector('header');
          const headerHeight = header ? (header as HTMLElement).offsetHeight : 0;
          const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: elementTop - headerHeight - 20, behavior: 'smooth' });
        }
      };

      const timer = setTimeout(scrollToSection, 150); // Increased slightly for better reliability
      return () => clearTimeout(timer);
    }
  }, [location]);

  return { container };
};