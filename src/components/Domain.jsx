import React from "react";
import Section from "./Section";

export default function Domain() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Section title="Purchase a Domain URL (Checklist)">
        <ol className="list-decimal ml-5 space-y-2 text-sm text-gray-700">
          <li>Choose domain name (example: <b>kspbottles.com</b>)</li>
          <li>Prefer .com, else .in/.net</li>
          <li>Buy from registrar: GoDaddy / Namecheap / Squarespace</li>
          <li>Add WHOIS privacy</li>
          <li>Connect domain to hosting (Vercel/Netlify/Wix)</li>
        </ol>
      </Section>

      <Section title="Optional Next Features">
        <ul className="list-disc ml-5 text-sm text-gray-700 space-y-2">
          <li>GST column + tax</li>
          <li>Invoice PDF generation + Print</li>
          <li>Customer ledger + due reminders</li>
          <li>Cloud sync (Firebase/Supabase)</li>
        </ul>
      </Section>
    </div>
  );
}
