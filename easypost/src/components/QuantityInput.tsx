"use client";

import { useState } from "react";

interface QuantityInputProps {
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
}

export default function QuantityInput({
  min = 1,
  max = 15,
  step = 1,
  defaultValue = 5,
  onChange,
}: QuantityInputProps) {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (newValue: number) => {
    if (newValue < min || newValue > max) return;
    setValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div
      className="
      w-full
      flex items-center
      justify-between
      bg-gradient-to-r from-purple-900/30 to-indigo-900/20
      border border-purple-500/40
      rounded-2xl
      h-16
      px-6
      backdrop-blur
      transition
      focus-within:border-purple-400
    "
    >
      <button
        type="button"
        onClick={() => handleChange(value - step)}
        className="
        text-purple-400
        text-xl
        font-semibold
        hover:text-white
        transition
      "
      >
        −
      </button>

      <input
        type="number"
        value={value}
        onChange={(e) => handleChange(Number(e.target.value))}
        className="
        w-16
        text-center
        bg-transparent
        text-white
        text-xl
        font-semibold
        outline-none
        appearance-none
      "
      />

      <button
        type="button"
        onClick={() => handleChange(value + step)}
        className="
        text-purple-400
        text-xl
        font-semibold
        hover:text-white
        transition
      "
      >
        +
      </button>
    </div>
  );
}
