import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Menu, 
  X, 
  LogOut,
  User,
  ChevronDown,
  Moon,
  Sun,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import FloatingBackground from './FloatingBackground';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/dashboard/employees', icon: Users, label: 'Employees' },
    { path: '/dashboard/tasks', icon: CheckSquare, label: 'Tasks' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-30 h-full w-64 
        bg-gradient-to-b from-emerald-800 via-emerald-900 to-emerald-950 text-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-0
        shadow-2xl
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-emerald-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">ProU Manager</h1>
              <p className="text-xs text-emerald-400">Employee & Tasks</p>
            </div>
          </div>
          <button 
            className="lg:hidden text-white hover:bg-emerald-700 p-1 rounded"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 pb-24">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-xl mb-2
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-900 shadow-lg shadow-amber-500/30 font-semibold' 
                    : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'
                  }
                `}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-emerald-900 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-emerald-700/50 bg-emerald-950/80 backdrop-blur-sm">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-emerald-800/50 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-md">
                  <User size={20} className="text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm text-amber-100">{user.name}</p>
                  <p className="text-xs text-emerald-400">{user.email}</p>
                </div>
                <ChevronDown size={16} className={`text-emerald-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden animate-fadeIn border border-gray-100 dark:border-gray-700">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-900 rounded-xl font-semibold hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/30"
            >
              <User size={18} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};

const Header = ({ setIsOpen }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  
  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-4 lg:px-6 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <button
          className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
          onClick={() => setIsOpen(true)}
        >
          <Menu size={24} />
        </button>
        <div className="flex-1 lg:ml-0 ml-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 dark:from-emerald-400 dark:to-emerald-600 bg-clip-text text-transparent">
            Welcome back! 👋
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your employees and tasks efficiently</p>
        </div>
        
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-amber-400 hover:shadow-lg transition-all duration-300 hover:scale-105"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-transparent dark:bg-transparent transition-colors duration-300">
      <FloatingBackground />
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0 relative z-10">
        <Header setIsOpen={setSidebarOpen} />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
