/*
 * CaseBuddy upgraded web application logic.
 *
 * This script provides all interactive functionality for managing cases,
 * including adding and selecting cases, uploading documents and evidence,
 * managing timeline events, recording FOIA requests and searching across
 * all stored items. All data is persisted in browser localStorage so
 * there is no backend dependency. If you clear your browser storage
 * the information will be lost, so make sure to export data if required.
 */

(function () {
  // Helper to generate a simple unique identifier
  function uuid() {
    return (
      Date.now().toString(36) +
      Math.random().toString(36).substring(2, 10)
    );
  }

  // Load cases from localStorage or initialise empty array
  let cases = [];
  try {
    const stored = localStorage.getItem('cases');
    cases = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(cases)) cases = [];
  } catch (err) {
    console.warn('Error reading cases from storage', err);
    cases = [];
  }

  // Current selected case id
  let currentCaseId = null;

  // DOM elements
  const casesListEl = document.getElementById('cases-list');
  const searchInputEl = document.getElementById('search-input');
  const searchResultsEl = document.getElementById('search-results');
  const newCaseForm = document.getElementById('new-case-form');
  const caseTitleInput = document.getElementById('case-title');
  const caseDescInput = document.getElementById('case-description');
  const caseDetailsEl = document.getElementById('case-details');
  const noSelectionEl = document.getElementById('no-selection');
  const caseInfoEl = document.getElementById('case-info');
  const caseTitleDisplay = document.getElementById('case-title-display');
  const caseDescDisplay = document.getElementById('case-description-display');
  // Document elements
  const documentsListEl = document.getElementById('documents-list');
  const addDocumentForm = document.getElementById('add-document-form');
  const documentNameInput = document.getElementById('document-name');
  const documentFileInput = document.getElementById('document-file');
  // Evidence elements
  const evidenceListEl = document.getElementById('evidence-list');
  const addEvidenceForm = document.getElementById('add-evidence-form');
  const evidenceNameInput = document.getElementById('evidence-name');
  const evidenceFileInput = document.getElementById('evidence-file');
  // Timeline elements
  const timelineListEl = document.getElementById('timeline-list');
  const addTimelineForm = document.getElementById('add-timeline-form');
  const timelineDateInput = document.getElementById('timeline-date');
  const timelineTitleInput = document.getElementById('timeline-title');
  const timelineDescInput = document.getElementById('timeline-description');
  // FOIA elements
  const foiaListEl = document.getElementById('foia-list');
  const addFoiaForm = document.getElementById('add-foia-form');
  const foiaSubjectInput = document.getElementById('foia-subject');
  const foiaDescInput = document.getElementById('foia-description');

  /**
   * Persist the current cases array to localStorage.
   */
  function saveCases() {
    try {
      localStorage.setItem('cases', JSON.stringify(cases));
    } catch (err) {
      console.error('Failed to save cases', err);
    }
  }

  /**
   * Find a case by its id.
   * @param {string} id
   */
  function getCaseById(id) {
    return cases.find(c => c.id === id);
  }

  /**
   * Render the list of cases into the sidebar. Each list item will attach
   * a click handler to select the case.
   */
  function renderCasesList() {
    casesListEl.innerHTML = '';
    if (cases.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No cases yet';
      li.classList.add('empty');
      casesListEl.appendChild(li);
      return;
    }
    cases.forEach(cs => {
      const li = document.createElement('li');
      li.textContent = cs.title || 'Untitled case';
      li.dataset.id = cs.id;
      if (cs.id === currentCaseId) {
        li.classList.add('active');
      }
      li.addEventListener('click', () => {
        selectCase(cs.id);
      });
      casesListEl.appendChild(li);
    });
  }

  /**
   * Select a case by id. Updates the currentCaseId and refreshes all
   * detail views.
   * @param {string} id
   */
  function selectCase(id) {
    currentCaseId = id;
    renderCasesList();
    const cs = getCaseById(id);
    if (!cs) {
      // Fallback if the case is missing
      noSelectionEl.textContent = 'Case not found.';
      caseInfoEl.classList.add('hidden');
      return;
    }
    noSelectionEl.style.display = 'none';
    caseInfoEl.classList.remove('hidden');
    caseTitleDisplay.textContent = cs.title || 'Untitled case';
    caseDescDisplay.textContent = cs.description || '';
    renderDocuments(cs);
    renderEvidence(cs);
    renderTimeline(cs);
    renderFoia(cs);
  }

  /**
   * Render the documents list for the selected case.
   * @param {object} cs
   */
  function renderDocuments(cs) {
    documentsListEl.innerHTML = '';
    if (!cs.documents || cs.documents.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No documents.';
      documentsListEl.appendChild(li);
      return;
    }
    cs.documents.forEach(doc => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.textContent = doc.name;
      link.href = doc.content || '#';
      link.target = '_blank';
      if (!doc.content) {
        link.addEventListener('click', (e) => e.preventDefault());
      }
      li.appendChild(link);
      documentsListEl.appendChild(li);
    });
  }

  /**
   * Render the evidence list for the selected case.
   * @param {object} cs
   */
  function renderEvidence(cs) {
    evidenceListEl.innerHTML = '';
    if (!cs.evidence || cs.evidence.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No evidence.';
      evidenceListEl.appendChild(li);
      return;
    }
    cs.evidence.forEach(ev => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.textContent = ev.name;
      link.href = ev.content || '#';
      link.target = '_blank';
      if (!ev.content) {
        link.addEventListener('click', (e) => e.preventDefault());
      }
      li.appendChild(link);
      evidenceListEl.appendChild(li);
    });
  }

  /**
   * Render the timeline events for the selected case.
   * @param {object} cs
   */
  function renderTimeline(cs) {
    timelineListEl.innerHTML = '';
    if (!cs.timeline || cs.timeline.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No events.';
      timelineListEl.appendChild(li);
      return;
    }
    // Sort events by date ascending
    const sorted = cs.timeline.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    sorted.forEach(ev => {
      const li = document.createElement('li');
      li.textContent = `${ev.date}: ${ev.title} — ${ev.description || ''}`;
      timelineListEl.appendChild(li);
    });
  }

  /**
   * Render FOIA requests for the selected case.
   * @param {object} cs
   */
  function renderFoia(cs) {
    foiaListEl.innerHTML = '';
    if (!cs.foia || cs.foia.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No FOIA requests.';
      foiaListEl.appendChild(li);
      return;
    }
    cs.foia.forEach(req => {
      const li = document.createElement('li');
      li.textContent = `${req.subject} — ${req.description || ''}`;
      foiaListEl.appendChild(li);
    });
  }

  /**
   * Handle new case creation.
   */
  newCaseForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const title = caseTitleInput.value.trim();
    const description = caseDescInput.value.trim();
    if (!title) return;
    const newCase = {
      id: uuid(),
      title,
      description,
      documents: [],
      evidence: [],
      timeline: [],
      foia: []
    };
    cases.push(newCase);
    saveCases();
    caseTitleInput.value = '';
    caseDescInput.value = '';
    renderCasesList();
    selectCase(newCase.id);
  });

  /**
   * Handle document upload for the current case.
   */
  addDocumentForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const cs = getCaseById(currentCaseId);
    if (!cs) return;
    const name = documentNameInput.value.trim();
    const file = documentFileInput.files[0];
    if (!name) return;
    const doc = { id: uuid(), name };
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        doc.content = reader.result;
        cs.documents.push(doc);
        saveCases();
        renderDocuments(cs);
      };
      reader.readAsDataURL(file);
    } else {
      // no file selected, just save name
      cs.documents.push(doc);
      saveCases();
      renderDocuments(cs);
    }
    documentNameInput.value = '';
    documentFileInput.value = '';
  });

  /**
   * Handle evidence upload for the current case.
   */
  addEvidenceForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const cs = getCaseById(currentCaseId);
    if (!cs) return;
    const name = evidenceNameInput.value.trim();
    const file = evidenceFileInput.files[0];
    if (!name) return;
    const ev = { id: uuid(), name };
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        ev.content = reader.result;
        cs.evidence.push(ev);
        saveCases();
        renderEvidence(cs);
      };
      reader.readAsDataURL(file);
    } else {
      cs.evidence.push(ev);
      saveCases();
      renderEvidence(cs);
    }
    evidenceNameInput.value = '';
    evidenceFileInput.value = '';
  });

  /**
   * Handle timeline event creation.
   */
  addTimelineForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const cs = getCaseById(currentCaseId);
    if (!cs) return;
    // Use provided date if supplied, otherwise default to today's date.
    let date = timelineDateInput.value;
    const title = timelineTitleInput.value.trim();
    const description = timelineDescInput.value.trim();
    if (!title) return;
    if (!date) {
      // Default to current date in ISO format (YYYY-MM-DD)
      date = new Date().toISOString().split('T')[0];
    }
    const event = { id: uuid(), date, title, description };
    cs.timeline.push(event);
    saveCases();
    renderTimeline(cs);
    timelineDateInput.value = '';
    timelineTitleInput.value = '';
    timelineDescInput.value = '';
  });

  /**
   * Handle FOIA request creation.
   */
  addFoiaForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const cs = getCaseById(currentCaseId);
    if (!cs) return;
    const subject = foiaSubjectInput.value.trim();
    const description = foiaDescInput.value.trim();
    if (!subject) return;
    const req = { id: uuid(), subject, description };
    cs.foia.push(req);
    saveCases();
    renderFoia(cs);
    foiaSubjectInput.value = '';
    foiaDescInput.value = '';
  });

  /**
   * Perform a search across cases, documents, evidence and FOIA requests.
   * Results are displayed as a list; clicking a result selects the case.
   */
  function performSearch(query) {
    searchResultsEl.innerHTML = '';
    if (!query) return;
    const q = query.toLowerCase();
    const results = [];
    cases.forEach(cs => {
      if (cs.title && cs.title.toLowerCase().includes(q)) {
        results.push({ type: 'Case', title: cs.title, caseId: cs.id });
      }
      if (cs.documents) {
        cs.documents.forEach(doc => {
          if (doc.name && doc.name.toLowerCase().includes(q)) {
            results.push({ type: 'Document', title: doc.name, caseId: cs.id });
          }
        });
      }
      if (cs.evidence) {
        cs.evidence.forEach(ev => {
          if (ev.name && ev.name.toLowerCase().includes(q)) {
            results.push({ type: 'Evidence', title: ev.name, caseId: cs.id });
          }
        });
      }
      if (cs.timeline) {
        cs.timeline.forEach(ev => {
          if (
            (ev.title && ev.title.toLowerCase().includes(q)) ||
            (ev.description && ev.description.toLowerCase().includes(q))
          ) {
            results.push({ type: 'Timeline', title: `${ev.date}: ${ev.title}`, caseId: cs.id });
          }
        });
      }
      if (cs.foia) {
        cs.foia.forEach(req => {
          if (
            (req.subject && req.subject.toLowerCase().includes(q)) ||
            (req.description && req.description.toLowerCase().includes(q))
          ) {
            results.push({ type: 'FOIA', title: req.subject, caseId: cs.id });
          }
        });
      }
    });
    results.forEach(res => {
      const li = document.createElement('li');
      li.textContent = `${res.type}: ${res.title}`;
      li.addEventListener('click', () => {
        selectCase(res.caseId);
        // Clear search results after selection for clarity
        searchResultsEl.innerHTML = '';
        searchInputEl.value = '';
      });
      searchResultsEl.appendChild(li);
    });
  }

  // Attach search input handler
  searchInputEl.addEventListener('input', function () {
    const query = searchInputEl.value.trim();
    performSearch(query);
  });

  // Initial render of cases list
  renderCasesList();
  // If there is at least one case, select the first by default
  if (cases.length > 0) {
    selectCase(cases[0].id);
  }
})();
