// Programs Component
import React from 'react';
import { FiBookOpen, FiUsers, FiAward, FiCheckCircle } from 'react-icons/fi';

const Programs: React.FC = () => {
  return (
    <section id="programs" className="py-16 sm:py-20 lg:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">
            Our Programs
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-600">
            Comprehensive educational programs for all levels
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* School Card */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div className="bg-linear-to-r from-blue-600 to-blue-700 p-5 sm:p-6">
              <div className="flex items-center justify-center mb-2">
                <FiBookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white mr-2 sm:mr-3" />
                <h3 className="text-2xl sm:text-3xl font-bold text-white">School</h3>
              </div>
              <p className="text-center text-blue-50 text-base sm:text-lg">
                Classes Nursery to 10th
              </p>
            </div>
            <div className="p-6 sm:p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-bold text-lg sm:text-xl text-slate-800 mb-4">
                    Classes Offered:
                  </h4>
                  <div className="flex items-start">
                    <FiCheckCircle className="w-5 h-5 text-emerald-600 mr-3 mt-1 shrink-0" />
                    <span className="text-sm sm:text-base text-slate-700">
                      Nursery to Class 5 - Foundation Program
                    </span>
                  </div>
                  <div className="flex items-start">
                    <FiCheckCircle className="w-5 h-5 text-emerald-600 mr-3 mt-1 shrink-0" />
                    <span className="text-sm sm:text-base text-slate-700">
                      Class 6 to 8 - Middle School Program
                    </span>
                  </div>
                  <div className="flex items-start">
                    <FiCheckCircle className="w-5 h-5 text-emerald-600 mr-3 mt-1 shrink-0" />
                    <span className="text-sm sm:text-base text-slate-700">
                      Class 9 to 10 - Secondary Education
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-lg sm:text-xl text-slate-800 mb-4">Features:</h4>
                  <div className="flex items-start">
                    <FiCheckCircle className="w-5 h-5 text-emerald-600 mr-3 mt-1 shrink-0" />
                    <span className="text-sm sm:text-base text-slate-700">
                      All Subjects Coverage
                    </span>
                  </div>
                  <div className="flex items-start">
                    <FiCheckCircle className="w-5 h-5 text-emerald-600 mr-3 mt-1 shrink-0" />
                    <span className="text-sm sm:text-base text-slate-700">
                      Experienced Teachers
                    </span>
                  </div>
                  <div className="flex items-start">
                    <FiCheckCircle className="w-5 h-5 text-emerald-600 mr-3 mt-1 shrink-0" />
                    <span className="text-sm sm:text-base text-slate-700">
                      Regular Assessments & Parent Meetings
                    </span>
                  </div>
                </div>
              </div>
              <button className="mt-6 w-full sm:w-auto bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Enroll for School Program
              </button>
            </div>
          </div>

          {/* Intermediate College Card */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div className="bg-linear-to-r from-blue-600 to-blue-700 p-5 sm:p-6">
              <div className="flex items-center justify-center mb-2">
                <FiAward className="w-8 h-8 sm:w-10 sm:h-10 text-white mr-2 sm:mr-3" />
                <h3 className="text-2xl sm:text-3xl font-bold text-white">Intermediate College</h3>
              </div>
              <p className="text-center text-blue-50 text-base sm:text-lg">Classes 11th & 12th</p>
            </div>
            <div className="p-6 sm:p-8">
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                {/* Girls Block */}
                <div className="bg-blue-50 p-5 sm:p-6 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center mb-4">
                    <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2" />
                    <h4 className="font-bold text-xl sm:text-2xl text-blue-700">Girls Block</h4>
                  </div>
                  <div className="space-y-3">
                    <h5 className="font-semibold text-base sm:text-lg text-slate-800 mb-3">
                      Available Courses:
                    </h5>
                    <div className="flex items-start">
                      <FiCheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-1 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800 text-sm sm:text-base">
                          MPC
                        </span>
                        <p className="text-xs sm:text-sm text-slate-600">
                          Maths, Physics, Chemistry
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FiCheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-1 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800 text-sm sm:text-base">
                          BiPC
                        </span>
                        <p className="text-xs sm:text-sm text-slate-600">
                          Biology, Physics, Chemistry
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FiCheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-1 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800 text-sm sm:text-base">
                          CEC
                        </span>
                        <p className="text-xs sm:text-sm text-slate-600">
                          Commerce, Economics, Civics
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <p className="text-xs sm:text-sm text-slate-600">✓ Separate Block for Girls</p>
                    <p className="text-xs sm:text-sm text-slate-600">✓ Female Faculty Available</p>
                  </div>
                </div>

                {/* Boys Block */}
                <div className="bg-slate-50 p-5 sm:p-6 rounded-lg border-2 border-slate-200">
                  <div className="flex items-center mb-4">
                    <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 mr-2" />
                    <h4 className="font-bold text-xl sm:text-2xl text-slate-700">Boys Block</h4>
                  </div>
                  <div className="space-y-3">
                    <h5 className="font-semibold text-base sm:text-lg text-slate-800 mb-3">
                      Available Courses:
                    </h5>
                    <div className="flex items-start">
                      <FiCheckCircle className="w-5 h-5 text-slate-600 mr-3 mt-1 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800 text-sm sm:text-base">
                          MPC
                        </span>
                        <p className="text-xs sm:text-sm text-slate-600">
                          Maths, Physics, Chemistry
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FiCheckCircle className="w-5 h-5 text-slate-600 mr-3 mt-1 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800 text-sm sm:text-base">
                          CEC
                        </span>
                        <p className="text-xs sm:text-sm text-slate-600">
                          Commerce, Economics, Civics
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs sm:text-sm text-slate-600">✓ Separate Block for Boys</p>
                    <p className="text-xs sm:text-sm text-slate-600">✓ Experienced Male Faculty</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-slate-700">
                  <strong>Note:</strong> Both blocks have separate infrastructure and dedicated
                  faculty members
                </p>
              </div>
              <button className="mt-6 w-full sm:w-auto bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Enroll for Intermediate
              </button>
            </div>
          </div>

          {/* Institution Card */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div className="bg-linear-to-r from-blue-600 to-blue-700 p-5 sm:p-6">
              <div className="flex items-center justify-center mb-2">
                <FiAward className="w-8 h-8 sm:w-10 sm:h-10 text-white mr-2 sm:mr-3" />
                <h3 className="text-2xl sm:text-3xl font-bold text-white">Institution</h3>
              </div>
              <p className="text-center text-blue-50 text-base sm:text-lg">
                Comprehensive Coaching & Exam Preparation
              </p>
            </div>
            <div className="p-6 sm:p-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Classes 1-9 */}
                <div className="bg-blue-50 p-5 sm:p-6 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-base sm:text-lg text-slate-800 mb-3">
                    Classes 1 to 9
                  </h4>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-xs sm:text-sm">All Subjects</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-xs sm:text-sm">Regular Practice Tests</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-xs sm:text-sm">Concept Building</span>
                    </li>
                  </ul>
                </div>

                {/* Class 10th */}
                <div className="bg-slate-50 p-5 sm:p-6 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-base sm:text-lg text-slate-800 mb-3">Class 10th</h4>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start">
                      <span className="text-slate-600 mr-2">•</span>
                      <span className="text-xs sm:text-sm">SSC Board Preparation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-slate-600 mr-2">•</span>
                      <span className="text-xs sm:text-sm">CBSE Board Preparation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-slate-600 mr-2">•</span>
                      <span className="text-xs sm:text-sm">Board Exam Focus</span>
                    </li>
                  </ul>
                </div>

                {/* Intermediate */}
                <div className="bg-blue-50 p-5 sm:p-6 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-base sm:text-lg text-slate-800 mb-3">
                    Intermediate
                  </h4>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-xs sm:text-sm">MPC Stream</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-xs sm:text-sm">BiPC Stream</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-xs sm:text-sm">CEC Stream</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-xs sm:text-sm">MEC Stream</span>
                    </li>
                  </ul>
                </div>

                {/* Degree & Engineering */}
                <div className="bg-slate-50 p-5 sm:p-6 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-base sm:text-lg text-slate-800 mb-3">
                    Higher Education
                  </h4>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start">
                      <span className="text-slate-600 mr-2">•</span>
                      <span className="text-xs sm:text-sm">Degree Students</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-slate-600 mr-2">•</span>
                      <span className="text-xs sm:text-sm">Engineering Students</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-slate-600 mr-2">•</span>
                      <span className="text-xs sm:text-sm">Subject-wise Coaching</span>
                    </li>
                  </ul>
                </div>

                {/* Open Schooling */}
                <div className="bg-blue-50 p-5 sm:p-6 rounded-lg border border-blue-200 sm:col-span-2 lg:col-span-2">
                  <h4 className="font-bold text-base sm:text-lg text-slate-800 mb-3">
                    Open Schooling Programs
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-blue-700 mb-2">TOSS</p>
                      <p className="text-xs text-slate-600">Telangana Open School Society</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700 mb-2">Open Intermediate</p>
                      <p className="text-xs text-slate-600">Complete preparation & support</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700 mb-2">Open Degree</p>
                      <p className="text-xs text-slate-600">Distance learning support</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <h5 className="font-semibold text-slate-800 mb-3 text-sm sm:text-base">
                  Institution Features:
                </h5>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm text-slate-700">
                  <div className="flex items-center">
                    <FiCheckCircle className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                    <span>Expert Faculty for Each Stream</span>
                  </div>
                  <div className="flex items-center">
                    <FiCheckCircle className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                    <span>Comprehensive Study Materials</span>
                  </div>
                  <div className="flex items-center">
                    <FiCheckCircle className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                    <span>Regular Mock Tests & Assessments</span>
                  </div>
                </div>
              </div>

              <button className="mt-6 w-full sm:w-auto bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Enroll for Institution Programs
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Programs;
