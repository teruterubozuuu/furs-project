import LPHome from "./components/LPHome";
import LPAbout from "./components/LPAbout";
import LPFooter from "./components/LPFooter";
import LPFeatures from "./components/LPFeatures";


export default function LandingPage() {
  return (
    <div>
      <main>
        <section id="top">
          <LPHome />
        </section>

        <section id="features">
          <LPFeatures />
        </section>

        <section id="about">
          {LPAbout ? <LPAbout /> : <LPAboutContent />}
        </section>

        <section id="contact">
          <LPFooter />
        </section>
      </main>
    </div>
  );
}
