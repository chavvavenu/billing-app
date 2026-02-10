import React, { useMemo, useState } from "react";
import { Search, Plus, MoreVertical, FileText } from "lucide-react";
import { money, toNumber, todayISO } from "../utils/format";
import { generateInvoicePDF } from "../utils/invoicePdf";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";

const PRODUCTS = [
  { id: "bottle_1l", name: "Plastic Bottle 1 Liter" },
  { id: "bottle_2l", name: "Plastic Bottle 2 Liters" },
  { id: "bottle_5l", name: "Plastic Bottle 5 Liters" },
  { id: "jar", name: "Jar Bottle" },
];

function statusVariant(s) {
  if (s === "Paid") return "success";
  if (s === "Partial") return "warning";
  return "danger";
}

export default function BillsPro({ data, setData }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false); // simple modal state (no radix to keep it copy/paste)
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    date: todayISO(),
    customerName: "",
    productId: PRODUCTS[0].id,
    quantity: "1",
    unitPrice: "0",
    paymentStatus: "Unpaid",
    invoiceNumber: "",
    invoiceLink: "",
    notes: "",
  });

  const billsComputed = useMemo(() => {
    const mapped = data.bills.map((b) => ({
      ...b,
      total: toNumber(b.quantity) * toNumber(b.unitPrice),
    }));

    const qq = q.trim().toLowerCase();
    let filtered = mapped;
    if (qq) {
      filtered = filtered.filter((b) => {
        return (
          String(b.customerName || "").toLowerCase().includes(qq) ||
          String(b.productName || "").toLowerCase().includes(qq) ||
          String(b.invoiceNumber || "").toLowerCase().includes(qq)
        );
      });
    }

    filtered.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return filtered;
  }, [data.bills, q]);

  const totals = useMemo(() => {
    const sales = billsComputed.reduce((s, b) => s + (b.total || 0), 0);
    const paid = billsComputed.filter((b) => b.paymentStatus === "Paid").reduce((s, b) => s + (b.total || 0), 0);
    return { sales, paid, unpaid: sales - paid };
  }, [billsComputed]);

  function openCreate() {
    setEditing(null);
    setForm({
      date: todayISO(),
      customerName: "",
      productId: PRODUCTS[0].id,
      quantity: "1",
      unitPrice: "0",
      paymentStatus: "Unpaid",
      invoiceNumber: "",
      invoiceLink: "",
      notes: "",
    });
    setOpen(true);
  }

  function openEdit(b) {
    setEditing(b);
    setForm({
      date: b.date,
      customerName: b.customerName,
      productId: b.productId,
      quantity: String(b.quantity),
      unitPrice: String(b.unitPrice),
      paymentStatus: b.paymentStatus || "Unpaid",
      invoiceNumber: b.invoiceNumber || "",
      invoiceLink: b.invoiceLink || "",
      notes: b.notes || "",
    });
    setOpen(true);
  }

  function save() {
    const product = PRODUCTS.find((p) => p.id === form.productId) || PRODUCTS[0];
    const payload = {
      id: editing?.id ?? crypto.randomUUID(),
      date: form.date || todayISO(),
      customerName: form.customerName.trim(),
      productId: product.id,
      productName: product.name,
      quantity: toNumber(form.quantity),
      unitPrice: toNumber(form.unitPrice),
      paymentStatus: form.paymentStatus,
      invoiceNumber: form.invoiceNumber.trim(),
      invoiceLink: form.invoiceLink.trim(),
      notes: form.notes.trim(),
    };

    if (!payload.customerName) return alert("Customer Name required");
    if (payload.quantity <= 0) return alert("Quantity must be > 0");

    setData((prev) => {
      const exists = prev.bills.some((b) => b.id === payload.id);
      const bills = exists ? prev.bills.map((b) => (b.id === payload.id ? payload : b)) : [...prev.bills, payload];
      return { ...prev, bills };
    });

    setOpen(false);
  }

  function remove(id) {
    if (!confirm("Delete this bill?")) return;
    setData((prev) => ({ ...prev, bills: prev.bills.filter((b) => b.id !== id) }));
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
            <CardDescription>Filtered by search</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{money(totals.sales)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Paid</CardTitle>
            <CardDescription>Collected amount</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{money(totals.paid)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unpaid</CardTitle>
            <CardDescription>Pending amount</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{money(totals.unpaid)}</CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
              <Input
                className="pl-9"
                placeholder="Search customer / product / invoice..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setQ("")}>
                Clear
              </Button>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" /> Add Bill
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bills</CardTitle>
          <CardDescription>Click row actions to Edit / Delete / PDF Invoice</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-2xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="text-left">
                  <th className="p-3 font-semibold">Date</th>
                  <th className="p-3 font-semibold">Customer</th>
                  <th className="p-3 font-semibold">Product</th>
                  <th className="p-3 font-semibold">Qty</th>
                  <th className="p-3 font-semibold">Unit</th>
                  <th className="p-3 font-semibold">Total</th>
                  <th className="p-3 font-semibold">Invoice #</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {billsComputed.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-gray-500">
                      No bills found.
                    </td>
                  </tr>
                ) : (
                  billsComputed.map((b) => (
                    <tr key={b.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="p-3 whitespace-nowrap">{b.date}</td>
                      <td className="p-3">{b.customerName}</td>
                      <td className="p-3">{b.productName}</td>
                      <td className="p-3">{b.quantity}</td>
                      <td className="p-3">{money(b.unitPrice)}</td>
                      <td className="p-3 font-semibold">{money(b.total)}</td>
                      <td className="p-3">{b.invoiceNumber || "-"}</td>
                      <td className="p-3">
                        <Badge variant={statusVariant(b.paymentStatus)}>{b.paymentStatus}</Badge>
                      </td>

                      <td className="p-3 text-right">
                        <div className="inline-flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(b)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => remove(b.id)}>
                            Delete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const amount = (b.quantity || 0) * (b.unitPrice || 0);
                              const cgstRate = 9;
                              const sgstRate = 9;
                              const cgstAmount = (amount * cgstRate) / 100;
                              const sgstAmount = (amount * sgstRate) / 100;
                              const totalTax = cgstAmount + sgstAmount;
                              const freight = b.freight || 0;
                              const totalAmount = amount + totalTax + freight;

                              generateInvoicePDF({
                                company: {
                                  name: "KSP POLYMERS",
                                  address1: "Plot No 233, Sy No: 682,693 to",
                                  address2: "697,699,701,702,704 to 709,711 to 717",
                                  address3: "TIF MSME Green Industrial Park, Dandu Malkapur(V)",
                                  address4: "Choutuppal (M), Yadadri(D), Telangana - 508252",
                                  gst: "36BEUPC7238H1Z5",
                                  bankAccountName: "KSP POLYMERS",
                                  bankName: "UNION BANK",
                                  branch: "KOTHAPET",
                                  ifsc: "UBIN0810925",
                                  accountNo: "0192110100000186",
                                },
                                invoice: {
                                  invoiceNo: b.invoiceNumber || `INV-${b.id?.slice(0, 6)}`,
                                  invoiceDate: b.date,
                                  deliveryDate: b.date,
                                  amount,
                                  totalAmount,
                                },
                                billTo: {
                                  name: b.customerName,
                                  address1: b.billToAddress1 || "",
                                  address2: b.billToAddress2 || "",
                                  cityStateZip: b.billToCityStateZip || "",
                                  gst: b.billToGst || "",
                                },
                                shipTo: {
                                  name: b.customerName,
                                  address1: b.shipToAddress1 || "",
                                  address2: b.shipToAddress2 || "",
                                  cityStateZip: b.shipToCityStateZip || "",
                                },
                                items: [
                                  {
                                    item: b.itemCode || "JB",
                                    description: b.description || b.productName,
                                    hsn: b.hsn || "",
                                    qty: b.quantity,
                                    rate: b.unitPrice,
                                    amount,
                                  },
                                ],
                                tax: { cgstRate, sgstRate, cgstAmount, sgstAmount, totalTax },
                                freight,
                                vehicleNo: b.vehicleNo || "",
                              });
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            PDF
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal (simple, clean) */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-gray-200">
            <div className="p-5 border-b border-gray-100 flex items-start justify-between">
              <div>
                <div className="text-lg font-bold">{editing ? "Edit Bill" : "Add Bill"}</div>
                <div className="text-sm text-gray-500">Fill details and save</div>
              </div>
              <button className="text-gray-500 hover:text-gray-900" onClick={() => setOpen(false)}>
                <MoreVertical className="h-5 w-5 rotate-90" />
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
              </div>

              <div className="space-y-1">
                <Label>Customer Name</Label>
                <Input value={form.customerName} onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))} />
              </div>

              <div className="space-y-1">
                <Label>Product</Label>
                <select
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-4 focus:ring-gray-900/10"
                  value={form.productId}
                  onChange={(e) => setForm((p) => ({ ...p, productId: e.target.value }))}
                >
                  {PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label>Payment Status</Label>
                <select
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-4 focus:ring-gray-900/10"
                  value={form.paymentStatus}
                  onChange={(e) => setForm((p) => ({ ...p, paymentStatus: e.target.value }))}
                >
                  <option>Unpaid</option>
                  <option>Partial</option>
                  <option>Paid</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label>Quantity</Label>
                <Input type="number" value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} />
              </div>

              <div className="space-y-1">
                <Label>Unit Price (₹)</Label>
                <Input type="number" value={form.unitPrice} onChange={(e) => setForm((p) => ({ ...p, unitPrice: e.target.value }))} />
              </div>

              <div className="space-y-1">
                <Label>Invoice Number</Label>
                <Input value={form.invoiceNumber} onChange={(e) => setForm((p) => ({ ...p, invoiceNumber: e.target.value }))} />
              </div>

              <div className="space-y-1">
                <Label>Invoice Link (optional)</Label>
                <Input value={form.invoiceLink} onChange={(e) => setForm((p) => ({ ...p, invoiceLink: e.target.value }))} />
              </div>

              <div className="space-y-1 md:col-span-2">
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
              </div>

              <div className="md:col-span-2 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="text-xs text-gray-500 font-semibold">Bill Total</div>
                <div className="text-2xl font-bold mt-1">
                  {money(toNumber(form.quantity) * toNumber(form.unitPrice))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>{editing ? "Update" : "Save"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
