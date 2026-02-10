import React, { useEffect, useMemo, useState } from "react";
import BillsPro from "./components/BillsPro";
import Expenses from "./components/Expenses";
import Domain from "./components/Domain";
import AppShell, { StatCard } from "./components/AppShell";
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
    <AppShell companyName="KSP POLYMERS" activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* Dashboard cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Sales" value={money(snapshot.salesAll)} sub="All time" />
        <StatCard label="Total Expenses" value={money(snapshot.expensesAll)} sub="All time" />
        <StatCard label="Net Profit" value={money(snapshot.net)} sub="Sales - Expenses" />
      </div>

      {activeTab === "bills" && <BillsPro data={data} setData={setData} />}
      {activeTab === "expenses" && <Expenses data={data} setData={setData} />}
      {activeTab === "domain" && <Domain />}
    </AppShell>
  );
}
