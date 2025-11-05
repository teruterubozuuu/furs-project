import LPHome from "./components/LPHome";
import LPAbout from "./components/LPAbout";
import LPContact from "./components/LPContact";
import LPFooter from "./components/LPFooter";

// Placeholder component for the Features section
const LPFeatures = () => (
  <div className="min-h-screen bg-gray-100 p-10 flex flex-col items-center justify-center">
    <h2 className="text-4xl font-extrabold text-[#2e7d32] mb-8">
      App Features
    </h2>
  </div>
);

// Placeholder component for the About section content

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
