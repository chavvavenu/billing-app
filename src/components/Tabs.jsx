import React from "react";

function Tab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={[
        "px-4 py-2 rounded-full text-sm font-semibold transition",
        active
          ? "bg-gray-900 text-white shadow"
          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function Tabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Tab active={activeTab === "bills"} onClick={() => setActiveTab("bills")}>
        Bills
      </Tab>
      <Tab active={activeTab === "expenses"} onClick={() => setActiveTab("expenses")}>
        Expenses
      </Tab>
      <Tab active={activeTab === "domain"} onClick={() => setActiveTab("domain")}>
        Domain
      </Tab>
    </div>
  );
}
