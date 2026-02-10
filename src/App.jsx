import { useMemo, useState } from "react";
import "./App.css";

const PRODUCTS = [
  { id: "bottle_1l", name: "Plastic Bottle 1L" },
  { id: "bottle_2l", name: "Plastic Bottle 2L" },
  { id: "bottle_5l", name: "Plastic Bottle 5L" },
  { id: "jar", name: "Jar Bottle" },
];

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function uid(prefix = "INV") {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(16)
    .slice(2, 6)
    .toUpperCase()}`;
}

export default function App() {
  // Bills = sales / outgoing
  const [billForm, setBillForm] = useState({
    date: todayISO(),
    customer: "",
    productId: PRODUCTS[0].id,
    qty: 1,
    unitPrice: 0,
    invoiceNo: uid("INV"),
    notes: "",
  });
  const [bills, setBills] = useState([]);

  // Expenses = daily expense sheet
  const [expForm, setExpForm] = useState({
    date: todayISO(),
    category: "Transport",
    description: "",
    amount: 0,
    paymentMode: "Cash",
    notes: "",
  });
  const [expenses, setExpenses] = useState([]);

  const billTotal = useMemo(() => {
    const qty = Number(billForm.qty || 0);
    const price = Number(billForm.unitPrice || 0);
    return qty * price;
  }, [billForm.qty, billForm.unitPrice]);

  const totals = useMemo(() => {
    const sales = bills.reduce((sum, b) => sum + b.total, 0);
    const exp = expenses.reduce((sum, e) => sum + e.amount, 0);
    return { sales, exp, net: sales - exp };
  }, [bills, expenses]);

  function addBill(e) {
    e.preventDefault();
    const qty = Number(billForm.qty);
    const unitPrice = Number(billForm.unitPrice);
    if (!billForm.customer.trim()) return alert("Enter customer name");
    if (!qty || qty <= 0) return alert("Qty must be > 0");
    if (!unitPrice || unitPrice < 0) return alert("Unit price must be >= 0");

    const product = PRODUCTS.find((p) => p.id === billForm.productId);
    const newBill = {
      id: uid("BILL"),
      date: billForm.date,
      customer: billForm.customer.trim(),
      productId: billForm.productId,
      productName: product?.name || billForm.productId,
      qty,
      unitPrice,
      total: qty * unitPrice,
      invoiceNo: billForm.invoiceNo.trim() || uid("INV"),
      notes: billForm.notes.trim(),
    };

    setBills((prev) => [newBill, ...prev]);
    setBillForm((f) => ({
      ...f,
      customer: "",
      qty: 1,
      unitPrice: 0,
      invoiceNo: uid("INV"),
      notes: "",
    }));
  }

  function addExpense(e) {
    e.preventDefault();
    const amount = Number(expForm.amount);
    if (!expForm.description.trim()) return alert("Enter expense description");
    if (!amount || amount <= 0) return alert("Expense amount must be > 0");

    const newExp = {
      id: uid("EXP"),
      date: expForm.date,
      category: expForm.category,
      description: expForm.description.trim(),
      amount,
      paymentMode: expForm.paymentMode,
      notes: expForm.notes.trim(),
    };

    setExpenses((prev) => [newExp, ...prev]);
    setExpForm((f) => ({
      ...f,
      category: "Transport",
      description: "",
      amount: 0,
      paymentMode: "Cash",
      notes: "",
    }));
  }

  function removeBill(id) {
    setBills((prev) => prev.filter((b) => b.id !== id));
  }
  function removeExpense(id) {
    setExpenses((prev) => prev.filter((x) => x.id !== id));
  }

  function exportJSON() {
    const payload = { bills, expenses, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plastic-billing-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const invoices = useMemo(() => {
    // separate "Invoices column" view (group by invoiceNo)
    const map = new Map();
    for (const b of bills) {
      const arr = map.get(b.invoiceNo) || [];
      arr.push(b);
      map.set(b.invoiceNo, arr);
    }
    return Array.from(map.entries()).map(([invoiceNo, items]) => {
      const total = items.reduce((s, x) => s + x.total, 0);
      const date = items[0]?.date;
      const customer = items[0]?.customer;
      return { invoiceNo, date, customer, count: items.length, total };
    });
  }, [bills]);

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>KSP Polymers</h1>
          <p className="muted">
            Products: 1L / 2L / 5L Bottles + Jar • Currency: INR
          </p>
        </div>
        <div className="actions">
          <button onClick={exportJSON}>Export Data (JSON)</button>
        </div>
      </header>

      <section className="cards">
        <div className="card">
          <div className="cardTitle">Today Summary</div>
          <div className="kpis">
            <div className="kpi">
              <div className="kpiLabel">Total Sales</div>
              <div className="kpiValue">{INR.format(totals.sales)}</div>
            </div>
            <div className="kpi">
              <div className="kpiLabel">Total Expenses</div>
              <div className="kpiValue">{INR.format(totals.exp)}</div>
            </div>
            <div className="kpi">
              <div className="kpiLabel">Net</div>
              <div className="kpiValue">{INR.format(totals.net)}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid">
        {/* Daily Bills */}
        <section className="card">
          <div className="cardTitle">Daily Bills (Sales Entry)</div>
          <form className="form" onSubmit={addBill}>
            <div className="row">
              <label>
                Date
                <input
                  type="date"
                  value={billForm.date}
                  onChange={(e) =>
                    setBillForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </label>

              <label>
                Customer
                <input
                  placeholder="Customer name"
                  value={billForm.customer}
                  onChange={(e) =>
                    setBillForm((f) => ({ ...f, customer: e.target.value }))
                  }
                />
              </label>
            </div>

            <div className="row">
              <label>
                Product
                <select
                  value={billForm.productId}
                  onChange={(e) =>
                    setBillForm((f) => ({ ...f, productId: e.target.value }))
                  }
                >
                  {PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Qty
                <input
                  type="number"
                  min="1"
                  value={billForm.qty}
                  onChange={(e) =>
                    setBillForm((f) => ({ ...f, qty: e.target.value }))
                  }
                />
              </label>

              <label>
                Unit Price (INR)
                <input
                  type="number"
                  min="0"
                  value={billForm.unitPrice}
                  onChange={(e) =>
                    setBillForm((f) => ({ ...f, unitPrice: e.target.value }))
                  }
                />
              </label>
            </div>

            <div className="row">
              <label>
                Invoice No (separate column)
                <input
                  value={billForm.invoiceNo}
                  onChange={(e) =>
                    setBillForm((f) => ({ ...f, invoiceNo: e.target.value }))
                  }
                />
              </label>

              <label>
                Notes
                <input
                  placeholder="Optional"
                  value={billForm.notes}
                  onChange={(e) =>
                    setBillForm((f) => ({ ...f, notes: e.target.value }))
                  }
                />
              </label>
            </div>

            <div className="row rowEnd">
              <div className="totalBox">
                Total: <strong>{INR.format(billTotal)}</strong>
              </div>
              <button type="submit">Add Bill</button>
            </div>
          </form>

          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th className="num">Qty</th>
                  <th className="num">Unit</th>
                  <th>Invoice</th>
                  <th className="num">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bills.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty">
                      No bills yet.
                    </td>
                  </tr>
                ) : (
                  bills.map((b) => (
                    <tr key={b.id}>
                      <td>{b.date}</td>
                      <td>{b.customer}</td>
                      <td>{b.productName}</td>
                      <td className="num">{b.qty}</td>
                      <td className="num">{INR.format(b.unitPrice)}</td>
                      <td>{b.invoiceNo}</td>
                      <td className="num">{INR.format(b.total)}</td>
                      <td className="num">
                        <button className="danger" onClick={() => removeBill(b.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Invoices */}
        <section className="card">
          <div className="cardTitle">Invoices (Grouped View)</div>
          <p className="muted small">
            This is your “separate invoice column” view grouped by Invoice No.
          </p>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th className="num">Items</th>
                  <th className="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty">
                      No invoices yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.invoiceNo}>
                      <td>{inv.invoiceNo}</td>
                      <td>{inv.date}</td>
                      <td>{inv.customer}</td>
                      <td className="num">{inv.count}</td>
                      <td className="num">{INR.format(inv.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Daily Expenses */}
        <section className="card">
          <div className="cardTitle">Daily Expense Sheet</div>
          <form className="form" onSubmit={addExpense}>
            <div className="row">
              <label>
                Date
                <input
                  type="date"
                  value={expForm.date}
                  onChange={(e) =>
                    setExpForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </label>

              <label>
                Category
                <select
                  value={expForm.category}
                  onChange={(e) =>
                    setExpForm((f) => ({ ...f, category: e.target.value }))
                  }
                >
                  <option>Transport</option>
                  <option>Raw Material</option>
                  <option>Electricity</option>
                  <option>Salary</option>
                  <option>Maintenance</option>
                  <option>Other</option>
                </select>
              </label>
            </div>

            <div className="row">
              <label>
                Description
                <input
                  placeholder="Example: Diesel / Packing covers / Tea"
                  value={expForm.description}
                  onChange={(e) =>
                    setExpForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </label>

              <label>
                Amount (INR)
                <input
                  type="number"
                  min="0"
                  value={expForm.amount}
                  onChange={(e) =>
                    setExpForm((f) => ({ ...f, amount: e.target.value }))
                  }
                />
              </label>
            </div>

            <div className="row">
              <label>
                Payment Mode
                <select
                  value={expForm.paymentMode}
                  onChange={(e) =>
                    setExpForm((f) => ({ ...f, paymentMode: e.target.value }))
                  }
                >
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Card</option>
                  <option>Bank Transfer</option>
                </select>
              </label>

              <label>
                Notes
                <input
                  placeholder="Optional"
                  value={expForm.notes}
                  onChange={(e) =>
                    setExpForm((f) => ({ ...f, notes: e.target.value }))
                  }
                />
              </label>
            </div>

            <div className="row rowEnd">
              <button type="submit">Add Expense</button>
            </div>
          </form>

          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Mode</th>
                  <th className="num">Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty">
                      No expenses yet.
                    </td>
                  </tr>
                ) : (
                  expenses.map((x) => (
                    <tr key={x.id}>
                      <td>{x.date}</td>
                      <td>{x.category}</td>
                      <td>{x.description}</td>
                      <td>{x.paymentMode}</td>
                      <td className="num">{INR.format(x.amount)}</td>
                      <td className="num">
                        <button className="danger" onClick={() => removeExpense(x.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <footer className="footer muted">
        Tip: Next step is saving data to a DB (Firebase / Supabase) + login + PDF invoice print.
      </footer>
    </div>
  );
}
