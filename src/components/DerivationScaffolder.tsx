import React, { useState } from 'react';
import { HelpCircle, CheckCircle, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';

interface DerivationScaffolderProps {
  onSuccess?: () => void;
}

export default function DerivationScaffolder({ onSuccess }: DerivationScaffolderProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  interface ScaffoldingStep {
    stepNumber: number;
    question: string;
    description: string;
    options: {
      text: string;
      math: string;
      feedback: string;
      isCorrect: boolean;
    }[];
  }

  const steps: ScaffoldingStep[] = [
    {
      stepNumber: 1,
      question: "Which of the following describes the absolute first 'Groundwork' equation of the derivation?",
      description: "IB examiners scrutinize the initial physical premise. Starting directly with v = sqrt(GM/r) is a fatal Band 2 mistake.",
      options: [
        {
          text: "Assume v = GM/r is proportional, so cancel m early.",
          math: "v = G M / r",
          feedback: "❌ Pitfall: Starting with the final answer yields 0 marks. You must declare the originating mechanical forces first.",
          isCorrect: false,
        },
        {
          text: "Equate centripetal force directly to Newton's universal gravitational force before canceling any terms.",
          math: "\\frac{m v^2}{r} = \\frac{G M m}{r^2}",
          feedback: "✅ Perfect! This is the core physical model. Centripetal force is PROVIDED by the gravitational attraction.",
          isCorrect: true,
        },
        {
          text: "Express kinetic energy equal to gravitational potential energy.",
          math: "\\frac{1}{2}m v^2 = \\frac{G M m}{r}",
          feedback: "❌ Warning: This equates energy, not forces. While useful for escape velocity derivations, it is incorrect for Keplerian circular orbit velocity derivations.",
          isCorrect: false,
        }
      ]
    },
    {
      stepNumber: 2,
      question: "How do you correctly execute the algebraic 'Manipulation' step to isolate orbital velocity?",
      description: "Show flawless execution. Cancel terms carefully and write down intermediate steps clearly.",
      options: [
        {
          text: "Subtract orbital radius from both sides to cancel exponents.",
          math: "v^2 = \\frac{G M m}{r^2} - m r",
          feedback: "❌ Red Alert: Incorrect algebra! Adding / subtracting across ratios does not cancel factors.",
          isCorrect: false,
        },
        {
          text: "Simultaneously eliminate the planet mass M and the satellite mass m.",
          math: "v^2 = \\frac{G}{r}",
          feedback: "❌ Error: The planet's mass M is the gravitating body and cannot cancel. Only the satellite's mass m cancels.",
          isCorrect: false,
        },
        {
          text: "Multiply both sides by r and divide by satellite mass m, cleanly isolating v².",
          math: "v^2 = \\frac{G M}{r}",
          feedback: "✅ Flawless! Notice the satellite's mass m cancels completely, showing that any satellite orbits at this speed regardless of its mass.",
          isCorrect: true,
        }
      ]
    },
    {
      stepNumber: 3,
      question: "What is the final 'Precision' expression and crucial commentary required for full 3/3 marks?",
      description: "Complete the derivation and make notes of physical parameters.",
      options: [
        {
          text: "Express orbital speed v by taking the radical, stating that satellite mass cancels out.",
          math: "v = \\sqrt{\\frac{G M}{r}} \\quad \\text{(satellite mass } m \\text{ cancels)}",
          feedback: "✅ Absolute Band 7 Excellence! You've explicitly highlighted the cancelation of the satellite mass, satisfying the strict markscheme stipulation.",
          isCorrect: true,
        },
        {
          text: "Approximate it as linear speed for circular paths with orbital period.",
          math: "v = \\frac{2 \\pi r}{T}",
          feedback: "❌ Incomplete: While mathematically true, this does not derive the speed in terms of the body's mass and orbital radius.",
          isCorrect: false,
        },
        {
          text: "Finalize as a constant relation neglecting physical context.",
          math: "v = k \\sqrt{\\frac{M}{r}}",
          feedback: "❌ Error: You must preserve the real universal gravitational constant G in physics paper responses.",
          isCorrect: false,
        }
      ]
    }
  ];

  const currentStepData = steps[currentStep - 1];

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    setShowFeedback(true);
    
    if (currentStepData.options[index].isCorrect && currentStep === 3 && onSuccess) {
      onSuccess();
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowFeedback(false);
    }
  };

  const resetScaffolder = () => {
    setCurrentStep(1);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowFeedback(false);
  };

  return (
    <div id="derivation_scaffolder" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl relative">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-purple-400" />
          <h3 className="font-sans font-semibold text-slate-100 text-sm tracking-wider uppercase">
            Derivation Scaffolding Challenge
          </h3>
        </div>
        <span className="font-mono text-xs px-2.5 py-1 bg-purple-950/80 text-purple-300 rounded-full border border-purple-800">
          Scaffold {currentStep} of 3
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-4 leading-relaxed italic">
        {currentStepData.description}
      </p>

      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-semibold tracking-wide text-slate-100 mb-3 font-display">
          {currentStepData.question}
        </h4>

        <div className="space-y-2.5">
          {currentStepData.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = option.isCorrect;
            
            let btnStyle = "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white";
            if (isAnswered) {
              if (isCorrect) {
                btnStyle = "bg-emerald-950/60 border-emerald-500 text-emerald-200";
              } else if (isSelected) {
                btnStyle = "bg-rose-950/60 border-rose-500 text-rose-200";
              } else {
                btnStyle = "bg-slate-950 border-slate-900 text-slate-500 opacity-60";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={isAnswered}
                className={`w-full p-3.5 rounded-lg border text-left text-xs transition duration-200 flex flex-col justify-between gap-2.5 ${btnStyle} relative overflow-hidden`}
              >
                <div className="flex items-start justify-between w-full">
                  <span className="pr-4 leading-relaxed font-sans">{option.text}</span>
                  {isAnswered && isCorrect && <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />}
                  {isAnswered && isSelected && !isCorrect && <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />}
                </div>
                
                {/* Math Preview Panel with beautifully typeset text-style simulation */}
                <div className="w-full bg-slate-950/90 border border-slate-900/50 py-2.5 px-4 rounded font-mono text-center text-xs text-slate-100 flex items-center justify-center min-h-[48px] shadow-inner select-all">
                  {option.math === "\\frac{m v^2}{r} = \\frac{G M m}{r^2}" && (
                    <div className="flex items-center gap-1 font-sans text-xs">
                      <span className="flex flex-col items-center">
                        <span className="border-b border-slate-400 pb-0.5">m v²</span>
                        <span className="pt-0.5">r</span>
                      </span>
                      <span className="mx-2 text-slate-400">=</span>
                      <span className="flex flex-col items-center">
                        <span className="border-b border-slate-400 pb-0.5">G M m</span>
                        <span className="pt-0.5">r²</span>
                      </span>
                    </div>
                  )}
                  {option.math === "v = G M / r" && (
                    <span className="font-mono">v = G M / r</span>
                  )}
                  {option.math === "\\frac{1}{2}m v^2 = \\frac{G M m}{r}" && (
                    <div className="flex items-center gap-1 font-sans text-xs">
                      <span className="mr-1">½ m v²</span>
                      <span className="mx-2 text-slate-400">=</span>
                      <span className="flex flex-col items-center">
                        <span className="border-b border-slate-400 pb-0.5">G M m</span>
                        <span className="pt-0.5">r</span>
                      </span>
                    </div>
                  )}
                  {option.math === "v^2 = \\frac{G M m}{r^2} - m r" && (
                    <span className="font-sans">v² = G M m / r² − m r</span>
                  )}
                  {option.math === "v^2 = \\frac{G}{r}" && (
                    <span className="font-sans">v² = G / r</span>
                  )}
                  {option.math === "v^2 = \\frac{G M}{r}" && (
                    <span className="font-sans">v² = G M / r</span>
                  )}
                  {option.math === "v = \\sqrt{\\frac{G M}{r}} \\quad \\text{(satellite mass } m \\text{ cancels)}" && (
                    <span className="font-sans flex items-center gap-2">
                      v = <span className="text-sm font-light">√</span><span className="border-t border-slate-300 pt-0.5 flex flex-col items-center text-xs"><span>G M</span><span className="border-t border-slate-600 w-full text-center">r</span></span>
                      <span className="text-[10px] text-purple-400 opacity-90 font-mono pl-2">(Satellite mass m cancelled)</span>
                    </span>
                  )}
                  {option.math === "v = \\frac{2 \\pi r}{T}" && (
                    <div className="flex items-center gap-1 font-sans text-xs">
                      <span>v</span>
                      <span className="mx-1 text-slate-400">=</span>
                      <span className="flex flex-col items-center">
                        <span className="border-b border-slate-400 pb-0.5">2 π r</span>
                        <span className="pt-0.5">T</span>
                      </span>
                    </div>
                  )}
                  {option.math === "v = k \\sqrt{\\frac{M}{r}}" && (
                    <span className="font-sans">v = k √M/r</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {showFeedback && (
        <div className={`p-4 rounded-lg border text-xs leading-relaxed mb-4 transition duration-200 ${
          currentStepData.options[selectedOption || 0].isCorrect
            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
            : 'bg-rose-950/40 border-rose-800 text-rose-300'
        }`}>
          {currentStepData.options[selectedOption || 0].feedback}
        </div>
      )}

      <div className="flex justify-between items-center mt-3">
        <button
          onClick={resetScaffolder}
          className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 py-1.5 transition"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Start Over
        </button>
        
        {isAnswered && (
          <button
            onClick={() => {
              if (currentStep < 3 && currentStepData.options[selectedOption || 0].isCorrect) {
                handleNext();
              } else if (!currentStepData.options[selectedOption || 0].isCorrect) {
                // Let them retry that step
                setSelectedOption(null);
                setIsAnswered(false);
                setShowFeedback(false);
              }
            }}
            className={`text-xs px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition ${
              currentStepData.options[selectedOption || 0].isCorrect
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                : 'bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700'
            }`}
          >
            {currentStepData.options[selectedOption || 0].isCorrect ? (
              currentStep === 3 ? 'Completed!' : (
                <>Next Step <ArrowRight className="h-3.5 w-3.5" /></>
              )
            ) : (
              'Retry Step'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
