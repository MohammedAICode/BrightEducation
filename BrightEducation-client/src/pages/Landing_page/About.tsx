import React from 'react';
import { FiTarget, FiAward, FiTrendingUp } from 'react-icons/fi';

// About Component
const About: React.FC = () => {
  return (
    <section id="about" className="py-16 sm:py-20 lg:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">
            About Us
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
            Bright Educational Academy has been a trusted name in education for over 15 years,
            helping students achieve academic excellence through personalized teaching methods.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
            <FiTarget className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-slate-800">Our Mission</h3>
            <p className="text-sm sm:text-base text-slate-600">
              To provide quality education that builds strong foundations and inspires lifelong
              learning.
            </p>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
            <FiAward className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-slate-800">Our Vision</h3>
            <p className="text-sm sm:text-base text-slate-600">
              To be the most trusted educational institution known for academic excellence and
              character building.
            </p>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center sm:col-span-2 lg:col-span-1">
            <FiTrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-slate-800">Our Approach</h3>
            <p className="text-sm sm:text-base text-slate-600">
              Individual attention, regular assessments, and innovative teaching methods for
              guaranteed results.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
