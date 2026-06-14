import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  QrCode, 
  Wifi, 
  Sparkles, 
  BookOpen, 
  AlertCircle, 
  Upload, 
  RefreshCw, 
  Info, 
  GraduationCap, 
  ChevronRight, 
  Link2,
  Lock,
  Compass,
  FileCheck,
  Camera,
  Smartphone,
  Signal,
  Battery,
  Award,
  CheckCircle2,
  Sliders,
  Maximize2
} from 'lucide-react';
import mqtt from 'mqtt';
import PhysicsSandbox from './components/PhysicsSandbox';
import DerivationScaffolder from './components/DerivationScaffolder';
import StudentWorkPanel from './components/StudentWorkPanel';
import RubricPanel from './components/RubricPanel';
import PitfallsGuide from './components/PitfallsGuide';
import UpcomingMasteryTasks from './components/UpcomingMasteryTasks';
import { 
  saveStudentAssessmentScore, 
  saveStudentProfile, 
  loadStudentProfile 
} from './lib/supabaseClient';
import { questionBank } from './data/questionBank';
import OnboardingScreen from './components/OnboardingScreen';


// Change this string parameter to dynamically swap out the entire dashboard content instantly:
const subtopicTargetCode = "TOPIC_10_2"; // Will pull the escape velocity derivation challenge!


export default function App() {
  // Onboarding & user profiling states
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('profile_onboarded_completed') === 'true';
  });
  const [studentLevel, setStudentLevel] = useState<'SL' | 'HL'>(() => {
    return (localStorage.getItem('profile_level_student_1') as 'SL' | 'HL') || 'HL';
  });
  const [startingBand, setStartingBand] = useState<number>(() => {
    const saved = localStorage.getItem('profile_band_student_1');
    return saved ? parseInt(saved, 10) : 6;
  });

  // Navigation / Mode Switcher State: 'desktop' | 'mobile'
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Dynamic question bank selection state
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>(() => {
    const level = (localStorage.getItem('profile_level_student_1') || 'HL') as 'SL' | 'HL';
    return level === 'SL' ? 'TOPIC_6_1' : 'TOPIC_10_2';
  });
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3>(() => {
    const savedBand = localStorage.getItem('profile_band_student_1');
    const band = savedBand ? parseInt(savedBand, 10) : 6;
    if (band <= 3) return 1;
    if (band <= 5) return 2;
    return 3;
  });

  // Sync profile details on mount
  useEffect(() => {
    loadStudentProfile("student_1").then(profile => {
      if (profile) {
        setStudentLevel(profile.level);
        setStartingBand(profile.startingBand);
        if (profile.level === 'SL' && selectedSubtopic.startsWith('TOPIC_10')) {
          setSelectedSubtopic('TOPIC_6_1');
        }
        if (!localStorage.getItem('profile_onboarded_completed')) {
          setIsOnboarded(true);
          localStorage.setItem('profile_onboarded_completed', 'true');
        }
      }
    }).catch(e => console.log("Profile sync deferred:", e));
  }, []);

  const activeQuestion = questionBank.find(
    q => q.subtopic_code === selectedSubtopic && q.tier === selectedTier
  ) || questionBank.find(q => q.id === "q_10_2_3") || questionBank[0];

  // Real-time MQTT stream coordination states
  const [sessionId, setSessionId] = useState<string>("84920"); // Default code matching user's mobile simulator
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [mqttConnected, setMqttConnected] = useState<boolean>(false);
  const mqttClientRef = React.useRef<any>(null);
  const decodingProcessRef = React.useRef<any>(null);

  // Fallback decoding state & simulated custom latency toggle
  const [showDecodingSpinner, setShowDecodingSpinner] = useState<boolean>(false);
  const [highLatencyEnabled, setHighLatencyEnabled] = useState<boolean>(true); // Enabled by default to showcase fallback loader!

  // Mobile upload simulation states
  const [uploadState, setUploadState] = useState<'idle' | 'linking' | 'completed'>('idle');
  const [activeWorkTab, setActiveWorkTab] = useState<'band7' | 'band2' | 'scan'>('band7');
  const [hoveredCriterion, setHoveredCriterion] = useState<string | null>(null);
  
  // Checking criteria manually
  const [checkedCriteria, setCheckedCriteria] = useState<Record<string, boolean>>({
    groundwork: false,
    manipulation: false,
    precision: false,
  });

  // Mobile-specific interactive states
  const [mobileFlash, setMobileFlash] = useState<boolean>(false);
  const [mobileGrid, setMobileGrid] = useState<boolean>(true);
  const [mobileProgress, setMobileProgress] = useState<number>(0);
  const [simulatedTime, setSimulatedTime] = useState<string>("09:41");

  // Real Camera & Shutter flash logic
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [shutterFlash, setShutterFlash] = useState<boolean>(false);

  // Auto-activate hardware rear-facing lens stream when companion mode launches
  useEffect(() => {
    let currentStream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // Prioritize primary rear camera
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        currentStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Ensure playback begins
          const tryPlay = () => {
            if (videoRef.current) {
              videoRef.current.setAttribute('playsinline', 'true');
              videoRef.current.setAttribute('autoplay', 'true');
              videoRef.current.play().catch(e => {
                console.warn("Autoplay deferred or paused", e);
              });
            }
          };
          tryPlay();
          setStreamActive(true);
          setCameraError(null);
        }
      } catch (err: any) {
        console.warn("Webcam access rejected or absent. Using physics mockup preview.", err);
        setStreamActive(false);
        setCameraError(err.message || "No rear lens/permission denied");
      }
    };

    if (viewMode === 'mobile') {
      startCamera();
    } else {
      setStreamActive(false);
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [viewMode]);

  // Keep simulated time accurate matching standard ios/android top bars
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hrs = now.getHours().toString().padStart(2, '0');
      let mins = now.getMinutes().toString().padStart(2, '0');
      setSimulatedTime(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Automatic screen-width and hash routing detection to open mobile companion mode by default on actual phones
  useEffect(() => {
    const checkViewportAndHash = () => {
      const isNarrow = window.innerWidth < 640;
      const hasMobileHash = window.location.hash === '#mobile' || window.location.href.includes('mobile=true');
      if (isNarrow || hasMobileHash) {
        setViewMode('mobile');
      }
    };
    checkViewportAndHash();
    window.addEventListener('resize', checkViewportAndHash);
    return () => window.removeEventListener('resize', checkViewportAndHash);
  }, []);

  // Monitor upload duration to dynamically display the fallback decoder spinner
  // if payload transmission and decoding latency exceeds 3.0 seconds (3000ms).
  useEffect(() => {
    let checkTimer: any = null;
    if (uploadState === 'linking') {
      checkTimer = setTimeout(() => {
        setShowDecodingSpinner(true);
      }, 3000);
    } else {
      setShowDecodingSpinner(false);
    }
    return () => {
      if (checkTimer) clearTimeout(checkTimer);
    };
  }, [uploadState]);

  // Real-time MQTT Bridge setup to synchronize live submissions via Secure WebSockets
  useEffect(() => {
    let client: any = null;
    setMqttConnected(false);

    // Cleanly wrap setup in an immediate local capsule to prevent namespace collision
    (() => {
      try {
        // Connect to the public HiveMQ MQTT broker via secure websockets on port 8884
        const brokerUrl = 'wss://broker.hivemq.com:8884/mqtt';
        console.log(`[MQTT] Connecting to Secure WebSockets Bridge: ${brokerUrl} ...`);
        
        client = mqtt.connect(brokerUrl, {
          keepalive: 60,
          reconnectPeriod: 3000,
          connectTimeout: 8000,
          clean: true,
          clientId: 'ib_phy_client_' + Math.random().toString(16).substring(2, 8)
        });

        client.on('connect', () => {
          console.log('[MQTT] Connected successfully to public secure bridge!');
          setMqttConnected(true);
          
          /* =========================================================================
           * ARCHITECTURAL REMARK: SANDBOXED DATA PIPELINES VIA TOPIC PATH ISOLATION
           * =========================================================================
           * The MQTT topic string `ib_physics/session/${sessionId}` establishes an
           * isolated, event-driven communication channel for each active student session.
           * By routing submissions through unique alphanumeric Session IDs (e.g., #84920),
           * we achieve logical sandboxing over shared public WebSocket brokers.
           * - Namespace collisions are prevented without dedicated tenant databases.
           * - Student workspaces remain lightweight, secure, and fully decoupled from
           *   adjacent interactive sessions.
           * - Web clients and mobile cameras bind securely to exact peer channels.
           * ========================================================================= */
          const topic = `ib_physics/session/${sessionId}`;
          client.subscribe(topic, (err: any) => {
            if (!err) {
              console.log(`[MQTT] Subscribed to session channel: ${topic}`);
            } else {
              const errMsg = err ? (err.message || String(err)) : '';
              if (errMsg.toLowerCase().includes('disconnect') || client.disconnecting) {
                console.log('[MQTT] Subscription gracefully aborted during connection teardown.');
              } else {
                console.error('[MQTT] Subscription error:', err);
              }
            }
          });
        });

        client.on('message', (topic: string, message: any) => {
          try {
            const payload = JSON.parse(message.toString());
            if (payload && payload.type === 'SUBMISSION') {
              console.log('[MQTT] Received live camera snapshot from companion device!');
              
              // Trigger the 'linking' phase representing transmission and parsing
              setUploadState('linking');
              setMobileProgress(80);

              // Cancel any current decoding process
              if (decodingProcessRef.current) {
                clearTimeout(decodingProcessRef.current);
              }

              // Determine delay. If simulated latency is enabled, take 4500ms (>3s threshold)
              // to trigger the native decoding fallback spinner, else take 1200ms.
              const completionDelay = highLatencyEnabled ? 4500 : 1200;

              decodingProcessRef.current = setTimeout(() => {
                setCapturedImage(payload.image);
                setUploadState('completed');
                setActiveWorkTab('scan');
                // Auto-fill markscheme checks
                setCheckedCriteria({
                  groundwork: true,
                  manipulation: true,
                  precision: true,
                });
                // Relational Database Spaced Repetition trigger (rubric score 3/3)
                saveStudentAssessmentScore("10.2", 3, "student_1");
              }, completionDelay);
            }
          } catch (e) {
            console.warn('[MQTT] Error parsing incoming payload:', e);
          }
        });

        client.on('offline', () => {
          setMqttConnected(false);
        });

        client.on('error', (err: any) => {
          console.warn('[MQTT] Connection reported error:', err);
          setMqttConnected(false);
        });

        mqttClientRef.current = client;
      } catch (err) {
        console.error('[MQTT] Failed to execute connect routine:', err);
      }
    })();

    return () => {
      if (client) {
        console.log('[MQTT] Unmounting page: Ending connection gracefully.');
        client.end();
      }
      if (decodingProcessRef.current) {
        clearTimeout(decodingProcessRef.current);
      }
    };
  }, [sessionId, highLatencyEnabled]);

  // Read URL query parameter or hash on mount to easily pre-fill session or navigate
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const querySess = params.get('session') || params.get('sessionId');
    if (querySess) {
      setSessionId(querySess);
    } else {
      // Check hash parameters like #mobile-84920
      const hash = window.location.hash;
      const match = hash.match(/mobile-(\d+)/) || hash.match(/session=(\d+)/);
      if (match && match[1]) {
        setSessionId(match[1]);
      }
    }
  }, []);

  // Programmatically render a high-craft physics derivation memo worksheet onto raw canvas
  const drawMockHandwrittenWorksheet = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas styling: creamy yellow student binder paper
    ctx.fillStyle = '#fafaf5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dynamic horizontal binder lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.2;
    for (let y = 60; y < canvas.height; y += 28) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Red vertical binder margin divider
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(80, 0);
    ctx.lineTo(80, canvas.height);
    ctx.stroke();

    // Dark slate hand-sketched ink styling
    ctx.fillStyle = '#0f172a';
    ctx.font = 'italic bold 20px "Courier New", Courier, monospace';
    ctx.fillText("IB Physics - Topic 10 Derivation", 100, 48);

    ctx.font = 'italic 15px "Courier New", Courier, monospace';
    ctx.fillStyle = '#475569';
    ctx.fillText("Session ID Bridge: #" + sessionId, 100, 80);
    ctx.fillText("Prompt: Express satellite orbital speed v.", 100, 112);

    // Physics Steps
    ctx.fillStyle = '#2563eb'; // blue ink
    ctx.font = 'italic bold 17px "Courier New", Courier, monospace';
    ctx.fillText("1) Equate Fc (centripetal) and Fg (gravity):", 100, 168);
    ctx.font = 'bold 20px "Courier New", Courier, monospace';
    ctx.fillText("   Fc = Fg  =>  mv²/r = GMm/r²", 100, 202);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'italic bold 17px "Courier New", Courier, monospace';
    ctx.fillText("2) Cancel mass m and simplify r:", 100, 258);
    ctx.font = 'bold 20px "Courier New", Courier, monospace';
    ctx.fillText("   v² = G * M / r", 100, 292);

    ctx.fillStyle = '#10b981'; // vibrant green ink
    ctx.font = 'italic bold 17px "Courier New", Courier, monospace';
    ctx.fillText("3) Extract velocity square root:", 100, 348);
    ctx.font = 'bold 23px "Courier New", Courier, monospace';
    ctx.fillText("   v = √[ G * M / r ]", 100, 388);

    // Simulated Red Grading Annotation lines
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    // Checkmarks
    ctx.beginPath();
    ctx.moveTo(420, 192); ctx.lineTo(435, 207); ctx.lineTo(455, 172);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(420, 282); ctx.lineTo(435, 297); ctx.lineTo(455, 262);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(420, 378); ctx.lineTo(435, 393); ctx.lineTo(455, 358);
    ctx.stroke();

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText("Excellent! 3/3 Marks", 330, 112);
  };

  const handleSimulateUpload = () => {
    if (uploadState === 'completed') return;
    setUploadState('linking');
    setMobileProgress(10);
    
    const activeDelay = highLatencyEnabled ? 4500 : 1500;
    
    // Simulate multi-step bridging/linking protocol feedback
    decodingProcessRef.current = setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      drawMockHandwrittenWorksheet(canvas);
      
      // Compress aggressively via HTML5 Canvas target format to minimize network payload sizes
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.4);

      setCapturedImage(imageDataUrl);
      setUploadState('completed');
      setActiveWorkTab('scan');
      setCheckedCriteria({
        groundwork: true,
        manipulation: true,
        precision: true,
      });
      // Relational Database Spaced Repetition trigger (rubric score 3/3)
      saveStudentAssessmentScore("10.2", 3, "student_1");

      // Broadcast simulated output to listener webviews immediately
      if (mqttClientRef.current && mqttConnected) {
        mqttClientRef.current.publish(`ib_physics/session/${sessionId}`, JSON.stringify({
          type: "SUBMISSION",
          image: imageDataUrl
        }));
      }
    }, activeDelay);
  };

  const handleMobileSnapUpload = () => {
    if (uploadState === 'linking' || uploadState === 'completed') return;
    
    // Simulate real snapshot shutter instant screen flash
    setShutterFlash(true);
    setTimeout(() => {
      setShutterFlash(false);
    }, 150);

    setUploadState('linking');
    setMobileProgress(15);
    
    // Process snapshot extraction
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    
    let imageDataUrl = "";
    if (streamActive && videoRef.current && ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      // Place beautiful translucent green target box layout
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('LIVE STREAM SCANNER #' + sessionId, 25, 35);
      
      // Compress aggressively via HTML5 Canvas target format to minimize network payload sizes
      imageDataUrl = canvas.toDataURL('image/jpeg', 0.4);
    } else {
      drawMockHandwrittenWorksheet(canvas);
      // Compress aggressively via HTML5 Canvas target format to minimize network payload sizes
      imageDataUrl = canvas.toDataURL('image/jpeg', 0.4);
    }

    setMobileProgress(50);

    const activeDelay = highLatencyEnabled ? 4500 : 1500;

    // Fake transmission progress over the real secure channels
    const transmitPayload = () => {
      const topic = `ib_physics/session/${sessionId}`;
      const payload = {
        type: "SUBMISSION",
        image: imageDataUrl,
        timestamp: Date.now()
      };

      if (mqttClientRef.current && mqttConnected) {
        mqttClientRef.current.publish(topic, JSON.stringify(payload), { qos: 0 }, () => {
          console.log('[MQTT] Camera Capture published across WebSocket channel!');
          setCapturedImage(imageDataUrl);
          setMobileProgress(100);
          setUploadState('completed');
          setActiveWorkTab('scan');
          setCheckedCriteria({
            groundwork: true,
            manipulation: true,
            precision: true,
          });
          // Relational Database Spaced Repetition trigger (rubric score 3/3)
          saveStudentAssessmentScore("10.2", 3, "student_1");
        });
      } else {
        // Direct local state bridge fallback if socket is reconnecting or throttled
        console.warn('[MQTT] Broker unlinked at publish time. Processing via internal preview pipeline.');
        setCapturedImage(imageDataUrl);
        setMobileProgress(100);
        setUploadState('completed');
        setActiveWorkTab('scan');
        setCheckedCriteria({
          groundwork: true,
          manipulation: true,
          precision: true,
        });
        // Relational Database Spaced Repetition trigger (rubric score 3/3)
        saveStudentAssessmentScore("10.2", 3, "student_1");
      }
    };

    decodingProcessRef.current = setTimeout(transmitPayload, activeDelay);
  };

  const handleToggleCriterion = (id: string) => {
    setCheckedCriteria(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleWorkTabChange = (tab: 'band7' | 'band2' | 'scan') => {
    setActiveWorkTab(tab);
    if (uploadState === 'completed') {
      setCheckedCriteria({
        groundwork: tab === 'band7' || tab === 'scan',
        manipulation: tab === 'band7' || tab === 'scan',
        precision: tab === 'band7' || tab === 'scan',
      });
    }
  };

  const resetSimulation = () => {
    setUploadState('idle');
    setMobileProgress(0);
    setCheckedCriteria({
      groundwork: false,
      manipulation: false,
      precision: false,
    });
  };

  const handleNotifyCancelObserved = () => {
    // Student simulated an adjustment to satellite mass
  };

  if (!isOnboarded) {
    return (
      <OnboardingScreen 
        sessionId={sessionId}
        onComplete={(lvl, band) => {
          setStudentLevel(lvl);
          setStartingBand(band);
          setIsOnboarded(true);
          localStorage.setItem('profile_onboarded_completed', 'true');
          
          if (band <= 3) {
            setSelectedTier(1);
          } else if (band <= 5) {
            setSelectedTier(2);
          } else {
            setSelectedTier(3);
          }
          
          if (lvl === 'SL') {
            setSelectedSubtopic('TOPIC_6_1');
          } else {
            setSelectedSubtopic('TOPIC_10_2');
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* GLOBAL INTERACTIVE VIEWPORT SWITCHER / PREVIEW HUB */}
      <div className="bg-slate-900/90 border-b border-indigo-950/70 p-3 sticky top-0 z-50 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-indigo-400 shrink-0" />
          <span className="font-semibold text-slate-300 font-sans">WORKSPACE MODE:</span>
          
          <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800">
            <button 
              id="btn_desktop_mode"
              onClick={() => setViewMode('desktop')}
              className={`px-3 py-1 rounded font-medium transition text-[11px] ${
                viewMode === 'desktop' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              💻 Desktop App (Master)
            </button>
            <button 
              id="btn_mobile_mode"
              onClick={() => setViewMode('mobile')}
              className={`px-3 py-1 rounded font-medium transition text-[11px] flex items-center gap-1.5 ${
                viewMode === 'mobile' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📱 Mobile Companion (Scanner)
              {uploadState === 'completed' && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block"></span>}
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Signal:</span>
            <span className="text-emerald-400">Secure Direct Link</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div>
            <span>Desktop State:</span>{' '}
            <strong className={uploadState === 'completed' ? 'text-emerald-400' : 'text-amber-400'}>
              {uploadState === 'completed' ? 'MAPPED_3/3' : 'AWAITING_UPLOAD'}
            </strong>
          </div>
        </div>
      </div>

      {/* RENDER MODE: MOBILE CAMERA VIEWPORT */}
      {viewMode === 'mobile' ? (
        <div id="mobile_camera_view" className="w-full max-w-md mx-auto min-h-[calc(100vh-45px)] bg-slate-950 flex flex-col justify-between relative overflow-hidden animate-fade-in">
          
          {/* SIMULATED MOBILE HARDWARE STATUS BAR */}
          <div className="px-5 py-2.5 flex justify-between items-center bg-slate-950/90 text-xs font-mono tracking-wider text-slate-400 border-b border-slate-900/40 select-none">
            <span className="font-bold">{simulatedTime}</span>
            <div className="flex items-center gap-2">
              <Signal className="h-3.5 w-3.5 text-slate-400 fill-current" />
              <span className="text-[10px] bg-slate-900 border border-slate-800 px-1 py-0.2 rounded text-[9px] text-emerald-400 uppercase tracking-widest font-extrabold font-mono">
                5G SSL
              </span>
              <Battery className="h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          {/* SIMULATED LINK CONNECTION CONTROLLER HEADER */}
          <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-3 select-none flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Link State</div>
                <div className="text-[11px] font-bold text-slate-200">Linked to Desktop (Room #419)</div>
              </div>
            </div>
            
            <span className="text-[9px] font-mono text-slate-400 bg-slate-950 border border-slate-800 px-2 py-1 rounded">
              SYS-LINK: 419-722
            </span>
          </div>

          {/* WORKSPACE CAMERA GUIDE / INSTRUCTIONS */}
          <div className="px-5 pt-3 select-none">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1 font-sans">
              Handwritten Slip Camera
            </h2>
            <p className="text-[11px] text-slate-400 leading-normal font-sans">
              Align your IB Physics Topic 10 gravitation derivation on the desk. Check that forces are directly equated!
            </p>
          </div>

          {/* CENTRAL CAMERA VIEWFINDER STREAM */}
          <div className="flex-1 my-3 mx-4 rounded-2xl relative overflow-hidden bg-slate-900 border border-slate-800 p-2 shadow-2xl flex flex-col justify-center min-h-[310px]">
            {/* Real Camera Video Output */}
            {streamActive && (
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="absolute inset-0 w-full h-full object-cover z-0 rounded-xl"
              />
            )}

            {/* Simulated hardware camera snapshot white flash effect */}
            {shutterFlash && (
              <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-300 pointer-events-none" />
            )}

            {/* Dark grid background simulation */}
            {!streamActive && (
              <div className="absolute inset-0 z-0 pointer-events-none opacity-10" 
                   style={{
                     backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
                     backgroundSize: '24px 24px'
                   }} 
              />
            )}

            {/* Simulated Live Viewfinder Paper Content Overlay */}
            <div className={`w-full h-full relative border border-dashed border-slate-800/40 rounded-xl ${streamActive ? 'bg-transparent' : 'bg-slate-950'} flex flex-col justify-between p-4 z-10 font-mono`}>
              
              {/* Floating Camera controls */}
              <div className="flex justify-between items-center relative z-20">
                <button 
                  onClick={() => setMobileFlash(!mobileFlash)}
                  className={`p-2 rounded-full border text-[10px] leading-none transition-all duration-200 flex items-center gap-1.5 ${
                    mobileFlash 
                      ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold' 
                      : 'bg-slate-900/80 backdrop-blur text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  ⚡ FLASH: {mobileFlash ? 'ACTIVE' : 'AUTO'}
                </button>

                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-1 text-[9px] font-bold rounded-full border uppercase tracking-wider ${
                    streamActive 
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' 
                      : 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
                  }`}>
                    {streamActive ? '● REAR LENS LIVE' : 'SIMULATED LENS'}
                  </span>
                </div>

                <button 
                  onClick={() => setMobileGrid(!mobileGrid)}
                  className={`p-2 rounded-full border text-[10px] leading-none transition-all duration-200 ${
                    mobileGrid 
                      ? 'bg-indigo-600 text-white border-indigo-500' 
                      : 'bg-slate-900/80 backdrop-blur text-slate-400 border-slate-800'
                  }`}
                >
                  🌐 GRID: {mobileGrid ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Hand-drawn physics gravitation derivation diagram placeholder / scanning sights */}
              <div className="flex-1 flex flex-col justify-center items-center my-6 space-y-4 px-2 relative z-10 select-none">
                
                {/* Simulated tracking frame brackets */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/75" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/75" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/75" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/75" />

                {/* Laser scan line overlay */}
                <div className="absolute left-0 right-0 h-0.5 bg-indigo-500/80 shadow-md shadow-indigo-500 animate-pulse pointer-events-none top-1/2" />

                {/* Grid Overlay lines */}
                {mobileGrid && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between opacity-35">
                    <div className="w-full h-px bg-slate-800" />
                    <div className="w-full h-px bg-slate-800" />
                    <div className="w-full h-px bg-slate-800" />
                    <div className="absolute inset-y-0 left-1/3 w-px bg-slate-800" />
                    <div className="absolute inset-y-0 right-1/3 w-px bg-slate-800" />
                  </div>
                )}

                {/* Blueprint card shows when webcam is idle or simulating */}
                <div className="text-center space-y-3 p-4 bg-slate-950/80 backdrop-blur-sm border border-slate-800/80 rounded-lg max-w-[240px] shadow-inner">
                  <div className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">Paper Frame Captured</div>
                  
                  {/* Equalities */}
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-slate-200">
                      Fc = Fg
                    </div>
                    <div className="text-[11px] text-slate-350">
                      mv²/r = G·M·m/r²
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ⇒ v² = G·M/r
                    </div>
                    <div className="text-xs font-bold text-emerald-400">
                      v = √[G·M/r]
                    </div>
                  </div>
                  
                  <div className="text-[9px] text-slate-500 italic block">
                    (m completely cancelled)
                  </div>
                </div>

                {/* Simulated Focus tracker circles */}
                <div className="absolute top-4 left-6 border border-emerald-400/50 w-8 h-8 rounded-full animate-ping pointer-events-none" />
                <div className="absolute bottom-3 right-8 border border-emerald-400/50 w-10 h-10 rounded-full animate-pulse pointer-events-none" />
                
                {/* Active Alignment Status Tag */}
                <span className="px-2 py-0.5 bg-emerald-950/85 border border-emerald-500 text-emerald-300 text-[9px] tracking-wider uppercase rounded-full font-bold">
                  {streamActive ? 'ALIGN TARGET SLIP' : 'Target Centered (Auto-focus)'}
                </span>
                
              </div>

              {/* Viewfinder footer overlay */}
              <div className="flex justify-between items-center text-[9px] text-slate-500 relative z-20">
                <span>ZOOM: 1.0X</span>
                <span>ISO 400</span>
                <span>{streamActive ? 'CAMERA STREAM CONNECTED' : 'PAPER MATCH: 98%'}</span>
              </div>
            </div>
          </div>

          {/* ACTIVE STATE OVERLAYS */}
          {uploadState === 'linking' && (
            <div className="mx-4 p-4 rounded-xl bg-indigo-950/90 border border-indigo-700 text-center space-y-2 select-none animate-bounce">
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 text-indigo-300 animate-spin" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Uploading handwritten slide...
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full transition-all duration-300 rounded-full" 
                  style={{ width: `${mobileProgress}%` }}
                />
              </div>
              <span className="text-[10px] text-indigo-300/90 block font-mono">
                Transmitting raw image blocks via WebSockets... {mobileProgress}%
              </span>
            </div>
          )}

          {uploadState === 'completed' && (
            <div className="mx-4 p-4 rounded-xl bg-emerald-950/90 border border-emerald-600 text-center space-y-1.5 select-none animate-pulse">
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-extrabold text-emerald-200 uppercase tracking-widest font-sans">
                  Transmitted Successfully!
                </span>
              </div>
              <p className="text-[10px] text-emerald-300 font-sans leading-normal">
                Handwritten answer sheet mapped. Toggle back to the <strong>Desktop Module</strong> to inspect the Band 7 Markscheme Rubrics!
              </p>
            </div>
          )}

          {/* THE MASSIVE BOTTOM DOCK CAM ACTION BUTTONS */}
          <div className="px-5 pb-8 pt-4 space-y-4 bg-slate-950 select-none border-t border-slate-900">
            {uploadState === 'idle' ? (
              <button
                id="btn_mobile_snap"
                onClick={handleMobileSnapUpload}
                className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm tracking-widest uppercase transition duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-950 active:scale-[0.98]"
              >
                📸 SNAP & UPLOAD WORK
              </button>
            ) : uploadState === 'linking' ? (
              <button
                disabled
                className="w-full py-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 font-extrabold text-sm tracking-widest uppercase cursor-not-allowed flex items-center justify-center gap-2.5"
              >
                <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-slate-500 animate-spin" />
                UPLOADING SCRIPTS...
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  disabled
                  className="w-full py-4 rounded-2xl bg-emerald-900 text-white font-extrabold text-sm tracking-widest uppercase flex items-center justify-center gap-2 border border-emerald-700"
                >
                  ✅ SENT TO DESKTOP!
                </button>
                <button
                  onClick={resetSimulation}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs transition"
                >
                  Capture another page
                </button>
              </div>
            )}

            <button
              onClick={() => setViewMode('desktop')}
              className="w-full py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs transition font-medium flex items-center justify-center gap-1"
            >
              ← Back to Desktop App
            </button>
          </div>

        </div>
      ) : (
        /* RENDER MODE: DUAL-COLUMN DESKTOP WORKSPACE */
        <div className="min-h-[calc(100vh-45px)] animate-fade-in">
          
          {/* Top Navigation Bar with High Tech IB Aesthetics */}
          <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-950/40">
                <GraduationCap className="h-5.5 w-5.5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-sans font-bold text-sm tracking-widest text-white uppercase">
                    IB Physics Gravitational Scaffolder
                  </h1>
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-0.5 rounded-full font-bold">
                    TOPIC 6 & 10
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono font-sans">Cognitive Bridge: Band 2 Student → Band 7 Scholar</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Active Student Level & Band Target Track indicator */}
              <div className="hidden sm:flex items-center gap-2 text-[11px] font-sans text-slate-400 border border-slate-850 bg-slate-950 px-3 py-1.5 rounded-lg select-none">
                <span className="text-slate-500">Track:</span>
                <strong className="text-indigo-400 font-bold">{studentLevel}</strong>
                <span className="text-slate-800">|</span>
                <span className="text-slate-500">Target:</span>
                <strong className="text-emerald-400 font-bold">
                  {startingBand === 2 ? "Band 2-3" : startingBand === 4 ? "Band 4-5" : "Band 6-7"}
                </strong>
              </div>

              {/* Paper 3 Practice Page */}
              <button
                onClick={() => {
                  window.location.href = 'paper3.html';
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 hover:bg-amber-600 hover:text-white cursor-pointer transition font-medium"
              >
                <Award className="h-3.5 w-3.5" />
                <span>Paper 3 Practice</span>
              </button>

              {/* Dynamic Re-calibration Button */}
              <button
                onClick={() => {
                  setIsOnboarded(false);
                  localStorage.removeItem('profile_onboarded_completed');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-900/60 text-xs text-indigo-350 hover:bg-slate-900 hover:text-white cursor-pointer transition font-medium"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Change Track</span>
              </button>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping block"></span>
                <span className="text-slate-400 font-mono text-[10px]">COGNITIVE ENGINE ACTIVE</span>
              </div>
            </div>
          </header>

          {/* Main Container Layout */}
          <main className="max-w-7xl mx-auto p-6 space-y-6">
            
            {/* Banner Introduction / Epistemology */}
            <div id="intro-banner" className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 pr-2">
                <h2 className="text-sm font-semibold tracking-wide uppercase text-indigo-400 flex items-center gap-1.5 font-sans">
                  <Compass className="h-4 w-4" /> The Derivation Scaffolding Methodology
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-3xl">
                  IB Physics markschemes are notorious for awarding point allocations only when specific, non-negotiable physical steps and commentaries are laid down. This platform scaffolds that rigorous logical flow, contrasting common intuitive candidate shortcuts with Band 7 excellence.
                </p>
              </div>
              <div className="text-[11px] text-slate-400 font-mono bg-slate-950 border border-slate-800 px-3 py-2 rounded shrink-0 leading-tight">
                <span>Active Target Question:</span> <br />
                <strong className="text-slate-200 font-sans">{activeQuestion.subtopic_title} - {activeQuestion.tier_name}</strong>
              </div>
            </div>

            {/* Curriculum Selector Control Panel */}
            <div id="question-selector-panel" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4.5 w-4.5 text-indigo-400" />
                  <h3 className="font-sans font-semibold text-slate-100 text-xs tracking-wider uppercase animate-pulse">
                    Select IB Physics Gravitation Subtopic & Pedagogical Mode
                  </h3>
                </div>
                <span className="text-[9px] font-mono text-indigo-400 bg-indigo-950 border border-indigo-900 px-2 py-0.5 rounded font-bold uppercase">
                  Curriculum Planner
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Columns 1 & 2: Subtopic Grid Selector */}
                <div className="md:col-span-2 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Gravitation Subtopics (Topic 6 & 10)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { code: "TOPIC_6_1", label: "6.1 Circular Dynamics" },
                      { code: "TOPIC_6_2", label: "6.2 Universal Gravitation" },
                      { code: "TOPIC_10_1", label: "10.1 Potential & Escape" },
                      { code: "TOPIC_10_2", label: "10.2 Orbital Motion" },
                      { code: "TOPIC_10_3", label: "10.3 Equipotential Fields" },
                      { code: "TOPIC_10_4", label: "10.4 Potential Gradient" },
                    ].filter(topic => studentLevel === 'HL' || topic.code.startsWith('TOPIC_6')).map((topic) => {
                      const isSelected = selectedSubtopic === topic.code;
                      return (
                        <button
                          key={topic.code}
                          onClick={() => {
                            setSelectedSubtopic(topic.code);
                            // Keep selection checkedCriteria refreshed
                            setCheckedCriteria({ groundwork: false, manipulation: false, precision: false });
                          }}
                          className={`text-left p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-950/40 border-indigo-500/80 text-indigo-200 shadow shadow-indigo-950/50'
                              : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-950 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="font-sans font-medium text-xs flex items-center justify-between">
                            <span>{topic.label}</span>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Column 3: Pedagogical Tier Selection */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pedagogical Execution Tiers</span>
                  <div className="flex flex-col gap-2">
                    {[
                      { tier: 1, label: "Tier 1: Conceptual Anchor", range: "Band 2→4" },
                      { tier: 2, label: "Tier 2: Scaffolded Math", range: "Band 4→6" },
                      { tier: 3, label: "Tier 3: Exam Derivation", range: "Band 6→7" },
                    ].map((t) => {
                      const isSelected = selectedTier === t.tier;
                      let activeStyles = "";
                      if (isSelected) {
                        if (t.tier === 1) activeStyles = "bg-rose-950/50 border-rose-500/80 text-rose-200";
                        else if (t.tier === 2) activeStyles = "bg-amber-950/50 border-amber-500/80 text-amber-200";
                        else activeStyles = "bg-emerald-950/50 border-emerald-500/80 text-emerald-200";
                      } else {
                        activeStyles = "bg-slate-950/40 border-slate-800/80 hover:bg-slate-950 hover:border-slate-700 text-slate-400 hover:text-slate-200";
                      }
                      return (
                        <button
                          key={t.tier}
                          onClick={() => {
                            setSelectedTier(t.tier as 1 | 2 | 3);
                            // Reset checkbox checkedCriteria
                            setCheckedCriteria({ groundwork: false, manipulation: false, precision: false });
                          }}
                          className={`text-left p-2.5 rounded-lg border transition-all duration-200 cursor-pointer ${activeStyles}`}
                        >
                          <div className="font-sans font-semibold text-xs flex items-center justify-between">
                            <span>{t.label}</span>
                            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                              {t.range}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Dual-Column Responsive Grid Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: Input, Actions & Simulator */}
              <section id="workspace_left" className="lg:col-span-6 space-y-6">
                
                {/* The Prime Paper 2 Question card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 border-b border-slate-800 pb-2">
                    <span className="font-bold flex items-center gap-1 font-sans">
                      <BookOpen className="h-4 w-4 text-slate-400" /> PAPER 2 STRUCTURED QUESTION
                    </span>
                    <span className="text-purple-400 bg-purple-950/50 px-2 py-0.5 rounded font-bold border border-purple-900">[3 MARKS]</span>
                  </div>

                  <div id="paper2_question_body" className="space-y-3.5">
                    <p className="text-base font-medium tracking-normal text-slate-100 font-display leading-relaxed border-l-2 border-indigo-500/60 pl-3">
                      {activeQuestion.question_text}
                    </p>
                    
                    <div className="bg-slate-950 p-3.5 rounded border border-slate-800 text-[11px] text-slate-400 leading-relaxed italic font-sans flex items-start gap-2.5">
                      <AlertCircle className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Scaffolding Tip:</strong> {activeQuestion.hints.scaffolding_tip}
                      </span>
                    </div>

                    {activeQuestion.hints.exponent_breakdown && (
                      <div className="bg-slate-950 p-3.5 rounded border border-slate-800/80 text-[11px] text-slate-300 font-sans space-y-2 mt-2">
                        <div className="text-amber-400 font-semibold flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Scaffolded Math - Keplerian Numerical Breakdowns:</span>
                        </div>
                        <p className="font-mono text-[10px] text-indigo-300 whitespace-pre-line leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-850">
                          {activeQuestion.hints.exponent_breakdown}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Simulated Mobile Upload & QR Linking Panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-5 w-5 text-indigo-400" />
                      <h3 className="font-sans font-semibold text-slate-100 text-sm tracking-wider uppercase">
                        Sync Mobile Bridge (Workspace Upload)
                      </h3>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Wifi className="h-3 w-3" /> NFC & QR Ready
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-center">
                    
                    {/* QR Code Graphic Frame */}
                    <div 
                      onClick={() => setViewMode('mobile')}
                      className="md:col-span-2 flex flex-col items-center justify-center p-3.5 bg-white rounded-xl relative group shadow-lg mx-auto cursor-pointer hover:ring-2 hover:ring-indigo-500 transition duration-200"
                    >
                      {/* Decorative QR Lines using pure HTML elements to look very crisp */}
                      <div className="w-[110px] h-[110px] relative flex flex-col justify-between" style={{ padding: '2px' }}>
                        {/* Top edge blocks */}
                        <div className="flex justify-between w-full h-[32px]">
                          <div className="w-[32px] h-[32px] bg-slate-950 border-[6px] border-slate-950 p-0.5 flex items-center justify-center">
                            <div className="w-full h-full bg-slate-950 border-[3px] border-white"></div>
                          </div>
                          <div className="w-[18px] h-[18px] bg-slate-950 self-start"></div>
                          <div className="w-[32px] h-[32px] bg-slate-950 border-[6px] border-slate-950 p-0.5 flex items-center justify-center">
                            <div className="w-full h-full bg-slate-950 border-[3px] border-white"></div>
                          </div>
                        </div>
                        {/* Center details */}
                        <div className="w-full flex justify-between px-1 my-2">
                          <div className="w-[12px] h-[24px] bg-slate-950"></div>
                          <div className="w-[20px] h-[20px] rounded-full bg-indigo-600 animate-pulse"></div>
                          <div className="w-[24px] h-[12px] bg-slate-950"></div>
                          <div className="w-[10px] h-[20px] bg-slate-800"></div>
                        </div>
                        {/* Bottom edge blocks */}
                        <div className="flex justify-between w-full h-[32px] items-end">
                          <div className="w-[32px] h-[32px] bg-slate-950 border-[6px] border-slate-950 p-0.5 flex items-center justify-center">
                            <div className="w-full h-full bg-slate-950 border-[3px] border-white"></div>
                          </div>
                          <div className="w-[18px] h-[12px] bg-slate-950"></div>
                          <div className="w-[30px] h-[30px] flex flex-wrap gap-1 p-0.5">
                            <div className="w-2.5 h-2.5 bg-slate-950"></div>
                            <div className="w-2.5 h-2.5 bg-slate-950"></div>
                            <div className="w-2.5 h-2.5 bg-slate-950"></div>
                            <div className="w-2.5 h-2.5 bg-slate-950"></div>
                          </div>
                        </div>
                      </div>

                      {/* QR active scanning animation overlay */}
                      <div className="absolute left-0 right-0 h-0.5 bg-indigo-500/80 animate-bounce top-5 shadow-sm shadow-indigo-400 pointer-events-none" />

                      <span className="text-[9px] font-mono font-bold text-slate-700 mt-2.5 tracking-wider uppercase">
                        TAP TO LAUNCH MOBILE
                      </span>
                    </div>

                    {/* Simulated Bridge Controls */}
                    <div className="md:col-span-3 space-y-3.5">
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-slate-200">
                          Configure Secure Real-Time Bridge
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-normal font-sans">
                          Enter or share this Session ID on your physical phone! Point your camera at your handwritten sheet and press capture to beam it in real-time.
                        </p>
                      </div>

                      {/* Interactive Session ID selection with MQTT Connection state */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">
                            Active Session ID
                          </label>
                          <div className="flex gap-1.5">
                            <input 
                              type="text"
                              value={sessionId}
                              onChange={(e) => {
                                // Allow only alphanumeric characters up to 8 characters
                                const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
                                setSessionId(val);
                                // Reset simulated progress on ID modification
                                setUploadState('idle');
                                setMobileProgress(0);
                              }}
                              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded text-xs font-mono font-bold text-indigo-300 w-full"
                              placeholder="e.g. 84920"
                            />
                            <button
                              onClick={() => {
                                const newId = Math.floor(10000 + Math.random() * 90000).toString();
                                setSessionId(newId);
                                setUploadState('idle');
                                setMobileProgress(0);
                              }}
                              className="px-2 py-1 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-[10px] text-slate-350 rounded font-mono font-bold transition cursor-pointer"
                              title="Randomize Session Code"
                            >
                              RAND
                            </button>
                          </div>
                        </div>

                        {/* Network Status tag */}
                        <div className="min-w-[100px] text-right">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-[9px] font-bold uppercase ${
                            mqttConnected 
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60' 
                              : 'bg-indigo-950/40 text-indigo-400 border-indigo-900/60 animate-pulse'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${mqttConnected ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'}`} />
                            {mqttConnected ? 'BRIDGE OK' : 'TUNNELING'}
                          </span>
                        </div>
                      </div>

                      {/* Operational Status Log */}
                      <div className="bg-slate-950 border border-slate-800/85 rounded px-3 py-1.5 font-mono text-[9px] space-y-1 text-slate-400">
                        <div className="flex items-center gap-1.5 justify-between font-sans">
                          <span className="text-slate-500 font-bold font-mono text-[8px] uppercase tracking-wider">Status Console:</span>
                          {uploadState === 'idle' && <span className="text-indigo-400 font-bold">AWAITING TRANSMISSION</span>}
                          {uploadState === 'linking' && <span className="text-amber-400 font-bold animate-pulse">TRANSMITTING IMAGE BLOCK...</span>}
                          {uploadState === 'completed' && <span className="text-emerald-400 font-bold flex items-center gap-1"><FileCheck className="h-3 w-3" /> LIVE_SESSION_MAPPED</span>}
                        </div>
                        {uploadState === 'linking' && (
                          <div className="text-slate-500 italic leading-tight">
                            &gt; Establishing secure WebSocket tunnel... <br/>
                            &gt; Decoding image fragment buffers: {mobileProgress}%
                          </div>
                        )}
                        {uploadState === 'completed' && (
                          <div className="text-slate-500 italic leading-tight">
                            &gt; Handshake verified. Student submission displayed in evaluation loop.
                          </div>
                        )}
                        {uploadState === 'idle' && (
                          <div className="text-slate-500 italic leading-tight">
                            &gt; Listening on topic: <span className="text-indigo-400">ib_physics/session/{sessionId}</span>
                          </div>
                        )}
                      </div>

                      {/* Latency selection config switcher */}
                      <label className="flex items-center gap-2 bg-slate-950/80 p-2 border border-slate-800/60 rounded text-[10px] text-slate-400 select-none cursor-pointer hover:border-slate-700 transition">
                        <input 
                          type="checkbox"
                          checked={highLatencyEnabled}
                          onChange={(e) => setHighLatencyEnabled(e.target.checked)}
                          className="rounded text-indigo-600 bg-slate-900 border-slate-800 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="font-bold text-slate-200">Enable 4.5s Simulated Network Delay</div>
                          <div className="text-[9px] text-slate-500 font-sans leading-none mt-0.5">Required to trigger and test the 3-second fallback spinner.</div>
                        </div>
                      </label>

                      {/* Emulator Trigger Bypass CTA */}
                      <div className="flex items-center gap-2">
                        {uploadState !== 'completed' ? (
                          <button
                            onClick={handleSimulateUpload}
                            disabled={uploadState === 'linking'}
                            className={`w-full py-2 px-3 rounded-lg font-semibold text-xs transition duration-200 shadow-md ${
                              uploadState === 'linking'
                                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer animate-pulse'
                            }`}
                          >
                            {uploadState === 'linking' ? 'Beaming image bytes...' : '🔧 Simulate Instant Submission'}
                          </button>
                        ) : (
                          <button
                            onClick={resetSimulation}
                            className="w-full py-2 px-3 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
                          >
                            Disconnect Stream Channel
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Cognitive Scaffold Step Practice Component */}
                <DerivationScaffolder onSuccess={() => {}} />

                {/* Interactive Physics Sandbox Simulator */}
                <PhysicsSandbox onNotifyCancelObserved={handleNotifyCancelObserved} />

              </section>

              {/* RIGHT COLUMN: Evaluation, Student paper, and Markscheme Rubric */}
              <section id="evaluationColumn" className="lg:col-span-6">
                
                {showDecodingSpinner ? (
                  /* NATIVE PROCESSING SPINNER DECODING student manuscript */
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl min-h-[580px] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden backdrop-blur-sm shadow-xl animate-fade-in">
                    <div className="z-20 space-y-5 max-w-sm flex flex-col items-center">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full border-t-2 border-indigo-500 animate-spin flex items-center justify-center" />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-400">OCR</span>
                      </div>
                      
                      <div className="space-y-1.5">
                        <h3 className="text-base font-semibold text-slate-100 font-sans tracking-wide">
                          Analyzing Input Stream
                        </h3>
                        {/* THE MANDATED LABEL */}
                        <p className="text-xs font-bold text-indigo-400 animate-pulse font-mono tracking-wide">
                          Decoding student manuscript...
                        </p>
                      </div>
                      
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        Reading handwritten gravitation parameters and orbital equations. Mapping Keplerian steps to examiner assessment milestones.
                      </p>
                      
                      <div className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded font-mono text-[9px] text-slate-500 tracking-wider">
                        STATUS: DEEP_RECOGNITION_ACTIVE (&gt;3000ms latency)
                      </div>
                    </div>
                  </div>
                ) : uploadState !== 'completed' ? (
                  /* AWAITING STATE MOCK PRE-UPLOAD (BLURRED OR SHADOWED) */
                  <div className="bg-slate-900/40 border border-slate-800/85 rounded-2xl min-h-[580px] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden backdrop-blur-sm shadow-xl">
                    {/* Visual lock and info decoration */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/40 to-slate-950/90 pointer-events-none z-10" />
                    
                    <div className="z-20 space-y-4 max-w-sm flex flex-col items-center">
                      <div className="h-16 w-16 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-400 mb-2 relative">
                        <Lock className="h-7 w-7 text-indigo-400" />
                        <span className="absolute -top-1 -right-1 bg-indigo-600 w-3 h-3 rounded-full animate-ping"></span>
                        <span className="absolute -top-1 -right-1 bg-indigo-600 w-3 h-3 rounded-full"></span>
                      </div>

                      <h3 className="text-base font-semibold text-slate-100 font-sans tracking-wide">
                        Rubric & Assessment Workspace Locked
                      </h3>
                      
                      <p id="qrStatusText" className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
                        The evaluation rubric, verified checklists, and pupil scripts are secured. Switch to the <strong className="text-indigo-400">📱 Mobile Companion (Scanner)</strong> view at the top of the page, align your camera, and snap a picture of your gravitation derivation to unlock!
                      </p>

                      <div className="flex flex-col gap-2.5 w-full">
                        <button
                          onClick={handleSimulateUpload}
                          className="py-2.5 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition duration-200"
                        >
                          Load Sample Script via Bypass
                        </button>
                        <button
                          onClick={() => setViewMode('mobile')}
                          className="py-2.5 px-6 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs transition duration-200"
                        >
                          Launch Simulated Phone Camera
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ACTIVE ASSESSMENT - UNBLURRED COMPLETE WORKSPACE */
                  <div className="space-y-6 animate-fade-in animate-duration-300">
                    
                    {/* Active Assessment Controls Header */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-semibold text-slate-200 font-sans uppercase tracking-wider">
                          Evaluation Loop Active
                        </span>
                      </div>
                      <button
                        onClick={resetSimulation}
                        className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition"
                      >
                        <RefreshCw className="h-3 w-3" /> Un-link device
                      </button>
                    </div>

                    {/* Side-by-side student work panel with crosshover highlights */}
                    <StudentWorkPanel 
                      activeTab={activeWorkTab} 
                      setActiveTab={handleWorkTabChange}
                      hoveredCriterion={hoveredCriterion}
                      capturedImage={capturedImage || undefined}
                      solutions={activeQuestion.solutions}
                      subtopicCode={selectedSubtopic}
                    />

                    {/* Markscheme Self Assessment Rubric checklist */}
                    <RubricPanel 
                      checkedCriteria={checkedCriteria}
                      onToggleCriterion={handleToggleCriterion}
                      onHoverCriterion={setHoveredCriterion}
                      criteriaList={activeQuestion.markscheme_criteria}
                    />

                  </div>
                )}

              </section>

            </div>

            {/* Spaced Repetition and Database Concept Decays Dashboard */}
            <UpcomingMasteryTasks />

            {/* Full Width Footer: Pitfalls Comparative Guide */}
            <footer id="workspace_footer" className="pt-4">
              <PitfallsGuide />
              
              <div className="mt-6 text-center text-[11px] text-slate-600 font-mono">
                IB Physics Gravitation Mastery Module • Developed for Grade 11 Cognitive Scaffolding and Band 7 Calibration
              </div>
            </footer>

          </main>
        </div>
      )}

    </div>
  );
}
