import React, { useEffect, useRef, useState } from 'react';
import { Settings, Info, RefreshCw, Zap } from 'lucide-react';

interface PhysicsSandboxProps {
  onNotifyCancelObserved?: () => void;
}

export default function PhysicsSandbox({ onNotifyCancelObserved }: PhysicsSandboxProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Real-world physical units scaled for demonstration:
  // Planet Mass in units of Earth Mass (1 M_E = 5.972e24 kg)
  const [planetMass, setPlanetMass] = useState<number>(1.0); 
  // Orbital Radius in thousands of km (6,400km is Earth's surface, so 7,000km to 24,000km range)
  const [orbitalRadius, setOrbitalRadius] = useState<number>(8.5); 
  // Satellite Mass in kg (100 kg to 2000 kg)
  const [satelliteMass, setSatelliteMass] = useState<number>(500);
  
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [satelliteMassAlert, setSatelliteMassAlert] = useState<boolean>(false);
  
  // Animation angle
  const angleRef = useRef<number>(0);

  // Constants
  const G = 6.6743e-11;
  const M_E = 5.972e24; // Earth mass in kg
  
  // Calculate orbital velocity: v = sqrt(G * M / r)
  const calculatedVelocityM_S = Math.sqrt((G * (planetMass * M_E)) / (orbitalRadius * 1e6));
  const calculatedVelocityKmS = calculatedVelocityM_S / 1000;
  
  // Calculate orbital period T = 2 * pi * r / v
  const calculatedPeriodSeconds = (2 * Math.PI * (orbitalRadius * 1e6)) / calculatedVelocityM_S;
  const calculatedPeriodHours = calculatedPeriodSeconds / 3600;

  // Calculate Forces
  // Gravitational force F = G * M * m / r^2
  const F_gravity = (G * (planetMass * M_E) * satelliteMass) / Math.pow(orbitalRadius * 1e6, 2);
  // Centripetal acceleration a_c = v^2 / r
  const a_centripetal = Math.pow(calculatedVelocityM_S, 2) / (orbitalRadius * 1e6);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Clear canvas with deep space theme
      ctx.fillStyle = '#020617'; // bg-slate-950
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw Orbit Path
      // Scale radius for rendering (e.g., radius 8.5 units -> 95 pixels)
      const renderRadius = 40 + (orbitalRadius * 10);
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, renderRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)'; // slate-700 with opacity
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw central planet (glowing sphere)
      const planetRadius = 24 + (planetMass * 4);
      const gradient = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, planetRadius);
      gradient.addColorStop(0, '#38bdf8'); // sky-400
      gradient.addColorStop(0.3, '#0284c7'); // sky-600
      gradient.addColorStop(1, '#0c4a6e'); // sky-900
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, planetRadius, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.shadowColor = '#0ea5e9';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0; // Reset shadow

      // Draw grid lines to feel like a high-tech simulator overlay
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.05)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Gravitation Force Vectors (Only draw arrow if desired)
      if (isRotating) {
        // Angle increases proportional to real velocity scale for interactive feel
        const angleSpeed = (calculatedVelocityKmS / orbitalRadius) * 0.03;
        angleRef.current = (angleRef.current + angleSpeed) % (2 * Math.PI);
      }

      const satX = centerX + renderRadius * Math.cos(angleRef.current);
      const satY = centerY + renderRadius * Math.sin(angleRef.current);

      // Draw Force Vectors (Centripetal = Gravitational)
      // Gravitational force pulls towards center
      const dx = centerX - satX;
      const dy = centerY - satY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const normX = dx / dist;
      const normY = dy / dist;

      // Draw Force Vector Line (F_g)
      ctx.beginPath();
      ctx.moveTo(satX, satY);
      ctx.lineTo(satX + normX * 35, satY + normY * 35);
      ctx.strokeStyle = '#ef4444'; // red-500 for Gravity Force
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Gravity Force Arrowhead
      ctx.beginPath();
      ctx.moveTo(satX + normX * 35, satY + normY * 35);
      ctx.lineTo(
        satX + normX * 30 - normY * 5,
        satY + normY * 30 + normX * 5
      );
      ctx.lineTo(
        satX + normX * 30 + normY * 5,
        satY + normY * 30 - normX * 5
      );
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      // Velocity Vector (Tangent line)
      // Tangent is perpendicular to radius (-sin(angle), cos(angle))
      const tangX = -Math.sin(angleRef.current);
      const tangY = Math.cos(angleRef.current);

      ctx.beginPath();
      ctx.moveTo(satX, satY);
      ctx.lineTo(satX + tangX * 35, satY + tangY * 35);
      ctx.strokeStyle = '#10b981'; // emerald-500
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Velocity Arrowhead
      ctx.beginPath();
      ctx.moveTo(satX + tangX * 35, satY + tangY * 35);
      ctx.lineTo(
        satX + tangX * 30 - tangY * 5,
        satY + tangY * 30 + tangX * 5
      );
      ctx.lineTo(
        satX + tangX * 30 + tangY * 5,
        satY + tangY * 30 - tangX * 5
      );
      ctx.fillStyle = '#10b981';
      ctx.fill();

      // Draw Satellite
      const satSize = 4 + Math.log2(satelliteMass / 100) * 1.5;
      ctx.beginPath();
      ctx.arc(satX, satY, satSize, 0, 2 * Math.PI);
      ctx.fillStyle = '#a855f7'; // purple-500
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw solar panels on satellite to make it look like a satellite
      ctx.fillStyle = '#3b82f6'; // blue-500
      ctx.fillRect(satX - satSize - 4, satY - 1.5, 4, 3);
      ctx.fillRect(satX + satSize, satY - 1.5, 4, 3);

      // Label force vectors on canvas
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ef4444';
      ctx.fillText("F_g", satX + normX * 42 - 5, satY + normY * 42 + 4);
      ctx.fillStyle = '#10b981';
      ctx.fillText("v", satX + tangX * 42 - 3, satY + tangY * 42 + 4);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [planetMass, orbitalRadius, satelliteMass, isRotating, calculatedVelocityKmS]);

  // Handle client-side warning and callback to teach cancellation principle
  const handleSatelliteMassChange = (newMass: number) => {
    setSatelliteMass(newMass);
    setSatelliteMassAlert(true);
    if (onNotifyCancelObserved) {
      onNotifyCancelObserved();
    }
    // Fade out alarm after 3 seconds
    setTimeout(() => {
      setSatelliteMassAlert(false);
    }, 4000);
  };

  return (
    <div id="physics_sandbox_container" className="bg-slate-900 border border-slate-800 rounded-xl p-5 overflow-hidden shadow-2xl relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-sky-400" />
          <h3 className="font-sans font-semibold text-slate-100 text-sm tracking-wider uppercase">
            Interactive Keplerian Orbit Sandbox
          </h3>
        </div>
        <button
          onClick={() => setIsRotating(!isRotating)}
          className="text-xs flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
        >
          <RefreshCw className={`h-3 w-3 ${isRotating ? 'animate-spin' : ''}`} />
          {isRotating ? 'Pause Active Orbit' : 'Resume Orbit'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Canvas Area */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center relative bg-slate-950 rounded-lg p-2 border border-slate-800 min-h-[220px]">
          <canvas
            ref={canvasRef}
            width={340}
            height={220}
            className="w-full max-w-[340px] aspect-[340/220] rounded block"
          />
          {satelliteMassAlert && (
            <div className="absolute top-3 left-3 right-3 bg-fuchsia-950/90 border border-fuchsia-700 text-fuchsia-200 text-xs px-3 py-2 rounded-md animate-fade-in text-center shadow-lg">
              <span className="font-bold">⚠️ Cognitive Insight:</span> Notice that changing satellite mass <span className="underline italic">m</span> did NOT affect the orbital velocity vector <span className="font-mono text-emerald-400">v</span>!
            </div>
          )}
          <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 block"></span>F_g: Gravitational Pull</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 block"></span>v: Tangential Speed</span>
          </div>
        </div>

        {/* Sliders and Telemetry Info */}
        <div className="lg:col-span-2 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Slider 1: M */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Planet Mass (<span className="text-sky-400">M</span>)</span>
                <span className="text-sky-400 font-semibold">{(planetMass * 1.0).toFixed(1)} M_Earth</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="3.0"
                step="0.1"
                value={planetMass}
                onChange={(e) => setPlanetMass(parseFloat(e.target.value))}
                className="w-full accent-sky-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Slider 2: r */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Orbital Radius (<span className="text-indigo-400">r</span>)</span>
                <span className="text-indigo-400 font-semibold">{Math.round(orbitalRadius * 1000).toLocaleString()} km</span>
              </div>
              <input
                type="range"
                min="6.5"
                max="18.0"
                step="0.5"
                value={orbitalRadius}
                onChange={(e) => setOrbitalRadius(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Slider 3: m */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Satellite Mass (<span className="text-purple-400">m</span>)</span>
                <span className="text-purple-400 font-semibold">{satelliteMass} kg</span>
              </div>
              <input
                type="range"
                min="100"
                max="2500"
                step="100"
                value={satelliteMass}
                onChange={(e) => handleSatelliteMassChange(parseInt(e.target.value))}
                className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 mt-1 italic leading-tight">
                Adjust this to test if satellite mass alters gravity equations.
              </p>
            </div>
          </div>

          {/* Telemetry Panel */}
          <div className="bg-slate-950 border border-slate-800 rounded p-3 font-mono space-y-1.5 text-xs text-slate-300">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1 mb-1 font-bold">
              Orbital Telemetry
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Orbital Speed v:</span>
              <span className="text-emerald-400 font-semibold">{calculatedVelocityKmS.toFixed(2)} km/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Centripetal Force F_c:</span>
              <span className="text-slate-300">{F_gravity.toFixed(2)} N</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Orbital Period T:</span>
              <span className="text-purple-400">{calculatedPeriodHours.toFixed(2)} hours</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-3.5 bg-slate-950/60 border border-slate-800 flex items-start gap-2.5 p-3 rounded-lg">
        <Info className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-slate-200">The Physics Fact Sheet:</strong> Notice how the satellite mass <span className="font-mono text-purple-400">m</span> appears on BOTH sides as <span className="font-mono">F_g = F_c</span>, translating to <span className="font-mono italic">G·M·m/r² = m·v²/r</span>. Dividing both sides by <span className="font-mono text-purple-400">m</span> proves that orbital size and central body mass ALONE dictate velocity. This is precisely what takes students from Band 2 algebraic anxiety to Band 7 deep intuition!
        </p>
      </div>
    </div>
  );
}
