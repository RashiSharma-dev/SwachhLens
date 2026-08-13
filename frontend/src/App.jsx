import React, { useState, useRef, useCallback, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Camera, Bell, Activity, Play, ArrowRight, ShieldAlert, Cpu, ListTodo,  User, Mic, MapPin, Clock, CheckCircle2, ChevronLeft, Send, AlertTriangle, Map, FileText, CheckCircle, LayoutDashboard, Settings, LogOut, Users, X, Tag, BarChart3, Info, Truck, Recycle } from 'lucide-react';

// --- CITIZEN REPORT COMPONENT ---

const CitizenReport = () => {
  const [step, setStep] = useState('home'); // 'home', 'camera', 'review', 'success'
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [comments, setComments] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const webcamRef = useRef(null);

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Speech recognition is not supported."); return; }
    if (isListening) { setIsListening(false); return; }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setComments(prev => (prev ? prev + ' ' + transcript : transcript));
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    setTimestamp(new Date());
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocationError(null);
          setStep('review');
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Unable to fetch location.");
          setStep('review');
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLocationError("Geolocation is not supported.");
      setStep('review');
    }
  }, [webcamRef]);

  const retake = () => { setImage(null); setLocation(null); setTimestamp(null); setStep('camera'); };
  
  const submitReport = () => {
    setIsSubmitting(true);
    setTimeout(() => { setIsSubmitting(false); setStep('success'); }, 1500);
  };
  
  const resetForm = () => { setStep('home'); setImage(null); setLocation(null); setTimestamp(null); setComments(''); };

  // Framer Motion Variants
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col max-w-md mx-auto shadow-2xl relative overflow-hidden sm:border-x sm:border-slate-200">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/40 via-slate-100 to-slate-100 pointer-events-none"></div>

      {step === 'home' && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex-1 flex flex-col p-5 relative z-10 overflow-y-auto">
          {/* Header Area */}
          <motion.div variants={itemVariants} className="flex justify-between items-start mb-6 mt-4">
             <button onClick={() => window.location.href = '/citizen/profile'} className="text-left hover:opacity-80 transition-opacity active:scale-95 origin-left">
               <h1 className="text-3xl font-black text-slate-800 tracking-tight">Hi, Citizen 👋</h1>
               <p className="text-slate-500 font-medium mt-1">Let's keep our city clean.</p>
             </button>
             <a href="/impact" className="relative group cursor-pointer">
               <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity"></div>
               <div className="relative bg-white/80 backdrop-blur-md border border-white p-3 rounded-2xl shadow-sm flex flex-col items-center">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Credits</span>
                 <span className="text-emerald-600 font-black text-xl">1,400</span>
               </div>
             </a>
          </motion.div>

          {/* Main Bento: Camera Action */}
          <motion.div variants={itemVariants} className="mb-4">
             <button onClick={() => setStep('camera')} className="w-full relative group overflow-hidden rounded-[2rem] bg-emerald-600 text-left transition-all active:scale-[0.98] shadow-xl shadow-emerald-900/20 aspect-[4/3] flex flex-col justify-end p-6 border border-emerald-500/30">
                <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500"><Camera className="w-48 h-48 text-white"/></div>
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 via-emerald-800/20 to-transparent"></div>
                <div className="relative z-10">
                   <div className="bg-white/20 backdrop-blur-md w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border border-white/30 shadow-inner">
                      <Camera className="w-7 h-7 text-white" />
                   </div>
                   <h2 className="text-3xl font-black text-white leading-tight mb-1">Tap to Scan<br/>Waste Issue</h2>
                   <p className="text-emerald-100 font-medium opacity-90 text-sm">AI will automatically detect and tag.</p>
                </div>
             </button>
          </motion.div>

          {/* Lower Bento Boxes */}
          <div className="grid grid-cols-2 gap-4 flex-1">
             <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-xl border border-white rounded-[2rem] p-5 shadow-sm flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><FileText className="w-24 h-24 text-slate-900"/></div>
                <h3 className="font-bold text-slate-800 mb-4 relative z-10 flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500"/> My Reports</h3>
                <div className="flex-1 relative z-10 flex flex-col justify-end">
                   <div className="space-y-3">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                         <div className="flex-1">
                            <p className="text-xs font-bold text-slate-700 truncate">Sector 12 Dump</p>
                            <p className="text-[10px] text-emerald-600 font-semibold uppercase">Resolved</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
                         <div className="flex-1">
                            <p className="text-xs font-bold text-slate-700 truncate">Market Bin #4</p>
                            <p className="text-[10px] text-amber-600 font-semibold uppercase">Pending</p>
                         </div>
                      </div>
                   </div>
                </div>
             </motion.div>

             <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-xl border border-white rounded-[2rem] p-5 shadow-sm flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><BarChart3 className="w-24 h-24 text-slate-900"/></div>
                <h3 className="font-bold text-slate-800 mb-1 relative z-10 flex items-center gap-2"><Users className="w-4 h-4 text-blue-500"/> Leaderboard</h3>
                <p className="text-xs text-slate-500 font-medium mb-4 relative z-10">Local Rank</p>
                <div className="flex-1 relative z-10 flex flex-col justify-end items-center pb-2">
                   <div className="text-4xl font-black text-slate-800 tracking-tighter">#42</div>
                   <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg mt-2">Top 5% 🏆</div>
                </div>
             </motion.div>
          </div>
        </motion.div>
      )}

      {/* CAMERA STEP */}
      {step === 'camera' && (
        <motion.div initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} className="flex-1 flex flex-col bg-black relative z-20">
          <header className="absolute top-0 inset-x-0 p-4 z-30 flex justify-between">
             <button onClick={() => setStep('home')} className="bg-black/50 p-2 rounded-full text-white backdrop-blur"><ChevronLeft/></button>
          </header>
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: "environment" }} className="flex-1 w-full h-full object-cover" />
          <div className="absolute inset-0 border-[40px] border-black/30 pointer-events-none">
            <div className="w-full h-full border border-white/30 rounded-3xl"></div>
          </div>
          <div className="absolute bottom-0 inset-x-0 p-8 pb-12 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-center items-center">
            <button onClick={capture} className="w-20 h-20 rounded-full border-4 border-white/50 p-1 active:scale-95 transition-transform">
              <div className="w-full h-full bg-white rounded-full"></div>
            </button>
          </div>
        </motion.div>
      )}

      {/* REVIEW STEP */}
      {step === 'review' && (
        <motion.div initial={{x: '100%'}} animate={{x: 0}} transition={{type: 'spring', damping: 25, stiffness: 200}} className="flex-1 flex flex-col p-5 overflow-y-auto bg-slate-50 relative z-20 pb-32">
          <header className="flex items-center gap-3 mb-6">
             <button onClick={retake} className="p-2 -ml-2 bg-white rounded-full shadow-sm text-slate-500 hover:text-slate-800"><ChevronLeft className="w-5 h-5"/></button>
             <h1 className="font-bold text-xl text-slate-800">Review Issue</h1>
          </header>

          <div className="relative rounded-[2rem] overflow-hidden shadow-sm mb-6 bg-slate-200 aspect-[4/3] border border-white">
            <img src={image} className="w-full h-full object-cover" />
            <button onClick={retake} className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-black/70 transition-colors">Retake</button>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-5 shadow-sm border border-white mb-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-blue-50 p-3 rounded-2xl"><MapPin className="w-5 h-5 text-blue-600" /></div>
              <div className="flex-1 mt-0.5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">GPS Location</h3>
                {location ? (
                  <p className="text-slate-800 font-mono text-sm font-semibold">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                ) : locationError ? (
                  <p className="text-red-500 text-sm font-medium">{locationError}</p>
                ) : (
                  <p className="text-slate-500 text-sm animate-pulse">Fetching...</p>
                )}
              </div>
            </div>
            <div className="h-px w-full bg-slate-100"></div>
            <div className="flex items-start gap-4">
              <div className="bg-amber-50 p-3 rounded-2xl"><Clock className="w-5 h-5 text-amber-600" /></div>
              <div className="flex-1 mt-0.5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Timestamp</h3>
                <p className="text-slate-800 text-sm font-semibold">{timestamp ? timestamp.toLocaleString() : 'Recording...'}</p>
              </div>
            </div>
          </div>

          <div className="mb-2">
            <label htmlFor="comments" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pl-2">Optional Comments</label>
            <div className="relative">
              <textarea
                id="comments"
                rows="3"
                className="w-full bg-white/80 backdrop-blur-md border border-white rounded-[2rem] p-5 pr-16 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow resize-none shadow-sm"
                placeholder="Describe the issue..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
              <button
                onClick={toggleListening}
                type="button"
                className={`absolute right-4 top-4 p-3 rounded-full transition-all flex items-center justify-center ${isListening ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 sm:absolute p-5 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
            <button 
              onClick={submitReport}
              disabled={isSubmitting || (!location && !locationError)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-4.5 px-6 rounded-[1.5rem] shadow-xl shadow-emerald-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
            >
              {isSubmitting ? <div className="w-6 h-6 rounded-full border-2 border-white/30 border-t-white animate-spin"></div> : <><Send className="w-5 h-5" /> Submit Report</>}
            </button>
          </div>
        </motion.div>
      )}

      {/* SUCCESS STEP */}
      {step === 'success' && (
        <motion.div initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} className="flex-1 flex flex-col justify-center items-center p-8 text-center bg-slate-50 z-30 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-100/50 via-transparent to-transparent"></div>
          <div className="relative z-10">
             <div className="bg-emerald-500 p-6 rounded-full mb-8 shadow-xl shadow-emerald-500/30 inline-block">
               <CheckCircle2 className="w-20 h-20 text-white" />
             </div>
             <h2 className="text-3xl font-black mb-4 text-slate-800 tracking-tight">Report Logged!</h2>
             <p className="text-slate-500 mb-10 text-lg font-medium max-w-[250px] mx-auto">
               You just earned <span className="text-emerald-600 font-bold">+50 Green Credits</span>. The municipal team is on it.
             </p>
             <button 
               onClick={resetForm}
               className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold py-4.5 px-8 rounded-[1.5rem] shadow-sm transition-colors text-lg active:scale-[0.98]"
             >
               Back to Home
             </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// --- AUTHORITY DASHBOARD COMPONENT ---

// Mock Data for Waste Hotspots
const mockHotspots = [
  { 
    id: 1, 
    position: [28.6139, 77.2090], 
    severity: 'high', 
    type: 'Construction Debris', 
    reportedAt: '10 mins ago',
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=600',
    aiTags: ['construction debris', 'hazardous'],
    estimatedVolume: 'Very Large',
    aiSeverityScore: 92
  },
  { 
    id: 2, 
    position: [28.6200, 77.2150], 
    severity: 'medium', 
    type: 'Household Waste', 
    reportedAt: '1 hour ago',
    image: 'https://images.unsplash.com/photo-1605600659928-89c0b1efb8f0?auto=format&fit=crop&q=80&w=600',
    aiTags: ['overflowing bin', 'organic waste', 'plastic waste'],
    estimatedVolume: 'Medium',
    aiSeverityScore: 65
  },
  { 
    id: 3, 
    position: [28.6100, 77.2200], 
    severity: 'low', 
    type: 'Plastic Overflow', 
    reportedAt: '3 hours ago',
    image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600',
    aiTags: ['plastic waste', 'packaging'],
    estimatedVolume: 'Small',
    aiSeverityScore: 30
  },
  { 
    id: 4, 
    position: [28.6250, 77.1950], 
    severity: 'high', 
    type: 'Chemical Waste', 
    reportedAt: '20 mins ago',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=600',
    aiTags: ['hazardous waste', 'liquid'],
    estimatedVolume: 'Large',
    aiSeverityScore: 98
  },
];

const mockPredictions = [
  {
    id: 101, position: [28.6300, 77.2200], title: "Market Bin #4", alert: "High probability of overflow within 12h.", probability: 88, radius: 40
  },
  {
    id: 102, position: [28.6000, 77.1900], title: "Sector 12 Dump", alert: "Expected hazardous waste accumulation.", probability: 75, radius: 60
  }
];

const getSeverityColor = (severity, type = 'hex') => {
  if (severity === 'high') return type === 'hex' ? '#ef4444' : 'text-red-500 bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
  if (severity === 'medium') return type === 'hex' ? '#3b82f6' : 'text-blue-500 bg-blue-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]';
  if (severity === 'low') return type === 'hex' ? '#10b981' : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
  return type === 'hex' ? '#8b5cf6' : 'text-purple-500 bg-purple-500/10 border-purple-500/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]';
};

const getCategoryColor = (tags) => {
   if (tags.some(t => ['hazardous', 'hazardous waste', 'bio-waste'].includes(t))) return '#ef4444'; // Red for hazardous
   if (tags.some(t => ['e-waste', 'plastic waste', 'plastic', 'packaging'].includes(t))) return '#3b82f6'; // Blue for recyclable
   return '#10b981'; // Green for organic/other
};

const AuthorityDashboard = () => {
  const [activeTab, setActiveTab] = useState('live-map');
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [predictiveMode, setPredictiveMode] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  // Update clock
  React.useEffect(() => {
     const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
     return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-300 font-sans overflow-hidden">
      
      {/* Sidebar: High-Tech Command Control */}
      <aside className="w-20 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 z-30 transition-all duration-300 relative">
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"></div>
        
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
               <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-md opacity-40"></div>
               <div className="bg-slate-800 border border-cyan-500/50 p-2 rounded-xl relative z-10">
                 <ShieldAlert className="text-cyan-400 w-5 h-5" />
               </div>
            </div>
            <h1 className="font-black text-xl tracking-tight text-white hidden lg:block">SYS<span className="text-cyan-400 font-light">COM</span></h1>
          </div>
        </div>

        <nav className="flex-1 py-6 space-y-3 overflow-y-auto px-3">
          <button onClick={() => setActiveTab('live-map')} className={`w-full flex items-center justify-center lg:justify-start gap-4 px-3 py-3 rounded-xl transition-all relative group ${activeTab === 'live-map' ? 'bg-cyan-950/50 border border-cyan-800/50' : 'hover:bg-slate-800/50 border border-transparent'}`}>
            {activeTab === 'live-map' && <div className="absolute inset-0 bg-cyan-500/10 rounded-xl blur-md"></div>}
            <Map className={`w-5 h-5 relative z-10 ${activeTab === 'live-map' ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-slate-500 group-hover:text-cyan-300'}`} />
            <span className={`hidden lg:block font-bold text-sm tracking-wide relative z-10 ${activeTab === 'live-map' ? 'text-cyan-100' : 'text-slate-400 group-hover:text-slate-200'}`}>Live Operations</span>
          </button>
          
          <button onClick={() => setActiveTab('interventions')} className={`w-full flex items-center justify-center lg:justify-start gap-4 px-3 py-3 rounded-xl transition-all relative group ${activeTab === 'interventions' ? 'bg-emerald-950/50 border border-emerald-800/50' : 'hover:bg-slate-800/50 border border-transparent'}`}>
            {activeTab === 'interventions' && <div className="absolute inset-0 bg-emerald-500/10 rounded-xl blur-md"></div>}
            <Cpu className={`w-5 h-5 relative z-10 ${activeTab === 'interventions' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'text-slate-500 group-hover:text-emerald-300'}`} />
            <span className={`hidden lg:block font-bold text-sm tracking-wide relative z-10 ${activeTab === 'interventions' ? 'text-emerald-100' : 'text-slate-400 group-hover:text-slate-200'}`}>AI Interventions</span>
          </button>

          <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center justify-center lg:justify-start gap-4 px-3 py-3 rounded-xl transition-all relative group ${activeTab === 'analytics' ? 'bg-purple-950/50 border border-purple-800/50' : 'hover:bg-slate-800/50 border border-transparent'}`}>
            <BarChart3 className={`w-5 h-5 relative z-10 ${activeTab === 'analytics' ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]' : 'text-slate-500 group-hover:text-purple-300'}`} />
            <span className={`hidden lg:block font-bold text-sm tracking-wide relative z-10 ${activeTab === 'analytics' ? 'text-purple-100' : 'text-slate-400 group-hover:text-slate-200'}`}>Analytics Hub</span>
          </button>
          
          <button className="w-full flex items-center justify-center lg:justify-start gap-4 px-3 py-3 rounded-xl transition-all relative group hover:bg-slate-800/50 border border-transparent">
            <Users className="w-5 h-5 relative z-10 text-slate-500 group-hover:text-amber-300" />
            <span className="hidden lg:block font-bold text-sm tracking-wide relative z-10 text-slate-400 group-hover:text-slate-200">Worker Tracking</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 mt-auto shrink-0">
          <button className="w-full flex items-center justify-center lg:justify-start gap-4 px-3 py-3 rounded-xl hover:bg-slate-800/50 transition-all border border-transparent">
            <Settings className="w-5 h-5 text-slate-500" />
            <span className="hidden lg:block font-bold text-sm text-slate-400">Settings</span>
          </button>
          <button onClick={() => window.location.href = '/'} className="w-full flex items-center justify-center lg:justify-start gap-4 px-3 py-3 rounded-xl hover:bg-red-950/30 hover:border-red-900/50 transition-all border border-transparent mt-1 group">
            <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-400" />
            <span className="hidden lg:block font-bold text-sm text-slate-400 group-hover:text-red-300">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative z-0">
        
        {/* Top Navbar */}
        <header className="h-20 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-8 z-20 shrink-0">
           <div className="flex items-center gap-6">
              <div className="bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                 <span className="font-mono text-cyan-100 font-bold tracking-widest">{time}</span>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-emerald-950/30 border border-emerald-900/50 px-4 py-2 rounded-lg">
                 <Activity className="w-4 h-4 text-emerald-400" />
                 <span className="text-sm font-bold text-emerald-100">City Health Score:</span>
                 <span className="text-emerald-400 font-black">94/100</span>
              </div>
           </div>

           <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                 <Bell className="w-6 h-6" />
                 <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-slate-900 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-slate-700 overflow-hidden shadow-lg shadow-cyan-900/20">
                 {/* Avatar Placeholder */}
              </div>
           </div>
        </header>

        {/* Tab Content */}
        <div className="flex-1 relative z-0 flex overflow-hidden">
          {activeTab === 'live-map' && (
            <div className="flex-1 flex flex-col relative w-full h-full">
               
               {/* KPI Row Overlay */}
               <div className="absolute top-6 inset-x-6 z-[400] grid grid-cols-4 gap-4 pointer-events-none">
                 {[
                   {label: 'Total Reports', val: '1,248', color: 'cyan'},
                   {label: 'Active Hotspots', val: '42', color: 'red'},
                   {label: 'AI Efficiency (Merged)', val: '342', color: 'emerald'},
                   {label: 'Avg Cleanup Time', val: '2.4h', color: 'purple'}
                 ].map((kpi, i) => (
                   <motion.div initial={{y: -20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: i * 0.1}} key={kpi.label} className={`bg-slate-900/80 backdrop-blur-md border border-${kpi.color}-500/30 p-4 rounded-2xl shadow-lg shadow-${kpi.color}-900/20 pointer-events-auto`}>
                     <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">{kpi.label}</p>
                     <p className={`text-2xl font-black text-${kpi.color}-400 drop-shadow-[0_0_8px_rgba(var(--tw-colors-${kpi.color}-400),0.8)]`}>{kpi.val}</p>
                   </motion.div>
                 ))}
               </div>

               {/* Predictive Mode Toggle */}
               <div className="absolute top-[120px] left-6 z-[400]">
                 <button onClick={() => setPredictiveMode(!predictiveMode)} className={`px-4 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 border ${predictiveMode ? 'bg-purple-900/80 text-purple-300 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.4)] backdrop-blur-md' : 'bg-slate-900/80 text-slate-400 border-slate-700 backdrop-blur-md hover:bg-slate-800'}`}>
                   <Cpu className="w-4 h-4" /> Predictive AI Mode
                 </button>
               </div>

               {/* Map Area */}
               <div className="flex-1 bg-slate-950 relative">
                  {/* Dark Mode Map Tiles via CSS filter trick or specific tile provider */}
                  <MapContainer center={[28.6139, 77.2090]} zoom={13} className="w-full h-full z-0 bg-slate-950" zoomControl={false}>
                    <TileLayer
                      attribution='&copy; OpenStreetMap'
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    
                    {/* Render Glowing Waste Dots */}
                    {mockHotspots.map((spot) => (
                      <CircleMarker key={spot.id} center={spot.position} radius={spot.severity === 'high' ? 12 : 8} pathOptions={{ 
                          color: getCategoryColor(spot.aiTags), 
                          fillColor: getCategoryColor(spot.aiTags), 
                          fillOpacity: 0.8, 
                          weight: 2,
                          className: spot.severity === 'high' ? 'animate-pulse' : ''
                        }}
                        eventHandlers={{ click: () => setSelectedHotspot(spot) }}
                      />
                    ))}

                    {/* Predictive Zones */}
                    {predictiveMode && mockPredictions.map(pred => (
                      <CircleMarker key={`pred-${pred.id}`} center={pred.position} radius={pred.radius} pathOptions={{ color: '#a855f7', fillColor: '#a855f7', fillOpacity: 0.15, weight: 2, dashArray: '5, 5', className: 'animate-pulse' }}>
                        <Popup className="dark-popup"><div className="font-sans bg-slate-900 text-white p-2 rounded"><h4 className="font-bold text-purple-400">{pred.title}</h4><p className="text-xs text-slate-300 mt-1">{pred.alert}</p></div></Popup>
                      </CircleMarker>
                    ))}
                  </MapContainer>
               </div>

               {/* Right Sidebar: Live Incident Feed */}
               <div className="absolute top-0 right-0 h-full w-80 bg-slate-900/90 backdrop-blur-xl border-l border-slate-800 z-10 flex flex-col shadow-2xl">
                 <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <h3 className="font-bold text-slate-200 flex items-center gap-2"><Play className="w-4 h-4 text-cyan-500 fill-cyan-500"/> Live Feed</h3>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                 </div>
                 <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {mockHotspots.map((spot, i) => (
                       <motion.div initial={{x: 50, opacity: 0}} animate={{x: 0, opacity: 1}} transition={{delay: i*0.1}} key={`feed-${spot.id}`} className="bg-slate-800/80 border border-slate-700/50 rounded-xl overflow-hidden cursor-pointer hover:border-cyan-500/30 transition-colors" onClick={() => setSelectedHotspot(spot)}>
                         <img src={spot.image} className="w-full h-24 object-cover opacity-80" />
                         <div className="p-3">
                            <div className="flex justify-between items-start mb-2">
                               <p className="text-xs font-bold text-slate-200 truncate pr-2">{spot.type}</p>
                               <span className="text-[10px] text-slate-400 shrink-0">{spot.reportedAt}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                               {spot.aiTags.map(t => <span key={t} className="bg-slate-700/50 border border-slate-600 text-slate-300 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">{t}</span>)}
                            </div>
                         </div>
                       </motion.div>
                    ))}
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'interventions' && (
            <div className="flex-1 bg-slate-950 p-8 overflow-y-auto relative z-0">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 pointer-events-none z-0"></div>
               
               <div className="max-w-6xl mx-auto relative z-10">
                 <header className="mb-10">
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Command Deck</h2>
                    <p className="text-slate-400 font-medium">Review and dispatch AI-recommended actions.</p>
                 </header>

                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {mockHotspots.map((spot, i) => {
                       const actionColor = getSeverityColor(spot.severity, 'class');
                       let btnColor = "bg-blue-600 hover:bg-blue-500 shadow-blue-900/50";
                       let actionText = "Dispatch Mini-Truck (Route A)";
                       
                       if (spot.severity === 'high') { btnColor = "bg-red-600 hover:bg-red-500 shadow-red-900/50"; actionText = "Urgent Escalation: Hazmat Team"; }
                       else if (spot.aiTags.some(t => ['e-waste', 'plastic waste'].includes(t))) { btnColor = "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/50"; actionText = "Broadcast to Swachh-Preneurs"; }

                       return (
                         <motion.div initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} transition={{delay: i*0.05}} key={spot.id} className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col group hover:border-slate-700 transition-colors">
                            {/* Image Header */}
                            <div className="relative h-48">
                               <img src={spot.image} className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-500" />
                               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
                               
                               {/* Circular Dial for Severity */}
                               <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md rounded-full w-14 h-14 border border-slate-700 flex items-center justify-center shadow-lg">
                                  <div className="text-center">
                                    <span className="block text-lg font-black text-white leading-none">{spot.aiSeverityScore}</span>
                                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Score</span>
                                  </div>
                                  <svg className="absolute inset-0 w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
                                     <path className="text-slate-800" strokeWidth="2" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                     <path className={spot.severity === 'high' ? 'text-red-500' : spot.severity === 'medium' ? 'text-blue-500' : 'text-emerald-500'} strokeDasharray={`${spot.aiSeverityScore}, 100`} strokeWidth="2" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                  </svg>
                               </div>

                               <div className="absolute bottom-4 left-4 right-4">
                                  <div className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-2 border backdrop-blur-md ${actionColor}`}>
                                     Vol: {spot.estimatedVolume}
                                  </div>
                                  <h3 className="text-xl font-bold text-white drop-shadow-md">{spot.type}</h3>
                               </div>
                            </div>

                            {/* Details */}
                            <div className="p-5 flex-1 flex flex-col">
                               <div className="flex gap-4 mb-6 pb-4 border-b border-slate-800/50">
                                  <div className="flex-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Location</span>
                                    <span className="text-sm font-mono text-slate-300">{spot.position[0].toFixed(4)}, {spot.position[1].toFixed(4)}</span>
                                  </div>
                                  <div className="flex-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Time Logged</span>
                                    <span className="text-sm font-medium text-slate-300">{spot.reportedAt}</span>
                                  </div>
                               </div>

                               <div className="mb-6 flex-1">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">AI Tags</span>
                                  <div className="flex flex-wrap gap-2">
                                     {spot.aiTags.map(t => (
                                        <span key={t} className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-1 rounded-md text-xs font-semibold capitalize">{t}</span>
                                     ))}
                                  </div>
                               </div>

                               {/* Approve Button */}
                               <div className="mt-auto pt-2">
                                  <button className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2 ${btnColor}`}>
                                     <Cpu className="w-5 h-5"/> Approve: {actionText}
                                  </button>
                                  <div className="text-center mt-3">
                                     <button className="text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest">Manual Override <ArrowRight className="w-3 h-3 inline-block -mt-0.5"/></button>
                                  </div>
                               </div>
                            </div>
                         </motion.div>
                       );
                    })}
                 </div>
               </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

// --- SANITATION WORKER COMPONENT ---

const SanitationWorker = () => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [step, setStep] = useState('list'); // 'list', 'details', 'camera', 'verifying', 'success'
  const [afterImage, setAfterImage] = useState(null);
  const [verificationError, setVerificationError] = useState(null);
  const webcamRef = useRef(null);

  const tasks = mockHotspots.filter(t => t.severity === 'high' || t.severity === 'medium');

  const capture = useCallback(() => {
    const img = webcamRef.current.getScreenshot();
    setAfterImage(img);
    setStep('verifying');
    setVerificationError(null);
    
    // Simulate API call to /api/verify-cleanup
    setTimeout(() => {
      const isClean = Math.random() > 0.3; // 70% chance of success for mock
      if (isClean) {
         setStep('success');
      } else {
         setVerificationError("Waste still detected. Please clean thoroughly and retake.");
         setStep('camera');
         setAfterImage(null);
      }
    }, 1500);
  }, [webcamRef]);

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-8 text-center max-w-md mx-auto sm:border-x shadow-xl">
        <div className="bg-emerald-100 p-5 rounded-full mb-6">
          <CheckCircle2 className="w-20 h-20 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold mb-3 text-slate-800">Task Resolved!</h2>
        <p className="text-slate-500 mb-8">AI verified the cleanup.</p>
        <button onClick={() => { setStep('list'); setSelectedTask(null); setAfterImage(null); }} className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-transform text-white font-semibold py-4 px-8 rounded-2xl shadow-lg shadow-emerald-200 text-lg">Next Task</button>
      </div>
    );
  }

  if (step === 'camera' || step === 'verifying') {
    return (
      <div className="min-h-screen bg-black flex flex-col relative max-w-md mx-auto sm:border-x shadow-xl">
        <header className="absolute top-0 inset-x-0 p-4 z-10 flex justify-between">
           <button onClick={() => setStep('details')} className="bg-black/50 p-2 rounded-full text-white backdrop-blur"><ChevronLeft/></button>
        </header>
        {step === 'camera' && !verificationError && <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: "environment" }} className="flex-1 w-full h-full object-cover" />}
        {verificationError && (
          <div className="absolute top-20 inset-x-4 bg-red-500/90 text-white p-4 rounded-xl text-center backdrop-blur shadow-lg z-20 font-medium">{verificationError}</div>
        )}
        <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/80 to-transparent flex justify-center pb-12">
          {step === 'verifying' ? (
             <div className="text-white text-lg flex items-center gap-3 font-medium"><div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"/> Verifying Cleanup...</div>
          ) : (
             <button onClick={capture} className="w-20 h-20 rounded-full border-4 border-white/50 p-1 active:scale-95 transition-transform"><div className="w-full h-full bg-white rounded-full"></div></button>
          )}
        </div>
      </div>
    );
  }

  if (step === 'details' && selectedTask) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-xl sm:border-x">
         <header className="bg-white p-5 flex items-center gap-3 border-b border-slate-100 sticky top-0 z-10 shadow-sm">
           <button onClick={() => setStep('list')} className="p-1 -ml-2 text-slate-500 hover:text-slate-800"><ChevronLeft className="w-6 h-6"/></button>
           <h1 className="font-bold text-xl text-slate-800">Task #{selectedTask.id}</h1>
         </header>
         <div className="p-5 flex-1 overflow-y-auto pb-24">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Before Photo</h3>
            <img src={selectedTask.image} className="w-full aspect-[4/3] object-cover rounded-2xl mb-6 shadow-sm border border-slate-200" />
            <div className="bg-white p-5 rounded-2xl border border-slate-100 mb-6 shadow-sm space-y-3">
               <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                 <span className="text-sm text-slate-500">Type</span>
                 <span className="font-semibold text-slate-800">{selectedTask.type}</span>
               </div>
               <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                 <span className="text-sm text-slate-500">Volume</span>
                 <span className="font-semibold text-slate-800">{selectedTask.estimatedVolume}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-sm text-slate-500">AI Priority</span>
                 <span className={`text-sm font-bold px-2 py-0.5 rounded uppercase ${selectedTask.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{selectedTask.severity}</span>
               </div>
            </div>
         </div>
         <div className="fixed sm:absolute bottom-0 inset-x-0 p-5 bg-white/80 backdrop-blur-xl border-t border-slate-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
            <button onClick={() => setStep('camera')} className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all text-white font-semibold py-4 rounded-2xl flex justify-center items-center gap-2 text-lg shadow-lg shadow-emerald-200"><Camera className="w-5 h-5" /> Start Cleanup Verification</button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl sm:border-x sm:border-slate-200 relative">
      <header className="bg-white px-6 py-5 shadow-sm sticky top-0 z-10">
         <h1 className="font-bold text-xl text-slate-800 flex items-center gap-2"><Truck className="w-5 h-5 text-emerald-600"/> Field Tasks</h1>
      </header>
      <div className="p-5 space-y-4 overflow-y-auto">
        {tasks.map(t => (
          <div key={t.id} onClick={() => { setSelectedTask(t); setStep('details'); }} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 cursor-pointer active:scale-[0.98] transition-transform hover:border-slate-200">
             <img src={t.image} className="w-20 h-20 object-cover rounded-xl shrink-0 border border-slate-100" />
             <div className="flex-1 min-w-0 py-1">
               <div className="flex justify-between items-start mb-1">
                 <h3 className="font-semibold text-slate-800 truncate pr-2">{t.type}</h3>
                 <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${t.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
               </div>
               <p className="text-sm text-slate-500 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> {t.position[0].toFixed(3)}, {t.position[1].toFixed(3)}</p>
               <p className="text-xs font-medium text-emerald-600">{t.estimatedVolume}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};


// --- SWACHH-PRENEUR COMPONENT ---

const mockGigs = [
  { id: 201, type: "E-Waste Dump", volume: "Medium", payment: "₹150", distance: "0.8 km", position: [28.6050, 77.2000], image: "https://images.unsplash.com/photo-1550005973-54089b1bf4ca?auto=format&fit=crop&q=80&w=600", aiTags: ['e-waste', 'metal'] },
  { id: 202, type: "Plastic Bottles", volume: "Large", payment: "₹250", distance: "1.2 km", position: [28.6100, 77.2200], image: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600", aiTags: ['plastic waste', 'packaging'] },
  { id: 203, type: "Cardboard Boxes", volume: "Small", payment: "₹80", distance: "2.1 km", position: [28.6200, 77.2150], image: "https://images.unsplash.com/photo-1605600659928-89c0b1efb8f0?auto=format&fit=crop&q=80&w=600", aiTags: ['cardboard', 'organic waste'] }
];

const SwachhPreneurDashboard = () => {
  const [availableGigs, setAvailableGigs] = useState(mockGigs);
  const [acceptedGig, setAcceptedGig] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);

  const acceptPickup = (gig) => {
    setIsAccepting(true);
    // Simulate API call to /api/accept-pickup
    setTimeout(() => {
       setAvailableGigs(prev => prev.filter(g => g.id !== gig.id));
       setAcceptedGig(gig);
       setIsAccepting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col max-w-md mx-auto shadow-2xl sm:border-x sm:border-slate-200 font-sans relative">
      <header className="bg-emerald-600 text-white p-5 sticky top-0 z-10 shadow-md">
         <div className="flex justify-between items-center mb-2">
            <h1 className="font-bold text-xl flex items-center gap-2"><Recycle className="w-5 h-5"/> Swachh-Preneur</h1>
            <div className="bg-emerald-800/50 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Online</div>
         </div>
         <p className="text-emerald-100 text-sm opacity-90">Find nearby recyclable waste</p>
      </header>

      <div className="p-4 flex-1 overflow-y-auto pb-20">
        {acceptedGig ? (
          <div className="animate-in fade-in slide-in-from-bottom-4">
             <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 mb-6">
                <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex justify-between items-center">
                   <h2 className="font-bold text-emerald-800 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-600"/> Active Pickup</h2>
                   <span className="font-bold text-emerald-600 bg-white px-2 py-1 rounded-lg text-sm shadow-sm">{acceptedGig.payment}</span>
                </div>
                <img src={acceptedGig.image} className="w-full h-48 object-cover" />
                <div className="p-5">
                   <h3 className="font-bold text-lg text-slate-800 mb-1">{acceptedGig.type}</h3>
                   <div className="flex gap-4 mb-4 text-sm text-slate-500">
                     <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {acceptedGig.distance}</span>
                     <span className="flex items-center gap-1"><Tag className="w-4 h-4"/> Vol: {acceptedGig.volume}</span>
                   </div>
                   <div className="flex gap-2 mb-6">
                     {acceptedGig.aiTags.map(t => <span key={t} className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium border border-slate-200">{t}</span>)}
                   </div>
                   <button onClick={() => setAcceptedGig(null)} className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-200 flex justify-center items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Complete Pickup</button>
                </div>
             </div>
          </div>
        ) : (
          <div className="space-y-4">
             <h2 className="font-bold text-slate-800 text-lg mb-2 flex items-center gap-2">Available Gigs <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-sm">{availableGigs.length}</span></h2>
             
             {availableGigs.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 border-dashed text-slate-400 mt-10">
                   <Recycle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                   <p>No gigs available right now.<br/>We'll notify you when someone reports recyclables!</p>
                </div>
             ) : (
                availableGigs.map(gig => (
                  <div key={gig.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow">
                     <div className="flex">
                        <img src={gig.image} className="w-1/3 object-cover min-h-[120px]" />
                        <div className="w-2/3 p-4 flex flex-col justify-between">
                           <div>
                              <div className="flex justify-between items-start">
                                <h3 className="font-bold text-slate-800 leading-tight">{gig.type}</h3>
                                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-sm">{gig.payment}</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> {gig.distance} away</p>
                           </div>
                           <button onClick={() => acceptPickup(gig)} disabled={isAccepting} className="w-full mt-3 bg-slate-900 hover:bg-black text-white font-semibold py-2 rounded-lg text-sm transition-colors active:scale-[0.98]">
                              Accept Pickup
                           </button>
                        </div>
                     </div>
                  </div>
                ))
             )}
          </div>
        )}
      </div>
    </div>
  );
};


// --- CITIZEN IMPACT COMPONENT ---
const CitizenImpact = () => {
  // Mock data
  const impactData = {
    points: 1400,
    verifiedReports: 12,
    cleanedAreas: 8,
    notifications: [
      { id: 1, message: "Thank you! The plastic waste you reported has been recycled.", date: "2 hours ago", icon: <Recycle className="w-5 h-5 text-emerald-500"/> },
      { id: 2, message: "Your report at Market Bin #4 was verified! +50 points", date: "1 day ago", icon: <CheckCircle className="w-5 h-5 text-blue-500"/> },
      { id: 3, message: "Cleanup completed at Sector 12. +100 points", date: "3 days ago", icon: <CheckCircle2 className="w-5 h-5 text-emerald-500"/> }
    ]
  };

  const getLevel = (points) => {
    if (points >= 2000) return { name: "Gold Civic Sensor", progress: (points/5000)*100, next: 5000, color: "bg-amber-400" };
    if (points >= 1000) return { name: "Silver Civic Sensor", progress: ((points - 1000)/1000)*100, next: 2000, color: "bg-slate-300" };
    return { name: "Bronze Civic Sensor", progress: (points/1000)*100, next: 1000, color: "bg-orange-700" };
  };

  const level = getLevel(impactData.points);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl sm:border-x sm:border-slate-200 font-sans relative">
      <header className="bg-white px-6 py-5 shadow-sm sticky top-0 z-10 flex items-center justify-between">
         <div className="flex items-center gap-3">
           <a href="/" className="p-1 -ml-2 text-slate-500 hover:text-slate-800"><ChevronLeft className="w-6 h-6"/></a>
           <h1 className="font-bold text-xl text-slate-800">My Impact</h1>
         </div>
      </header>
      
      <div className="p-5 space-y-6 overflow-y-auto pb-10">
         <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 p-4 opacity-10 transform rotate-12"><Recycle className="w-32 h-32" /></div>
            <h2 className="text-emerald-100 font-semibold mb-1 relative z-10">Swachhata Green Credits</h2>
            <div className="text-5xl font-black mb-6 flex items-baseline gap-1 relative z-10">{impactData.points} <span className="text-lg font-medium text-emerald-200">pts</span></div>
            
            <div className="space-y-3 relative z-10">
               <div className="flex justify-between text-sm font-bold tracking-wide">
                  <span className="text-white drop-shadow-sm">{level.name}</span>
                  <span className="text-emerald-200 font-mono">{impactData.points} / {level.next}</span>
               </div>
               <div className="w-full bg-black/20 rounded-full h-3 backdrop-blur-sm p-0.5 border border-white/10">
                  <div className={`h-full rounded-full ${level.color} shadow-[0_0_10px_rgba(255,255,255,0.3)]`} style={{ width: `${level.progress}%` }}></div>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
               <div className="bg-blue-50 p-3 rounded-full mb-3"><MapPin className="w-6 h-6 text-blue-500" /></div>
               <span className="text-3xl font-black text-slate-800">{impactData.verifiedReports}</span>
               <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Verified Reports</span>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
               <div className="bg-emerald-50 p-3 rounded-full mb-3"><CheckCircle2 className="w-6 h-6 text-emerald-500" /></div>
               <span className="text-3xl font-black text-slate-800">{impactData.cleanedAreas}</span>
               <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Cleaned Areas</span>
            </div>
         </div>

         <div>
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-slate-400"/> Activity History</h3>
            <div className="space-y-3">
               {impactData.notifications.map(n => (
                  <div key={n.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4 items-start">
                     <div className="bg-slate-50 p-2.5 rounded-xl shrink-0 mt-0.5 border border-slate-100">
                        {n.icon}
                     </div>
                     <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1 leading-snug">{n.message}</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{n.date}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};


const CitizenProfile = () => {
  const navigate = useNavigate();
  
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col max-w-md mx-auto shadow-2xl relative overflow-hidden sm:border-x sm:border-slate-200">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/40 via-slate-100 to-slate-100 pointer-events-none"></div>
      
      <header className="absolute top-0 inset-x-0 p-4 z-30 flex justify-between">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/50 backdrop-blur-md rounded-full shadow-sm text-slate-700 hover:bg-white transition-colors">
          <ChevronLeft className="w-6 h-6"/>
        </button>
      </header>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex-1 flex flex-col p-5 relative z-10 overflow-y-auto pt-20 hide-scrollbar">
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-emerald-400 rounded-full blur-md opacity-40 animate-pulse"></div>
            <img src="https://ui-avatars.com/api/?name=Rashi+Sharma&background=10b981&color=fff" alt="Profile" className="relative w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover" />
            <div className="absolute bottom-0 right-0 bg-emerald-500 p-1.5 rounded-full border-2 border-white shadow-md">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Rashi Sharma</h2>
          <p className="text-emerald-600 font-bold text-sm tracking-wide uppercase mt-1">Verified Civic Sensor</p>
          <div className="mt-2 bg-slate-800 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold shadow-inner border border-slate-700">Level 4: Green Guardian</div>
        </motion.div>

        {/* Impact Stats Bento Box */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-8">
          <div className="col-span-2 bg-white/60 backdrop-blur-xl border border-white rounded-[2rem] p-5 shadow-sm relative overflow-hidden flex justify-between items-center group">
             <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity"><Activity className="w-24 h-24 text-emerald-900"/></div>
             <div className="relative z-10">
               <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Swachhata Credits</p>
               <h3 className="text-3xl font-black text-emerald-600">1,400</h3>
             </div>
             <div className="relative z-10 bg-emerald-100 p-3 rounded-2xl border border-emerald-200">
               <Tag className="w-8 h-8 text-emerald-500" />
             </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-xl border border-white rounded-[2rem] p-5 shadow-sm relative overflow-hidden">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Waste Reported</p>
             <h3 className="text-2xl font-black text-slate-800">120<span className="text-sm text-slate-500 ml-1">kg</span></h3>
          </div>

          <div className="bg-white/60 backdrop-blur-xl border border-white rounded-[2rem] p-5 shadow-sm relative overflow-hidden">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Issues Resolved</p>
             <h3 className="text-2xl font-black text-slate-800">15</h3>
          </div>
        </motion.div>

        {/* Achievements Carousel */}
        <motion.div variants={itemVariants} className="mb-8">
          <h3 className="font-bold text-slate-800 mb-4 px-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" /> Digital Badges
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
             {[
               { icon: <Camera className="w-8 h-8 text-blue-500" />, title: "First Report", color: "blue" },
               { icon: <Recycle className="w-8 h-8 text-emerald-500" />, title: "Recycling Champ", color: "emerald" },
               { icon: <ShieldAlert className="w-8 h-8 text-purple-500" />, title: "Plastic Free", color: "purple" },
               { icon: <MapPin className="w-8 h-8 text-amber-500" />, title: "Zone Guardian", color: "amber" }
             ].map((badge, idx) => (
                <div key={idx} className="snap-start shrink-0 w-28 aspect-square bg-white border border-white/50 rounded-[2rem] shadow-sm flex flex-col items-center justify-center p-3 relative overflow-hidden group">
                  <div className={`absolute inset-0 bg-${badge.color}-500/5 group-hover:bg-${badge.color}-500/10 transition-colors`}></div>
                  <div className={`w-12 h-12 bg-${badge.color}-50 rounded-full flex items-center justify-center mb-2 shadow-inner border border-${badge.color}-100`}>
                    {badge.icon}
                  </div>
                  <p className="text-[10px] font-bold text-slate-700 text-center leading-tight">{badge.title}</p>
                </div>
             ))}
          </div>
        </motion.div>

        {/* Settings List */}
        <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-2 shadow-sm">
           <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors text-left">
             <div className="flex items-center gap-3">
               <Settings className="w-5 h-5 text-slate-400" />
               <span className="font-semibold text-slate-700 text-sm">Account Settings</span>
             </div>
             <ChevronLeft className="w-4 h-4 text-slate-300 rotate-180" />
           </button>
           <div className="h-px bg-slate-100 mx-4"></div>
           <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors text-left">
             <div className="flex items-center gap-3">
               <Info className="w-5 h-5 text-slate-400" />
               <span className="font-semibold text-slate-700 text-sm">Language Preferences</span>
             </div>
             <ChevronLeft className="w-4 h-4 text-slate-300 rotate-180" />
           </button>
           <div className="h-px bg-slate-100 mx-4"></div>
           <button onClick={() => { localStorage.clear(); navigate('/auth'); }} className="w-full flex items-center justify-between p-4 hover:bg-red-50 rounded-2xl transition-colors text-left group">
             <div className="flex items-center gap-3">
               <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-500 transition-colors" />
               <span className="font-semibold text-red-500 text-sm">Logout</span>
             </div>
           </button>
        </motion.div>

      </motion.div>
    </div>
  );
};

const WorkerProfile = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(true);

  return (
    <div className="h-screen bg-slate-950 text-slate-300 font-sans flex flex-col w-full mx-auto relative overflow-hidden sm:border-x sm:border-slate-800 lg:max-w-md">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-900/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none"></div>

      <header className="flex items-center justify-between p-6 pb-4 relative z-10 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} className="p-2 bg-slate-900 rounded-full border border-slate-800 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5"/>
        </button>
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Service Record</h1>
        <div className="w-9"></div> {/* Spacer for centering */}
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10 hide-scrollbar pb-20">
        
        {/* Digital ID Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/50 rounded-3xl p-6 shadow-2xl shadow-cyan-900/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
          
          <div className="flex items-start gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-800 shrink-0">
               <img src="https://ui-avatars.com/api/?name=Rakesh+Kumar&background=0f172a&color=06b6d4" className="w-full h-full object-cover" alt="ID" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Rakesh Kumar</h2>
              <p className="text-slate-400 text-xs font-mono mb-1">ID: SW-4920-BL</p>
              <div className="flex items-center gap-1.5 mt-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                <span className="text-xs font-bold text-cyan-400">Zone A - Central Market</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
             <div>
               <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Duty Status</p>
               <p className={`text-sm font-bold flex items-center gap-2 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                 <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
                 {isActive ? 'Active / On-Duty' : 'Off-Duty'}
               </p>
             </div>
             <button 
               onClick={() => setIsActive(!isActive)}
               className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-slate-700'}`}
             >
               <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
             </button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity className="w-4 h-4" /> Monthly Performance</h3>
          <div className="grid grid-cols-2 gap-4">
            
            {/* Radial Accuracy */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col items-center justify-center relative shadow-lg">
               <div className="relative w-24 h-24 mb-2">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                    <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="226" strokeDashoffset="22" className="text-cyan-500" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-black text-white">92%</span>
                  </div>
               </div>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center mt-2">Resolution<br/>Accuracy</p>
            </div>

            <div className="flex flex-col gap-4">
               <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex-1 shadow-lg">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tickets Resolved</p>
                  <p className="text-2xl font-black text-emerald-400">148</p>
               </div>
               <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex-1 shadow-lg">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Avg Response</p>
                  <p className="text-2xl font-black text-indigo-400">45<span className="text-xs text-slate-500 ml-1">min</span></p>
               </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Clock className="w-4 h-4"/> Recent Activity</h3>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg">
             <div className="relative border-l-2 border-slate-800 ml-3 space-y-8 pb-4">
                
                <div className="relative">
                   <div className="absolute -left-[27px] bg-emerald-900/50 border border-emerald-500 w-6 h-6 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                   </div>
                   <div className="pl-6">
                     <p className="text-xs text-slate-500 font-mono mb-1">Today, 14:30</p>
                     <p className="text-sm font-bold text-white mb-0.5">Cleared Category-A Waste</p>
                     <p className="text-xs text-slate-400">Sector 12 Market - Verified via AI</p>
                   </div>
                </div>

                <div className="relative">
                   <div className="absolute -left-[27px] bg-cyan-900/50 border border-cyan-500 w-6 h-6 rounded-full flex items-center justify-center">
                      <Truck className="w-3 h-3 text-cyan-400" />
                   </div>
                   <div className="pl-6">
                     <p className="text-xs text-slate-500 font-mono mb-1">Today, 11:15</p>
                     <p className="text-sm font-bold text-white mb-0.5">Dispatched to Hotspot</p>
                     <p className="text-xs text-slate-400">Main Road, near City Mall</p>
                   </div>
                </div>

                <div className="relative">
                   <div className="absolute -left-[27px] bg-emerald-900/50 border border-emerald-500 w-6 h-6 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                   </div>
                   <div className="pl-6">
                     <p className="text-xs text-slate-500 font-mono mb-1">Yesterday, 16:45</p>
                     <p className="text-sm font-bold text-white mb-0.5">Resolved Citizen Ticket #892</p>
                     <p className="text-xs text-slate-400">Residential Block B</p>
                   </div>
                </div>

             </div>
          </div>
        </div>

      </div>
    </div>
  );
};


// --- PROTECTED ROUTE COMPONENT ---
const ProtectedRoute = ({ children, allowedRoles }) => {
  const role = localStorage.getItem('userRole');
  
  if (!role) {
    return <Navigate to="/auth" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-red-50 p-6 rounded-full mb-6 border border-red-100 shadow-sm">
          <AlertTriangle className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">403</h1>
        <h2 className="text-xl font-bold text-slate-700 mb-4">Access Denied</h2>
        <p className="text-slate-500 mb-8 text-center max-w-sm font-medium">You don't have the required permissions to view this page. Your current role is <b>{role}</b>.</p>
        <button onClick={() => window.history.back()} className="bg-slate-900 hover:bg-black text-white px-8 py-3.5 rounded-xl font-bold transition-colors shadow-lg active:scale-95">Go Back</button>
      </div>
    );
  }
  
  return children;
};

// --- AUTH COMPONENT ---
const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FieldError = ({ msg }) =>
  msg ? (
    <p className="text-red-500 text-xs font-semibold mt-1.5 pl-1 flex items-center gap-1">
      <AlertTriangle className="w-3 h-3 shrink-0" />{msg}
    </p>
  ) : null;

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('citizen');

  // field values
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [empId, setEmpId] = useState('');

  // per-field errors
  const [errs, setErrs] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // reset state when switching login/signup or role
  const reset = () => {
    setErrs({});
    setMobile(''); setEmail(''); setPassword(''); setEmpId('');
  };

  // validate all fields, return true if clean
  const validate = () => {
    const e = {};
    if (role === 'citizen') {
      if (!mobile) e.mobile = 'Mobile number is required.';
      else if (!PHONE_RE.test(mobile)) e.mobile = 'Invalid phone number. Must be exactly 10 digits.';
    } else {
      if (!email) e.email = 'Email is required.';
      else if (!EMAIL_RE.test(email)) e.email = 'Invalid email address.';
      if (!isLogin && !empId) e.empId = 'Employee / Partner ID is required.';
    }
    if (!password) e.password = 'Password is required.';
    else if (password.length < 6) e.password = 'Password too short. Minimum 6 characters.';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    submitToBackend();
  };

  const submitToBackend = async () => {
    setIsLoading(true);
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      if (isLogin) {
        const username = role === 'citizen' ? mobile : email;
        const res = await fetch(`${API}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Login failed.');
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('token', data.access_token);
        toast.success('Welcome back! 🎉');
        if (data.role === 'authority') navigate('/dashboard');
        else if (data.role === 'worker') navigate('/worker');
        else if (data.role === 'recycler') navigate('/recycler');
        else navigate('/');
      } else {
        const res = await fetch(`${API}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, mobile: role === 'citizen' ? mobile : undefined, email: role !== 'citizen' ? email : undefined, emp_id: empId || undefined, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Signup failed.');
        toast.success('Account created! Please log in.');
        reset();
        setIsLogin(true);
      }
    } catch (err) {
      toast.error(err.message, { duration: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (field) =>
    `w-full bg-slate-50 border rounded-xl p-4 text-slate-700 focus:outline-none focus:ring-2 font-semibold shadow-sm placeholder:font-normal transition-colors ${
      errs[field]
        ? 'border-red-400 focus:ring-red-400 bg-red-50/50'
        : 'border-slate-200 focus:ring-emerald-500 hover:border-slate-300'
    }`;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-8 font-sans">
      <Toaster position="top-center" toastOptions={{ style: { fontFamily: 'inherit', fontWeight: 600 } }} />
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 relative">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-10 text-center text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 transform rotate-12 scale-150"><Recycle className="w-32 h-32"/></div>
          <div className="bg-white/20 p-4 rounded-3xl inline-block mb-4 backdrop-blur-md border border-white/20 shadow-inner">
            <Camera className="w-10 h-10 text-white"/>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2 drop-shadow-sm">SwachhLens</h1>
          <p className="text-emerald-100 font-medium text-sm tracking-wide uppercase">Empowering Clean Communities</p>
        </div>

        <div className="p-8">
          <div className="flex gap-4 mb-8 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
            <button id="tab-login" onClick={() => { setIsLogin(true); reset(); }} className={`flex-1 py-3 font-bold rounded-xl text-sm transition-all ${isLogin ? 'bg-white text-emerald-700 shadow border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}>Login</button>
            <button id="tab-signup" onClick={() => { setIsLogin(false); reset(); }} className={`flex-1 py-3 font-bold rounded-xl text-sm transition-all ${!isLogin ? 'bg-white text-emerald-700 shadow border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}>Sign Up</button>
          </div>


            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Role selector */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 pl-1">I am a...</label>
                <select id="role-select" value={role} onChange={(e) => { setRole(e.target.value); reset(); }} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none font-semibold shadow-sm hover:border-slate-300 transition-colors">
                  <option value="citizen">Citizen (Reporter)</option>
                  <option value="authority">Municipal Authority</option>
                  <option value="worker">Sanitation Worker</option>
                  <option value="recycler">Recycling Partner</option>
                </select>
              </div>

              {/* Mobile or Email */}
              {role === 'citizen' ? (
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 pl-1">Mobile Number</label>
                  <input
                    id="mobile-input"
                    type="tel"
                    value={mobile}
                    onChange={e => { setMobile(e.target.value); setErrs(p => ({ ...p, mobile: '' })); }}
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    className={inputCls('mobile')}
                  />
                  <FieldError msg={errs.mobile} />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 pl-1">Official Email</label>
                  <input
                    id="email-input"
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrs(p => ({ ...p, email: '' })); }}
                    placeholder="name@department.gov"
                    className={inputCls('email')}
                  />
                  <FieldError msg={errs.email} />
                </div>
              )}

              {/* Employee ID (signup only, non-citizen) */}
              {!isLogin && role !== 'citizen' && (
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 pl-1">Employee / Partner ID</label>
                  <input
                    id="empid-input"
                    type="text"
                    value={empId}
                    onChange={e => { setEmpId(e.target.value); setErrs(p => ({ ...p, empId: '' })); }}
                    placeholder="ID Number"
                    className={inputCls('empId')}
                  />
                  <FieldError msg={errs.empId} />
                </div>
              )}

              {/* Password */}
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 pl-1">Password</label>
                <input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrs(p => ({ ...p, password: '' })); }}
                  placeholder="Min. 6 characters"
                  className={inputCls('password')}
                />
                <FieldError msg={errs.password} />
              </div>

              <div className="pt-2">
                <button id="submit-btn" type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 flex justify-center items-center gap-2">
                  {isLoading
                    ? <div className="w-6 h-6 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    : isLogin ? 'Sign In Securely' : 'Create Account'}
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
};

// --- APP COMPONENT ---
function App() {
  return (
    <Router>
      <Routes>
          <Route path="/auth" element={<AuthScreen />} />
          <Route path="/citizen/profile" element={<ProtectedRoute allowedRoles={['citizen']}><CitizenProfile /></ProtectedRoute>} />
          <Route path="/worker/profile" element={<ProtectedRoute allowedRoles={['worker', 'authority']}><WorkerProfile /></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute allowedRoles={['citizen']}><CitizenReport /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['authority']}><AuthorityDashboard /></ProtectedRoute>} />
          <Route path="/worker" element={<ProtectedRoute allowedRoles={['worker']}><SanitationWorker /></ProtectedRoute>} />
          <Route path="/recycler" element={<ProtectedRoute allowedRoles={['recycler']}><SwachhPreneurDashboard /></ProtectedRoute>} />
          <Route path="/impact" element={<ProtectedRoute allowedRoles={['citizen']}><CitizenImpact /></ProtectedRoute>} />
        </Routes>
    </Router>
  );
}

export default App;
