function csvEscape(v) {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }
  
  export function downloadText(filename, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  
  export function billsToCSV(bills) {
    const headers = [
      "Date",
      "Customer Name",
      "Product",
      "Quantity",
      "Unit Price",
      "Total",
      "Invoice Number",
      "Invoice Link",
      "Notes",
      "Payment Status",
    ];
    const lines = [headers.join(",")];
  
    for (const b of bills) {
      const row = [
        b.date,
        b.customerName,
        b.productName,
        b.quantity,
        b.unitPrice,
        b.total,
        b.invoiceNumber,
        b.invoiceLink,
        b.notes,
        b.paymentStatus,
      ].map(csvEscape);
      lines.push(row.join(","));
    }
    return lines.join("\n");
  }
  
  export function expensesToCSV(expenses) {
    const headers = ["Date", "Category", "Vendor", "Amount", "Payment Method", "Notes"];
    const lines = [headers.join(",")];
  
    for (const e of expenses) {
      const row = [e.date, e.category, e.vendor, e.amount, e.paymentMethod, e.notes].map(csvEscape);
      lines.push(row.join(","));
    }
    return lines.join("\n");
  }
  