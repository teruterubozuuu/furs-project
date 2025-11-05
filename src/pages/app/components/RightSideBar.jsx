import React from "react";

const LOCAL_ORGS = [
  {
    id: 1,
    name: "Philippine Animal Welfare Society",
    websiteUrl: "https://paws.org.ph/",
  },
  {
    id: 2,
    name: "Animal Kingdom Foundation",
    websiteUrl: "https://www.akfrescues.org/",
  },
  {
    id: 3,
    name: "Compassion and Responsibility for Animals",
    websiteUrl: "https://www.caraphil.org/",
  },
  {
    id: 4,
    name: "People for the Ethical Treatment of Animals",
    websiteUrl: "https://www.petaasia.com/",
  },
  {
    id: 5,
    name: "Philippine Society for the Prevention of Cruelty to Animals",
    websiteUrl: "https://www.instagram.com/pspca_official/?hl=en",
  },
];

export default function LeftSideBar() {
  return (
    <div className="h-full hidden xl:flex  xl:flex-col xl:w-full p-5 border rounded-lg bg-[#fafafa] border-gray-200 shadow-sm ">
      <div className="text-sm">
        <h1 className="text-lg font-semibold text-[#2e7d32]">
          Animal Welfare Organizations
        </h1>
        <ul className="space-y-1">
          {LOCAL_ORGS.map((org) => (
            <li key={org.id}>
              <a
                href={org.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 text-gray-700 hover:bg-[#ffe9b0] hover:text-[#2e7d32] transition-colors duration-200 rounded-lg font-medium text-base"
              >
                {org.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
