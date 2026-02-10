export function money(n) {
    const x = Number(n || 0);
    return x.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });
  }
  
  export function toNumber(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  
  export function todayISO() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  