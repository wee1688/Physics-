import React from 'react';
import { AlertCircle, CheckCircle, ShieldAlert, BookOpen, Volume2 } from 'lucide-react';

export default function PitfallsGuide() {
  const pitfalls = [
    {
      title: 'Premature Algebraic Simplification',
      band2: 'Skipping the initial force equation and jumping instantly to v² = GM/r.',
      band7: 'Explicitly writing down F_c = F_g, substituting mechanical ratios, then simplifying step-by-step.',
      reason: 'IB Markschemes reward structural physical concepts first, algebraic proficiency second.',
    },
    {
      title: 'Ambiguous Variable Nomenclature',
      band2: 'Using uppercase R for orbital radius, or confusing planet mass and satellite mass.',
      band7: 'Reserving uppercase R for central planet radius, and lowercase r for orbital radius (r = R + altitude).',
      reason: 'If the question specifies r, altering notation raises ambiguity and compromises subsequent derivations.',
    },
    {
      title: 'Undeclared Variables / Omissions',
      band2: 'Setting up equations without defining what variables cancel out, or leaving the speed un-rooted as v².',
      band7: 'Finishing with the single radical v = sqrt(GM/r) and stating "the satellite mass m cancels completely."',
      reason: 'Writing a statement about m shows command over physical reality (all objects at altitude r orbit at speed v, irrespective of mass).',
    }
  ];

  return (
    <div id="pitfalls_guide_container" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <ShieldAlert className="h-5 w-5 text-indigo-400" />
        <h3 className="font-sans font-semibold text-slate-100 text-sm tracking-wider uppercase">
          Band 2 Pitfalls vs. Band 7 Excellence
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pitfalls.map((pitfall, idx) => (
          <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-1.5 flex items-center gap-1.5 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 block"></span>
              {pitfall.title}
            </h4>

            {/* Red block */}
            <div className="space-y-1 bg-red-950/20 border border-red-950/40 p-2.5 rounded text-[11px] leading-relaxed">
              <div className="flex items-center gap-1 text-red-400 font-bold font-sans uppercase text-[9px] tracking-wide">
                <AlertCircle className="h-3 w-3" /> Band 2 Error (0m)
              </div>
              <p className="text-slate-400 font-sans">{pitfall.band2}</p>
            </div>

            {/* Green block */}
            <div className="space-y-1 bg-emerald-950/20 border border-emerald-950/40 p-2.5 rounded text-[11px] leading-relaxed">
              <div className="flex items-center gap-1 text-emerald-400 font-bold font-sans uppercase text-[9px] tracking-wide">
                <CheckCircle className="h-3 w-3" /> Band 7 Solution (3/3m)
              </div>
              <p className="text-slate-350 font-sans">{pitfall.band7}</p>
            </div>

            <p className="text-[10px] text-slate-500 italic leading-tight font-sans">
              <strong className="text-slate-400 not-italic">Markscheme Logic:</strong> {pitfall.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
