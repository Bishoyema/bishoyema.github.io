import { About } from "@/sections/About";
import { AIVideo } from "@/sections/AIVideo";
import { Capabilities } from "@/sections/Capabilities";
import { Certifications } from "@/sections/Certifications";
import { Contact } from "@/sections/Contact";
import { Hero } from "@/sections/Hero";
import { SelectedWork } from "@/sections/SelectedWork";
import { Services } from "@/sections/Services";
import { Showreel } from "@/sections/Showreel";
import { WhyMe } from "@/sections/WhyMe";

export default function Home() {
  return (
    <>
      <Hero />
      <Showreel />
      <SelectedWork />
      <AIVideo />
      <Services />
      <About />
      <Capabilities />
      <Certifications />
      <WhyMe />
      <Contact />
    </>
  );
}
