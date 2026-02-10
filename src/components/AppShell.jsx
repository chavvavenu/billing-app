import React from "react";

function NavItem({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition",
        active
          ? "bg-white/10 text-white"
          : "text-white/80 hover:text-white hover:bg-white/10",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-4">
      <div className="text-xs font-semibold text-gray-500">{label}</div>
      <div className="text-2xl font-bold mt-1 text-gray-900">{value}</div>
      {sub ? <div className="text-xs text-gray-500 mt-1">{sub}</div> : null}
    </div>
  );
}

export function Badge({ tone = "gray", children }) {
  const tones = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export default function AppShell({
  companyName = "KSP POLYMERS",
  activeTab,
  setActiveTab,
  children,
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col bg-gray-900 text-white p-4">
          <div className="rounded-2xl bg-white/10 p-4">
            <div className="text-lg font-bold">{companyName}</div>
            <div className="text-xs text-white/70 mt-1">Billing & Invoice System</div>
          </div>

          <div className="mt-4 space-y-2">
            <NavItem active={activeTab === "bills"} onClick={() => setActiveTab("bills")}>
              🧾 Bills
            </NavItem>
            <NavItem active={activeTab === "expenses"} onClick={() => setActiveTab("expenses")}>
              💸 Expenses
            </NavItem>
            <NavItem active={activeTab === "domain"} onClick={() => setActiveTab("domain")}>
              🌐 Domain
            </NavItem>
          </div>

          <div className="mt-auto pt-4 text-xs text-white/60">
            Tip: Use “PDF Invoice” for Tax Invoice.
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Top bar */}
          <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
            <div className="px-4 md:px-8 py-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Dashboard</div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  {activeTab === "bills"
                    ? "Daily Bills"
                    : activeTab === "expenses"
                    ? "Daily Expenses"
                    : "Domain Setup"}
                </h1>
              </div>

              {/* Mobile tabs */}
              <div className="md:hidden flex gap-2">
                <button
                  className={`px-3 py-2 rounded-xl text-sm font-semibold border ${
                    activeTab === "bills" ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200"
                  }`}
                  onClick={() => setActiveTab("bills")}
                >
                  Bills
                </button>
                <button
                  className={`px-3 py-2 rounded-xl text-sm font-semibold border ${
                    activeTab === "expenses" ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200"
                  }`}
                  onClick={() => setActiveTab("expenses")}
                >
                  Expenses
                </button>
                <button
                  className={`px-3 py-2 rounded-xl text-sm font-semibold border ${
                    activeTab === "domain" ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200"
                  }`}
                  onClick={() => setActiveTab("domain")}
                >
                  Domain
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 md:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
