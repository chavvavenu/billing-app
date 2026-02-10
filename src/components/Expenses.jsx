import React, { useMemo, useState } from "react";
import Section from "./Section";
import { SelectInput, SmallButton, TextInput } from "./Inputs";
import { expensesToCSV, downloadText } from "../utils/csv";
import { money, toNumber, todayISO } from "../utils/format";

export default function Expenses({ data, setData }) {
  const [expenseForm, setExpenseForm] = useState({
    id: null,
    date: todayISO(),
    category: "Raw Material",
    vendor: "",
    amount: "0",
    paymentMethod: "Cash",
    notes: "",
  });

  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseDateFrom, setExpenseDateFrom] = useState("");
  const [expenseDateTo, setExpenseDateTo] = useState("");

  const expensesFiltered = useMemo(() => {
    const q = expenseSearch.trim().toLowerCase();
    let filtered = [...data.expenses];

    if (q) {
      filtered = filtered.filter((e) => {
        return (
          String(e.category || "").toLowerCase().includes(q) ||
          String(e.vendor || "").toLowerCase().includes(q) ||
          String(e.paymentMethod || "").toLowerCase().includes(q)
        );
      });
    }
    if (expenseDateFrom) filtered = filtered.filter((e) => e.date >= expenseDateFrom);
    if (expenseDateTo) filtered = filtered.filter((e) => e.date <= expenseDateTo);

    filtered.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return filtered;
  }, [data.expenses, expenseSearch, expenseDateFrom, expenseDateTo]);

  const expensesTotal = useMemo(() => {
    return expensesFiltered.reduce((sum, e) => sum + toNumber(e.amount), 0);
  }, [expensesFiltered]);

  function resetExpenseForm() {
    setExpenseForm({
      id: null,
      date: todayISO(),
      category: "Raw Material",
      vendor: "",
      amount: "0",
      paymentMethod: "Cash",
      notes: "",
    });
  }

  function upsertExpense() {
    const payload = {
      id: expenseForm.id ?? crypto.randomUUID(),
      date: expenseForm.date || todayISO(),
      category: expenseForm.category.trim(),
      vendor: expenseForm.vendor.trim(),
      amount: toNumber(expenseForm.amount),
      paymentMethod: expenseForm.paymentMethod,
      notes: expenseForm.notes.trim(),
    };

    if (!payload.vendor) return alert("Please enter Vendor / Paid To.");
    if (payload.amount <= 0) return alert("Amount must be greater than 0.");

    setData((prev) => {
      const exists = prev.expenses.some((e) => e.id === payload.id);
      const expenses = exists
        ? prev.expenses.map((e) => (e.id === payload.id ? payload : e))
        : [...prev.expenses, payload];
      return { ...prev, expenses };
    });

    resetExpenseForm();
  }

  function editExpense(e) {
    setExpenseForm({
      id: e.id,
      date: e.date,
      category: e.category || "Raw Material",
      vendor: e.vendor || "",
      amount: String(e.amount ?? 0),
      paymentMethod: e.paymentMethod || "Cash",
      notes: e.notes || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteExpense(id) {
    if (!confirm("Delete this expense?")) return;
    setData((prev) => ({ ...prev, expenses: prev.expenses.filter((e) => e.id !== id) }));
  }

  function exportExpensesCSV() {
    const csv = expensesToCSV(expensesFiltered);
    downloadText(`daily-expenses_${todayISO()}.csv`, csv);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Section
        title={expenseForm.id ? "Edit Expense" : "Add Daily Expense"}
        right={
          <div className="flex gap-2">
            <SmallButton onClick={resetExpenseForm}>Clear</SmallButton>
            <SmallButton variant="primary" onClick={upsertExpense}>
              {expenseForm.id ? "Update" : "Add"}
            </SmallButton>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextInput
            label="Date"
            type="date"
            value={expenseForm.date}
            onChange={(v) => setExpenseForm((p) => ({ ...p, date: v }))}
          />

          <SelectInput
            label="Category"
            value={expenseForm.category}
            onChange={(v) => setExpenseForm((p) => ({ ...p, category: v }))}
            options={[
              { value: "Raw Material", label: "Raw Material" },
              { value: "Transport", label: "Transport" },
              { value: "Electricity", label: "Electricity" },
              { value: "Salary/Wages", label: "Salary/Wages" },
              { value: "Maintenance", label: "Maintenance" },
              { value: "Office", label: "Office" },
              { value: "Marketing", label: "Marketing" },
              { value: "Other", label: "Other" },
            ]}
          />

          <TextInput
            label="Vendor / Paid To"
            value={expenseForm.vendor}
            onChange={(v) => setExpenseForm((p) => ({ ...p, vendor: v }))}
          />

          <TextInput
            label="Amount (₹)"
            type="number"
            value={expenseForm.amount}
            onChange={(v) => setExpenseForm((p) => ({ ...p, amount: v }))}
          />

          <SelectInput
            label="Payment Method"
            value={expenseForm.paymentMethod}
            onChange={(v) => setExpenseForm((p) => ({ ...p, paymentMethod: v }))}
            options={[
              { value: "Cash", label: "Cash" },
              { value: "Bank Transfer", label: "Bank Transfer" },
              { value: "Card", label: "Card" },
              { value: "Check", label: "Check" },
              { value: "UPI", label: "UPI" },
              { value: "Other", label: "Other" },
            ]}
          />

          <div className="md:col-span-2">
            <TextInput
              label="Notes"
              value={expenseForm.notes}
              onChange={(v) => setExpenseForm((p) => ({ ...p, notes: v }))}
            />
          </div>

          <div className="md:col-span-2 rounded-xl bg-gray-50 border border-gray-200 p-3">
            <div className="text-xs text-gray-500">Expense</div>
            <div className="text-xl font-bold">{money(expenseForm.amount)}</div>
          </div>
        </div>
      </Section>

      <div className="lg:col-span-2">
        <Section
          title="Expense List"
          right={
            <div className="flex gap-2">
              <SmallButton onClick={exportExpensesCSV}>Export CSV</SmallButton>
              <SmallButton
                variant="danger"
                onClick={() => {
                  if (!confirm("Clear ALL expenses?")) return;
                  setData((prev) => ({ ...prev, expenses: [] }));
                }}
              >
                Clear Expenses
              </SmallButton>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <TextInput label="Search" value={expenseSearch} onChange={setExpenseSearch} />
            <TextInput label="From Date" type="date" value={expenseDateFrom} onChange={setExpenseDateFrom} />
            <TextInput label="To Date" type="date" value={expenseDateTo} onChange={setExpenseDateTo} />
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="text-xs text-gray-600 font-semibold">Filtered Total</div>
              <div className="mt-1 text-sm flex justify-between">
                <span className="text-gray-500">Expenses</span>
                <span className="font-semibold">{money(expensesTotal)}</span>
              </div>
            </div>
          </div>

          <div className="overflow-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="p-3 font-semibold">Date</th>
                  <th className="p-3 font-semibold">Category</th>
                  <th className="p-3 font-semibold">Vendor</th>
                  <th className="p-3 font-semibold">Amount</th>
                  <th className="p-3 font-semibold">Method</th>
                  <th className="p-3 font-semibold">Notes</th>
                  <th className="p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expensesFiltered.length === 0 ? (
                  <tr>
                    <td className="p-4 text-gray-500" colSpan={7}>
                      No expenses yet.
                    </td>
                  </tr>
                ) : (
                  expensesFiltered.map((e) => (
                    <tr key={e.id} className="border-t border-gray-200">
                      <td className="p-3 whitespace-nowrap">{e.date}</td>
                      <td className="p-3">{e.category}</td>
                      <td className="p-3">{e.vendor}</td>
                      <td className="p-3 font-semibold">{money(e.amount)}</td>
                      <td className="p-3">{e.paymentMethod}</td>
                      <td className="p-3">{e.notes || "-"}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <SmallButton onClick={() => editExpense(e)}>Edit</SmallButton>
                          <SmallButton variant="danger" onClick={() => deleteExpense(e.id)}>
                            Delete
                          </SmallButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    </div>
  );
}
