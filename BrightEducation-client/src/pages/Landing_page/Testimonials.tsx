import React from 'react';
import TestimonialCard from './TestimonialCard';

// Testimonials Component
const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Priya Sharma',
      grade: 'Class 10',
      score: '95%',
      text: 'The teachers here are amazing! They helped me improve my math score from 60% to 95%.',
    },
    {
      name: 'Rahul Kumar',
      grade: 'Class 12',
      score: '92%',
      text: 'Best tuition center in the area. The study material and regular tests really helped me.',
    },
    {
      name: 'Ananya Singh',
      grade: 'Class 9',
      score: '90%',
      text: "I was struggling with science, but now it's my favorite subject thanks to the teachers!",
    },
  ];

  return (
    <section id="testimonials" className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">
            Student Success Stories
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-600">
            Hear from our successful students
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
