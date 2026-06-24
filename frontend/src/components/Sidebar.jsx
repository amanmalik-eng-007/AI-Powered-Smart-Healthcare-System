import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  ClipboardList,
  Bot,
  User,
  Shield,
  LogOut,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const patientLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/doctors', label: 'Search Doctors', icon: Users },
    { to: '/appointments', label: 'Appointments', icon: Calendar },
    { to: '/prescriptions', label: 'Prescriptions', icon: FileText },
    { to: '/reports', label: 'Medical Reports', icon: ClipboardList },
    { to: '/ai-assistant', label: 'AI Assistant', icon: Bot },
    { to: '/profile', label: 'Profile', icon: User }
  ];

  const doctorLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/appointments', label: 'Manage Bookings', icon: Calendar },
    { to: '/prescriptions', label: 'Prescriptions', icon: FileText },
    { to: '/profile', label: 'Availability Profile', icon: User }
  ];

  const adminLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin-panel', label: 'Admin Control', icon: Shield }
  ];

  let links = [];
  if (user.role === 'patient') links = patientLinks;
  else if (user.role === 'doctor') links = doctorLinks;
  else if (user.role === 'admin') links = adminLinks;

  const NavItem = ({ to, label, icon: Icon }) => (
    <NavLink
      to={to}
      onClick={() => setIsOpen(false)}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
          isActive
            ? 'bg-teal-700 text-white active-pulse font-medium'
            : 'text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-800/50 hover:text-teal-700 dark:hover:text-teal-400'
        }`
      }
    >
      <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <>
      {/* Mobile Burger Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-teal-700 text-white shadow-lg active:scale-95 transition-transform"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Main Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/80 p-5 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="flex items-center space-x-3 px-2 py-4 mb-6 select-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white font-extrabold shadow-md shadow-teal-500/20">
              ✚
            </div>
            <div>
              <h1 className="text-lg font-bold text-teal-800 dark:text-teal-400 leading-none">SmartHealth</h1>
              <span className="text-[10px] text-slate-400 tracking-wider font-semibold">AI PORTAL</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {links.map((link) => (
              <NavItem key={link.to} {...link} />
            ))}
          </nav>
        </div>

        {/* Footer actions & user card */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-3">
          {/* Dark Mode Switcher */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-500" />}
              <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
            </div>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ${darkMode ? 'bg-teal-600' : 'bg-slate-300'}`}>
              <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ${darkMode ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* User profile info block */}
          <div className="flex items-center justify-between px-2 py-1 bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-2.5">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/60 flex items-center justify-center text-teal-800 dark:text-teal-300 font-bold uppercase shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate leading-tight">{user.name}</p>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{user.role}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all active:scale-95 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
