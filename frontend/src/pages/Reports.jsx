import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { reportAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast, ToastContainer } from 'react-toastify';
import { FileUp, FileText, Bot, HelpCircle, Activity, Heart, AlertTriangle, ArrowRight } from 'lucide-react';

const Reports = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  
  // Upload State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Analysis display state
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [analyzingId, setAnalyzingId] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await reportAPI.getMy();
      if (res.data.success) {
        setReports(res.data.reports);
      }
    } catch (err) {
      toast.error('Failed to load medical reports history');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return toast.warn('Please select a file to upload first');

    const formData = new FormData();
    formData.append('reportFile', uploadFile);

    setUploading(true);
    try {
      const res = await reportAPI.upload(formData);
      if (res.data.success) {
        toast.success('Report file uploaded successfully!');
        setUploadFile(null);
        // Reset file input value
        document.getElementById('report-file-input').value = '';
        fetchReports();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async (id) => {
    setAnalyzingId(id);
    try {
      const res = await reportAPI.analyze(id);
      if (res.data.success) {
        toast.success('AI Analysis Completed!');
        // Update local report details
        setReports(prev =>
          prev.map(rep => (rep._id === id ? res.data.report : rep))
        );
        setActiveAnalysis(res.data.report);
      }
    } catch (err) {
      toast.error('AI Report Analysis engine failed. Check API configuration.');
    } finally {
      setAnalyzingId('');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col pl-0 lg:pl-64">
          <Navbar title="Medical Records Portal" />
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Sidebar />

      <div className="flex-1 flex flex-col pl-0 lg:pl-64">
        <Navbar title="Electronic Medical Records & Reports" />

        <main className="flex-1 p-6 space-y-8 max-w-7xl w-full mx-auto">
          {/* Main Layout Grid */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Upload and list */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Upload Card for Patients */}
              {user.role === 'patient' && (
                <div className="glass-card space-y-4">
                  <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <FileUp className="w-5 h-5" />
                    <h3 className="font-bold">Upload Lab Reports</h3>
                  </div>

                  <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all relative">
                      <input
                        id="report-file-input"
                        type="file"
                        required
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-950/20 text-teal-600 flex items-center justify-center mx-auto">
                          <FileUp className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-slate-700 dark:text-slate-350">
                          {uploadFile ? uploadFile.name : 'Select file or drag here'}
                        </p>
                        <span className="text-[10px] text-slate-400 block font-medium">Supports PDF, PNG, JPG, or TXT (Max 5MB)</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={uploading || !uploadFile}
                      className="w-full py-3 bg-gradient-to-r from-teal-700 to-teal-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-teal-500 shadow-md active:scale-95 transition-all text-xs disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {uploading ? 'Uploading to Secure Cloud...' : 'Upload Medical Report File'}
                    </button>
                  </form>
                </div>
              )}

              {/* Reports List */}
              <div className="glass-card space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                  Clinical Records Repository
                </h3>

                {reports.length === 0 ? (
                  <p className="text-sm text-slate-400 py-10 text-center">No reports uploaded to repository.</p>
                ) : (
                  <div className="space-y-3.5">
                    {reports.map((rep) => (
                      <div key={rep._id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start space-x-3 truncate">
                          <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/20 text-teal-600 shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="truncate">
                            <p className="font-semibold text-slate-800 dark:text-slate-100 truncate text-sm">{rep.fileName}</p>
                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                              Uploaded: {new Date(rep.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Analysis actions */}
                        <div className="flex items-center space-x-2 shrink-0">
                          {rep.aiAnalysis && rep.aiAnalysis.abnormalities?.length > 0 ? (
                            <button
                              onClick={() => setActiveAnalysis(rep)}
                              className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 rounded-lg text-xs font-bold transition-all"
                            >
                              View AI Insights
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAnalyze(rep._id)}
                              disabled={analyzingId === rep._id}
                              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-650 text-white rounded-lg text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center space-x-1.5"
                            >
                              {analyzingId === rep._id ? (
                                <>
                                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  <span>Analyzing...</span>
                                </>
                              ) : (
                                <>
                                  <Bot className="w-4 h-4" />
                                  <span>Analyze with AI</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: AI Insights Drawer */}
            <div className="lg:col-span-5">
              {activeAnalysis ? (
                <div className="glass-card space-y-6 border-l-4 border-l-indigo-600 dark:border-l-indigo-400">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400">
                      <Bot className="w-5 h-5 animate-bounce" />
                      <h3 className="font-bold">AI Diagnostics Engine</h3>
                    </div>
                    <button onClick={() => setActiveAnalysis(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs">
                      Dismiss
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* File Header */}
                    <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Record Analyzed</p>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{activeAnalysis.fileName}</p>
                    </div>

                    {/* Summary */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clinical Summary</span>
                      <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                        {activeAnalysis.aiAnalysis.summary}
                      </p>
                    </div>

                    {/* Plain Language explanation */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Layman interpretation</span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-indigo-50/30 dark:bg-indigo-950/10 p-3.5 rounded-2xl border border-indigo-500/10">
                        {activeAnalysis.aiAnalysis.simpleLanguage}
                      </p>
                    </div>

                    {/* Abnormalities List */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Flagged Abnormalities</span>
                      
                      {activeAnalysis.aiAnalysis.abnormalities && activeAnalysis.aiAnalysis.abnormalities.length > 0 ? (
                        <div className="space-y-2">
                          {activeAnalysis.aiAnalysis.abnormalities.map((ab, idx) => (
                            <div key={idx} className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs">
                              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                              <span className="font-semibold leading-tight">{ab}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-450 text-xs">
                          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                          <span>All analyzed cellular levels are within standard range thresholds.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="bg-slate-100 dark:bg-slate-850 p-3.5 rounded-2xl text-[10px] text-slate-400 leading-relaxed border border-slate-200/50 dark:border-slate-800">
                    <p className="font-bold uppercase tracking-wider text-slate-500 mb-1">Medical Disclaimer</p>
                    AI analysis provides electronic insights based on statistical references and is NOT a professional clinical diagnosis. Discuss findings with your consulting physician before altering therapies.
                  </div>
                </div>
              ) : (
                <div className="glass-card flex flex-col items-center justify-center text-center py-20 text-slate-400 space-y-4">
                  <Bot className="w-12 h-12 text-slate-300 animate-pulse" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Awaiting AI Request</h4>
                    <p className="text-xs max-w-[200px] mt-1 mx-auto leading-relaxed">Select a report and click "Analyze with AI" to extract medical summaries.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
