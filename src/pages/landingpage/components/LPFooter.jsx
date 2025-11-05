import React from "react";
import logo from "../../../assets/logo_furs.png";
const FacebookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
  </svg>
);

const TwitterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-.422.724-.665 1.568-.665 2.476 0 2.114 1.076 3.973 2.712 5.063-.998-.03-1.927-.304-2.747-.758v.065c0 2.953 2.102 5.414 4.885 5.973-.51.139-1.046.21-1.604.21-.39 0-.77-.038-1.14-.109.776 2.422 3.023 4.184 5.688 4.234-2.087 1.637-4.72 2.614-7.584 2.614-.492 0-.978-.028-1.455-.084 2.704 1.731 5.922 2.746 9.39 2.746 11.277 0 17.457-9.34 17.457-17.457 0-.265-.006-.528-.018-.79 1.195-.863 2.233-1.948 3.053-3.174z" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.148 3.227-1.669 4.771-4.919 4.919-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.07-1.646-.07-4.85s.012-3.584.07-4.85c.148-3.227 1.669-4.771 4.919-4.919 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.059 1.689.073 4.948.073s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073z" />
  </svg>
);

export default function LPFooter() {
  return (
    <footer className="bg-[#2e7d32] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Column 1: Logo and Brand */}
          <div className="space-y-4">
            <a href="/#top" className="inline-block">
              <img
                src={logo}
                alt="F.U.R.S. Logo"
                className="w-40 bg-white p-2 rounded-md"
              />
            </a>
            <p className="text-gray-300 text-sm">
              Find, Unite, and Rescue Strays. A community-driven platform to
              help stray animals.
            </p>
          </div>

          {/* Column 2: Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Us</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <a href="mailto:contact@furs.com" className="hover:text-white">
                  Email: contact@furs.com
                </a>
              </li>
              <li>
                <a href="tel:+123456789" className="hover:text-white">
                  Phone: (+63) 918 959 8013
                </a>
              </li>
              <li>
                <p>
                  Address: 94 Kamuning Rd, Diliman, Quezon City, 1103 Metro
                  Manila
                </p>
              </li>
            </ul>
          </div>

          {/* Column 3: Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/profile.php?id=61578199832740"
                aria-label="Facebook"
                target="_blank"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <FacebookIcon />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                target="_blank"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <TwitterIcon />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                target="_blank"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="border-t border-gray-600 mt-10 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} F.U.R.S. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
