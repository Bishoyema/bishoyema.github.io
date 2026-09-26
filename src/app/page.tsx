import { About } from "@/sections/About";
import { AIVideo } from "@/sections/AIVideo";
import { Contact } from "@/sections/Contact";
import { Hero } from "@/sections/Hero";
import { SelectedWork } from "@/sections/SelectedWork";
import { Services } from "@/sections/Services";
import { Showreel } from "@/sections/Showreel";
import { Certifications, Skills } from "@/sections/Skills";
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
      <Skills />
      <Certifications />
      <WhyMe />
      <Contact />
    </>
  );
}
