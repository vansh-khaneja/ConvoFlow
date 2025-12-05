'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui-kit/button';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: 'Welcome to ConvoFlow!',
    description: 'Build AI-powered chatbots with a visual workflow builder. Let\'s get started!',
    position: 'center'
  },
  {
    id: 2,
    title: 'Add Your First Node',
    description: 'Click the "Add Node" button in the top right to see available nodes for your workflow.',
    target: '[data-tutorial="add-node-button"]',
    position: 'bottom'
  },
  {
    id: 3,
    title: 'Connect Nodes',
    description: 'Drag from a node\'s output handle to another node\'s input to create connections.',
    position: 'center'
  },
  {
    id: 4,
    title: 'Configure Nodes',
    description: 'Click on any node to open its configuration panel and customize its settings.',
    position: 'center'
  },
  {
    id: 5,
    title: 'Test Your Workflow',
    description: 'Click the "Run" button to test your chatbot workflow and see it in action!',
    target: '[data-tutorial="run-button"]',
    position: 'bottom'
  }
];

const STORAGE_KEY = 'convoflow_tutorial_completed';

interface WorkflowTutorialProps {
  nodes: any[];
  onAddNode?: () => void;
  onSkip?: () => void;
}

export default function WorkflowTutorial({ nodes, onAddNode, onSkip }: WorkflowTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    // Check if tutorial was already completed
    const completed = localStorage.getItem(STORAGE_KEY) === 'true';
    setHasCompleted(completed);
    
    // Show tutorial only if:
    // 1. Not completed before
    // 2. Canvas is empty (no nodes)
    if (!completed && nodes.length === 0) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [nodes.length]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
    if (onSkip) {
      onSkip();
    }
  };

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setHasCompleted(true);
    setIsVisible(false);
  };

  // Auto-advance step 2 if user clicks Add Node button
  useEffect(() => {
    if (currentStep === 1 && nodes.length > 0) {
      // User added a node, move to next step
      setTimeout(() => {
        setCurrentStep(2);
      }, 500);
    }
  }, [currentStep, nodes.length]);

  if (!isVisible || hasCompleted) {
    return null;
  }

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <>
      {/* Overlay backdrop */}
      <div 
        className="fixed inset-0 z-[100] transition-opacity duration-300"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)'
        }}
        onClick={isFirstStep ? undefined : handleNext}
      />

      {/* Tutorial Card */}
      <div
        className="fixed z-[101] transition-all duration-300"
        style={{
          ...(step.target ? {
            // Position relative to target element if specified
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          } : {
            // Center position for general steps
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          })
        }}
      >
        <div
          className="bg-[#13111C] border border-[var(--border-color)] rounded-xl shadow-2xl p-6 w-[420px] max-w-[90vw]"
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.1)'
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  {step.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="w-8 h-8 rounded-lg text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)]"
              aria-label="Close tutorial"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Description */}
          <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="h-1.5 bg-[var(--card-bg)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%`,
                  background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)'
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)]"
            >
              Skip Tutorial
            </Button>
            <Button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: '#ffffff',
                border: '1.5px solid rgba(139, 92, 246, 0.3)',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <span>{isLastStep ? 'Get Started' : 'Next'}</span>
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

