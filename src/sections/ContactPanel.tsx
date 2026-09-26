"use client";

import { useState } from "react";
import { buttonClasses } from "@/components/Button";
import { Check, Copy, LinkedIn, Mail, WhatsApp } from "@/components/Icons";
import { mailtoLink, profile, whatsappLink } from "@/data/profile";
import { cn } from "@/lib/site";

const topics = [
  "AI video",
  "Ad creatives",
  "Social media content",
  "Digital marketing",
  "AI automation",
  "A landing page",
  "A full-time role",
] as const;

type Topic = (typeof topics)[number];

function compose(topic: Topic | null) {
  if (topic === "A full-time role") {
    return {
      subject: "Opportunity for Bishoy Emad",
      message: "Hi Bishoy, I saw your portfolio and I’d like to talk to you about a role.",
    };
  }
  const about = topic ? topic.toLowerCase() : "a project";
  return {
    subject: topic ? `Project enquiry: ${topic}` : "Project enquiry",
    message: `Hi Bishoy, I saw your portfolio and I’d like to talk about ${about}.`,
  };
}

export function ContactPanel() {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [copied, setCopied] = useState(false);
  const { subject, message } = compose(topic);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.assign(mailtoLink(subject, message));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
      <fieldset className="lg:col-span-6">
        <legend className="label text-faint">What can I help with?</legend>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {topics.map((item) => {
            const selected = topic === item;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={selected}
                onClick={() => setTopic(selected ? null : item)}
                className={cn(
                  "h-11 cursor-pointer rounded-full border px-4 text-[0.9375rem] transition-colors duration-300",
                  selected
                    ? "border-paper bg-paper text-ink"
                    : "border-line-strong text-mute hover:border-paper/60 hover:text-paper",
                )}
              >
                {item}
              </button>
            );
          })}
        </div>
        <p className="mt-5 text-sm text-faint" aria-live="polite">
          {topic ? `Your message will start with: “${message}”` : "Pick one and your message is written for you."}
        </p>
      </fieldset>

      <div className="lg:col-span-5 lg:col-start-8">
        <div className="grid gap-3">
          <a href={mailtoLink(subject, `${message}\n\n`)} className={buttonClasses("primary", "lg", "justify-between!")}>
            <span className="flex items-center gap-3">
              <Mail width={18} height={18} />
              Email me
            </span>
            <span className="hidden text-sm text-ink/60 sm:inline">{profile.email}</span>
          </a>
          <a
            href={whatsappLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("secondary", "lg", "justify-between!")}
          >
            <span className="flex items-center gap-3">
              <WhatsApp width={18} height={18} />
              WhatsApp
            </span>
            <span className="text-sm text-faint">Chat</span>
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("secondary", "lg", "justify-between!")}
          >
            <span className="flex items-center gap-3">
              <LinkedIn width={18} height={18} />
              LinkedIn
            </span>
            <span className="text-sm text-faint">Connect</span>
          </a>
        </div>

        <button
          type="button"
          onClick={copyEmail}
          className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm text-mute transition-colors hover:text-paper"
        >
          {copied ? <Check width={16} height={16} className="text-signal" /> : <Copy width={16} height={16} />}
          <span aria-live="polite">{copied ? "Email address copied" : `Copy email: ${profile.email}`}</span>
        </button>
      </div>
    </div>
  );
}
