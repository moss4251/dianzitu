/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Printer, RefreshCw, Layers, FileText } from 'lucide-react';
import { playClickSound, playSnapSound } from './AudioEffects';

interface FrontQuestion {
  id: number;
  rows: number;
  cols: number;
}

interface BackQuestion {
  id: number;
  rows: number;
  cols: number;
}

function generateRandomFrontQuestions(): FrontQuestion[] {
  const pairs: [number, number][] = [];
  while (pairs.length < 4) {
    const r = Math.floor(Math.random() * 8) + 2; // 2..9
    let c = Math.floor(Math.random() * 8) + 2; // 2..9
    while (c === r) {
      c = Math.floor(Math.random() * 8) + 2;
    }
    // Avoid duplicate pairs
    if (!pairs.some(([pr, pc]) => (pr === r && pc === c) || (pr === c && pc === r))) {
      pairs.push([r, c]);
    }
  }
  return pairs.map(([rows, cols], idx) => ({ id: idx + 1, rows, cols }));
}

function generateRandomBackQuestions(): BackQuestion[] {
  const pairs: [number, number][] = [];
  while (pairs.length < 4) {
    const r = Math.floor(Math.random() * 8) + 2;
    let c = Math.floor(Math.random() * 8) + 2;
    while (c === r) {
      c = Math.floor(Math.random() * 8) + 2;
    }
    if (!pairs.some(([pr, pc]) => (pr === r && pc === c) || (pr === c && pc === r))) {
      pairs.push([r, c]);
    }
  }
  return pairs.map(([rows, cols], idx) => ({ id: idx + 1, rows, cols }));
}

export default function PrintWorksheet() {
  const [printOption, setPrintOption] = useState<'both' | 'front' | 'back'>('both');
  const [frontQuestions, setFrontQuestions] = useState<FrontQuestion[]>(generateRandomFrontQuestions());
  const [backQuestions, setBackQuestions] = useState<BackQuestion[]>(generateRandomBackQuestions());

  const handleRefreshQuestions = () => {
    playSnapSound();
    setFrontQuestions(generateRandomFrontQuestions());
    setBackQuestions(generateRandomBackQuestions());
  };

  const handlePrint = () => {
    playClickSound();
    window.print();
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Interactive Toolbar (Hidden during printing) */}
      <div className="no-print w-full max-w-4xl bg-white border border-neutral-200 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-neutral-600 mr-1">选择页面：</span>
          <button
            onClick={() => {
              playClickSound();
              setPrintOption('both');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all ${
              printOption === 'both'
                ? 'bg-amber-400 text-amber-950 font-black shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>双面（共2页）</span>
          </button>
          <button
            onClick={() => {
              playClickSound();
              setPrintOption('front');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all ${
              printOption === 'front'
                ? 'bg-amber-400 text-amber-950 font-black shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>仅正面（第1页）</span>
          </button>
          <button
            onClick={() => {
              playClickSound();
              setPrintOption('back');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all ${
              printOption === 'back'
                ? 'bg-amber-400 text-amber-950 font-black shadow-xs'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>仅反面（第2页）</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center px-3 py-1.5 rounded-xl bg-amber-50 text-amber-950 border border-amber-300 text-xs font-bold">
            📄 标准 A4 纸张 (210mm × 297mm)
          </span>
          <button
            onClick={handleRefreshQuestions}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-white text-neutral-800 hover:bg-neutral-50 border border-neutral-300 shadow-xs cursor-pointer transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4 text-amber-600" />
            <span>换一组题</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm sm:text-base font-black bg-amber-500 hover:bg-amber-600 text-white shadow-md cursor-pointer transition-all active:scale-95 ring-2 ring-amber-300"
          >
            <Printer className="w-4 h-4" />
            <span>立即打印</span>
          </button>
        </div>
      </div>

      {/* Printable A4 Sheets Container */}
      <div className="w-full flex flex-col items-center gap-8 print:gap-0">
        {/* PAGE 1 (Front: 点子图 -> 算式与表达方法) */}
        {(printOption === 'both' || printOption === 'front') && (
          <div className="print-sheet w-full max-w-[794px] min-h-[1050px] bg-white border border-neutral-300 shadow-xl p-6 sm:p-8 text-black font-sans box-border flex flex-col justify-between">
            {/* Sheet Header */}
            <div>
              <div className="text-center pb-2 border-b-2 border-black">
                <h1 className="text-2xl sm:text-3xl font-black tracking-widest">小学二年级数学·乘法点子图练习纸</h1>
                <p className="text-xs sm:text-sm font-bold text-neutral-600 mt-1">（正面：根据点子图写算式与表达方法 · A4标准版）</p>
              </div>

              {/* Student Info Fields */}
              <div className="flex items-center justify-between text-sm sm:text-base font-bold py-2.5 border-b border-neutral-300 mb-3">
                <span>班级：_______________</span>
                <span>姓名：_______________</span>
                <span>日期：_______________</span>
                <span>得分：_______ / 100</span>
              </div>
            </div>

            {/* Questions Grid (4 Questions, 2x2 layout, spacious for Grade 2 students) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 flex-1 py-1">
              {frontQuestions.map((q) => (
                <div key={`front-q-${q.id}`} className="print-question-card border-2 border-neutral-800 rounded-2xl p-3.5 flex flex-col justify-between bg-white">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5 mb-1.5">
                    <span className="font-black text-base">第 {q.id} 题</span>
                    <span className="text-xs text-neutral-500 font-semibold">观察圈出的点子</span>
                  </div>

                  {/* 10x10 Dot Array with highlighted area */}
                  <div className="flex justify-center my-1.5">
                    <div className="relative w-[155px] h-[155px] bg-[#FFFBEB] border border-neutral-400 rounded-xl grid grid-cols-10 grid-rows-10 p-1">
                      {Array.from({ length: 10 }).map((_, r) =>
                        Array.from({ length: 10 }).map((_, c) => {
                          const isInSelected = r < q.rows && c < q.cols;
                          return (
                            <div key={`fdot-${q.id}-${r}-${c}`} className="w-full h-full flex items-center justify-center">
                              <div
                                className={`rounded-full ${
                                  isInSelected
                                    ? 'w-2 h-2 bg-black'
                                    : 'w-1.5 h-1.5 bg-neutral-300'
                                }`}
                              />
                            </div>
                          );
                        })
                      )}
                      {/* Highlight Border around target dots */}
                      <div
                        style={{
                          left: '4px',
                          top: '4px',
                          width: `calc(${q.cols * 10}% - 4px)`,
                          height: `calc(${q.rows * 10}% - 4px)`,
                        }}
                        className="absolute border-2 border-black rounded-lg pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Fill in the blanks */}
                  <div className="space-y-1.5 text-xs sm:text-sm font-bold pt-2 border-t border-neutral-200">
                    <div>
                      <span>横着看：每行( </span>
                      <span className="inline-block w-8 border-b-2 border-black text-center">&nbsp;</span>
                      <span> )个，有( </span>
                      <span className="inline-block w-8 border-b-2 border-black text-center">&nbsp;</span>
                      <span> )行。</span>
                    </div>
                    <div>
                      <span>竖着看：每列( </span>
                      <span className="inline-block w-8 border-b-2 border-black text-center">&nbsp;</span>
                      <span> )个，有( </span>
                      <span className="inline-block w-8 border-b-2 border-black text-center">&nbsp;</span>
                      <span> )列。</span>
                    </div>
                    <div>
                      <span>表达方法：( </span>
                      <span className="inline-block w-8 border-b-2 border-black text-center">&nbsp;</span>
                      <span> )行( </span>
                      <span className="inline-block w-8 border-b-2 border-black text-center">&nbsp;</span>
                      <span> )列。</span>
                    </div>
                    <div className="pt-1">
                      <span>乘法算式：</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-base font-black">
                      <span>(</span>
                      <span className="inline-block w-7 border-b-2 border-black text-center">&nbsp;</span>
                      <span>) × (</span>
                      <span className="inline-block w-7 border-b-2 border-black text-center">&nbsp;</span>
                      <span>) = (</span>
                      <span className="inline-block w-8 border-b-2 border-black text-center">&nbsp;</span>
                      <span>)</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-base font-black">
                      <span>(</span>
                      <span className="inline-block w-7 border-b-2 border-black text-center">&nbsp;</span>
                      <span>) × (</span>
                      <span className="inline-block w-7 border-b-2 border-black text-center">&nbsp;</span>
                      <span>) = (</span>
                      <span className="inline-block w-8 border-b-2 border-black text-center">&nbsp;</span>
                      <span>)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="text-center pt-2 border-t border-neutral-300 text-xs text-neutral-500">
              第 1 页（共 2 页）· 认真观察每一行每一列，正确列出两个互换乘法算式。
            </div>
          </div>
        )}

        {/* PAGE 2 (Back: 算式 / 表达方法 -> 画/圈点子图) */}
        {(printOption === 'both' || printOption === 'back') && (
          <div className="print-sheet w-full max-w-[794px] min-h-[1050px] bg-white border border-neutral-300 shadow-xl p-6 sm:p-8 text-black font-sans box-border flex flex-col justify-between">
            {/* Sheet Header */}
            <div>
              <div className="text-center pb-2 border-b-2 border-black">
                <h1 className="text-2xl sm:text-3xl font-black tracking-widest">小学二年级数学·乘法点子图练习纸</h1>
                <p className="text-xs sm:text-sm font-bold text-neutral-600 mt-1">（反面：根据算式圈出点子图与表达方法 · A4标准版）</p>
              </div>

              {/* Student Info Fields */}
              <div className="flex items-center justify-between text-sm sm:text-base font-bold py-2.5 border-b border-neutral-300 mb-3">
                <span>班级：_______________</span>
                <span>姓名：_______________</span>
                <span>日期：_______________</span>
                <span>得分：_______ / 100</span>
              </div>
            </div>

            {/* Questions Grid (4 Questions, 2x2 layout) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 flex-1 py-1">
              {backQuestions.map((q) => {
                const product = q.rows * q.cols;
                return (
                  <div key={`back-q-${q.id}`} className="print-question-card border-2 border-neutral-800 rounded-2xl p-3.5 flex flex-col justify-between bg-white">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5 mb-1.5">
                      <span className="font-black text-base">第 {q.id} 题</span>
                      <span className="text-sm font-black font-mono bg-neutral-100 px-2.5 py-0.5 rounded-lg border border-neutral-300">
                        {q.rows} × {q.cols} = {product}
                      </span>
                    </div>

                    {/* Instruction & Blank Dot Array */}
                    <div className="text-xs font-bold text-neutral-700">
                      请用铅笔在点子图上用线框圈出对应的点子阵列：
                    </div>

                    {/* 10x10 Blank Dot Array for Student to circle */}
                    <div className="flex justify-center my-1.5">
                      <div className="w-[155px] h-[155px] bg-white border-2 border-neutral-400 rounded-xl grid grid-cols-10 grid-rows-10 p-1">
                        {Array.from({ length: 10 }).map((_, r) =>
                          Array.from({ length: 10 }).map((_, c) => (
                            <div key={`bdot-${q.id}-${r}-${c}`} className="w-full h-full flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-neutral-800 rounded-full" />
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Expressions & Commutative Equation Blanks */}
                    <div className="space-y-1.5 text-xs sm:text-sm font-bold pt-2 border-t border-neutral-200">
                      <div>
                        <span>表达方法：可圈( </span>
                        <span className="inline-block w-7 border-b-2 border-black text-center">&nbsp;</span>
                        <span> )行( </span>
                        <span className="inline-block w-7 border-b-2 border-black text-center">&nbsp;</span>
                        <span> )列，或( </span>
                        <span className="inline-block w-7 border-b-2 border-black text-center">&nbsp;</span>
                        <span> )行( </span>
                        <span className="inline-block w-7 border-b-2 border-black text-center">&nbsp;</span>
                        <span> )列。</span>
                      </div>
                      <div>
                        <span>表示( </span>
                        <span className="inline-block w-7 border-b-2 border-black text-center">&nbsp;</span>
                        <span> )个( </span>
                        <span className="inline-block w-7 border-b-2 border-black text-center">&nbsp;</span>
                        <span> )相加，也可以表示( </span>
                        <span className="inline-block w-7 border-b-2 border-black text-center">&nbsp;</span>
                        <span> )个( </span>
                        <span className="inline-block w-7 border-b-2 border-black text-center">&nbsp;</span>
                        <span> )相加。</span>
                      </div>
                      <div className="pt-0.5">
                        <span>写出另一个乘法算式：</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-base font-black">
                        <span>(</span>
                        <span className="inline-block w-7 border-b-2 border-black text-center">&nbsp;</span>
                        <span>) × (</span>
                        <span className="inline-block w-7 border-b-2 border-black text-center">&nbsp;</span>
                        <span>) = (</span>
                        <span className="inline-block w-8 border-b-2 border-black text-center">&nbsp;</span>
                        <span>)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="text-center pt-2 border-t border-neutral-300 text-xs text-neutral-500">
              第 2 页（共 2 页）· 结合算式在点子图上圈一圈，理解乘法的意义。
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
