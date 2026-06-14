import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  GraduationCap, 
  BookOpen, 
  QrCode, 
  CheckCircle2, 
  Laptop, 
  Smartphone, 
  Wifi, 
  Sliders,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import mqtt from 'mqtt';
import { saveStudentProfile } from '../lib/supabaseClient';

interface OnboardingScreenProps {
  sessionId: string;
  onComplete: (level: 'SL' | 'HL', startingBand: number) => void;
}

export default function OnboardingScreen({ sessionId, onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState<number>(1);
  const [level, setLevel] = useState<'SL' | 'HL' | null>(null);
  const [startingBand, setStartingBand] = useState<number>(6);
  const [paired, setPaired] = useState<boolean>(false);
  const [mqttConnected, setMqttConnected] = useState<boolean>(false);
  const [pairingHandshakeMessage, setPairingHandshakeMessage] = useState<string>('Awaiting cross-device handshake pairing string...');

  // Setup MQTT listener for real-time onboarding handshake sync
  useEffect(() => {
    let client: any = null;
    const topic = `ib_physics/session/${sessionId}`;

    try {
      const brokerUrl = 'wss://broker.hivemq.com:8884/mqtt';
      client = mqtt.connect(brokerUrl, {
        keepalive: 60,
        reconnectPeriod: 3000,
        connectTimeout: 8000,
        clean: true,
        clientId: 'ib_phy_onboard_' + Math.random().toString(16).substring(2, 8)
      });

      client.on('connect', () => {
        setMqttConnected(true);
        client.subscribe(topic);
        console.log(`[Onboarding] Subscribed to session: ${topic} for handshake detections`);
      });

      client.on('message', (t: string, message: any) => {
        try {
          const payload = JSON.parse(message.toString());
          // If we receive any workspace connection snapshot or handshake
          if (payload) {
            console.log('[Onboarding] Handshake received via MQTT broadcast!');
            setPaired(true);
            setPairingHandshakeMessage("Device Successfully Connected! Link Established. ✔");
          }
        } catch (err) {
          // If message is just any string/ping
          console.log('[Onboarding] Simple string ping received!');
          setPaired(true);
          setPairingHandshakeMessage("Device Successfully Connected! Link Established. ✔");
        }
      });

      client.on('offline', () => setMqttConnected(false));
      client.on('error', () => setMqttConnected(false));
    } catch (e) {
      console.warn("Onboarding real-time client setup deferred.", e);
    }

    return () => {
      if (client) {
        client.end();
      }
    };
  }, [sessionId]);

  const handleSelectLevel = (chosenLevel: 'SL' | 'HL') => {
    setLevel(chosenLevel);
    setStep(2);
  };

  const handleSelectStartingBand = (band: number) => {
    setStartingBand(band);
    setStep(3);
  };

  const handleSimulateHandshake = () => {
    setPaired(true);
    setPairingHandshakeMessage("Device Successfully Connected! Link Established. ✔");
  };

  const handleEnterWorkspace = async () => {
    if (!level) return;
    try {
      await saveStudentProfile(level, startingBand, "student_1");
    } catch (err) {
      console.error("Failed storing profile: ", err);
    }
    onComplete(level, startingBand);
  };

  // Progress Bar percentage width
  const getProgressWidth = () => {
    if (step === 1) return 'w-1/3';
    if (step === 2) return 'w-2/3';
    return 'w-full';
  };

  // Progress color matching step
  const getProgressColor = () => {
    if (step === 1) return 'bg-blue-500';
    if (step === 2) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl min-h-[460px] flex flex-col justify-between relative overflow-hidden">
        
        {/* Progress Bar Header */}
        <div className="w-full bg-slate-950 h-1.5 rounded-full mb-8 overflow-hidden flex">
          <div className={`${getProgressColor()} h-full ${getProgressWidth()} transition-all duration-500 ease-out`} />
        </div>

        {/* Step Cards with AnimatePresence */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: TRACK SELECTION */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 flex flex-col w-full"
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 animate-spin duration-1000" /> Step 1 of 3
                  </span>
                  <h1 className="text-2xl font-bold font-display text-white mt-1.5 tracking-tight">
                    Select your IB Physics track
                  </h1>
                  <p className="text-sm text-slate-400 mt-2 font-sans">
                    We customize your gravitation learning ladder based on your exact exam scope.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={() => handleSelectLevel('SL')} 
                    className="w-full p-4 bg-slate-950 hover:bg-slate-850/80 border border-slate-800 hover:border-blue-500 rounded-xl text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-white group-hover:text-blue-400 text-sm flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        Standard Level (SL)
                      </div>
                      <div className="text-xs text-slate-400 mt-1 pl-6 leading-relaxed font-sans">
                        Focus entirely on Core Gravitation mechanics (Topic 6 circular motion).
                      </div>
                    </div>
                    <ChevronRight className="text-slate-600 group-hover:text-blue-400 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>

                  <button 
                    onClick={() => handleSelectLevel('HL')} 
                    className="w-full p-4 bg-slate-950 hover:bg-slate-850/80 border border-slate-800 hover:border-blue-500 rounded-xl text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-white group-hover:text-blue-400 text-sm flex items-center gap-2">
                        <GraduationCap className="h-4.5 w-4.5 text-indigo-400" />
                        Higher Level (HL)
                      </div>
                      <div className="text-xs text-slate-400 mt-1 pl-6 leading-relaxed font-sans">
                        Includes Core Mechanics plus Potential Fields & Space Geometry (Topic 10).
                      </div>
                    </div>
                    <ChevronRight className="text-slate-600 group-hover:text-blue-400 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: STARTING BAND SELECTION */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 flex flex-col w-full"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                      Step 2 of 3
                    </span>
                    <button 
                      onClick={() => setStep(1)} 
                      className="text-xs text-slate-500 hover:text-slate-300 font-mono cursor-pointer"
                    >
                      ← Back
                    </button>
                  </div>
                  <h1 className="text-2xl font-bold font-display text-white mt-1.5 tracking-tight">
                    Where are we starting from?
                  </h1>
                  <p className="text-sm text-slate-400 mt-2 font-sans">
                    Be completely honest. The engine uses this baseline to calibrate the math support depth.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button 
                    onClick={() => handleSelectStartingBand(2)} 
                    className="p-5 bg-slate-950 hover:bg-slate-850/60 border border-slate-800 hover:border-amber-500 rounded-xl text-center transition-all group cursor-pointer flex flex-col justify-between min-h-[140px]"
                  >
                    <div className="text-xl font-mono font-bold text-amber-500 group-hover:scale-115 transition-transform">Band 2-3</div>
                    <div className="text-[10px] text-slate-400 mt-4 uppercase tracking-wide font-sans leading-snug">
                      Struggling with formula transpositions
                    </div>
                  </button>

                  <button 
                    onClick={() => handleSelectStartingBand(4)} 
                    className="p-5 bg-slate-950 hover:bg-slate-850/60 border border-slate-800 hover:border-indigo-500 rounded-xl text-center transition-all group cursor-pointer flex flex-col justify-between min-h-[140px]"
                  >
                    <div className="text-xl font-mono font-bold text-indigo-400 group-hover:scale-115 transition-transform">Band 4-5</div>
                    <div className="text-[10px] text-slate-400 mt-4 uppercase tracking-wide font-sans leading-snug">
                      Okay with math, stuck on text structure
                    </div>
                  </button>

                  <button 
                    onClick={() => handleSelectStartingBand(6)} 
                    className="p-5 bg-slate-950 hover:bg-slate-850/60 border border-slate-800 hover:border-emerald-500 rounded-xl text-center transition-all group cursor-pointer flex flex-col justify-between min-h-[140px]"
                  >
                    <div className="text-xl font-mono font-bold text-emerald-400 group-hover:scale-115 transition-transform">Band 6</div>
                    <div className="text-[10px] text-slate-400 mt-4 uppercase tracking-wide font-sans leading-snug">
                      Aiming for absolute derivation perfection
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: DEVICE PAIR CONNECTION */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 flex flex-col w-full"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                      Step 3 of 3
                    </span>
                    <button 
                      onClick={() => setStep(2)} 
                      className="text-xs text-slate-500 hover:text-slate-300 font-mono cursor-pointer"
                    >
                      ← Back
                    </button>
                  </div>
                  <h1 className="text-2xl font-bold font-display text-white mt-1.5 tracking-tight">
                    Connect your camera workspace
                  </h1>
                  <p className="text-xs text-slate-450 mt-2 font-sans leading-relaxed">
                    To achieve standard Band 7 proof marks, you must practice freehand derivations on paper. Pair your smartphone camera to instantly sync and project handwritten slips.
                  </p>
                </div>

                {/* QR Code pairing block */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1.5 text-center sm:text-left flex-1">
                    <span className="flex items-center justify-center sm:justify-start gap-1">
                      <span className={`h-2 w-2 rounded-full ${paired ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
                      <p className={`text-xs font-semibold ${paired ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {pairingHandshakeMessage}
                      </p>
                    </span>
                    <p className="text-[10px] text-slate-500 font-sans">
                      Keep this browser tab open while pairing. Alphanumeric Session Room: <strong className="font-mono text-slate-300">#{sessionId}</strong>
                    </p>

                    {/* Simulation trigger link */}
                    {!paired && (
                      <button 
                        type="button"
                        onClick={handleSimulateHandshake}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-mono cursor-pointer block pt-1.5"
                      >
                        ⚡ Simulate Instant Cross-Device Link (Bypass)
                      </button>
                    )}
                  </div>

                  {/* Aesthetic styled QR layout */}
                  <div className="bg-white p-2.5 rounded-lg shrink-0 shadow-lg relative group">
                    <div className="w-20 h-20 bg-slate-950 flex flex-col items-center justify-center rounded text-white overflow-hidden relative">
                      <QrCode className="h-10 w-10 text-white shrink-0" />
                      <div className="text-[8px] font-mono select-none tracking-tight font-bold pt-1.5 uppercase text-slate-400 text-center">
                        ROOM {sessionId}
                      </div>
                      
                      {/* Laser scanner effect across the QR placeholder */}
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-sky-500 animate-bounce pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Complete / Enter Workspace button */}
                <button 
                  id="finalDashboardBtn"
                  disabled={!paired}
                  onClick={handleEnterWorkspace}
                  className={`w-full py-3.5 font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md ${
                    paired 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer hover:shadow-indigo-500/10' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
                  }`}
                >
                  {paired ? "Enter Gravitation Mastery Workspace" : "Awaiting Device Connection"}
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer info branding block */}
        <div className="mt-8 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-sans">
          <span className="flex items-center gap-1.5">
            <Laptop className="h-3.5 w-3.5" />
            Workspace Session Link
          </span>
          <span className="font-mono tracking-widest bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
            {mqttConnected ? "CONNECTED_BROKER" : "LOCAL_TUNNEL"}
          </span>
        </div>

      </div>
    </div>
  );
}
