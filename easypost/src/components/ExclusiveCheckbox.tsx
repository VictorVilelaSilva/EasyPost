import { ReactNode } from "react";

type ExclusiveCheckboxProps = {
  label: string;
  value: string;
  selectedValue: string;
  onChange: (value: string) => void;
  icon?: ReactNode;
  description?: string;

  layout?: "default" | "card";
  className?: string;
};

export default function ExclusiveCheckbox({
  label,
  value,
  selectedValue,
  onChange,
  icon,
  description,
  layout = "default",
  className = "",
}: ExclusiveCheckboxProps) {
  const checked = selectedValue === value;

  return (
    <label className={`cursor-pointer w-full ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onChange(value)}
        className="hidden"
      />

      {layout === "card" ? (
        <div
          className={`
            w-full
            rounded-2xl
            border
            p-6
            transition-all
            duration-300
            flex
            flex-col
            items-center
            text-center
            gap-3
            ${
              checked
                ? "bg-purple-900/40 border-purple-500 shadow-[0_0_0_1px_rgba(168,85,247,0.5)]"
                : "bg-gray-900/40 border-white/10 hover:border-purple-400/40"
            }
          `}
        >
          {icon && (
            <div
              className={`
                w-12 h-12
                flex items-center justify-center
                rounded-full
                ${
                  checked
                    ? "bg-purple-600/30 text-purple-400"
                    : "bg-gray-800 text-gray-400"
                }
              `}
            >
              {icon}
            </div>
          )}

          <div>
            <p
              className={`font-semibold text-base ${
                checked ? "text-white" : "text-gray-200"
              }`}
            >
              {label}
            </p>

            {description && (
              <p className="text-sm text-gray-400 mt-1">{description}</p>
            )}
          </div>
        </div>
      ) : (
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
      )}
    </label>
  );
}
