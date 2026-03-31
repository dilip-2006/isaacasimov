import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Lock, Cpu, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  // Removed roll number parsing since login is admin only with direct email

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Login
      const success = await login(email, password);
      if (!success) {
        setError('Invalid credentials. Please check your email and password.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-peacock-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-peacock-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-dark-800/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-peacock-500/20 p-8 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-peacock-500 via-blue-500 to-purple-500"></div>
          
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-peacock-500 to-blue-500 rounded-full mb-6 shadow-lg animate-glow">
              <Cpu className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-peacock-200 bg-clip-text text-transparent mb-2">
              Isaac Asimov
            </h1>
            <p className="text-peacock-300 text-lg font-medium">
              Admin Portal
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-peacock-400 text-sm">
                <Shield className="w-4 h-4" />
                <span>Secure Access</span>
              </div>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <label className="block text-peacock-300 text-sm font-semibold mb-3">
                Email Address
              </label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-peacock-400 w-5 h-5 group-focus-within:text-peacock-300 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 bg-dark-700/50 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:border-peacock-500 focus:ring-2 focus:ring-peacock-500/20 transition-all duration-300 group-hover:border-dark-500"
                  placeholder="admin@isaacasimov.in"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label className="block text-peacock-300 text-sm font-semibold mb-3">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-peacock-400 w-5 h-5 group-focus-within:text-peacock-300 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-4 bg-dark-700/50 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:border-peacock-500 focus:ring-2 focus:ring-peacock-500/20 transition-all duration-300 group-hover:border-dark-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-peacock-400 hover:text-peacock-300 transition-colors p-1 rounded"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>



            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm backdrop-blur-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  {error}
                </div>
              </motion.div>
            )}

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0, 206, 209, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-peacock-500 to-blue-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl focus:ring-2 focus:ring-peacock-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-peacock-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-center gap-3">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </div>
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 space-y-4"
          >

            
            
            <div className="text-center text-xs text-dark-400">
              <p>© 2024 Isaac Asimov Robotics Lab. All rights reserved.</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;