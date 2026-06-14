import React, { useEffect } from 'react';
import { RubricCriterion } from '../types';
import { Check, ClipboardList, Award, Sparkles, BookOpen, UserCheck } from 'lucide-react';

interface RubricPanelProps {
  checkedCriteria: Record<string, boolean>;
  onToggleCriterion: (id: string) => void;
  onHoverCriterion: (id: string | null) => void;
  criteriaList: {
    id: 'groundwork' | 'manipulation' | 'precision' | string;
    title: string;
    mark: string;
    badge: 'Groundwork' | 'Manipulation' | 'Precision';
    description: string;
    math: string;
    examinerTip: string;
  }[];
}

export default function RubricPanel({
  checkedCriteria,
  onToggleCriterion,
  onHoverCriterion,
  criteriaList = [],
}: RubricPanelProps) {
  
  const score = Object.values(checkedCriteria).filter(Boolean).length;
  
  // Helper to format LaTeX math formulas to pretty unicode text
  const formatMathText = (latex: string) => {
    return latex
      .replace(/\\implies/g, " ⟹ ")
      .replace(/\\neq/g, " ≠ ")
      .replace(/\\cos/g, "cos")
      .replace(/\\sin/g, "sin")
      .replace(/\\tan/g, "tan")
      .replace(/\\theta/g, "θ")
      .replace(/\\alpha/g, "α")
      .replace(/\\beta/g, "β")
      .replace(/\\approx/g, " ≈ ")
      .replace(/\\times/g, " × ")
      .replace(/\\hat\{u\}/g, "û")
      .replace(/\\vec\{([A-Za-z]+)\}/g, "vec($1)")
      .replace(/\\vec\{F\}_\{net\}/g, "F_net")
      .replace(/\\vec\{F\}_g/g, "F_g")
      .replace(/\\vec\{a\}_c/g, "a_c")
      .replace(/\\vec\{g\}/g, "g")
      .replace(/\\vec\{\\nabla\}/g, "∇")
      .replace(/\\in/g, " ∈ ")
      .replace(/\\mathbb\{R\}\^([+-]*)/g, "R^$1")
      .replace(/\\Delta/g, "Δ")
      .replace(/\\frac\{([^\}]+)\}\{([^\}]+)\}/g, "($1)/($2)")
      .replace(/\\sqrt\{([^\}]+)\}/g, "√($1)")
      .replace(/_\{([^\}]+)\}/g, "_$1")
      .replace(/\^\{([^\}]+)\}/g, "^$1")
      .replace(/\\text\{([^\}]+)\}/g, "$1")
      .replace(/\\quad/g, "   ")
      .replace(/\\impliedby/g, " ⟸ ")
      .replace(/\\implies/g, " ⟹ ")
      .replace(/\\\\/g, ", ")
      .replace(/\\/g, "");
  };
  
  // Calculate Band mapping
  let performanceBand = 'Band 2 and below';
  let bandColor = 'text-rose-400 bg-rose-950/50 border-rose-800';
  let description = 'Low conceptual retention & algebraic anxiety. Let’s rebuild the conceptual foundations.';
  
  if (score === 1) {
    performanceBand = 'Band 3 - 4';
    bandColor = 'text-amber-400 bg-amber-950/50 border-amber-800';
    description = 'Partial structure recognized. Missing core physical proofs required by examiners.';
  } else if (score === 2) {
    performanceBand = 'Band 5 - 6';
    bandColor = 'text-indigo-400 bg-indigo-950/50 border-indigo-800';
    description = 'Strong physics logic. Minor presentation or algebraic notation slip holds you back.';
  } else if (score === 3) {
    performanceBand = 'Band 7';
    bandColor = 'text-emerald-400 bg-emerald-950/50 border-emerald-800';
    description = 'Elite physics command! Strict markscheme compliance matched with absolute precision.';
  }

  return (
    <div id="rubric_panel" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl relative flex flex-col justify-between h-full">
      {/* Scrollable Content Container */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-indigo-400" />
            <h3 className="font-sans font-semibold text-slate-100 text-sm tracking-wider uppercase">
              Interactive Marking Rubric
            </h3>
          </div>
          <div className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" /> Topic 6 & 10 (IB Physics)
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          Act as the examiner. Read the candidate's paper side-by-side, then self-assess the criteria below to audit compliance.
        </p>

        {/* Criteria List */}
        <div className="space-y-3">
          {criteriaList.map((criterion) => {
            const isChecked = !!checkedCriteria[criterion.id];
            return (
              <div
                key={criterion.id}
                onMouseEnter={() => onHoverCriterion(criterion.id)}
                onMouseLeave={() => onHoverCriterion(null)}
                className={`p-4 rounded-lg border transition duration-200 group relative ${
                  isChecked
                    ? 'bg-slate-950 border-indigo-500/80'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-950 hover:border-slate-700'
                }`}
              >
                {/* Checkbox Overlay click handler */}
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <button
                      onClick={() => onToggleCriterion(criterion.id)}
                      className={`h-5 w-5 rounded border flex items-center justify-center transition-all duration-150 ${
                        isChecked
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                          : 'border-slate-700 hover:border-slate-500 bg-slate-900'
                      }`}
                    >
                      {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </button>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition font-sans">
                        {criterion.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                        {criterion.mark}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      {criterion.description}
                    </p>

                    {/* Inline math standard simulation */}
                    <div className="bg-slate-900/60 border border-slate-900 px-3 py-1.5 rounded text-xs font-mono text-slate-300 w-fit flex items-center gap-1.5 shadow-inner">
                      <span className="text-[9px] text-slate-500 font-bold">MAPPED:</span>
                      <span className="font-sans text-xs font-semibold text-emerald-400">
                        {formatMathText(criterion.math)}
                      </span>
                    </div>

                    {/* Expandable/visible examiner notes on hover */}
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900 mt-2 italic flex items-start gap-1 font-sans leading-relaxed">
                      {criterion.examinerTip}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Score Board and Band Feedback */}
      <div className="mt-5 pt-4 border-t border-slate-800 space-y-3.5">
        <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">IB Performance</div>
              <div className="text-xs font-semibold text-slate-100 font-sans">Marks Awarded: {score} / 3</div>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold text-center tracking-wide shadow-md ${bandColor}`}>
            {performanceBand}
          </div>
        </div>

        {/* Band Description Narrative */}
        <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
          {description}
        </p>

        {/* Band 7 High Performance glowing Banner and Particle Alert */}
        {score === 3 && (
          <div className="bg-emerald-950/60 border border-emerald-500/50 p-4 rounded-xl text-center shadow-lg shadow-emerald-950/30 animate-pulse relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="h-4.5 w-4.5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-200 tracking-wider uppercase font-sans">
                Band 7 Threshold Maintained
              </span>
              <Sparkles className="h-4.5 w-4.5 text-emerald-400" />
            </div>
            <p className="text-[10px] text-emerald-300/90 leading-normal font-sans">
              Markscheme validation checks complete! If this exact standard is written on a Paper 2 booklet, you are guaranteed full marks. Nice scaffolding mastery!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
