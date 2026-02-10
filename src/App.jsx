import React, { useEffect, useMemo, useState } from "react";
import Tabs from "./components/Tabs";
import Bills from "./components/Bills";
import Expenses from "./components/Expenses";
import Domain from "./components/Domain";
import { loadData, saveData } from "./utils/storage";
import { money, toNumber } from "./utils/format";

export default function App() {
  const [activeTab, setActiveTab] = useState("bills");
  const [data, setData] = useState(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  const snapshot = useMemo(() => {
    const salesAll = data.bills.reduce(
      (sum, b) => sum + toNumber(b.quantity) * toNumber(b.unitPrice),
      0
    );
    const expensesAll = data.expenses.reduce((sum, e) => sum + toNumber(e.amount), 0);
    return { salesAll, expensesAll, net: salesAll - expensesAll };
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        <header className="mb-6 md:mb-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Plastic Bottle Company – Daily Billing (₹ INR)
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Bills + Invoice columns • Daily expense sheet • Stored in browser
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
              <div className="text-xs font-semibold text-gray-600">All-time Snapshot</div>
              <div className="mt-1 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-gray-500 text-xs">Sales</div>
                  <div className="font-semibold">{money(snapshot.salesAll)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Expenses</div>
                  <div className="font-semibold">{money(snapshot.expensesAll)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Net</div>
                  <div className="font-semibold">{money(snapshot.net)}</div>
                </div>
              </div>
            </div>
          </div>

          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </header>

        {activeTab === "bills" && <Bills data={data} setData={setData} />}
        {activeTab === "expenses" && <Expenses data={data} setData={setData} />}
        {activeTab === "domain" && <Domain />}

        <footer className="mt-10 text-xs text-gray-500">
          Data saved in your browser (localStorage). Export CSV regularly for backup.
        </footer>
      </div>
    </div>
  );
}
