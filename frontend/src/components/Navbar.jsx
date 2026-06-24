import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bell, ShieldCheck, Activity } from 'lucide-react';

const Navbar = ({ title }) => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 w-full h-16 border-b border-slate-100 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      {/* Page Title / Section Name */}
      <div className="pl-12 lg:pl-0">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600 animate-pulse" />
          <span>{title || 'Health Management Portal'}</span>
        </h2>
      </div>

      {/* Action Items */}
      <div className="flex items-center space-x-4">
        {/* Verification Status Banner */}
        {user.isVerified ? (
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/20 text-[11px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
            <span>Awaiting Verification</span>
          </div>
        )}

        {/* Notifications Icon (Simulated active state) */}
        <div className="relative group p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer text-slate-500 dark:text-slate-400 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500"></span>
          
          {/* Tooltip alert */}
          <div className="absolute top-12 right-0 w-64 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Notifications</p>
            <div className="space-y-2">
              <div className="text-xs p-2 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
                <p className="font-semibold text-slate-700 dark:text-slate-200">System Live</p>
                <span className="text-[10px] text-slate-400">Welcome to your dashboard.</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Role Tag */}
        <div className="px-3 py-1 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 text-xs font-bold uppercase tracking-wider">
          {user.role}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
