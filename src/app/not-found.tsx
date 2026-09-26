import type { Metadata } from "next";
import { ButtonLink } from "@/components/Button";
import { Container } from "@/components/Container";
import { Accent } from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] items-center pt-28">
      <Container>
        <p className="label text-mute">404</p>
        <h1 className="mt-5 font-display text-[clamp(3.5rem,11vw,9rem)] leading-[0.88]">
          This scene <Accent>didn’t make the cut.</Accent>
        </h1>
        <p className="mt-6 max-w-md text-lg text-mute">The page you’re looking for doesn’t exist or has moved.</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/">Back to the portfolio</ButtonLink>
          <ButtonLink href="/#work" variant="secondary">
            See the work
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
