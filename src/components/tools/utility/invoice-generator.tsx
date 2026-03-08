"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, FileText } from "lucide-react";
import { DownloadButton } from "@/components/shared/download-button";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "INR", symbol: "₹" },
  { code: "JPY", symbol: "¥" },
  { code: "CAD", symbol: "C$" },
  { code: "AUD", symbol: "A$" },
];

let itemId = 1;

function createItem(): LineItem {
  return { id: String(itemId++), description: "", quantity: 1, unitPrice: 0 };
}

export function InvoiceGenerator() {
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState(0);
  const [items, setItems] = useState<LineItem[]>([createItem()]);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [generating, setGenerating] = useState(false);

  const currencySymbol =
    CURRENCIES.find((c) => c.code === currency)?.symbol ?? "$";

  const addItem = () => setItems((prev) => [...prev, createItem()]);
  const removeItem = (id: string) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));

  const updateItem = (id: string, field: keyof LineItem, value: string | number) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const fmt = (n: number) =>
    `${currencySymbol}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleGenerate = async () => {
    setGenerating(true);
    setPdfBytes(null);

    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");

      const doc = await PDFDocument.create();
      const page = doc.addPage([595, 842]); // A4
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
      const { height } = page.getSize();

      const black = rgb(0, 0, 0);
      const gray = rgb(0.4, 0.4, 0.4);
      const lightGray = rgb(0.92, 0.92, 0.92);
      const accent = rgb(0.13, 0.55, 0.87);

      let y = height - 50;

      // Header
      page.drawText("INVOICE", {
        x: 50,
        y,
        size: 28,
        font: fontBold,
        color: accent,
      });

      page.drawText(invoiceNumber, {
        x: 400,
        y,
        size: 12,
        font: fontBold,
        color: black,
      });
      y -= 18;
      page.drawText(`Date: ${date}`, { x: 400, y, size: 9, font, color: gray });
      if (dueDate) {
        y -= 14;
        page.drawText(`Due: ${dueDate}`, { x: 400, y, size: 9, font, color: gray });
      }

      y = height - 110;

      // From
      page.drawText("From", { x: 50, y, size: 8, font, color: gray });
      y -= 16;
      if (companyName) {
        page.drawText(companyName, { x: 50, y, size: 11, font: fontBold, color: black });
        y -= 14;
      }
      for (const line of companyAddress.split("\n")) {
        page.drawText(line, { x: 50, y, size: 9, font, color: gray });
        y -= 13;
      }

      // To
      let yTo = height - 110;
      page.drawText("Bill To", { x: 300, y: yTo, size: 8, font, color: gray });
      yTo -= 16;
      if (clientName) {
        page.drawText(clientName, { x: 300, y: yTo, size: 11, font: fontBold, color: black });
        yTo -= 14;
      }
      for (const line of clientAddress.split("\n")) {
        page.drawText(line, { x: 300, y: yTo, size: 9, font, color: gray });
        yTo -= 13;
      }

      y = Math.min(y, yTo) - 30;

      // Table header
      page.drawRectangle({ x: 45, y: y - 5, width: 505, height: 22, color: lightGray });
      const cols = [50, 280, 350, 420, 490];
      const headers = ["Description", "Qty", "Unit Price", "Amount"];
      headers.forEach((h, i) => {
        page.drawText(h, {
          x: cols[i],
          y: y,
          size: 9,
          font: fontBold,
          color: black,
        });
      });
      y -= 28;

      // Line items
      for (const item of items) {
        if (!item.description && item.unitPrice === 0) continue;
        const lineTotal = item.quantity * item.unitPrice;

        page.drawText(item.description || "—", { x: 50, y, size: 9, font, color: black });
        page.drawText(String(item.quantity), { x: 290, y, size: 9, font, color: black });
        page.drawText(fmt(item.unitPrice), { x: 350, y, size: 9, font, color: black });
        page.drawText(fmt(lineTotal), { x: 460, y, size: 9, font, color: black });

        y -= 6;
        page.drawLine({ start: { x: 45, y }, end: { x: 550, y }, thickness: 0.5, color: lightGray });
        y -= 16;
      }

      y -= 10;

      // Totals
      const drawTotal = (label: string, value: string, bold = false) => {
        page.drawText(label, { x: 380, y, size: 9, font: bold ? fontBold : font, color: black });
        page.drawText(value, { x: 470, y, size: 9, font: bold ? fontBold : font, color: black });
        y -= 18;
      };

      drawTotal("Subtotal:", fmt(subtotal));
      drawTotal(`Tax (${taxRate}%):`, fmt(taxAmount));
      page.drawLine({ start: { x: 375, y: y + 12 }, end: { x: 550, y: y + 12 }, thickness: 1, color: black });
      drawTotal("Total:", fmt(total), true);

      const bytes = await doc.save();
      setPdfBytes(bytes);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const labelClass = "block text-sm font-medium text-foreground mb-1";
  const selectClass =
    "w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Company */}
        <div className="space-y-4 rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Your Company</h3>
          <div>
            <label className={labelClass}>Company Name</label>
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Inc." className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Address</label>
            <textarea value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} rows={3} placeholder={"123 Main St\nCity, State 12345\nCountry"} className={inputClass} />
          </div>
        </div>

        {/* Client */}
        <div className="space-y-4 rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Bill To</h3>
          <div>
            <label className={labelClass}>Client Name</label>
            <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client Corp." className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Client Address</label>
            <textarea value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} rows={3} placeholder={"456 Oak Ave\nCity, State 67890\nCountry"} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Invoice Details</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={labelClass}>Invoice Number</label>
            <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={selectClass}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Line Items</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 text-left font-medium text-foreground">Description</th>
                <th className="pb-2 text-right font-medium text-foreground w-24">Qty</th>
                <th className="pb-2 text-right font-medium text-foreground w-32">Unit Price</th>
                <th className="pb-2 text-right font-medium text-foreground w-32">Amount</th>
                <th className="pb-2 w-12" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="py-2 pr-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      placeholder="Item description"
                      className={inputClass}
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                      className={`${inputClass} text-right`}
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                      className={`${inputClass} text-right`}
                    />
                  </td>
                  <td className="py-2 px-2 text-right font-medium text-foreground whitespace-nowrap">
                    {fmt(item.quantity * item.unitPrice)}
                  </td>
                  <td className="py-2 pl-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={items.length <= 1}
                      className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={addItem}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">{fmt(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Tax</span>
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-20 rounded-lg border border-border bg-muted px-2 py-1 text-right text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span>%</span>
          </div>
          <span className="font-medium text-foreground">{fmt(taxAmount)}</span>
        </div>
        <div className="border-t border-border pt-3 flex justify-between text-sm">
          <span className="font-semibold text-foreground">Total</span>
          <span className="text-lg font-bold text-foreground">{fmt(total)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          Generate PDF
        </button>

        {pdfBytes && (
          <DownloadButton
            data={pdfBytes}
            filename={`${invoiceNumber || "invoice"}.pdf`}
            mimeType="application/pdf"
            label="Download PDF"
          />
        )}
      </div>
    </div>
  );
}
