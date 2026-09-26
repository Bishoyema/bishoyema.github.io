import Link from "next/link";
import { mailtoLink, profile, whatsappLink } from "@/data/profile";
import { Container } from "./Container";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="footer" className="border-t border-line py-10 text-sm text-mute">
      <Container className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-6">
          <p className="font-display text-2xl uppercase text-paper">{profile.name}</p>
          <p className="mt-1">{profile.role} · {profile.location}</p>
          <p className="mt-5 max-w-lg text-faint">
            All visuals and films on this site were created by {profile.name} using AI. Concept projects are
            independent and not affiliated with the brands shown.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 md:col-span-6 md:justify-end">
          <a href={mailtoLink("Project enquiry")} className="transition-colors hover:text-paper">
            Email
          </a>
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-paper">
            WhatsApp
          </a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-paper">
            LinkedIn
          </a>
          <Link href="/#top" className="transition-colors hover:text-paper">
            Back to top ↑
          </Link>
        </div>
        <p className="text-faint md:col-span-12">© {year} {profile.name}</p>
      </Container>
    </footer>
  );
}
