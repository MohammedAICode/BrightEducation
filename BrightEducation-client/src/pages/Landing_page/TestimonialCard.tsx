import React from 'react';
import { FiStar } from 'react-icons/fi';
// Testimonial Card Component
interface TestimonialCardProps {
  testimonial: {
    name: string;
    grade: string;
    score: string;
    text: string;
  };
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <div className="bg-slate-50 p-6 sm:p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <FiStar key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-current" />
        ))}
      </div>
      <p className="text-sm sm:text-base text-slate-600 mb-6 italic leading-relaxed">
        "{testimonial.text}"
      </p>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm sm:text-base text-slate-800">{testimonial.name}</h4>
          <p className="text-xs sm:text-sm text-slate-500">{testimonial.grade}</p>
        </div>
        <div className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-sm sm:text-base">
          {testimonial.score}
        </div>
      </div>
    </div>
  );
};
export default TestimonialCard;
