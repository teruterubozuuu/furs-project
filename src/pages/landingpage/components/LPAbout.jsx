import React from "react";
import fursAbout from "../../../assets/furs_about.jpg";

export default function LPAbout() {
  return (
    <div className="bg-white py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold text-[#2e7d32] text-center mb-12">
          Our Mission and Creation Story
        </h2>

        {/* Responsive Two-Column Layout */}
        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Left Column: Image (50% width on medium screens and up) */}
          <div className="md:w-1/2 w-full flex justify-center p-4">
            <img
              src={fursAbout}
              alt="F.U.R.S. Team working on animal welfare"
              className="rounded-xl shadow-2xl object-cover max-h-[500px] w-full"
              style={{ objectFit: "cover" }}
            />
          </div>

          {/* Right Column: Text (50% width on medium screens and up) */}
          <div className="md:w-1/2 w-full space-y-6 text-gray-600">
            <h3 className="text-2xl font-bold text-[#fbc02d]">
              Founded with a Purpose
            </h3>

            <p className="leading-relaxed">
              F.U.R.S. (Find, Unite, and Rescue Strays) was born out of a simple
              necessity: turning compassion into coordinated action. Our
              founders, a small of software engineers and animal lovers,
              recognized that the biggest hurdle in stray animal rescue was lack
              of centralized, actionable data. Too often, sightings were
              reported in fragmented social media posts, making organized
              intervention nearly impossible.
            </p>

            <p className="leading-relaxed">
              Our initial vision was to create a unified mapping platform where
              every sighting, no matter how small, could contribute to a larger
              heatmap. This real-time data allows local shelters and volunteer
              teams to prioritize high-density areas, effectively allocating
              resources and saving more lives.
            </p>

            <p className="leading-relaxed">
              Today, we are proud to be a bridge between the community and
              animal welfare organizations, ensuring that no stray sighting goes
              unnoticed and that rescue efforts are smarter, faster, and more
              efficient. Our mission is to transform scattered reports into
              organized rescue missions, making every corner of our city safer
              for stray animals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
