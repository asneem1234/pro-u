import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import Button from '../components/Button';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';

// Floating orbs for auth background
const AuthFloatingOrbs = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const orbs = [
    { size: 400, x: '0%', y: '0%', color: 'emerald', delay: 0 },
    { size: 300, x: '80%', y: '0%', color: 'amber', delay: 1 },
    { size: 350, x: '70%', y: '60%', color: 'teal', delay: 2 },
    { size: 280, x: '10%', y: '70%', color: 'yellow', delay: 1.5 },
    { size: 200, x: '50%', y: '30%', color: 'emerald', delay: 3 },
  ];

  const getColor = (color) => {
    const colors = {
      emerald: 'from-emerald-400/30 to-emerald-600/10',
      amber: 'from-amber-400/30 to-yellow-500/10',
      teal: 'from-teal-400/30 to-cyan-500/10',
      yellow: 'from-yellow-300/30 to-orange-400/10',
    };
    return colors[color];
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb, i) => (
        <div
          key={i}
          className={`absolute rounded-full bg-gradient-to-br ${getColor(orb.color)} backdrop-blur-3xl`}
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            animation: `authFloat ${10 + orb.delay}s ease-in-out infinite`,
            animationDelay: `${orb.delay}s`,
          }}
        />
      ))}
      {/* Mouse follow */}
      <div
        className="absolute w-64 h-64 rounded-full transition-all duration-500 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          left: mousePos.x - 128,
          top: mousePos.y - 128,
        }}
      />
      <style>{`
        @keyframes authFloat {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          33% { transform: translateY(-30px) translateX(20px) scale(1.05); }
          66% { transform: translateY(-15px) translateX(-15px) scale(0.95); }
        }
      `}</style>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-700 via-teal-700 to-amber-600 flex items-center justify-center p-4 relative overflow-hidden">
      <AuthFloatingOrbs />
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-8 animate-fadeIn border border-white/50 relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30 hover:scale-110 hover:shadow-emerald-500/50 transition-all duration-300 cursor-pointer">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center">
            <AlertCircle size={18} className="mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-9 text-emerald-500" size={18} />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="[&_input]:pl-10"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-9 text-emerald-500" size={18} />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="[&_input]:pl-10"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Sign In
          </Button>
        </form>

        {/* Register Link */}
        <p className="text-center text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
            Sign up
          </Link>
        </p>

        {/* Skip Login */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => navigate('/')}
          >
            Continue without login
          </Button>
        </div>
      </div>
    </div>
  );
};

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-700 via-teal-700 to-amber-600 flex items-center justify-center p-4 relative overflow-hidden">
      <AuthFloatingOrbs />
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-8 animate-fadeIn border border-white/50 relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30 hover:scale-110 hover:shadow-emerald-500/50 transition-all duration-300 cursor-pointer">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-2">Sign up to get started</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center">
            <AlertCircle size={18} className="mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <User className="absolute left-3 top-9 text-emerald-500" size={18} />
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              className="[&_input]:pl-10"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-9 text-emerald-500" size={18} />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="[&_input]:pl-10"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-9 text-emerald-500" size={18} />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="[&_input]:pl-10"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-9 text-emerald-500" size={18} />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="[&_input]:pl-10"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Create Account
          </Button>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export { Login, Register };
