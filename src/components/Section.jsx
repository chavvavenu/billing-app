import React from "react";

export default function Section({ title, children, right }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 md:p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h2 className="text-lg md:text-xl font-semibold">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}
