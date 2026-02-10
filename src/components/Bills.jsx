import React, { useMemo, useState } from "react";
import Section from "./Section";
import { SelectInput, SmallButton, TextInput } from "./Inputs";
import { billsToCSV, downloadText } from "../utils/csv";
import { money, toNumber, todayISO } from "../utils/format";
import { generateInvoicePDF } from "../utils/invoicePdf";
import { Badge } from "./AppShell";

const PRODUCTS = [
  { id: "bottle_1l", name: "Plastic Bottle 1 Liter" },
  { id: "bottle_2l", name: "Plastic Bottle 2 Liters" },
  { id: "bottle_5l", name: "Plastic Bottle 5 Liters" },
  { id: "jar", name: "Jar Bottle" },
];

export default function Bills({ data, setData }) {
  const [billForm, setBillForm] = useState({
    id: null,
    date: todayISO(),
    customerName: "",
    productId: PRODUCTS[0].id,
    quantity: "1",
    unitPrice: "0",
    invoiceNumber: "",
    invoiceLink: "",
    notes: "",
    paymentStatus: "Unpaid",
  });

  const [billSearch, setBillSearch] = useState("");
  const [billDateFrom, setBillDateFrom] = useState("");
  const [billDateTo, setBillDateTo] = useState("");

  const billsComputed = useMemo(() => {
    const mapped = data.bills.map((b) => ({
      ...b,
      total: toNumber(b.quantity) * toNumber(b.unitPrice),
    }));

    const q = billSearch.trim().toLowerCase();
    let filtered = mapped;

    if (q) {
      filtered = filtered.filter((b) => {
        return (
          String(b.customerName || "")
            .toLowerCase()
            .includes(q) ||
          String(b.productName || "")
            .toLowerCase()
            .includes(q) ||
          String(b.invoiceNumber || "")
            .toLowerCase()
            .includes(q)
        );
      });
    }
    if (billDateFrom) filtered = filtered.filter((b) => b.date >= billDateFrom);
    if (billDateTo) filtered = filtered.filter((b) => b.date <= billDateTo);

    filtered.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return filtered;
  }, [data.bills, billSearch, billDateFrom, billDateTo]);

  const totals = useMemo(() => {
    const totalSales = billsComputed.reduce(
      (sum, b) => sum + (b.total || 0),
      0
    );
    const paid = billsComputed
      .filter((b) => b.paymentStatus === "Paid")
      .reduce((sum, b) => sum + (b.total || 0), 0);
    return { totalSales, paid, unpaid: totalSales - paid };
  }, [billsComputed]);

  function resetBillForm() {
    setBillForm({
      id: null,
      date: todayISO(),
      customerName: "",
      productId: PRODUCTS[0].id,
      quantity: "1",
      unitPrice: "0",
      invoiceNumber: "",
      invoiceLink: "",
      notes: "",
      paymentStatus: "Unpaid",
    });
  }

  function upsertBill() {
    const product =
      PRODUCTS.find((p) => p.id === billForm.productId) || PRODUCTS[0];

    const payload = {
      id: billForm.id ?? crypto.randomUUID(),
      date: billForm.date || todayISO(),
      customerName: billForm.customerName.trim(),
      productId: product.id,
      productName: product.name,
      quantity: toNumber(billForm.quantity),
      unitPrice: toNumber(billForm.unitPrice),
      invoiceNumber: billForm.invoiceNumber.trim(),
      invoiceLink: billForm.invoiceLink.trim(),
      notes: billForm.notes.trim(),
      paymentStatus: billForm.paymentStatus,
    };

    if (!payload.customerName) return alert("Please enter Customer Name.");
    if (payload.quantity <= 0) return alert("Quantity must be greater than 0.");

    setData((prev) => {
      const exists = prev.bills.some((b) => b.id === payload.id);
      const bills = exists
        ? prev.bills.map((b) => (b.id === payload.id ? payload : b))
        : [...prev.bills, payload];
      return { ...prev, bills };
    });

    resetBillForm();
  }

  function editBill(b) {
    setBillForm({
      id: b.id,
      date: b.date,
      customerName: b.customerName,
      productId: b.productId,
      quantity: String(b.quantity),
      unitPrice: String(b.unitPrice),
      invoiceNumber: b.invoiceNumber || "",
      invoiceLink: b.invoiceLink || "",
      notes: b.notes || "",
      paymentStatus: b.paymentStatus || "Unpaid",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteBill(id) {
    if (!confirm("Delete this bill?")) return;
    setData((prev) => ({
      ...prev,
      bills: prev.bills.filter((b) => b.id !== id),
    }));
  }

  function exportBillsCSV() {
    const csv = billsToCSV(billsComputed);
    downloadText(`daily-bills_${todayISO()}.csv`, csv);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Section
        title={billForm.id ? "Edit Bill" : "Submit Daily Bill"}
        right={
          <div className="flex gap-2">
            <SmallButton onClick={resetBillForm}>Clear</SmallButton>
            <SmallButton variant="primary" onClick={upsertBill}>
              {billForm.id ? "Update" : "Add"}
            </SmallButton>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextInput
            label="Date"
            type="date"
            value={billForm.date}
            onChange={(v) => setBillForm((p) => ({ ...p, date: v }))}
          />
          <TextInput
            label="Customer Name"
            value={billForm.customerName}
            onChange={(v) => setBillForm((p) => ({ ...p, customerName: v }))}
          />

          <SelectInput
            label="Product"
            value={billForm.productId}
            onChange={(v) => setBillForm((p) => ({ ...p, productId: v }))}
            options={PRODUCTS.map((p) => ({ value: p.id, label: p.name }))}
          />

          <TextInput
            label="Quantity"
            type="number"
            value={billForm.quantity}
            onChange={(v) => setBillForm((p) => ({ ...p, quantity: v }))}
          />

          <TextInput
            label="Unit Price (₹)"
            type="number"
            value={billForm.unitPrice}
            onChange={(v) => setBillForm((p) => ({ ...p, unitPrice: v }))}
          />

          <SelectInput
            label="Payment Status"
            value={billForm.paymentStatus}
            onChange={(v) => setBillForm((p) => ({ ...p, paymentStatus: v }))}
            options={[
              { value: "Unpaid", label: "Unpaid" },
              { value: "Partial", label: "Partial" },
              { value: "Paid", label: "Paid" },
            ]}
          />

          <TextInput
            label="Invoice Number (separate column)"
            value={billForm.invoiceNumber}
            onChange={(v) => setBillForm((p) => ({ ...p, invoiceNumber: v }))}
          />
          <TextInput
            label="Invoice Link / File URL"
            value={billForm.invoiceLink}
            onChange={(v) => setBillForm((p) => ({ ...p, invoiceLink: v }))}
            placeholder="Google Drive link"
          />

          <div className="md:col-span-2">
            <TextInput
              label="Notes"
              value={billForm.notes}
              onChange={(v) => setBillForm((p) => ({ ...p, notes: v }))}
            />
          </div>

          <div className="md:col-span-2 rounded-xl bg-gray-50 border border-gray-200 p-3">
            <div className="text-xs text-gray-500">Bill Total</div>
            <div className="text-xl font-bold">
              {money(
                toNumber(billForm.quantity) * toNumber(billForm.unitPrice)
              )}
            </div>
          </div>
        </div>
      </Section>

      <div className="lg:col-span-2">
        <Section
          title="Bills List"
          right={
            <div className="flex gap-2">
              <SmallButton onClick={exportBillsCSV}>Export CSV</SmallButton>
              <SmallButton
                variant="danger"
                onClick={() => {
                  if (!confirm("Clear ALL bills?")) return;
                  setData((prev) => ({ ...prev, bills: [] }));
                }}
              >
                Clear Bills
              </SmallButton>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <TextInput
              label="Search (customer / product / invoice #)"
              value={billSearch}
              onChange={setBillSearch}
            />
            <TextInput
              label="From Date"
              type="date"
              value={billDateFrom}
              onChange={setBillDateFrom}
            />
            <TextInput
              label="To Date"
              type="date"
              value={billDateTo}
              onChange={setBillDateTo}
            />
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="text-xs text-gray-600 font-semibold">
                Filtered Totals
              </div>
              <div className="mt-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sales</span>
                  <span className="font-semibold">
                    {money(totals.totalSales)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Paid</span>
                  <span className="font-semibold">{money(totals.paid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Unpaid</span>
                  <span className="font-semibold">{money(totals.unpaid)}</span>
                </div>
              </div>
            </div>
          </div>

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
                  <th className="p-3 font-semibold">Invoice</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {billsComputed.length === 0 ? (
                  <tr>
                    <td className="p-4 text-gray-500" colSpan={10}>
                      No bills yet.
                    </td>
                  </tr>
                ) : (
                  billsComputed.map((b) => (
                    <tr className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="p-3 whitespace-nowrap">{b.date}</td>
                      <td className="p-3">{b.customerName}</td>
                      <td className="p-3">{b.productName}</td>
                      <td className="p-3">{b.quantity}</td>
                      <td className="p-3">{money(b.unitPrice)}</td>
                      <td className="p-3 font-semibold">{money(b.total)}</td>
                      <td className="p-3">{b.invoiceNumber || "-"}</td>
                      <td className="p-3">
                        {b.invoiceLink ? (
                          <a
                            href={b.invoiceLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Open
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3">
                        {(() => {
                          const tone =
                            b.paymentStatus === "Paid"
                              ? "green"
                              : b.paymentStatus === "Partial"
                              ? "yellow"
                              : "red";

                          return <Badge tone={tone}>{b.paymentStatus}</Badge>;
                        })()}
                      </td>{" "}
                      <td className="p-3">
                        <div className="flex gap-2">
                          <SmallButton onClick={() => editBill(b)}>
                            Edit
                          </SmallButton>
                          <SmallButton
                            variant="danger"
                            onClick={() => deleteBill(b.id)}
                          >
                            Delete
                          </SmallButton>
                          <SmallButton
                            onClick={() => {
                              const amount =
                                (b.quantity || 0) * (b.unitPrice || 0);

                              // Example: CGST 9% + SGST 9% (edit if needed)
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
                                  address2:
                                    "697,699,701,702,704 to 709,711 to 717",
                                  address3:
                                    "TIF MSME Green Industrial Park, Dandu Malkapur(V)",
                                  address4:
                                    "Choutuppal (M), Yadadri(D), Telangana - 508252",
                                  gst: "36BEUPC7238H1Z5",
                                  bankAccountName: "KSP POLYMERS",
                                  bankName: "UNION BANK",
                                  branch: "KOTHAPET",
                                  ifsc: "UBIN0810925",
                                  accountNo: "0192110100000186",
                                },
                                invoice: {
                                  invoiceNo:
                                    b.invoiceNumber ||
                                    `INV-${b.id?.slice(0, 6)}`,
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
                                tax: {
                                  cgstRate,
                                  sgstRate,
                                  cgstAmount,
                                  sgstAmount,
                                  totalTax,
                                },
                                freight,
                                vehicleNo: b.vehicleNo || "",
                              });
                            }}
                          >
                            PDF Invoice
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
