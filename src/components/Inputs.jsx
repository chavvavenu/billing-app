import React from "react";

export function TextInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-gray-600 mb-1">{label}</div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
      />
    </label>
  );
}

export function SelectInput({ label, value, onChange, options }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-gray-600 mb-1">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 bg-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SmallButton({ children, onClick, variant = "default" }) {
  const cls =
    variant === "danger"
      ? "border-red-200 hover:bg-red-50 text-red-700"
      : variant === "primary"
      ? "border-black bg-black text-white hover:opacity-90"
      : "border-gray-200 hover:bg-gray-50 text-gray-800";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm font-medium border ${cls}`}
    >
      {children}
    </button>
  );
}
