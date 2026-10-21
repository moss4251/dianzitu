/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { speakChineseText } from './AudioEffects';

export default function StudentCharacters() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechText = '我们来玩点子图游戏吧，来判断一下有多少个点子，也来看看有什么乘法算式。';

  const handleSpeak = () => {
    setIsSpeaking(true);
    speakChineseText(speechText);
    setTimeout(() => {
      setIsSpeaking(false);
    }, 4800);
  };

  return (
    <div
      onClick={handleSpeak}
      className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-3xl bg-white/95 backdrop-blur-xs border-2 border-amber-300 shadow-md hover:shadow-lg transition-all cursor-pointer select-none group max-w-[280px] sm:max-w-[340px]"
    >
      {/* Speech Bubble */}
      <div className={`relative px-4 py-3 bg-amber-50 rounded-2xl border-2 border-amber-300 text-amber-950 shadow-sm transition-transform duration-200 ${isSpeaking ? 'scale-105 ring-2 ring-amber-400' : 'group-hover:scale-102'}`}>
        <p className="text-sm sm:text-base font-black leading-snug tracking-wide text-neutral-800">
          “我们来玩点子图游戏吧，来判断一下有多少个点子，也来看看有什么乘法算式。”
        </p>
        <div className="flex items-center justify-end gap-1 mt-1 text-xs font-bold text-amber-700">
          <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-pulse text-amber-600' : ''}`} />
        </div>
        {/* Speech Bubble Downward Notch */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-amber-50 border-b-2 border-r-2 border-amber-300 rotate-45" />
      </div>

      {/* Cute Elementary School Boy & Girl Characters */}
      <div className="flex items-center justify-center gap-4 pt-1">
        {/* Boy Character */}
        <div className={`flex flex-col items-center transition-transform duration-300 ${isSpeaking ? 'animate-bounce' : 'group-hover:-translate-y-1'}`}>
          <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 100 100" fill="none">
            {/* Hair Back */}
            <path d="M25 45 C20 30 35 12 50 12 C65 12 80 30 75 45 Z" fill="#292524" />
            {/* Face */}
            <ellipse cx="50" cy="52" rx="28" ry="26" fill="#FDE68A" />
            {/* Ears */}
            <circle cx="21" cy="52" r="7" fill="#FDE68A" />
            <circle cx="79" cy="52" r="7" fill="#FDE68A" />
            {/* Hair Front Bangs */}
            <path d="M25 40 Q35 25 50 25 Q65 25 75 40 Q62 30 50 33 Q38 30 25 40 Z" fill="#292524" />
            {/* Blushing Cheeks */}
            <ellipse cx="32" cy="56" rx="4" ry="2.5" fill="#FCA5A5" opacity="0.7" />
            <ellipse cx="68" cy="56" rx="4" ry="2.5" fill="#FCA5A5" opacity="0.7" />
            {/* Eyes */}
            <circle cx="37" cy="48" r="4.5" fill="#1C1917" />
            <circle cx="38.5" cy="46.5" r="1.5" fill="#FFFFFF" />
            <circle cx="63" cy="48" r="4.5" fill="#1C1917" />
            <circle cx="64.5" cy="46.5" r="1.5" fill="#FFFFFF" />
            {/* Happy Smile */}
            <path d="M43 58 Q50 67 57 58" stroke="#1C1917" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Shirt / Collar */}
            <path d="M30 77 Q50 82 70 77 L76 96 Q50 100 24 96 Z" fill="#38BDF8" />
            <path d="M42 77 L50 87 L58 77 Z" fill="#FFFFFF" />
          </svg>
        </div>

        {/* Girl Character */}
        <div className={`flex flex-col items-center transition-transform duration-300 delay-75 ${isSpeaking ? 'animate-bounce' : 'group-hover:-translate-y-1'}`}>
          <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 100 100" fill="none">
            {/* Pigtails / Ribbons */}
            <path d="M12 44 Q5 32 18 28 Q24 35 20 48 Z" fill="#292524" />
            <path d="M88 44 Q95 32 82 28 Q76 35 80 48 Z" fill="#292524" />
            <circle cx="18" cy="38" r="4" fill="#F43F5E" />
            <circle cx="82" cy="38" r="4" fill="#F43F5E" />
            {/* Hair Back */}
            <path d="M24 45 C18 28 35 12 50 12 C65 12 82 28 76 45 Z" fill="#292524" />
            {/* Face */}
            <ellipse cx="50" cy="52" rx="28" ry="26" fill="#FDE68A" />
            {/* Ears */}
            <circle cx="21" cy="52" r="7" fill="#FDE68A" />
            <circle cx="79" cy="52" r="7" fill="#FDE68A" />
            {/* Bangs */}
            <path d="M23 42 Q36 28 50 28 Q64 28 77 42 Q65 32 50 33 Q35 32 23 42 Z" fill="#292524" />
            {/* Blushing Cheeks */}
            <ellipse cx="32" cy="56" rx="4.5" ry="3" fill="#FCA5A5" opacity="0.8" />
            <ellipse cx="68" cy="56" rx="4.5" ry="3" fill="#FCA5A5" opacity="0.8" />
            {/* Eyes */}
            <circle cx="37" cy="48" r="4.5" fill="#1C1917" />
            <circle cx="38.5" cy="46.5" r="1.5" fill="#FFFFFF" />
            <circle cx="63" cy="48" r="4.5" fill="#1C1917" />
            <circle cx="64.5" cy="46.5" r="1.5" fill="#FFFFFF" />
            {/* Cheerful Open Smile */}
            <path d="M42 57 Q50 68 58 57 Z" fill="#F43F5E" stroke="#1C1917" strokeWidth="1.5" />
            {/* Dress / Collar */}
            <path d="M29 77 Q50 82 71 77 L78 96 Q50 100 22 96 Z" fill="#FB7185" />
            <ellipse cx="50" cy="80" rx="9" ry="4" fill="#FFFFFF" />
          </svg>
        </div>
      </div>
    </div>
  );
}
