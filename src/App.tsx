/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, RotateCcw, Hash, Eye, ChevronDown, Sparkles, ArrowRight, Check, Sparkle } from 'lucide-react';
import {
  playLiftSound,
  playSnapSound,
  playClickSound,
  toggleMute,
} from './components/AudioEffects';

export default function App() {
  const [page, setPage] = useState<1 | 2 | 3>(1);
  const [muted, setMuted] = useState<boolean>(false);
  const [showNumbers, setShowNumbers] = useState<boolean>(false);

  // Progressive task progression state
  const [nextCount, setNextCount] = useState<number>(10);
  const [progressionStage, setProgressionStage] = useState<1 | 2>(1);
  const [hasUnlockedPage3, setHasUnlockedPage3] = useState<boolean>(false);
  const [showFormula, setShowFormula] = useState<boolean>(false);

  // "随机算式" Challenge Mode State
  const [isRandomEquationMode, setIsRandomEquationMode] = useState<boolean>(false);
  const [targetEquation, setTargetEquation] = useState<{ a: number; b: number } | null>(null);
  // Challenge step: 1 (first orientation), 2 (second orientation), 3 (completely correct)
  const [challengeStep, setChallengeStep] = useState<1 | 2 | 3>(1);
  const [firstSolved, setFirstSolved] = useState<{ rows: number; cols: number } | null>(null);
  const [challengeFeedback, setChallengeFeedback] = useState<'correct' | 'all_correct' | null>(null);
  const [isShakeError, setIsShakeError] = useState<boolean>(false);

  // Bouncing states for axis numbers
  const [bouncingRows, setBouncingRows] = useState<boolean>(false);
  const [bouncingCols, setBouncingCols] = useState<boolean>(false);

  // Cascading dropdown states for Page 2 / Page 3 top-right corner
  const [showObservationMenu, setShowObservationMenu] = useState<boolean>(false);
  const [showInfoMenu, setShowInfoMenu] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'none' | 'col' | 'row'>('none');

  // Animation state for "看我的" (simulated human dragging random questioning)
  const [isAutoAnimating, setIsAutoAnimating] = useState<boolean>(false);

  // Number of visible rows and columns (1 to 10)
  const [visibleRows, setVisibleRows] = useState<number>(10);
  const [visibleCols, setVisibleCols] = useState<number>(10);

  // Dragging states for Bottom Paper (Rows)
  const [isDraggingRow, setIsDraggingRow] = useState<boolean>(false);
  const [dragRowPos, setDragRowPos] = useState<number>(10);

  // Dragging states for Right Paper (Columns)
  const [isDraggingCol, setIsDraggingCol] = useState<boolean>(false);
  const [dragColPos, setDragColPos] = useState<number>(10);

  const boardRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{
    pointerY: number;
    pointerX: number;
    startPos: number;
  }>({ pointerY: 0, pointerX: 0, startPos: 10 });

  // Handle sound mute toggle
  const handleToggleMute = () => {
    const isNowMuted = toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      playClickSound();
    }
  };

  // Switch pages
  const handlePageChange = (newPage: 1 | 2 | 3) => {
    if (page === newPage) return;
    playClickSound();
    setPage(newPage);
    if (newPage === 1) {
      setViewMode('none');
      setShowObservationMenu(false);
      setShowInfoMenu(false);
      setIsAutoAnimating(false);
      setShowFormula(false);
      setIsRandomEquationMode(false);
    }
  };

  // Toggle axis numbers display
  const handleToggleNumbers = () => {
    playClickSound();
    setShowNumbers((prev) => !prev);
  };

  // Reset to full 10x10
  const handleReset = () => {
    if (isAutoAnimating) return;
    playSnapSound();
    setVisibleRows(10);
    setDragRowPos(10);
    setVisibleCols(10);
    setDragColPos(10);
    setShowFormula(false);
  };

  // "看我的" - Random question feature with human-like drag animation
  const handleRandomQuestion = () => {
    if (isAutoAnimating) return;
    setIsAutoAnimating(true);
    playLiftSound();
    setShowFormula(false);

    // Phase 1: Dynamically slide both white papers to cover the entire dot board (0 rows, 0 cols)
    setVisibleRows(0);
    setDragRowPos(0);
    setVisibleCols(0);
    setDragColPos(0);

    // Pick random target rows and columns (between 2 and 9 for grade-2 math challenge)
    let nextR = Math.floor(Math.random() * 8) + 2;
    let nextC = Math.floor(Math.random() * 8) + 2;
    if (nextR === visibleRows && nextC === visibleCols) {
      nextR = (nextR % 8) + 2;
    }

    // After Phase 1 finishes (550ms) + short dramatic pause (200ms)
    setTimeout(() => {
      playLiftSound();
      // Phase 2: Dynamically unfold both papers simultaneously to the random position
      setVisibleRows(nextR);
      setDragRowPos(nextR);
      setVisibleCols(nextC);
      setDragColPos(nextC);

      // Finish animation when arrival transition completes
      setTimeout(() => {
        playSnapSound();
        setIsAutoAnimating(false);

        // Progress counter countdown
        setNextCount((prev) => {
          const updated = Math.max(0, prev - 1);
          if (updated === 0) {
            playSnapSound();
            if (progressionStage === 1) {
              // Automatically open menus so student sees the newly unlocked "列算式"
              setShowObservationMenu(true);
              setShowInfoMenu(true);
            } else if (progressionStage === 2) {
              // Unlock Page 3
              setHasUnlockedPage3(true);
            }
          }
          return updated;
        });
      }, 650);
    }, 750);
  };

  // "列算式" button click handler
  const handleFormulate = () => {
    playSnapSound();
    setShowFormula((prev) => !prev);

    // If currently at stage 1 and countdown is 0, advance to stage 2 and reset NEXT to 10
    if (progressionStage === 1 && nextCount === 0) {
      setProgressionStage(2);
      setNextCount(10);
    }
  };

  // "随机算式" toggle handler
  const handleToggleRandomEquation = () => {
    playSnapSound();
    if (isRandomEquationMode) {
      // Exit mode
      setIsRandomEquationMode(false);
      setTargetEquation(null);
      setChallengeStep(1);
      setFirstSolved(null);
      setChallengeFeedback(null);
    } else {
      // Enter mode: generate random equation with factors <= 10 (2..9, a != b)
      let a = Math.floor(Math.random() * 8) + 2;
      let b = Math.floor(Math.random() * 8) + 2;
      while (b === a) {
        b = Math.floor(Math.random() * 8) + 2;
      }
      setIsRandomEquationMode(true);
      setTargetEquation({ a, b });
      setChallengeStep(1);
      setFirstSolved(null);
      setChallengeFeedback(null);
      setShowFormula(false);
      // Reset papers so student can arrange from clean state
      setVisibleRows(10);
      setDragRowPos(10);
      setVisibleCols(10);
      setDragColPos(10);
    }
  };

  // "确定" verification handler for "随机算式"
  const handleConfirmChallenge = () => {
    if (!targetEquation) return;
    playClickSound();

    const currentR = currentRowCount;
    const currentC = currentColCount;
    const { a, b } = targetEquation;

    if (challengeStep === 1) {
      // Step 1: Can be either (a, b) or (b, a)
      const isConfig1 = currentR === a && currentC === b;
      const isConfig2 = currentR === b && currentC === a;

      if (isConfig1 || isConfig2) {
        // Correct! Save orientation, advance to step 2
        playSnapSound();
        setFirstSolved({ rows: currentR, cols: currentC });
        setChallengeStep(2);
        setChallengeFeedback('correct');
        // Reset papers for the second orientation attempt
        setVisibleRows(10);
        setDragRowPos(10);
        setVisibleCols(10);
        setDragColPos(10);
      } else {
        // Incorrect
        triggerShakeError();
      }
    } else if (challengeStep === 2) {
      if (!firstSolved) return;
      // Step 2: Must be the OTHER orientation!
      const isOpposite = currentR === firstSolved.cols && currentC === firstSolved.rows;

      if (isOpposite) {
        // Completely correct!
        playSnapSound();
        setChallengeStep(3);
        setChallengeFeedback('all_correct');
      } else {
        // Incorrect
        triggerShakeError();
      }
    } else if (challengeStep === 3) {
      // Restart with another random equation
      let nextA = Math.floor(Math.random() * 8) + 2;
      let nextB = Math.floor(Math.random() * 8) + 2;
      while (nextB === nextA) {
        nextB = Math.floor(Math.random() * 8) + 2;
      }
      setTargetEquation({ a: nextA, b: nextB });
      setChallengeStep(1);
      setFirstSolved(null);
      setChallengeFeedback(null);
      setVisibleRows(10);
      setDragRowPos(10);
      setVisibleCols(10);
      setDragColPos(10);
    }
  };

  const triggerShakeError = () => {
    setIsShakeError(true);
    setTimeout(() => setIsShakeError(false), 500);
  };

  // Click on numbers inside the formulas (only works if "横着看" or "竖着看" is selected)
  const handleFormulaNumberClick = (type: 'row' | 'col' | 'total') => {
    if (viewMode === 'none') {
      setShowObservationMenu(true);
      setShowInfoMenu(true);
      return;
    }

    playClickSound();
    setShowNumbers(true);

    if (type === 'row') {
      setBouncingRows(false);
      requestAnimationFrame(() => {
        setBouncingRows(true);
        setTimeout(() => setBouncingRows(false), 600);
      });
    } else if (type === 'col') {
      setBouncingCols(false);
      requestAnimationFrame(() => {
        setBouncingCols(true);
        setTimeout(() => setBouncingCols(false), 600);
      });
    } else if (type === 'total') {
      setBouncingRows(false);
      setBouncingCols(false);
      requestAnimationFrame(() => {
        setBouncingRows(true);
        setBouncingCols(true);
        setTimeout(() => {
          setBouncingRows(false);
          setBouncingCols(false);
        }, 600);
      });
    }
  };

  // Quick select row or column by tapping axis number badges
  const handleRowClick = (r: number) => {
    if (page === 1 || isAutoAnimating) return;
    playSnapSound();
    setVisibleRows(r);
    setDragRowPos(r);
  };

  const handleColClick = (c: number) => {
    if (page === 1 || isAutoAnimating) return;
    playSnapSound();
    setVisibleCols(c);
    setDragColPos(c);
  };

  // Toggle observation menu (Level 1)
  const handleToggleObservation = () => {
    playClickSound();
    setShowObservationMenu((prev) => {
      const next = !prev;
      if (!next) {
        setShowInfoMenu(false);
      }
      return next;
    });
  };

  // Toggle "说信息" (Level 2)
  const handleToggleInfoMenu = () => {
    playClickSound();
    setShowInfoMenu((prev) => !prev);
  };

  // Toggle "竖着看" or "横着看" (Level 3)
  const handleSelectViewMode = (mode: 'col' | 'row') => {
    playSnapSound();
    setViewMode((prev) => (prev === mode ? 'none' : mode));
  };

  // Pointer event handlers for Bottom Paper (Row cover)
  const handleRowPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isAutoAnimating) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setIsDraggingRow(true);
    playLiftSound();
    dragStartRef.current = {
      pointerY: e.clientY,
      pointerX: e.clientX,
      startPos: visibleRows,
    };
    setDragRowPos(visibleRows);
  };

  const handleRowPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRow || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const cellHeight = rect.height / 10;
    const deltaY = e.clientY - dragStartRef.current.pointerY;
    const deltaRows = deltaY / cellHeight;
    const newPos = Math.min(10, Math.max(1, dragStartRef.current.startPos + deltaRows));
    setDragRowPos(newPos);
  };

  const handleRowPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRow) return;
    setIsDraggingRow(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    const snapped = Math.min(10, Math.max(1, Math.round(dragRowPos)));
    setVisibleRows(snapped);
    setDragRowPos(snapped);
    playSnapSound();
  };

  // Pointer event handlers for Right Paper (Column cover)
  const handleColPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isAutoAnimating) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setIsDraggingCol(true);
    playLiftSound();
    dragStartRef.current = {
      pointerY: e.clientY,
      pointerX: e.clientX,
      startPos: visibleCols,
    };
    setDragColPos(visibleCols);
  };

  const handleColPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingCol || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const cellWidth = rect.width / 10;
    const deltaX = e.clientX - dragStartRef.current.pointerX;
    const deltaCols = deltaX / cellWidth;
    const newPos = Math.min(10, Math.max(1, dragStartRef.current.startPos + deltaCols));
    setDragColPos(newPos);
  };

  const handleColPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingCol) return;
    setIsDraggingCol(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    const snapped = Math.min(10, Math.max(1, Math.round(dragColPos)));
    setVisibleCols(snapped);
    setDragColPos(snapped);
    playSnapSound();
  };

  // Computed row and column counts
  const currentRowCount =
    page === 1
      ? 10
      : isDraggingRow
      ? Math.min(10, Math.max(1, Math.round(dragRowPos)))
      : visibleRows;

  const currentColCount =
    page === 1
      ? 10
      : isDraggingCol
      ? Math.min(10, Math.max(1, Math.round(dragColPos)))
      : visibleCols;

  const currentTotal = currentRowCount * currentColCount;

  // Percentage position of Bottom Paper top edge
  const effectiveRowPosition = isDraggingRow ? dragRowPos : visibleRows;
  const bottomPaperTopPercent = (effectiveRowPosition / 10) * 100;

  // Percentage position of Right Paper left edge
  const effectiveColPosition = isDraggingCol ? dragColPos : visibleCols;
  const rightPaperLeftPercent = (effectiveColPosition / 10) * 100;

  // Whether the "列算式" button is visible
  const isFormulaButtonAvailable = (progressionStage === 1 && nextCount === 0) || progressionStage >= 2 || page === 3 || hasUnlockedPage3;

  // Whether the "随机算式" button is visible (appears when Page 3 unlocks)
  const isRandomEquationButtonAvailable = hasUnlockedPage3 || page === 3;

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-between p-3 sm:p-6 select-none touch-none font-sans relative">
      {/* Top Action Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between gap-2 sm:gap-4 mb-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Button: 第一页 */}
          <button
            onClick={() => handlePageChange(1)}
            className={`px-5 sm:px-7 py-2.5 sm:py-3 rounded-2xl text-lg sm:text-xl font-bold cursor-pointer transition-all active:scale-95 shadow-sm ${
              page === 1
                ? 'bg-amber-400 text-amber-950 ring-3 ring-amber-300 shadow-md scale-105'
                : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
            }`}
          >
            第一页
          </button>

          {/* Button: 第二页 */}
          <button
            onClick={() => handlePageChange(2)}
            className={`px-5 sm:px-7 py-2.5 sm:py-3 rounded-2xl text-lg sm:text-xl font-bold cursor-pointer transition-all active:scale-95 shadow-sm ${
              page === 2
                ? 'bg-amber-400 text-amber-950 ring-3 ring-amber-300 shadow-md scale-105'
                : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
            }`}
          >
            第二页
          </button>

          {/* Button: 第三页 (Appears to the right of "第二页" when unlocked, pushing "数字" to the right) */}
          {(hasUnlockedPage3 || page === 3) && (
            <button
              onClick={() => handlePageChange(3)}
              className={`px-5 sm:px-7 py-2.5 sm:py-3 rounded-2xl text-lg sm:text-xl font-bold cursor-pointer transition-all active:scale-95 shadow-sm animate-in fade-in slide-in-from-left-3 duration-300 ${
                page === 3
                  ? 'bg-amber-400 text-amber-950 ring-3 ring-amber-300 shadow-md scale-105'
                  : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200 ring-2 ring-emerald-400/50'
              }`}
            >
              第三页
            </button>
          )}

          {/* Toggle Numbers Button */}
          <button
            onClick={handleToggleNumbers}
            className={`flex items-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-base sm:text-lg font-bold cursor-pointer transition-all active:scale-95 shadow-sm border ${
              showNumbers
                ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-300/60'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border-neutral-200'
            }`}
          >
            <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600" />
            <span>数字</span>
          </button>

          {/* Reset Button (on Page 2 / 3) */}
          {(page === 2 || page === 3) && (
            <button
              onClick={handleReset}
              disabled={isAutoAnimating}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-base sm:text-lg font-bold bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200 shadow-sm cursor-pointer transition-all active:scale-95 disabled:opacity-60"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600" />
              <span>复原</span>
            </button>
          )}
        </div>

        {/* Audio Mute Toggle Button */}
        <button
          onClick={handleToggleMute}
          className="p-2.5 sm:p-3 rounded-2xl bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200 shadow-sm cursor-pointer transition-all active:scale-95 shrink-0"
        >
          {muted ? (
            <VolumeX className="w-5 h-5 text-neutral-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-amber-600" />
          )}
        </button>
      </div>

      {/* Target Equation Display when in "随机算式" Mode */}
      {isRandomEquationMode && targetEquation && (
        <div className="w-full max-w-2xl bg-white border-2 border-amber-400 rounded-2xl py-3 px-6 shadow-md flex items-center justify-between gap-4 mb-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-3xl sm:text-4xl font-black tracking-wider text-neutral-900 font-mono">
            {targetEquation.a} × {targetEquation.b} = {targetEquation.a * targetEquation.b}
          </div>
          {challengeFeedback && (
            <div
              className={`px-4 py-1.5 rounded-xl font-black text-base sm:text-lg animate-in zoom-in-75 duration-200 flex items-center gap-1.5 ${
                challengeFeedback === 'all_correct'
                  ? 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-300'
                  : 'bg-amber-400 text-amber-950 shadow-sm'
              }`}
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{challengeFeedback === 'all_correct' ? '完全正确' : '正确'}</span>
            </div>
          )}
        </div>
      )}

      {/* Two Commutative Formulas Display (Triggered by "列算式", when not in challenge mode) */}
      {!isRandomEquationMode && showFormula && (page === 2 || page === 3) && (
        <div className="w-full max-w-2xl bg-white/95 backdrop-blur-xs border-2 border-amber-400 rounded-2xl py-2.5 px-4 sm:px-6 shadow-md flex flex-wrap items-center justify-around gap-3 sm:gap-6 mb-2 animate-in fade-in zoom-in-95 duration-200">
          {/* Formula 1: Rows × Cols = Total */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-2xl sm:text-3xl font-black text-neutral-900 font-mono">
            <button
              onClick={() => handleFormulaNumberClick('row')}
              className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 hover:bg-amber-200 active:scale-90 transition-all cursor-pointer shadow-xs"
            >
              {currentRowCount}
            </button>
            <span className="text-neutral-400 font-bold select-none">×</span>
            <button
              onClick={() => handleFormulaNumberClick('col')}
              className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-sky-100 border border-sky-300 text-sky-950 hover:bg-sky-200 active:scale-90 transition-all cursor-pointer shadow-xs"
            >
              {currentColCount}
            </button>
            <span className="text-neutral-400 font-bold select-none">=</span>
            <button
              onClick={() => handleFormulaNumberClick('total')}
              className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 hover:bg-emerald-200 active:scale-90 transition-all cursor-pointer shadow-xs"
            >
              {currentTotal}
            </button>
          </div>

          <div className="hidden sm:block w-px h-8 bg-neutral-200" />

          {/* Formula 2: Cols × Rows = Total (Commutative Partner) */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-2xl sm:text-3xl font-black text-neutral-900 font-mono">
            <button
              onClick={() => handleFormulaNumberClick('col')}
              className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-sky-100 border border-sky-300 text-sky-950 hover:bg-sky-200 active:scale-90 transition-all cursor-pointer shadow-xs"
            >
              {currentColCount}
            </button>
            <span className="text-neutral-400 font-bold select-none">×</span>
            <button
              onClick={() => handleFormulaNumberClick('row')}
              className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 hover:bg-amber-200 active:scale-90 transition-all cursor-pointer shadow-xs"
            >
              {currentRowCount}
            </button>
            <span className="text-neutral-400 font-bold select-none">=</span>
            <button
              onClick={() => handleFormulaNumberClick('total')}
              className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 hover:bg-emerald-200 active:scale-90 transition-all cursor-pointer shadow-xs"
            >
              {currentTotal}
            </button>
          </div>
        </div>
      )}

      {/* Page 2 / 3 Top-Right Action Area */}
      {(page === 2 || page === 3) && (
        <div className="absolute top-3 sm:top-6 right-3 sm:right-6 z-50 flex items-start gap-2 sm:gap-3">
          {/* "看我的" Button (Left of "看一看") */}
          <button
            onClick={handleRandomQuestion}
            disabled={isAutoAnimating}
            className={`flex items-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-base sm:text-lg font-bold cursor-pointer transition-all active:scale-95 shadow-md border ${
              isAutoAnimating
                ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-300/60 scale-95'
                : 'bg-white text-neutral-800 hover:bg-neutral-50 border-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            <span>看我的</span>
          </button>

          {/* "看一看" Cascading Dropdown (Right of "看我的") */}
          <div className="flex flex-col items-end gap-2">
            {/* Level 1: Root Button */}
            <button
              onClick={handleToggleObservation}
              className={`flex items-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-base sm:text-lg font-bold cursor-pointer transition-all active:scale-95 shadow-md border ${
                showObservationMenu
                  ? 'bg-amber-500 text-white border-amber-400 ring-2 ring-amber-300'
                  : 'bg-white text-neutral-800 hover:bg-neutral-50 border-neutral-200'
              }`}
            >
              <Eye className={`w-4 h-4 sm:w-5 sm:h-5 ${showObservationMenu ? 'text-white' : 'text-amber-500'}`} />
              <span>看一看</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  showObservationMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Level 2: "说信息" Button (Drops down below Level 1) */}
            {showObservationMenu && (
              <div className="flex flex-col items-end gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={handleToggleInfoMenu}
                  className={`flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-base sm:text-lg font-bold cursor-pointer transition-all active:scale-95 shadow-md border ${
                    showInfoMenu
                      ? 'bg-amber-400 text-amber-950 border-amber-500 ring-2 ring-amber-300'
                      : 'bg-white text-neutral-700 hover:bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <span>说信息</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      showInfoMenu ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Level 3: "竖着看", "横着看", "列算式", and "随机算式" */}
                {showInfoMenu && (
                  <div className="flex flex-col gap-1.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-2xl border border-neutral-200 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => handleSelectViewMode('col')}
                      className={`px-4 sm:px-5 py-2 rounded-xl text-sm sm:text-base font-bold cursor-pointer transition-all active:scale-95 ${
                        viewMode === 'col'
                          ? 'bg-amber-400 text-amber-950 border-2 border-amber-500 shadow-sm font-black'
                          : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border border-neutral-200'
                      }`}
                    >
                      竖着看
                    </button>
                    <button
                      onClick={() => handleSelectViewMode('row')}
                      className={`px-4 sm:px-5 py-2 rounded-xl text-sm sm:text-base font-bold cursor-pointer transition-all active:scale-95 ${
                        viewMode === 'row'
                          ? 'bg-amber-400 text-amber-950 border-2 border-amber-500 shadow-sm font-black'
                          : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border border-neutral-200'
                      }`}
                    >
                      横着看
                    </button>

                    {/* "列算式" Button */}
                    {isFormulaButtonAvailable && (
                      <button
                        onClick={handleFormulate}
                        className={`px-4 sm:px-5 py-2 rounded-xl text-sm sm:text-base font-bold cursor-pointer transition-all active:scale-95 border-2 ${
                          showFormula
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300 font-black'
                            : 'bg-amber-50 text-amber-900 border-amber-400 hover:bg-amber-100'
                        }`}
                      >
                        列算式
                      </button>
                    )}

                    {/* "随机算式" Button (Appears under "列算式" when Page 3 unlocks) */}
                    {isRandomEquationButtonAvailable && (
                      <button
                        onClick={handleToggleRandomEquation}
                        className={`px-4 sm:px-5 py-2 rounded-xl text-sm sm:text-base font-bold cursor-pointer transition-all active:scale-95 border-2 ${
                          isRandomEquationMode
                            ? 'bg-purple-600 text-white border-purple-700 shadow-md ring-2 ring-purple-300 font-black'
                            : 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100'
                        }`}
                      >
                        随机算式
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Interactive Stage with 3D Depth Support */}
      <div className="relative flex-1 flex flex-col items-center justify-center w-full max-w-2xl pb-4 pr-8 [perspective:1200px]">
        <div className={`relative flex flex-col items-start transition-transform duration-200 ${isShakeError ? 'animate-[wiggle_0.4s_ease-in-out]' : ''}`}>
          {/* Top Column Number Indicators */}
          <div
            className={`w-[280px] sm:w-[440px] md:w-[480px] ml-7 sm:ml-9 mb-1.5 grid grid-cols-10 transition-all duration-200 ${
              showNumbers ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {Array.from({ length: 10 }).map((_, c) => {
              const colNum = c + 1;
              const isColActive = colNum <= currentColCount;
              const isBouncing = bouncingCols && isColActive;
              return (
                <button
                  key={`col-head-${colNum}`}
                  onClick={() => handleColClick(colNum)}
                  className={`w-full h-6 sm:h-7 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center transition-all cursor-pointer ${
                    isBouncing ? 'animate-gentle-bounce-y ring-3 ring-sky-400 bg-sky-400 text-white shadow-md' : ''
                  } ${
                    page !== 1
                      ? isColActive
                        ? 'bg-sky-500 text-white shadow-xs font-black'
                        : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50'
                      : 'text-neutral-500 font-semibold'
                  }`}
                >
                  {colNum}
                </button>
              );
            })}
          </div>

          <div className="flex items-start">
            {/* Left Row Number Indicators */}
            <div
              className={`h-[280px] sm:h-[440px] md:h-[480px] w-6 sm:w-8 mr-1.5 grid grid-rows-10 transition-all duration-200 ${
                showNumbers ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {Array.from({ length: 10 }).map((_, r) => {
                const rowNum = r + 1;
                const isRowActive = rowNum <= currentRowCount;
                const isBouncing = bouncingRows && isRowActive;
                return (
                  <button
                    key={`row-head-${rowNum}`}
                    onClick={() => handleRowClick(rowNum)}
                    className={`w-full h-full rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center transition-all cursor-pointer ${
                      isBouncing ? 'animate-gentle-bounce-x ring-3 ring-amber-400 bg-amber-400 text-white shadow-md' : ''
                    } ${
                      page !== 1
                        ? isRowActive
                          ? 'bg-amber-500 text-white shadow-xs font-black'
                          : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50'
                        : 'text-neutral-500 font-semibold'
                    }`}
                  >
                    {rowNum}
                  </button>
                );
              })}
            </div>

            {/* Board Frame & Stacking Container */}
            <div className="relative">
              {/* Stacked Background Card 1 (When step >= 2: scaled down into page depth with 3D stacking visual effect) */}
              {isRandomEquationMode && firstSolved && challengeStep >= 2 && (
                <div
                  style={{
                    transform: 'translate3d(18px, -28px, -80px) scale(0.88)',
                    transformOrigin: 'top center',
                  }}
                  className="absolute inset-0 bg-[#FFF6D6] rounded-2xl border-3 border-[#D6C495] shadow-2xl opacity-75 z-0 pointer-events-none grid grid-cols-10 grid-rows-10 overflow-hidden transition-all duration-700"
                >
                  {/* Dots on Stacked Card 1 */}
                  {Array.from({ length: 10 }).map((_, r) =>
                    Array.from({ length: 10 }).map((_, c) => (
                      <div
                        key={`stacked-dot-${r}-${c}`}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 bg-[#111827] rounded-full opacity-90" />
                      </div>
                    ))
                  )}

                  {/* Mask for First Solved Orientation */}
                  <div
                    style={{ top: `${(firstSolved.rows / 10) * 100}%`, bottom: 0 }}
                    className="absolute left-0 right-0 bg-white border-t-2 border-neutral-300"
                  />
                  <div
                    style={{ left: `${(firstSolved.cols / 10) * 100}%`, right: 0, top: 0, bottom: 0 }}
                    className="absolute bg-white border-l-2 border-neutral-300"
                  />
                </div>
              )}

              {/* Front Active Dot Board */}
              <div
                ref={boardRef}
                className="relative z-10 w-[280px] sm:w-[440px] md:w-[480px] h-[280px] sm:h-[440px] md:h-[480px] bg-[#FFF6D6] rounded-2xl border-3 border-[#E8DCB8] shadow-sm grid grid-cols-10 grid-rows-10"
              >
                {/* 100 Crisp Solid Black Dots */}
                {Array.from({ length: 10 }).map((_, r) =>
                  Array.from({ length: 10 }).map((_, c) => (
                    <div
                      key={`dot-${r}-${c}`}
                      className="w-full h-full flex items-center justify-center pointer-events-none"
                    >
                      <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 bg-[#111827] rounded-full shadow-[0_1px_1px_rgba(0,0,0,0.2)]" />
                    </div>
                  ))
                )}

                {/* Bright Gold Framing Masks for "竖着看" (Column-by-column framing) */}
                {page !== 1 && viewMode === 'col' && (
                  <div className="absolute inset-0 pointer-events-none z-10">
                    {Array.from({ length: currentColCount }).map((_, c) => (
                      <div
                        key={`col-frame-${c}`}
                        style={{
                          left: `${c * 10}%`,
                          width: '10%',
                          top: 0,
                          height: `${bottomPaperTopPercent}%`,
                          transition: isDraggingRow ? 'none' : 'height 0.45s cubic-bezier(0.2, 0.8, 0.25, 1)',
                        }}
                        className="absolute flex items-center justify-center p-0.5 sm:p-1"
                      >
                        <div className="w-full h-full bg-transparent border-[2.5px] sm:border-[3px] border-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.55),inset_0_0_8px_rgba(254,240,138,0.3)] ring-1 ring-[#FCD34D] rounded-xl sm:rounded-2xl transition-all" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Bright Gold Framing Masks for "横着看" (Row-by-row framing) */}
                {page !== 1 && viewMode === 'row' && (
                  <div className="absolute inset-0 pointer-events-none z-10">
                    {Array.from({ length: currentRowCount }).map((_, r) => (
                      <div
                        key={`row-frame-${r}`}
                        style={{
                          top: `${r * 10}%`,
                          height: '10%',
                          left: 0,
                          width: `${rightPaperLeftPercent}%`,
                          transition: isDraggingCol ? 'none' : 'width 0.45s cubic-bezier(0.2, 0.8, 0.25, 1)',
                        }}
                        className="absolute flex items-center justify-center p-0.5 sm:p-1"
                      >
                        <div className="w-full h-full bg-transparent border-[2.5px] sm:border-[3px] border-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.55),inset_0_0_8px_rgba(254,240,138,0.3)] ring-1 ring-[#FCD34D] rounded-xl sm:rounded-2xl transition-all" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom White Paper */}
                {page !== 1 && (
                  <div
                    onPointerDown={handleRowPointerDown}
                    onPointerMove={handleRowPointerMove}
                    onPointerUp={handleRowPointerUp}
                    onPointerCancel={handleRowPointerUp}
                    style={{
                      top: `${bottomPaperTopPercent}%`,
                      bottom: 0,
                      transition: isDraggingRow
                        ? 'none'
                        : isAutoAnimating
                        ? 'top 0.55s cubic-bezier(0.25, 1, 0.4, 1), box-shadow 0.3s, transform 0.3s'
                        : 'top 0.35s cubic-bezier(0.2, 0.8, 0.25, 1), box-shadow 0.25s, transform 0.25s',
                    }}
                    className={`absolute left-0 right-0 bg-white border-t-2 border-neutral-300/90 rounded-b-2xl cursor-grab active:cursor-grabbing select-none ${
                      isDraggingRow || isAutoAnimating
                        ? 'z-40 scale-[1.015] shadow-[0_-22px_45px_rgba(0,0,0,0.36),0_15px_30px_rgba(0,0,0,0.22)] ring-2 ring-amber-400/60'
                        : 'z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.1)]'
                    }`}
                  >
                    {/* Integrated Pull Tab / Handle at Top Edge of Bottom Paper */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-auto">
                      <div
                        className={`px-6 sm:px-8 py-1 sm:py-1.5 rounded-b-xl border-x-2 border-b-2 flex items-center justify-center gap-2 cursor-grab active:cursor-grabbing transition-all ${
                          isDraggingRow || isAutoAnimating
                            ? 'bg-amber-50 border-amber-400 shadow-md'
                            : 'bg-white border-neutral-300 shadow-sm hover:bg-neutral-50'
                        }`}
                      >
                        <span className="text-neutral-600 font-black text-sm sm:text-base leading-none">
                          ↕
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <div className="w-5 sm:w-6 h-0.5 bg-neutral-400 rounded-full" />
                          <div className="w-5 sm:w-6 h-0.5 bg-neutral-400 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Right White Paper */}
                {page !== 1 && (
                  <div
                    onPointerDown={handleColPointerDown}
                    onPointerMove={handleColPointerMove}
                    onPointerUp={handleColPointerUp}
                    onPointerCancel={handleColPointerUp}
                    style={{
                      left: `${rightPaperLeftPercent}%`,
                      right: 0,
                      top: 0,
                      bottom: 0,
                      transition: isDraggingCol
                        ? 'none'
                        : isAutoAnimating
                        ? 'left 0.55s cubic-bezier(0.25, 1, 0.4, 1), box-shadow 0.3s, transform 0.3s'
                        : 'left 0.35s cubic-bezier(0.2, 0.8, 0.25, 1), box-shadow 0.25s, transform 0.25s',
                    }}
                    className={`absolute bg-white border-l-2 border-neutral-300/90 rounded-r-2xl cursor-grab active:cursor-grabbing select-none ${
                      isDraggingCol || isAutoAnimating
                        ? 'z-40 scale-[1.015] shadow-[-22px_0_45px_rgba(0,0,0,0.36),15px_0_30px_rgba(0,0,0,0.22)] ring-2 ring-sky-400/60'
                        : 'z-30 shadow-[-5px_0_15px_rgba(0,0,0,0.1)]'
                    }`}
                  >
                    {/* Integrated Pull Tab / Handle at Left Edge of Right Paper */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-auto">
                      <div
                        className={`py-6 sm:py-8 px-1 sm:px-1.5 rounded-r-xl border-y-2 border-r-2 flex flex-col items-center justify-center gap-2 cursor-grab active:cursor-grabbing transition-all ${
                          isDraggingCol || isAutoAnimating
                            ? 'bg-sky-50 border-sky-400 shadow-md'
                            : 'bg-white border-neutral-300 shadow-sm hover:bg-neutral-50'
                        }`}
                      >
                        <span className="text-neutral-600 font-black text-sm sm:text-base leading-none">
                          ↔
                        </span>
                        <div className="flex gap-0.5">
                          <div className="h-5 sm:h-6 w-0.5 bg-neutral-400 rounded-full" />
                          <div className="h-5 sm:h-6 w-0.5 bg-neutral-400 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* "确定" Action Button Below the Dot Board in "随机算式" Mode */}
        {isRandomEquationMode && (
          <div className="mt-4 flex items-center justify-center">
            <button
              onClick={handleConfirmChallenge}
              className={`px-8 sm:px-12 py-2.5 sm:py-3.5 rounded-2xl text-lg sm:text-xl font-black shadow-lg cursor-pointer transition-all active:scale-95 flex items-center gap-2 ${
                challengeFeedback === 'all_correct'
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 ring-3 ring-emerald-300'
                  : 'bg-amber-400 text-amber-950 hover:bg-amber-300 ring-3 ring-amber-300'
              }`}
            >
              <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
              <span>{challengeStep === 3 ? '下一题' : '确定'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom-Right "NEXT（10）" Button / Countdown Tracker */}
      {(page === 2 || page === 3) && !isRandomEquationMode && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40">
          <button
            onClick={handleRandomQuestion}
            disabled={isAutoAnimating}
            className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-base sm:text-lg font-black bg-white text-neutral-800 hover:bg-neutral-50 border-2 border-neutral-300 shadow-lg cursor-pointer transition-all active:scale-95 disabled:opacity-60"
          >
            <span>NEXT（{nextCount}）</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
          </button>
        </div>
      )}
    </div>
  );
}
