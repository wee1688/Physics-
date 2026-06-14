import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Hourglass, 
  AlertTriangle, 
  CheckCircle2, 
  Database, 
  BookOpen, 
  RefreshCw, 
  Zap, 
  CornerDownRight, 
  Play, 
  Sparkles,
  Search,
  Lock
} from 'lucide-react';
import { 
  StudentReviewTask 
} from '../lib/srsStorage';
import {
  isSupabaseConfigured,
  saveStudentAssessmentScore,
  loadStudentDashboard
} from '../lib/supabaseClient';

export default function UpcomingMasteryTasks() {
  const [tasks, setTasks] = useState<StudentReviewTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterMode, setFilterMode] = useState<'all' | 'overdue' | 'leaks'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [now, setNow] = useState<Date>(new Date());
  const [showExplanation, setShowExplanation] = useState<boolean>(true);

  // Load active records from DB/Local storage asynchronously
  const loadRecords = () => {
    setIsLoading(true);
    loadStudentDashboard("student_1")
      .then(res => {
        setTasks(res);
        // Add a high-fidelity DB query latency simulation to enable students to see the smooth pulse skeleton loader
        setTimeout(() => {
          setIsLoading(false);
        }, 850);
      })
      .catch(err => {
        console.error("Dashboard DB load error:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadRecords();

    // Listen to database modification signals
    window.addEventListener('srs-db-updated', loadRecords);
    
    // Periodically update current timestamp to verify decays in real-time
    const interval = setInterval(() => {
      setNow(new Date());
    }, 10000);

    return () => {
      window.removeEventListener('srs-db-updated', loadRecords);
      clearInterval(interval);
    };
  }, []);

  // Quick manual evaluation simulator writing through the Repetition update procedure to DB
  const handleScoreUpdate = (subtopicId: string, score: number) => {
    saveStudentAssessmentScore(subtopicId, score, "student_1");
  };

  // Filter & Search Logic
  const filteredTasks = tasks.filter(task => {
    const isOverdue = new Date(task.nextReviewDue) < now;
    
    // Filter
    if (filterMode === 'overdue' && !isOverdue) return false;
    if (filterMode === 'leaks' && !task.isConceptLeak) return false;

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        task.subtopicId.toLowerCase().includes(q) ||
        task.topicName.toLowerCase().includes(q)
      );
    }
    
    return true;
  });

  const getDueTimeDescription = (dueStr: string) => {
    const dueDate = new Date(dueStr);
    const diffMs = dueDate.getTime() - now.getTime();
    const isPast = diffMs < 0;
    const absDiff = Math.abs(diffMs);
    
    const minutes = Math.floor(absDiff / 60000);
    const hours = Math.floor(absDiff / 3600000);
    const days = Math.floor(absDiff / 86400000);

    if (days > 0) {
      return isPast ? `${days}d overdue` : `due in ${days}d`;
    }
    if (hours > 0) {
      return isPast ? `${hours}h overdue` : `due in ${hours}h`;
    }
    if (minutes > 0) {
      return isPast ? `${minutes}m overdue` : `due in ${minutes}m`;
    }
    return isPast ? `just overdue` : `due momentarily`;
  };

  return (
    <div id="upcoming_mastery_panel" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl relative space-y-4">
      {/* DB & Title banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {isSupabaseConfigured() ? (
              <span className="p-1 px-1.5 bg-emerald-950/85 text-emerald-400 border border-emerald-900/50 rounded flex items-center text-[10px] font-mono tracking-wider uppercase font-bold animate-pulse">
                <Database className="h-3 w-3 mr-1 text-emerald-450" /> SUPABASE_CONNECTED
              </span>
            ) : (
              <span className="p-1 px-1.5 bg-indigo-950/80 text-indigo-400 border border-indigo-900/50 rounded flex items-center text-[10px] font-mono tracking-wider uppercase font-bold">
                <Database className="h-3 w-3 mr-1" /> DATABASE_LOCAL_MOCK
              </span>
            )}
            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
              USER: student_1
            </span>
          </div>
          <h3 className="font-sans font-extrabold text-slate-200 text-sm tracking-tight flex items-center gap-1.5">
            📅 Upcoming Mastery Tasks & Memory Decays
          </h3>
          <p className="text-xs text-slate-400 leading-normal font-sans">
            Tracks individual physics concepts as discrete records to counter the human forgetting curve.
          </p>
        </div>
        
        {/* Toggle algorithm explanation helper button */}
        <button
          onClick={() => setShowExplanation(prev => !prev)}
          className="text-[10px] text-slate-500 hover:text-indigo-400 transition cursor-pointer flex items-center gap-1 font-mono font-bold"
        >
          <Zap className="h-3 w-3 text-amber-400" />
          {showExplanation ? 'HIDE ENGINE PARAMETERS' : 'EXPLAIN REPETITION ENGINE'}
        </button>
      </div>

      {/* Relational Schema Details Explainer */}
      {showExplanation && (
        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg space-y-2 animate-fade-in text-[11px] text-slate-400 leading-relaxed font-sans">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300 font-mono text-[10px] tracking-wide text-indigo-300 uppercase">
              Relational DB Integration Architecture
            </span>
            <span className="text-[9px] text-slate-500 font-mono font-semibold">
              Schema Model: [ReviewsTable]
            </span>
          </div>
          <p>
            When a student submits evidence of handwritten derivations via the secure MQTT channel, the linter and evaluation dashboard route the results to the mock relational engine. 
            The system then executes a simulated <code className="bg-slate-900 px-1 rounded text-red-300 font-mono">UPSERT</code> statement that updates interval metrics based on the score obtained:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[10px] font-mono">
            <div className="bg-slate-900/80 p-2 border border-slate-800 rounded">
              <span className="text-emerald-400 font-bold block">🌟 PERFECT (3/3):</span>
              Interval hops exponentially <strong>x2.5</strong> (e.g. 1d → 3d → 8d → 20d) to cement mastery.
            </div>
            <div className="bg-slate-900/80 p-2 border border-slate-800 rounded">
              <span className="text-amber-400 font-bold block">⏳ SATISFACTORY (2/3):</span>
              Interval grows cautiously at <strong>x1.5</strong> to stabilize retention.
            </div>
            <div className="bg-slate-900/80 p-2 border border-slate-800 rounded">
              <span className="text-rose-400 font-bold block">⚠️ DECAY DETECTED (&lt;2/3):</span>
              Interval drops to <strong>1 day</strong>. Marked as an <span className="text-red-300 block font-bold mt-0.5">Active Concept Leak ⚡</span>.
            </div>
          </div>
        </div>
      )}

      {/* Filters & search line */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/40 p-2 rounded-lg border border-slate-850">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded text-xs transition font-bold font-sans cursor-pointer ${
              filterMode === 'all'
                ? 'bg-slate-800 text-slate-100 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setFilterMode('overdue')}
            className={`px-3 py-1.5 rounded text-xs transition font-bold font-sans flex items-center gap-1 cursor-pointer ${
              filterMode === 'overdue'
                ? 'bg-rose-950 text-rose-200 border border-rose-900'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            Overdue ({tasks.filter(t => new Date(t.nextReviewDue) < now).length})
          </button>
          <button
            onClick={() => setFilterMode('leaks')}
            className={`px-3 py-1 rounded text-xs transition font-bold font-sans flex items-center gap-1 cursor-pointer ${
              filterMode === 'leaks'
                ? 'bg-amber-950 text-amber-200 border border-amber-900'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            Concept Leaks ({tasks.filter(t => t.isConceptLeak).length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Search className="h-3 w-3 text-slate-500" />
          </span>
          <input
            type="text"
            placeholder="Search syllabus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 pl-8 pr-3 py-1 rounded text-xs text-slate-250 placeholder-slate-500 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-sans"
          />
        </div>
      </div>

      {/* Task review list cards */}
      <div className="grid grid-cols-1 gap-3">
        {isLoading ? (
          // High-fidelity modern skeleton placeholders representing record structures waiting for database response
          Array.from({ length: 3 }).map((_, idx) => (
            <div 
              id={`skeleton_placeholder_${idx}`}
              key={`skeleton_${idx}`}
              className="rounded-lg border border-slate-850 bg-slate-950/40 p-4 space-y-3.5 relative overflow-hidden animate-shimmer-pulse"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2.5 flex-1 w-full">
                  {/* Badge & Subject skeleton line */}
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-4 bg-slate-800/70 rounded" />
                    <div className="w-32 h-3 bg-slate-800/40 rounded" />
                  </div>
                  
                  {/* Topic Title skeleton */}
                  <div className="space-y-1.5 pt-1">
                    <div className="w-full h-4.5 bg-slate-800/85 rounded" />
                    <div className="w-5/6 h-4.5 bg-slate-800/50 rounded" />
                  </div>

                  {/* Metadata line skeleton */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-24 h-3 bg-slate-800/40 rounded" />
                    <div className="w-2 h-2 rounded-full bg-slate-800/30" />
                    <div className="w-36 h-3 bg-slate-800/40 rounded" />
                  </div>
                </div>

                {/* Right action block skeleton */}
                <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-2 pt-1 border-t border-slate-850 sm:border-0">
                  <div className="w-20 h-3.5 bg-slate-800/50 rounded" />
                  <div className="w-24 h-7 bg-slate-800/70 rounded-md" />
                </div>
              </div>
            </div>
          ))
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-8 rounded-lg border border-dashed border-slate-800 bg-slate-950/20 text-slate-500 text-xs font-sans">
            No spaced repetition tasks matches your filter criteria.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isOverdue = new Date(task.nextReviewDue) < now;
            
            return (
              <div 
                id={`task_card_${task.id}`}
                key={task.id}
                className={`group relative rounded-lg border p-4 transition duration-200 bg-slate-950/50 ${
                  isOverdue 
                    ? 'border-rose-900/60 hover:border-rose-500/80 bg-gradient-to-r from-slate-950 to-rose-950/20' 
                    : task.isConceptLeak 
                    ? 'border-amber-900/50 hover:border-amber-500/80' 
                    : 'border-slate-800/80 hover:border-slate-700 bg-slate-950/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    {/* Header line */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9px] font-mono font-bold text-slate-400">
                        Syllabus {task.subtopicId}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 font-sans">
                        {task.topicName}
                      </span>
                      
                      {/* Concept Leak badge */}
                      {task.isConceptLeak && (
                        <span className="bg-amber-950 border border-amber-900 text-amber-300 font-bold font-mono text-[8.5px] px-1.5 py-0.2 rounded flex items-center gap-1 uppercase tracking-tight">
                          <AlertTriangle className="h-2.5 w-2.5" /> Concept Leak
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h4 className="text-xs font-semibold text-slate-200 mt-1 font-sans leading-slight">
                      {task.title}
                    </h4>

                    {/* Interval and scores */}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-500 pt-1.5">
                      <span className="flex items-center gap-1">
                        Last Tested: <strong className="text-slate-400 font-medium">{new Date(task.lastTested).toLocaleDateString()}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        Active Spacing: <strong className="text-indigo-400 font-extrabold">{task.currentInterval} {task.currentInterval === 1 ? 'day' : 'days'}</strong>
                        {task.previousInterval > 0 && (
                          <span className="text-[8px] text-slate-600"> (prior: {task.previousInterval}d)</span>
                        )}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 bg-slate-950/60 px-1 rounded">
                        Rubric Marks: 
                        <strong className={`font-extrabold ml-0.5 ${
                          task.rubricScore === 3 ? 'text-emerald-400' : task.rubricScore === 2 ? 'text-amber-400' : 'text-rose-450'
                        }`}>
                          {task.rubricScore}/3
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* RIGHT STATUS CORNER: Decays and timing */}
                  <div className="text-right flex flex-col justify-between items-end gap-2 shrink-0">
                    
                    {/* THE CRITICAL DECAY FLASHING BADGE */}
                    {isOverdue ? (
                      <span className="inline-flex items-center gap-1 bg-rose-950/90 border border-rose-800 text-rose-300 text-[9px] font-bold px-2 py-1 rounded animate-pulse shadow-md select-none uppercase tracking-wider">
                        <AlertTriangle className="h-3 w-3 text-rose-400 shrink-0" />
                        Critical Memory Decay: Re-verify Now
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-emerald-950/60 border border-emerald-900/60 text-emerald-300 text-[9.5px] font-bold px-2 py-0.5 rounded uppercase font-sans tracking-tight">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Retained: {getDueTimeDescription(task.nextReviewDue)}
                      </span>
                    )}

                    <div className="text-[9.5px] font-mono text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-900">
                      📅 Review: {new Date(task.nextReviewDue).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {/* INTERACTIVE COMPANION EVALUATOR SHORTCUT */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-850/85 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 opacity-80 group-hover:opacity-100 transition duration-150">
                  <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
                    <CornerDownRight className="h-3 w-3 text-slate-400" />
                    <span>Live Simulator: Click score to process update as relational database hook</span>
                  </div>

                  {/* Live submission updater buttons */}
                  <div className="flex gap-1.5 self-end">
                    {[0, 1, 2, 3].map((score) => (
                      <button
                        id={`action_btn_${task.id}_score_${score}`}
                        key={score}
                        type="button"
                        onClick={() => handleScoreUpdate(task.subtopicId, score)}
                        className={`text-[9px] px-2 py-1 rounded border font-mono font-bold transition duration-150 cursor-pointer ${
                          score === 3 
                            ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-900/60' 
                            : score === 2 
                            ? 'bg-amber-950 hover:bg-amber-900 text-amber-300 border-amber-900/40' 
                            : 'bg-rose-950 hover:bg-rose-900 text-rose-305 border-rose-900/40'
                        }`}
                        title={`Simulate grading with ${score}/3`}
                      >
                        Grade: {score}/3
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
