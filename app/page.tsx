import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import ProblemsSection from "./components/ProblemsSection";
import FeaturesSection from "./components/FeaturesSection";
import ResultsSection from "./components/ResultsSection";
import StepsSection from "./components/StepsSection";
import FaqSection from "./components/FaqSection";
import CtaSection from "./components/CtaSection";
import Footer from "./components/Footer";
import AnalyticsTracker from "./components/analytics/AnalyticsTracker";

export default function Home() {
  return (
    <div id="top">
      <AnalyticsTracker event="landing_viewed" />
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
