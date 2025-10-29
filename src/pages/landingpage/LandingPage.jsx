import React from "react";
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
        {/* Home Section (ID for Logo link - should be at the top) */}
        <section id="top">
          <LPHome />
        </section>

        {/* Features Section (ID for Features link) */}
        <section id="features">
          <LPFeatures />
        </section>

        {/* About Section (ID for About link) */}
        <section id="about">
          {/* If LPAbout is an actual component, use it; otherwise use the placeholder for visibility */}
          {LPAbout ? <LPAbout /> : <LPAboutContent />}
        </section>

        {/* Contact/Footer Section (ID for Contact link) - Now using the new LPFooter */}
        <section id="contact">
          <LPFooter />
        </section>
      </main>
    </div>
  );
}
