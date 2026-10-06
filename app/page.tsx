import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import ProblemsSection from "./components/ProblemsSection";
import FeaturesSection from "./components/FeaturesSection";
import ResultsSection from "./components/ResultsSection";
import StepsSection from "./components/StepsSection";
import FaqSection from "./components/FaqSection";
import CtaSection from "./components/CtaSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div id="top">
      <Header />
      <main>
        <HeroSection />
        <ProblemsSection />
        <FeaturesSection />
        <ResultsSection />
        <StepsSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
