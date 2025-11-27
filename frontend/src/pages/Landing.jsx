import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  CheckSquare, 
  BarChart3, 
  Zap, 
  Shield, 
  Smartphone,
  ArrowRight,
  Star,
  ChevronRight,
  Play
} from 'lucide-react';

// Floating orbs for landing page
const LandingFloatingOrbs = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const orbs = [
    { size: 500, x: '-5%', y: '-10%', color: 'emerald', delay: 0 },
    { size: 400, x: '75%', y: '-5%', color: 'amber', delay: 1 },
    { size: 450, x: '80%', y: '50%', color: 'teal', delay: 2 },
    { size: 350, x: '-10%', y: '60%', color: 'yellow', delay: 1.5 },
    { size: 300, x: '40%', y: '70%', color: 'emerald', delay: 3 },
  ];

  const getColor = (color) => {
    const colors = {
      emerald: 'from-emerald-400/20 to-emerald-600/5',
      amber: 'from-amber-400/20 to-yellow-500/5',
      teal: 'from-teal-400/20 to-cyan-500/5',
      yellow: 'from-yellow-300/20 to-orange-400/5',
    };
    return colors[color];
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950" />
      {orbs.map((orb, i) => (
        <div
          key={i}
          className={`absolute rounded-full bg-gradient-to-br ${getColor(orb.color)} blur-3xl`}
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            animation: `landingFloat ${12 + orb.delay}s ease-in-out infinite`,
            animationDelay: `${orb.delay}s`,
          }}
        />
      ))}
      <div
        className="absolute w-96 h-96 rounded-full transition-all duration-700 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          left: mousePos.x - 192,
          top: mousePos.y - 192,
        }}
      />
      <style>{`
        @keyframes landingFloat {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          33% { transform: translateY(-40px) translateX(30px) scale(1.05); }
          66% { transform: translateY(-20px) translateX(-20px) scale(0.95); }
        }
      `}</style>
    </div>
  );
};

const Landing = () => {
  const features = [
    {
      icon: Users,
      title: 'Employee Management',
      description: 'Easily manage your team with comprehensive employee profiles, departments, and status tracking.',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: CheckSquare,
      title: 'Task Tracking',
      description: 'Create, assign, and track tasks with our intuitive Kanban board and list views.',
      color: 'from-amber-400 to-orange-500',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Get real-time insights with beautiful charts and performance metrics.',
      color: 'from-teal-500 to-cyan-600',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built with modern technology for blazing fast performance and smooth interactions.',
      color: 'from-yellow-400 to-amber-500',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with JWT authentication and encrypted data.',
      color: 'from-emerald-600 to-green-700',
    },
    {
      icon: Smartphone,
      title: 'Fully Responsive',
      description: 'Works seamlessly on desktop, tablet, and mobile devices.',
      color: 'from-purple-500 to-indigo-600',
    },
  ];

  const stats = [
    { value: '99.9%', label: 'Uptime' },
    { value: '10k+', label: 'Users' },
    { value: '50k+', label: 'Tasks Completed' },
    { value: '4.9/5', label: 'Rating' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <LandingFloatingOrbs />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="px-6 py-4 lg:px-12">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-white font-bold text-xl">ProU</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="text-gray-300 hover:text-white transition-colors px-4 py-2"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="px-6 pt-16 pb-24 lg:px-12 lg:pt-24 lg:pb-32">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-8">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-emerald-400 text-sm font-medium">Trusted by 10,000+ companies</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Manage Your Team
              <span className="block bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 bg-clip-text text-transparent">
                Like Never Before
              </span>
            </h1>
            
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              The all-in-one platform for employee management and task tracking. 
              Boost productivity, streamline workflows, and achieve more together.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/register" 
                className="group bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/30 transition-all hover:-translate-y-1 flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="group flex items-center gap-3 text-gray-300 hover:text-white px-6 py-4 rounded-2xl border border-gray-700 hover:border-gray-500 transition-all">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Play className="w-4 h-4 fill-white" />
                </div>
                Watch Demo
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 py-12 lg:px-12 border-y border-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-24 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Everything You Need
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Powerful features to help you manage your team and tasks efficiently
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <div 
                  key={i}
                  className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/50 hover:bg-gray-900/80 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-24 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 backdrop-blur-sm border border-emerald-500/20 rounded-3xl p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of teams already using ProU to manage their workforce efficiently.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-900 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-amber-500/30 transition-all hover:-translate-y-1 flex items-center gap-2"
                >
                  Create Free Account
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link 
                  to="/login" 
                  className="text-white px-8 py-4 rounded-2xl font-semibold border border-white/20 hover:bg-white/10 transition-all"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 lg:px-12 border-t border-gray-800">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="text-gray-400 font-medium">ProU © 2025</span>
            </div>
            <div className="flex items-center gap-6 text-gray-500 text-sm">
              <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
