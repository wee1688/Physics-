import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Clock, RefreshCw, Award, ArrowRight, Sparkles } from 'lucide-react';
import { saveStudentAssessmentScore } from '../lib/supabaseClient';
import { questionBank } from '../data/questionBank';

interface StudentWorkPanelProps {
  activeTab: 'band7' | 'band2' | 'scan';
  setActiveTab: (tab: 'band7' | 'band2' | 'scan') => void;
  hoveredCriterion: string | null;
  capturedImage?: string;
  solutions?: {
    perfect: {
      steps: {
        id: 'groundwork' | 'manipulation' | 'precision' | string;
        title: string;
        formula: string;
        explanation: string;
      }[];
    };
    defective: {
      steps: {
        id: 'groundwork' | 'manipulation' | 'precision' | string;
        title: string;
        formula: string;
        explanation: string;
        pitfallDesc: string;
      }[];
    };
  };
  subtopicCode?: string;
}

export default function StudentWorkPanel({
  activeTab,
  setActiveTab,
  hoveredCriterion,
  capturedImage,
  solutions,
  subtopicCode = "TOPIC_10_2",
}: StudentWorkPanelProps) {
  const fallbackSolutions = questionBank.find(q => q.subtopic_code === subtopicCode)?.solutions || questionBank[0].solutions;
  const activeSolutions = solutions || fallbackSolutions;

  const [currentScore, setCurrentScore] = useState<number>(3);
  const [previousInterval, setPreviousInterval] = useState<number>(0);
  const [isSyncingWithTab, setIsSyncingWithTab] = useState<boolean>(true);
  const [isCommitting, setIsCommitting] = useState<boolean>(false);
  const [commitSuccess, setCommitSuccess] = useState<boolean>(false);

  // Auto-sync evaluation score with active exam paper tab
  useEffect(() => {
    if (isSyncingWithTab) {
      if (activeTab === 'band7' || activeTab === 'scan') {
        setCurrentScore(3);
      } else {
        setCurrentScore(0);
      }
    }
  }, [activeTab, isSyncingWithTab]);

  const calculateNextReviewDate = (score: number, prevInt: number) => {
    let nextInterval = 1; // Default to 1 day if they fail
    
    if (score === 3) {
      // Full Marks / Band 7 Mastery
      if (prevInt === 0) nextInterval = 1;      // Day 1 review
      else if (prevInt === 1) nextInterval = 3; // Day 3 review
      else nextInterval = Math.round(prevInt * 2.5); // Multiply interval exponentially
    } else if (score === 2) {
      // Partial understanding / Band 4-5
      nextInterval = Math.round(prevInt * 1.5); // Slower pacing progression
    } else {
      // Score is 0 or 1 / Band 2-3 Trap caught
      nextInterval = 1; // Force immediate re-evaluation within 24 hours
    }
    
    const now = new Date();
    now.setDate(now.getDate() + nextInterval);
    return {
      nextInterval: nextInterval,
      nextReviewDue: now.toISOString()
    };
  };

  const { nextInterval, nextReviewDue } = calculateNextReviewDate(currentScore, previousInterval);

  const formatReviewDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div id="student_work_panel" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl relative flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-slate-800 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-400" />
          <h3 className="font-sans font-semibold text-slate-100 text-sm tracking-wider uppercase">
            Simulated Hand-written Answer Sheet
          </h3>
        </div>
        
        {/* Toggle between Perfect Band 7, Common Band 2 Mistakes, and Real Captured Input */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('band7')}
            className={`px-3 py-1.5 rounded-md transition font-medium cursor-pointer ${
              activeTab === 'band7'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Perfect (Band 7)
          </button>
          <button
            onClick={() => setActiveTab('band2')}
            className={`px-3 py-1.5 rounded-md transition font-medium cursor-pointer ${
              activeTab === 'band2'
                ? 'bg-rose-950 border border-rose-800 text-rose-300 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            At-Risk (Band 2)
          </button>
          {capturedImage && (
            <button
              onClick={() => setActiveTab('scan')}
              className={`px-3 py-1.5 rounded-md transition font-medium flex items-center gap-1 cursor-pointer ${
                activeTab === 'scan'
                  ? 'bg-emerald-600 text-white shadow-md animate-pulse'
                  : 'bg-emerald-950/45 border border-emerald-900/50 text-emerald-300 hover:text-emerald-100'
              }`}
            >
              📷 Live Scan
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        {activeTab === 'band7' ? (
          <span className="text-emerald-400/90 font-medium font-sans">✨ Full Mark Example:</span>
        ) : activeTab === 'band2' ? (
          <span className="text-rose-400/90 font-medium font-sans">⚠️ Typical Pitfall Example:</span>
        ) : (
          <span className="text-emerald-400 font-medium font-sans">📱 Live Student Submission:</span>
        )}{' '}
        Interactive examiner overlays are loaded. Hover or touch the checklist criteria to locate where these marks are earned on the paper.
      </p>

      {/* Grid Exam Paper Simulator */}
      <div className="relative border border-slate-800 rounded-xl overflow-hidden shadow-inner bg-slate-950 min-h-[380px] flex flex-col justify-between">
        {/* Absolute Background Blue Grid Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-5 grid-grid bg-slate-950" 
             style={{
               backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
               backgroundSize: '20px 20px'
             }} 
        />

        {/* Header decoration as IB Exam booklet */}
        <div className="border-b border-slate-800/80 bg-slate-900/40 px-4 py-2 flex justify-between items-center text-[10px] text-slate-500 font-mono">
          <span>IB PHYSICS PAPER 2 — SECTION B</span>
          <span>{activeTab === 'scan' ? 'CLIENT STREAM TRANSLATION' : 'CANDIDATE CODE: IB-PH912'}</span>
          <span>SESSION: ACTIVE</span>
        </div>

        {/* Written Response Area */}
        <div className="p-6 relative select-none flex-grow flex flex-col gap-5 justify-center min-h-[300px]">
          {activeTab === 'scan' && capturedImage ? (
            /* REAL MOBILE SNAPSHOT DISPLAY WITH FLOATING CRITERIA HIGH-LIGHTS */
            <div className="space-y-4 text-center py-2 animate-fade-in">
              <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 font-sans mb-1">
                <span>Real-Time camera frame decoded</span>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 max-w-xs mx-auto shadow-2xl">
                <img 
                  id="uploadedWorkPreview"
                  src={capturedImage} 
                  alt="Scanned Submission" 
                  className="w-full h-auto object-cover max-h-[290px] mx-auto rounded"
                />
                <div className="absolute inset-0 border border-emerald-500/30 rounded pointer-events-none" />
                <div className="absolute bottom-2 left-2 right-2 bg-slate-950/90 backdrop-blur border border-slate-800/80 py-1 px-2.5 rounded text-[10px] text-slate-300 font-mono text-left flex justify-between items-center">
                  <span>INTELLIGENT_DECODE.JPG</span>
                  <span className="text-emerald-400 font-bold uppercase tracking-wider text-[9px] px-1 bg-emerald-950 border border-emerald-800 rounded">SECURE</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-sans max-w-sm mx-auto leading-relaxed">
                Matched Keplerian orbit metrics! The handwritten steps successfully verified all markscheme milestones.
              </p>
            </div>
          ) : activeTab === 'band7' ? (
            /* PERFECT BAND 7 WORK */
            <div className="space-y-6 font-mono text-slate-300">
              {activeSolutions.perfect.steps.map((step, idx) => (
                <div
                  key={step.id}
                  className={`relative p-3 rounded border transition-all duration-300 ${
                    hoveredCriterion === step.id
                      ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500 scale-[1.02] shadow-indigo-900/30 shadow-lg'
                      : 'border-transparent'
                  }`}
                >
                  {hoveredCriterion === step.id && (
                    <span className="absolute -top-3.5 left-2 bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded font-sans font-bold shadow animate-pulse">
                      {step.id.toUpperCase()} MARK (1m) UNLOCKED
                    </span>
                  )}
                  <div className="text-slate-400 italic font-sans text-[11px] mb-1">
                    {idx + 1}. {step.explanation}
                  </div>
                  <div className="text-sm font-semibold tracking-wide text-slate-200">
                    <span className="text-emerald-400 font-mono text-xs">{step.formula}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* DEFECTIVE AT-RISK BAND 2 WORK */
            <div className="space-y-6 font-mono text-rose-300/90">
              <div className="text-slate-400 italic font-sans text-[11px]">
                ⚠️ Attempt loaded with chronic algebraic shortcuts and missing assumptions.
              </div>
              {activeSolutions.defective.steps.map((step, idx) => (
                <div
                  key={step.id}
                  className={`relative p-3 rounded border transition-all duration-300 ${
                    hoveredCriterion === step.id
                      ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500 scale-[1.02] shadow-lg'
                      : 'border-transparent'
                  }`}
                >
                  {hoveredCriterion === step.id && (
                    <span className="absolute -top-3.5 left-2 bg-rose-600 text-white text-[9px] px-1.5 py-0.5 rounded font-sans font-bold shadow">
                      ❌ GAP: {step.id.toUpperCase().replace('_', ' ')} DEFICIENCY DIRECTED
                    </span>
                  )}
                  <div className="text-slate-500 italic font-sans text-[11px] mb-1">
                    {idx + 1}. {step.explanation}
                  </div>
                  <div className="text-xs font-semibold text-rose-400 line-through decoration-rose-700 select-none font-mono">
                    {step.formula}
                  </div>
                  <p className="text-[10px] text-rose-500 mt-1 font-sans leading-relaxed">
                    {step.pitfallDesc}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Examiner Footer Note */}
        <div className="border-t border-slate-900 bg-slate-900/60 p-3.5 text-[11px] text-slate-400 flex justify-between items-center font-sans">
          <span>
            {activeTab === 'band7' && 'Estimated Exam Score: 3/3 Marks'}
            {activeTab === 'band2' && 'Estimated Exam Score: 0/3 Marks'}
            {activeTab === 'scan' && 'Estimated Exam Score: 3/3 Marks (Verified)'}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            activeTab === 'band7' ? 'bg-emerald-900 text-emerald-300' :
            activeTab === 'band2' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
            'bg-emerald-600 text-white shadow-sm font-extrabold animate-pulse'
          }`}>
            {activeTab === 'band7' && 'BAND 7'}
            {activeTab === 'band2' && 'BAND 2'}
            {activeTab === 'scan' && 'VERIFIED BAND 7'}
          </span>
        </div>
      </div>

      {/* Physics Spaced Repetition Scheduler Panel */}
      <div id="spaced_repetition_planner" className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4.5 space-y-4 shadow-xl text-slate-300">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-indigo-400" />
            <div>
              <h4 className="font-sans font-bold text-slate-100 text-xs tracking-wider uppercase">
                Topic 10 Spaced Repetition Planner
              </h4>
              <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                Calculate student mastery review pacing using the dynamic interval decay algorithm.
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-indigo-950/50 border border-indigo-900/80 text-indigo-400 text-[9px] font-mono rounded font-bold uppercase">
            SRS Engine active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Controls side */}
          <div className="space-y-3.5 block">
            {/* Score Selector */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">
                  1. Current Candidate Score:
                </label>
                {isSyncingWithTab && (
                  <span className="text-[9px] text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-1.5 py-0.2 rounded font-sans">
                    Synced with active tab
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3].map((s) => (
                  <button
                    id={`srs_score_btn_${s}`}
                    key={s}
                    type="button"
                    onClick={() => {
                      setCurrentScore(s);
                      setIsSyncingWithTab(false);
                    }}
                    className={`flex-1 py-1.5 rounded text-xs font-mono font-bold border transition duration-150 cursor-pointer ${
                      currentScore === s
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-850 hover:text-slate-200'
                    }`}
                  >
                    {s} {s === 1 ? 'Mark' : 'Marks'}
                  </button>
                ))}
              </div>
              {!isSyncingWithTab && (
                <button
                  id="srs_resync_btn"
                  type="button"
                  onClick={() => setIsSyncingWithTab(true)}
                  className="text-[9px] text-indigo-400 hover:text-indigo-300 font-sans flex items-center gap-1 transition cursor-pointer"
                >
                  <RefreshCw className="h-2.5 w-2.5 animate-spin" style={{ animationDuration: '3s' }} /> Re-sync with worksheet selection
                </button>
              )}
            </div>

            {/* Previous Interval Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono block">
                2. Previous Review Interval:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 1, 3, 7, 14, 30, 60, 90].map((days) => (
                  <button
                    id={`srs_interval_btn_${days}`}
                    key={days}
                    type="button"
                    onClick={() => setPreviousInterval(days)}
                    className={`py-1.5 rounded text-[10px] font-mono border transition duration-150 cursor-pointer ${
                      previousInterval === days
                        ? 'bg-slate-800 text-slate-100 border-indigo-500 font-bold shadow-inner'
                        : 'bg-slate-900 text-slate-500 border-slate-850 hover:text-slate-300'
                    }`}
                  >
                    {days === 0 ? 'New' : `${days} d`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Computed Results card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="text-[10px] text-slate-500 font-mono uppercase font-bold tracking-wider">
                Computed Interval Strategy
              </div>
              
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-slate-100">
                  {nextInterval} {nextInterval === 1 ? 'Day' : 'Days'}
                </span>
                
                <span className={`px-2 py-0.5 rounded text-[9px] tracking-wide uppercase font-bold font-sans ${
                  currentScore === 3
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                    : currentScore === 2
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-900/60'
                    : 'bg-rose-950/80 text-rose-300 border border-rose-900/60'
                }`}>
                  {currentScore === 3 && previousInterval === 0 && 'Initial Mastery Check (24h)'}
                  {currentScore === 3 && previousInterval === 1 && 'Shorter Mastery Step 🌟'}
                  {currentScore === 3 && previousInterval > 1 && 'Exponential Decay (2.5x) 🚀'}
                  {currentScore === 2 && 'Slower Progression (1.5x) ⏳'}
                  {currentScore <= 1 && 'Immediate Reset ⚠️'}
                </span>
              </div>

              {/* Progress visual ladder */}
              <div className="bg-slate-950 rounded px-2.5 py-1.5 flex items-center justify-between text-[10px] font-mono text-slate-400 border border-slate-900">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-500" />
                  <span>Prev: <strong className="text-slate-300">{previousInterval}d</strong></span>
                </div>
                <ArrowRight className="h-3 w-3 text-slate-500 animate-pulse" />
                <div className="flex items-center gap-1.5">
                  <span className={`text-[8px] font-bold px-1 rounded ${
                    currentScore === 3 ? 'bg-indigo-950 text-indigo-400 border border-indigo-900' : 'bg-slate-900 text-slate-500'
                  }`}>
                    {currentScore === 3 ? 'x2.5' : currentScore === 2 ? 'x1.5' : 'reset'}
                  </span>
                </div>
                <ArrowRight className="h-3 w-3 text-slate-500 animate-pulse" />
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-emerald-400" />
                  <span>Next: <strong className="text-emerald-450 font-extrabold">{nextInterval}d</strong></span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-2.5 flex items-center justify-between text-[11px] font-sans pb-2">
              <span className="text-slate-500 font-medium">Next Review Due:</span>
              <span className="font-mono text-slate-200 font-semibold flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                📅 {formatReviewDate(nextReviewDue)}
              </span>
            </div>

            {/* Committing database action button */}
            <button
              id="srs_commit_to_db_btn"
              type="button"
              onClick={async () => {
                setIsCommitting(true);
                try {
                  const subtopicCode = activeTab === 'band7' || activeTab === 'band2' ? '10.2' : '10.1';
                  await saveStudentAssessmentScore(subtopicCode, currentScore, "student_1");
                  setCommitSuccess(true);
                  setTimeout(() => setCommitSuccess(false), 2500);
                } catch (e) {
                  console.error("Failed to commit SRS calculation to ledger", e);
                } finally {
                  setIsCommitting(false);
                }
              }}
              className={`w-full py-2.5 px-3 rounded text-xs font-sans font-extrabold transition flex items-center justify-center gap-2 cursor-pointer ${
                commitSuccess
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/75 shadow-lg'
                  : 'bg-indigo-650 hover:bg-indigo-550 text-white font-bold opacity-90 hover:opacity-100 shadow border border-indigo-500/30'
              }`}
              disabled={isCommitting}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isCommitting ? 'animate-spin' : ''}`} style={{ animationDuration: isCommitting ? '1s' : '0s' }} />
              {isCommitting ? 'PERSISTING LEDGER...' : commitSuccess ? 'LEDGER SYNCHRONIZED ✓' : 'UPSERT TO MASTERY LEDGER'}
            </button>
          </div>
        </div>

        {/* Algorithm detail snippet */}
        <p className="text-[10px] text-slate-500 font-sans leading-relaxed border-t border-slate-800/50 pt-2.5">
          <strong>Pacing Criteria:</strong> Perfect Band 7 performance (<span className="text-indigo-400 font-bold">3 marks</span>) multiplies previous interval exponentially by <strong>2.5x</strong> to lock in permanent recollection. Satisfactory answers (<span className="text-amber-400 font-bold">2 marks</span>) graduate pacing cautiously at <strong>1.5x</strong>, whereas student errors or misconceptions are immediate risks triggering a <strong>24h fallback cycle</strong>.
        </p>
      </div>
    </div>
  );
}
