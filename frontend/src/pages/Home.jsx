import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, BrainCircuit, Users2, FileSymlink, Sparkles } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between overflow-x-hidden selection:bg-teal-500 selection:text-white">
      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3 select-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white font-extrabold shadow-md shadow-teal-500/20">
            ✚
          </div>
          <div>
            <h1 className="text-lg font-bold text-teal-800 dark:text-teal-400 leading-none">SmartHealth</h1>
            <span className="text-[10px] text-slate-400 tracking-wider font-semibold">AI PORTAL</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            Login
          </Link>
          <Link to="/register" className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-600 hover:to-teal-500 rounded-xl shadow-lg shadow-teal-700/10 active:scale-95 transition-all">
            Join Platform
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto w-full px-6 py-12 lg:py-20 grid lg:grid-cols-12 gap-12 items-center flex-1">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-900/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>AI-Diagnosed Electronic Health Records</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
            The next generation of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-500">
              Healthcare Management
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-xl text-base md:text-lg leading-relaxed">
            Unifying patients, doctors, and hospital administrators in a single workspace. Check symptoms, analyze medical report abnormalities, and manage appointments using intelligent automated models.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link to="/register" className="px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-600 hover:to-teal-500 rounded-2xl shadow-xl shadow-teal-700/15 hover:shadow-teal-700/25 active:scale-95 transition-all text-center">
              Register as Patient
            </Link>
            <Link to="/register?role=doctor" className="px-8 py-3.5 text-base font-semibold text-teal-700 dark:text-teal-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-lg shadow-slate-100/50 dark:shadow-none active:scale-95 transition-all text-center">
              Register as Doctor
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="lg:col-span-5 grid sm:grid-cols-2 gap-4">
          <div className="glass-card flex flex-col justify-between space-y-4 hover:translate-y-[-4px] transition-transform duration-300">
            <BrainCircuit className="w-8 h-8 text-teal-600" />
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">AI Symptom Checker</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Get immediate insight on concerns and suggested medical specializations.</p>
            </div>
          </div>

          <div className="glass-card flex flex-col justify-between space-y-4 hover:translate-y-[-4px] transition-transform duration-300">
            <FileSymlink className="w-8 h-8 text-cyan-500" />
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Report Analyzer</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Upload blood, metabolic, or lipid profile logs to check abnormalities.</p>
            </div>
          </div>

          <div className="glass-card flex flex-col justify-between space-y-4 hover:translate-y-[-4px] transition-transform duration-300">
            <Users2 className="w-8 h-8 text-emerald-500" />
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Doctor Directory</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Search active specialists by experience levels, ratings, and budgets.</p>
            </div>
          </div>

          <div className="glass-card flex flex-col justify-between space-y-4 hover:translate-y-[-4px] transition-transform duration-300">
            <Shield className="w-8 h-8 text-indigo-500" />
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Audit Security</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">JWT verification, hashed database passwords, and Helmet defenses.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30 py-6 text-center text-xs text-slate-400">
        <p>&copy; {new Date().getFullYear()} SmartHealth Portal. Built with MERN Stack + Google Gemini API.</p>
      </footer>
    </div>
  );
};

export default Home;
