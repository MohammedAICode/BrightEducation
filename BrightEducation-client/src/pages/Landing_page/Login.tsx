import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import logo from '/logo.svg';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login, clearError } from '../../store/authSlice';

/**
 * Login page component.
 * Handles user authentication.
 *
 * Test credentials:
 * - Owner: owner@gmail.com / Owner@123
 * - Admin: admin@gmail.com / Admin@123
 * - Incharge: incharge@gmail.com / Incharge@123
 * - Teacher: teacher@gmail.com / Teacher@123
 */
const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    
    // Auto-append @bright.com if input doesn't contain @ and is not a phone number
    let email = formData.emailOrPhone;
    if (!email.includes('@') && !/^\d+$/.test(email)) {
      email = `${email.toLowerCase()}@bright.com`;
    }
    
    const result = await dispatch(login({ email, password: formData.password }));
    
    if (login.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <LoginHeader />
          <LoginForm
            formData={formData}
            setFormData={setFormData}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            error={error}
            isLoading={isLoading}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

function LoginHeader() {
  return (
    <div className="bg-linear-to-r from-blue-600 to-blue-700 p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="bg-white p-3 rounded-full">
          <img src={logo} alt="Bright Academy" className="w-12 h-12" />
        </div>
      </div>
      <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
      <p className="text-blue-100">Sign in to your account</p>
    </div>
  );
}

interface LoginFormProps {
  formData: { emailOrPhone: string; password: string };
  setFormData: (data: { emailOrPhone: string; password: string }) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  error: string | null;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

function LoginForm({
  formData,
  setFormData,
  showPassword,
  setShowPassword,
  error,
  isLoading,
  onSubmit,
}: LoginFormProps) {
  return (
    <div className="p-8">
      <form onSubmit={onSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email or Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={formData.emailOrPhone}
              onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Enter email or phone"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Enter password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <FiEyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <FiEye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
              Remember me
            </label>
          </div>
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-700 transition"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
