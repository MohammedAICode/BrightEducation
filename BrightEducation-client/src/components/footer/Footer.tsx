import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import logo from '/logo.svg';

// Footer Component
const Footer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img
                src={logo}
                alt="Bright Educational Academy Logo"
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
              />
              <span className="ml-2 text-lg sm:text-xl font-bold text-white">
                Bright Educational Academy
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-400">
              Building futures through quality education since 2010.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4 text-base sm:text-lg">Quick Links</h3>
            <ul className="space-y-2 text-sm sm:text-base">
              <li>
                <button
                  onClick={() => scrollToSection('about')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('programs')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Programs
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('testimonials')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Testimonials
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4 text-base sm:text-lg">Programs</h3>
            <ul className="space-y-2 text-sm sm:text-base">
              <li>
                <button
                  onClick={() => scrollToSection('programs')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  School
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('programs')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Intermediate College
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('programs')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Institution
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4 text-base sm:text-lg">Contact Info</h3>
            <ul className="space-y-2 text-sm sm:text-base">
              <li className="flex items-start">
                <FiPhone className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                <span>+91 80740 48833</span>
              </li>
              <li className="flex items-start">
                <FiMail className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                <span className="wrap-break-word">brighttheschool@gmail.com</span>
              </li>
              <li className="flex items-start">
                <FiMapPin className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                <span>Bandlaguda, Hyderabad - 500005</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm sm:text-base text-slate-400">
          <p>&copy; 2025 Bright Educational Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
