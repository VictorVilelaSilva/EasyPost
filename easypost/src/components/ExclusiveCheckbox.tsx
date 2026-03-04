import { ReactNode } from "react";

type ExclusiveCheckboxProps = {
  label: string;
  value: string;
  selectedValue: string;
  onChange: (value: string) => void;
  icon?: ReactNode;
};

export default function ExclusiveCheckbox({
  label,
  value,
  selectedValue,
  onChange,
  icon,
}: ExclusiveCheckboxProps) {
  const checked = selectedValue === value;

  return (
    <label className="cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onChange(value)}
        className="hidden"
      />

      <div
        className={`
          flex items-center gap-2
          px-4 py-2
          rounded-lg
          border
          text-sm
          transition
          ${
            checked
              ? "bg-indigo-500 border-indigo-500 text-white"
              : "bg-gray-800 border-white/10 text-gray-300 hover:bg-white/5"
          }
        `}
      >
        {icon && <span className="text-base">{icon}</span>}
        {label}
      </div>
    </label>
  );
}
