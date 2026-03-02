type TextInputProps = {
  label?: string;
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function TextInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: TextInputProps) {
  return (
    <div className="flex flex-row gap-1">
      {label && <label className="text-sm text-gray-300 mt-5">{label}</label>}

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
            bg-gray-800
            border border-white/10
            rounded-lg
            px-3 py-2
            text-sm text-white
            outline-none
            focus:ring-2 focus:ring-indigo-500
          "
      />
    </div>
  );
}
