import React from "react";

import AKF from "../../assets/orgs/AKF.png";
import CARA from "../../assets/orgs/CARA.png";
import PAWS from "../../assets/orgs/PAWS.jpg";
import PETA from "../../assets/orgs/PETA.png";
import PSPCA from "../../assets/orgs/PSPCA.png";

const ORGANIZATIONS = [
  {
    id: 1,
    name: "Philippine Animal Welfare Association",
    logoUrl: PAWS,
    websiteUrl: "https://paws.org.ph/",
    description: "People helping animals. Animals helping people.",
  },
  {
    id: 2,
    name: "Animal Kingdom Foundation",
    logoUrl: AKF,
    websiteUrl: "https://www.akfrescues.org/",
    description: "Be kind to all kinds.",
  },
  {
    id: 3,
    name: "Compassion and Responsibility for Animals",
    logoUrl: CARA,
    websiteUrl: "https://www.caraphil.org/",
    description:
      "A society where the safe and compassionate co-existence of humans, cats and dogs thrives.",
  },
  {
    id: 4,
    name: "People for the Ethical Treatment of Animals",
    logoUrl: PETA,
    websiteUrl: "https://www.petaasia.com/",
    description: "Every animal is someone.",
  },
  {
    id: 5,
    name: "Philippine Society for the Prevention of Cruelty to Animals",
    logoUrl: PSPCA,
    websiteUrl: "https://www.instagram.com/pspca_official/?hl=en",
  },
];

function OrganizationCard({ organization }) {
  const { name, logoUrl, websiteUrl, description } = organization;

  return (
    <a
      href={websiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center space-x-4 p-4 md:p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-[1.02] cursor-pointer border border-gray-100"
    >
      <div className="flex-shrink-0">
        <img
          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-full border-2 border-[#2e7d32]"
          src={logoUrl}
          alt={`${name} Logo`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/100x100/cccccc/666666?text=Logo";
          }}
        />
      </div>

      <div className="flex-grow">
        <h3 className="text-xl md:text-2xl font-semibold text-[#2e7d32] group-hover:text-[#1e5720]">
          {name}
        </h3>
        <p className="text-sm text-gray-500 mt-1 hidden sm:block">
          {description}
        </p>
        <p className="text-xs text-[#fbc02d] mt-1 font-medium">
          Click to visit website
        </p>
      </div>
    </a>
  );
}

export default function Organizations() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <header className="max-w-7xl mx-auto mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#2e7d32] text-center">
          Organizations List
        </h1>
        <p className="text-center text-lg text-gray-500 mt-3">
          Partnering with dedicated animal welfare groups in the community.
        </p>
      </header>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
          {ORGANIZATIONS.map((org) => (
            <OrganizationCard key={org.id} organization={org} />
          ))}
        </div>
      </div>
    </div>
  );
}
