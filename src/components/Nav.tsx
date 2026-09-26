"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useCallback, useEffect, useRef, useState } from "react";
import { mailtoLink, profile, whatsappLink } from "@/data/profile";
import { cn } from "@/lib/site";
import { ButtonLink } from "./Button";
import { Container } from "./Container";
import { ArrowUpRight, Close, Menu } from "./Icons";

const links = [
  { id: "work", label: "Work", href: "/#work" },
  { id: "services", label: "Services", href: "/#services" },
  { id: "about", label: "About", href: "/#about" },
  { id: "contact", label: "Contact", href: "/#contact" },
];

export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSection, setActive] = useState<string | null>(null);
  const active = isHome ? activeSection : null;
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the nav item for the section crossing the middle of the viewport.
  useEffect(() => {
    if (!isHome) return;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.getAttribute("data-nav"));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [isHome]);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled || open ? "border-line bg-ink/80 backdrop-blur-xl" : "border-transparent bg-transparent",
        )}
      >
        <Container className="flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="font-display text-[1.375rem] uppercase leading-none tracking-[0.01em]"
          >
            Bishoy Emad<span className="sr-only">, home</span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
            {links.map((link) => {
              const isActive = active === link.id;
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "relative text-[0.9375rem] transition-colors duration-300 hover:text-paper",
                    isActive ? "text-paper" : "text-mute",
                  )}
                >
                  {link.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -bottom-2 left-1/2 size-1 -translate-x-1/2 rounded-full bg-signal transition-opacity duration-300",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ButtonLink href="/#contact" size="md" onClick={() => setOpen(false)} className="px-4 sm:px-5">
              <span className="sm:hidden">Let’s talk</span>
              <span className="hidden sm:inline">Let’s Work Together</span>
            </ButtonLink>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid size-11 place-items-center rounded-full border border-line-strong text-paper transition-colors hover:border-paper/70 lg:hidden"
            >
              {open ? <Close /> : <Menu />}
            </button>
          </div>
        </Container>
      </header>

      <AnimatePresence>{open && <MobileMenu onClose={close} />}</AnimatePresence>
    </>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const content = [document.getElementById("main"), document.getElementById("footer")];
    content.forEach((element) => element?.setAttribute("inert", ""));
    firstLinkRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) onClose();
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      root.style.overflow = previousOverflow;
      content.forEach((element) => element?.removeAttribute("inert"));
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [onClose]);

  return (
    <m.div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-40 overflow-y-auto bg-ink pt-16 lg:hidden"
    >
      <Container className="flex min-h-full flex-col justify-between gap-12 pb-10 pt-10">
        <nav aria-label="Mobile">
          <ul>
            {links.map((link, index) => (
              <m.li
                key={link.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.06 * index + 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="border-b border-line"
              >
                <Link
                  ref={index === 0 ? firstLinkRef : undefined}
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center justify-between py-4 font-display text-[clamp(2.75rem,13vw,4.5rem)] uppercase leading-none"
                >
                  {link.label}
                  <ArrowUpRight width={28} height={28} className="text-mute" />
                </Link>
              </m.li>
            ))}
          </ul>
        </nav>

        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid gap-3 text-mute"
        >
          <p className="label">Get in touch</p>
          <a href={mailtoLink("Project enquiry")} className="text-lg text-paper">
            {profile.email}
          </a>
          <div className="flex gap-5 text-[0.9375rem]">
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-paper">
              WhatsApp
            </a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-paper">
              LinkedIn
            </a>
          </div>
        </m.div>
      </Container>
    </m.div>
  );
}
