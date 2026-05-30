import React from 'react';

// Hero Component
const Hero: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="hero"
      className="bg-linear-to-br from-blue-600 to-blue-700 text-white py-16 sm:py-20 md:py-24 lg:py-28"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Excellence in Education
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 text-blue-50 max-w-3xl mx-auto">
            Enlightening lives through Education
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <button
              onClick={() => scrollToSection('programs')}
              className="w-full sm:w-auto bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-semibold hover:bg-blue-50 hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              View Programs
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="w-full sm:w-auto bg-transparent text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 border-2 border-white cursor-pointer"
            >
              Enroll Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
