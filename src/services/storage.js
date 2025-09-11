
// Local storage for cases and documents
const CASES_KEY = 'cb_cases';
const DOCS_KEY = 'cb_docs';

export function loadCases() {
  try { return JSON.parse(localStorage.getItem(CASES_KEY) || '[]'); } catch { return []; }
}

export function saveCases(cases) {
  localStorage.setItem(CASES_KEY, JSON.stringify(cases));
}

export function addCase(c) {
  const cases = loadCases();
  const id = (cases.at(-1)?.id || 0) + 1;
  const created = new Date().toISOString().slice(0,10);
  const nc = { id, created, ...c };
  cases.push(nc);
  saveCases(cases);
  return nc;
}

export function loadDocs() {
  try { return JSON.parse(localStorage.getItem(DOCS_KEY) || '[]'); } catch { return []; }
}

export function addDoc(doc) {
  const docs = loadDocs();
  const id = (docs.at(-1)?.id || 0) + 1;
  const nd = { id, uploadedAt: new Date().toISOString(), ...doc };
  docs.push(nd);
  localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
  return nd;
}
