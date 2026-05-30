import React from 'react';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';

// Contact Component
const Contact: React.FC = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    program: '',
    class: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your interest! We will contact you soon.');
    setFormData({ name: '', email: '', phone: '', program: '', class: '', message: '' });
  };

  return (
    <section
      id="contact"
      className="py-16 sm:py-20 lg:py-24 bg-linear-to-br from-blue-600 to-blue-700 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Get In Touch</h2>
          <p className="text-base sm:text-lg md:text-xl text-blue-50">
            Visit us or contact us for admissions
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-xl text-center shadow-lg hover:shadow-xl transition-all">
            <FiPhone className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-slate-800">Phone</h3>
            <p className="text-sm sm:text-base text-slate-600">+91 80740 48833</p>
            <p className="text-sm sm:text-base text-slate-600">+91 95054 30120</p>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-xl text-center shadow-lg hover:shadow-xl transition-all">
            <FiMail className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-slate-800">Email</h3>
            <p className="text-sm sm:text-base text-slate-600 wrap-break-word">
              info@brighteducationalacademy.com
            </p>
            <p className="text-sm sm:text-base text-slate-600 wrap-break-word">
              admissions@brighteducationalacademy.com
            </p>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-xl text-center shadow-lg hover:shadow-xl transition-all sm:col-span-2 lg:col-span-1">
            <FiMapPin className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-slate-800">Address</h3>
            <p className="text-sm sm:text-base text-slate-600">
              AL-Masood Complex, Bandlaguda, Chandrayangutta,
            </p>
            <p className="text-sm sm:text-base text-slate-600">Hyderabad - 500005</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 sm:mt-12 bg-white rounded-xl p-6 sm:p-8 max-w-2xl mx-auto shadow-lg">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 text-center">
            Enroll Now
          </h3>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Student Name"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <select name="program" value={formData.program} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all" required>
                <option value="">Select Program</option>
                <option value="School">School</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Institution">Institution</option>
              </select>
            </div>
            <div>
              <select name="class" value={formData.class} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all" required>
                <option value="">Select Class</option>
                <option value="Class 6-8">Class 6-8</option>
                <option value="Class 9-10">Class 9-10</option>
                <option value="Class 11-12">Class 11-12</option>
                <option value="Degree">Degree</option>
                <option value="Engineering">Engineering</option>
              </select>
            </div>
            <div>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Message (Optional)"
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
            >
              Submit Enrollment
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
export default Contact;
