import React from 'react';
// Stats Component
const Stats: React.FC = () => {
  const stats = [
    { number: '500+', label: 'Students Enrolled' },
    { number: '15+', label: 'Years Experience' },
    { number: '95%', label: 'Success Rate' },
    { number: '20+', label: 'Expert Teachers' },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-600 mb-2">
                {stat.number}
              </div>
              <div className="text-sm sm:text-base text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
