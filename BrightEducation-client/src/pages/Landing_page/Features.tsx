import React from 'react';
import { FiAward, FiClock, FiBookOpen } from 'react-icons/fi';
// Features Component
const Features: React.FC = () => {
  const features = [
    {
      icon: <FiAward className="w-8 h-8" />,
      title: 'Expert Faculty',
      desc: 'Highly qualified teachers with 10+ years experience',
    },
    {
      icon: <FiClock className="w-8 h-8" />,
      title: 'Flexible Timings',
      desc: 'Morning, evening, and weekend batches available',
    },
    {
      icon: <FiBookOpen className="w-8 h-8" />,
      title: 'Study Material',
      desc: 'Comprehensive notes and practice papers provided',
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">
            Why Choose Us?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-600">
            What makes us different from others
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 sm:p-8 bg-slate-50 rounded-xl hover:shadow-lg hover:bg-white transition-all duration-200"
            >
              <div className="text-blue-600 mb-4 flex justify-center">{feature.icon}</div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 text-slate-800">{feature.title}</h3>
              <p className="text-sm sm:text-base text-slate-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
