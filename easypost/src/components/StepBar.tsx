"use client";

import React from "react";

interface StepBarProps {
  currentStep: number; // 1 até 4
}

const TOTAL_STEPS = 4;

export default function StepBar({ currentStep }: StepBarProps) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-white text-2xl font-semibold">
          Configurações do conteúdo
        </h1>

        <span className="text-xs font-medium px-3 py-1 rounded-full bg-purple-600 text-white tracking-wider">
          PASSO {currentStep} DE {TOTAL_STEPS}
        </span>
      </div>

      {/* Steps Segmentados */}
      <div className="flex gap-3">
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber <= currentStep;

          return (
            <div
              key={index}
              className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                isActive
                  ? "bg-gradient-to-r from-purple-500 to-fuchsia-500"
                  : "bg-gray-800"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
