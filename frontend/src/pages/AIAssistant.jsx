import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { aiAPI } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import { BrainCircuit, Send, Sparkles, MessageSquare, AlertTriangle, ShieldCheck, HeartPulse, RefreshCw } from 'lucide-react';

const AIAssistant = () => {
  const [activeTab, setActiveTab] = useState('symptoms');
  const [loading, setLoading] = useState(false);

  // Symptom Checker States
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState(null);
  const [warning, setWarning] = useState('');

  // Chatbot States
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your AI Health Assistant. How can I help you today? You can ask me about dietary habits, explain simple medicines, or get preventive tips.' }
  ]);

  const handleSymptomCheck = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return toast.warn('Specify at least one symptom');

    setLoading(true);
    setDiagnosis(null);
    try {
      const res = await aiAPI.symptomCheck(symptoms);
      if (res.data.success) {
        setDiagnosis(res.data.data);
        setWarning(res.data.warning);
        toast.success('Analysis completed');
      }
    } catch (err) {
      toast.error('AI Check failed, please verify API configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chat(userMsg);
      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }]);
      }
    } catch (err) {
      toast.error('Failed to communicate with AI chat agent');
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      { role: 'assistant', text: 'Hello! I am your AI Health Assistant. How can I help you today? You can ask me about dietary habits, explain simple medicines, or get preventive tips.' }
    ]);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Sidebar />

      <div className="flex-1 flex flex-col pl-0 lg:pl-64">
        <Navbar title="AI Diagnostic Assistant Hub" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Tabs Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-1.5 rounded-2xl w-fit space-x-1">
            <button
              onClick={() => setActiveTab('symptoms')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'symptoms'
                  ? 'bg-teal-700 text-white active-pulse shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Symptom Checker</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'chat'
                  ? 'bg-teal-700 text-white active-pulse shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Health Chatbot</span>
            </button>
          </div>

          {/* ================= SYMPTOM CHECKER ================= */}
          {activeTab === 'symptoms' && (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Input Form */}
              <div className="glass-card lg:col-span-5 space-y-4">
                <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <h3 className="font-bold text-sm">Analyze Symptoms</h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                  Type your symptoms (e.g. cold, dry cough, mild fever) and our automated checker will map potential diseases and recommend specialist clinics.
                </p>

                <form onSubmit={handleSymptomCheck} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Describe Symptoms</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Enter symptoms here..."
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-600 hover:to-teal-500 text-white font-semibold rounded-xl text-xs shadow-md active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <BrainCircuit className="w-4 h-4" />
                        <span>Run AI Symptom Check</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Diagnosis Output */}
              <div className="lg:col-span-7">
                {diagnosis ? (
                  <div className="glass-card space-y-6">
                    <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <ShieldCheck className="w-5 h-5 text-indigo-500" />
                      <h3 className="font-bold">AI Clinical Analysis Report</h3>
                    </div>

                    <div className="space-y-4 text-xs">
                      {/* Specialist */}
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Recommended Specialist Clinic</p>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">{diagnosis.specialist}</p>
                        </div>
                        <HeartPulse className="w-6 h-6 text-teal-600 animate-pulse" />
                      </div>

                      {/* Possible Concerns */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Potential conditions</span>
                        <div className="flex flex-wrap gap-2">
                          {diagnosis.diseases.map((d, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-750 dark:text-indigo-450 rounded-xl font-bold uppercase tracking-wider border border-indigo-100 dark:border-indigo-900/30 text-[10px]">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Precautions */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Immediate Precautions</span>
                        <ul className="list-disc pl-5 space-y-1 text-slate-650 dark:text-slate-400 font-medium">
                          {diagnosis.precautions.map((p, idx) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Suggestions */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Health Suggestions</span>
                        <ul className="list-disc pl-5 space-y-1 text-slate-650 dark:text-slate-400 font-medium">
                          {diagnosis.suggestions.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Disclaimer */}
                    {warning && (
                      <div className="p-3.5 bg-slate-100 dark:bg-slate-850 text-slate-400 text-[10px] rounded-2xl flex items-start space-x-2.5 border border-slate-200/50 dark:border-slate-800 leading-relaxed">
                        <AlertTriangle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                        <p>{warning}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="glass-card flex flex-col items-center justify-center py-24 text-slate-400 text-center space-y-4">
                    <BrainCircuit className="w-12 h-12 text-slate-200 animate-pulse" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-700 dark:text-slate-350">Awaiting symptoms query</h4>
                      <p className="text-xs max-w-[200px] mt-1 mx-auto leading-relaxed">Submit the form on the left to run AI diagnosis reports.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= HEALTH CHATBOT ================= */}
          {activeTab === 'chat' && (
            <div className="glass-card flex flex-col justify-between h-[500px]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400">
                  <MessageSquare className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold">AI Chatbot Agent</h3>
                </div>
                <button onClick={clearChat} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-semibold flex items-center space-x-1">
                  <RefreshCw className="w-3 h-3" />
                  <span>Clear Conversation</span>
                </button>
              </div>

              {/* Message Streams */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed font-medium shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-teal-755 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 rounded-tr-none border border-teal-500/10'
                          : 'bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-tl-none border border-slate-200/50 dark:border-slate-800'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 dark:bg-slate-850 p-3 rounded-2xl rounded-tl-none border border-slate-200/50 dark:border-slate-800 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Input */}
              <form onSubmit={handleSendMessage} className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex space-x-3 items-center">
                <input
                  type="text"
                  placeholder="Ask a general health question (e.g. What is a balanced diet?)..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none text-slate-800 dark:text-slate-200"
                />
                <button
                  type="submit"
                  disabled={loading || !chatInput.trim()}
                  className="p-3 bg-teal-700 hover:bg-teal-600 text-white rounded-xl shadow-md transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AIAssistant;
