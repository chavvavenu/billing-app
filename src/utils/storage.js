const STORAGE_KEY = "ksp_bottle_billing_v1";

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { bills: [], expenses: [] };
    const parsed = JSON.parse(raw);
    return {
      bills: Array.isArray(parsed.bills) ? parsed.bills : [],
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
    };
  } catch {
    return { bills: [], expenses: [] };
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
