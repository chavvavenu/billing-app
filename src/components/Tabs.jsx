import React from "react";

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={[
        "px-3 py-2 rounded-xl text-sm font-medium border",
        active
          ? "bg-black text-white border-black"
          : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function Tabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex gap-2 mt-4">
      <TabButton active={activeTab === "bills"} onClick={() => setActiveTab("bills")}>
        Daily Bills + Invoices
      </TabButton>
      <TabButton active={activeTab === "expenses"} onClick={() => setActiveTab("expenses")}>
        Daily Expense Sheet
      </TabButton>
      <TabButton active={activeTab === "domain"} onClick={() => setActiveTab("domain")}>
        Purchase Domain URL
      </TabButton>
    </div>
  );
}
