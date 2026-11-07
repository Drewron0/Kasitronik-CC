import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import GuideSection from "./components/GuideSection";
import WorkflowSection from "./components/WorkflowSection";
import PreparationSection from "./components/PreparationSection";
import Footer from "./components/Footer";
import ScrollReveal from "./components/ScrollReveal";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.home} id="top">
      <a href="#main" className={styles.skipLink}>
        Lewati navigasi
      </a>

      <Header variant="home" />

      <main id="main">
        <HeroSection />

        <ScrollReveal delay={50}>
          <GuideSection />
        </ScrollReveal>

        <ScrollReveal delay={50}>
          <WorkflowSection />
        </ScrollReveal>

        <ScrollReveal delay={50}>
          <PreparationSection />
        </ScrollReveal>
      </main>

      <Footer showBackToTop={true} />
    </div>
  );
}
