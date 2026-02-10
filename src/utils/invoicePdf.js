import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ---- helpers ----
const money = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function numberToWordsINR(amount) {
  // Simple INR words (works for normal invoices). You can upgrade later.
  const a = Math.floor(Number(amount || 0));
  if (!Number.isFinite(a)) return "";

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const twoDigits = (n) => {
    if (n < 20) return ones[n];
    return `${tens[Math.floor(n / 10)]} ${ones[n % 10]}`.trim();
  };

  const threeDigits = (n) => {
    const h = Math.floor(n / 100);
    const r = n % 100;
    if (!h) return twoDigits(r);
    if (!r) return `${ones[h]} Hundred`;
    return `${ones[h]} Hundred ${twoDigits(r)}`;
  };

  const parts = [];
  let n = a;

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const rest = n;

  if (crore) parts.push(`${threeDigits(crore)} Crore`);
  if (lakh) parts.push(`${threeDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${threeDigits(thousand)} Thousand`);
  if (rest) parts.push(`${threeDigits(rest)}`);

  return `${parts.join(" ").trim()} Only`;
}

// ---- MAIN ----
export function generateInvoicePDF({
  company,
  invoice,
  billTo,
  shipTo,
  items,
  tax,
  freight,
  vehicleNo,
}) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  // HEADER
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("TAX INVOICE", pageWidth / 2, 14, { align: "center" });

  doc.setFontSize(18);
  doc.text(company.name || "KSP POLYMERS", 14, 26);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  // Right invoice box
  const boxX = 120;
  const boxY = 18;
  const boxW = 76;
  const boxH = 36;
  doc.rect(boxX, boxY, boxW, boxH);

  const rightRows = [
    ["Invoice No", invoice.invoiceNo || "-"],
    ["Invoice Date", invoice.invoiceDate || "-"],
    ["Delivery Date", invoice.deliveryDate || "-"],
    ["Amount", money(invoice.amount || 0)],
    ["Tax", money(tax.totalTax || 0)],
    ["Freight", money(freight || 0)],
    ["Total Amount", money(invoice.totalAmount || 0)],
    ["Vehicle No", vehicleNo || "-"],
  ];

  let ry = boxY + 6;
  rightRows.forEach(([k, v]) => {
    doc.text(String(k), boxX + 2, ry);
    doc.text(String(v), boxX + 42, ry);
    doc.line(boxX, ry + 1.5, boxX + boxW, ry + 1.5);
    ry += 4.2;
  });

  // BILL TO / SHIP TO / ADDRESS boxes
  const topY = 58;
  const colW = (pageWidth - 28) / 3;

  const drawBox = (x, y, w, h, title, lines) => {
    doc.rect(x, y, w, h);
    doc.setFont("helvetica", "bold");
    doc.text(title, x + w / 2, y + 6, { align: "center" });
    doc.setFont("helvetica", "normal");
    let ly = y + 12;
    lines.forEach((line) => {
      doc.text(String(line || ""), x + 3, ly);
      ly += 4.2;
    });
  };

  drawBox(14, topY, colW, 40, "Bill To", [
    billTo.name,
    billTo.address1,
    billTo.address2,
    billTo.cityStateZip,
    `GST: ${billTo.gst || "-"}`,
  ]);

  drawBox(14 + colW, topY, colW, 40, "Ship To", [
    shipTo.name,
    shipTo.address1,
    shipTo.address2,
    shipTo.cityStateZip,
  ]);

  drawBox(14 + colW * 2, topY, colW, 40, "Company Address", [
    company.address1,
    company.address2,
    company.address3,
    company.address4,
    `GST: ${company.gst || "-"}`,
  ]);

  // ITEMS TABLE
  const tableStartY = 104;

  autoTable(doc, {
    startY: tableStartY,
    head: [["Sl No", "Item", "Description", "HSN", "Qty", "Rate", "Amount (₹)"]],
    body: items.map((it, idx) => [
      String(idx + 1),
      it.item || "-",
      it.description || "-",
      it.hsn || "-",
      String(it.qty || 0),
      money(it.rate || 0),
      money(it.amount || 0),
    ]),
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0] },
    theme: "grid",
  });

  const afterTableY = doc.lastAutoTable.finalY + 6;

  // TAX rows (CGST/SGST)
  doc.setFont("helvetica", "normal");
  doc.text(`CGST @ ${tax.cgstRate}%`, 120, afterTableY);
  doc.text(money(tax.cgstAmount), 190, afterTableY, { align: "right" });

  doc.text(`SGST @ ${tax.sgstRate}%`, 120, afterTableY + 5);
  doc.text(money(tax.sgstAmount), 190, afterTableY + 5, { align: "right" });

  // TOTAL
  doc.setFont("helvetica", "bold");
  doc.text("Total Amount", 120, afterTableY + 12);
  doc.text(money(invoice.totalAmount), 190, afterTableY + 12, { align: "right" });

  // Words
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Total in words after round off:", 14, afterTableY + 20);
  doc.setFont("helvetica", "bold");
  doc.text(numberToWordsINR(invoice.totalAmount), 14, afterTableY + 25);

  // BANK DETAILS + Footer Signature
  const bankY = afterTableY + 32;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.rect(14, bankY, 95, 28);
  doc.setFont("helvetica", "bold");
  doc.text("Bank Details", 16, bankY + 6);
  doc.setFont("helvetica", "normal");
  const bankLines = [
    `Account Name: ${company.bankAccountName || "-"}`,
    `Bank Name: ${company.bankName || "-"}`,
    `Branch: ${company.branch || "-"}`,
    `IFSC: ${company.ifsc || "-"}`,
    `Account No: ${company.accountNo || "-"}`,
  ];
  let by = bankY + 12;
  bankLines.forEach((l) => {
    doc.text(l, 16, by);
    by += 4.2;
  });

  doc.rect(114, bankY, 82, 28);
  doc.setFont("helvetica", "bold");
  doc.text(`M/s ${company.name || "KSP POLYMERS"}`, 155, bankY + 10, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text("Authorised Signatory", 155, bankY + 24, { align: "center" });

  doc.setFontSize(9);
  doc.text("SUBJECT TO HYDERABAD JURISDICTION", 14, 288);

  // Save file
  doc.save(`${invoice.invoiceNo || "invoice"}.pdf`);
}
