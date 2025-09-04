import React, { useState, useEffect } from 'react';

/**
 * CaseBuddy React implementation.
 *
 * This component replicates the behaviour of the original static CaseBuddy
 * application using React hooks. Cases, documents, evidence, timeline events
 * and FOIA requests are all managed in component state and persisted to
 * localStorage so that data survives page reloads. A simple search across
 * all entities is provided.
 */
export default function App() {
  // State for all cases and the currently selected case
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(null);

  // State for form inputs
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseDesc, setNewCaseDesc] = useState('');

  const [documentName, setDocumentName] = useState('');
  const [documentFile, setDocumentFile] = useState(null);

  const [evidenceName, setEvidenceName] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);

  const [eventDate, setEventDate] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');

  const [foiaSubject, setFoiaSubject] = useState('');
  const [foiaDesc, setFoiaDesc] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  /**
   * Helper to generate a unique identifier. Uses current timestamp and a random
   * component to minimise the chance of collisions.
   */
  function uuid() {
    return (
      Date.now().toString(36) + Math.random().toString(36).substring(2, 10)
    );
  }

  // Load cases from localStorage on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cases');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCases(parsed);
          // Select the first case by default for convenience
          if (parsed.length > 0) {
            setSelectedCaseId(parsed[0].id);
          }
        }
      }
    } catch (err) {
      console.warn('Error loading cases from localStorage', err);
    }
  }, []);

  // Persist cases to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('cases', JSON.stringify(cases));
    } catch (err) {
      console.error('Error saving cases to localStorage', err);
    }
  }, [cases]);

  /**
   * Find a case by its identifier.
   * @param {string} id
   */
  function getCaseById(id) {
    return cases.find((cs) => cs.id === id);
  }

  /**
   * Handle adding a new case. Resets the form and selects the new case.
   */
  function handleAddCase(e) {
    e.preventDefault();
    const title = newCaseTitle.trim();
    const description = newCaseDesc.trim();
    if (!title) return;
    const id = uuid();
    const newCase = {
      id,
      title,
      description,
      documents: [],
      evidence: [],
      timeline: [],
      foia: []
    };
    setCases((prev) => [...prev, newCase]);
    setSelectedCaseId(id);
    setNewCaseTitle('');
    setNewCaseDesc('');
  }

  /**
   * Handle selection of a case when clicked in the sidebar.
   * @param {string} id
   */
  function handleSelectCase(id) {
    setSelectedCaseId(id);
  }

  /**
   * Generic helper to update a specific case in the state. Accepts a callback
   * that receives the current case and returns an updated copy.
   * @param {string} id
   * @param {function} updater
   */
  function updateCase(id, updater) {
    setCases((prev) =>
      prev.map((cs) => (cs.id === id ? updater({ ...cs }) : cs))
    );
  }

  /**
   * Handle adding a document to the selected case. If a file is provided,
   * read it as a data URL using FileReader. The document name must be
   * provided.
   */
  function handleAddDocument(e) {
    e.preventDefault();
    const name = documentName.trim();
    if (!selectedCaseId || !name) return;
    const file = documentFile;
    const id = uuid();
    // Function to push the document into the case once content is ready
    const pushDoc = (content) => {
      updateCase(selectedCaseId, (cs) => {
        const doc = { id, name, content };
        cs.documents = cs.documents ? [...cs.documents, doc] : [doc];
        return cs;
      });
    };
    if (file) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        pushDoc(ev.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      pushDoc(undefined);
    }
    setDocumentName('');
    setDocumentFile(null);
    // Reset file input value manually; React will not control file inputs
    e.target.reset();
  }

  /**
   * Handle adding evidence to the selected case. Similar to documents, but
   * stored in the evidence array.
   */
  function handleAddEvidence(e) {
    e.preventDefault();
    const name = evidenceName.trim();
    if (!selectedCaseId || !name) return;
    const file = evidenceFile;
    const id = uuid();
    const pushEv = (content) => {
      updateCase(selectedCaseId, (cs) => {
        const ev = { id, name, content };
        cs.evidence = cs.evidence ? [...cs.evidence, ev] : [ev];
        return cs;
      });
    };
    if (file) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        pushEv(ev.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      pushEv(undefined);
    }
    setEvidenceName('');
    setEvidenceFile(null);
    e.target.reset();
  }

  /**
   * Handle adding a timeline event. Defaults the date to today if none is
   * supplied. Resets event inputs after adding.
   */
  function handleAddEvent(e) {
    e.preventDefault();
    const title = eventTitle.trim();
    if (!selectedCaseId || !title) return;
    let date = eventDate;
    if (!date) {
      // Use current date in ISO format (YYYY-MM-DD)
      date = new Date().toISOString().split('T')[0];
    }
    const description = eventDesc.trim();
    const id = uuid();
    updateCase(selectedCaseId, (cs) => {
      const evt = { id, date, title, description };
      cs.timeline = cs.timeline ? [...cs.timeline, evt] : [evt];
      return cs;
    });
    setEventDate('');
    setEventTitle('');
    setEventDesc('');
  }

  /**
   * Handle adding a FOIA request to the selected case. Requires a subject.
   */
  function handleAddFoia(e) {
    e.preventDefault();
    const subject = foiaSubject.trim();
    if (!selectedCaseId || !subject) return;
    const description = foiaDesc.trim();
    const id = uuid();
    updateCase(selectedCaseId, (cs) => {
      const req = { id, subject, description };
      cs.foia = cs.foia ? [...cs.foia, req] : [req];
      return cs;
    });
    setFoiaSubject('');
    setFoiaDesc('');
  }

  /**
   * Perform a search across cases, documents, evidence, timeline events and
   * FOIA requests. Updates the searchResults state with matching items. Each
   * result includes a type and the id of the case it belongs to for easy
   * navigation.
   */
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results = [];
    cases.forEach((cs) => {
      if (cs.title && cs.title.toLowerCase().includes(q)) {
        results.push({ type: 'Case', title: cs.title, caseId: cs.id });
      }
      cs.documents?.forEach((doc) => {
        if (doc.name && doc.name.toLowerCase().includes(q)) {
          results.push({ type: 'Document', title: doc.name, caseId: cs.id });
        }
      });
      cs.evidence?.forEach((ev) => {
        if (ev.name && ev.name.toLowerCase().includes(q)) {
          results.push({ type: 'Evidence', title: ev.name, caseId: cs.id });
        }
      });
      cs.timeline?.forEach((ev) => {
        if (
          (ev.title && ev.title.toLowerCase().includes(q)) ||
          (ev.description && ev.description.toLowerCase().includes(q))
        ) {
          results.push({
            type: 'Timeline',
            title: `${ev.date}: ${ev.title}`,
            caseId: cs.id,
          });
        }
      });
      cs.foia?.forEach((req) => {
        if (
          (req.subject && req.subject.toLowerCase().includes(q)) ||
          (req.description && req.description.toLowerCase().includes(q))
        ) {
          results.push({ type: 'FOIA', title: req.subject, caseId: cs.id });
        }
      });
    });
    setSearchResults(results);
  }, [searchQuery, cases]);

  // Determine the currently selected case object for easy access
  const selectedCase = selectedCaseId ? getCaseById(selectedCaseId) : null;

  return (
    <div>
      <header className="header">
        <h1>CaseBuddy&nbsp;– Case Intelligence Portal</h1>
        <p className="subtitle">
          Organise, analyse and manage your legal cases with ease.
        </p>
      </header>
      <div className="container">
        <aside id="cases-section">
          <h2>Cases</h2>
          <ul id="cases-list" className="list">
            {cases.length === 0 ? (
              <li className="empty">No cases yet</li>
            ) : (
              cases.map((cs) => (
                <li
                  key={cs.id}
                  className={
                    cs.id === selectedCaseId ? 'active' : undefined
                  }
                  onClick={() => handleSelectCase(cs.id)}
                >
                  {cs.title || 'Untitled case'}
                </li>
              ))
            )}
          </ul>
          <h3>Add&nbsp;New&nbsp;Case</h3>
          <form id="new-case-form" className="form" onSubmit={handleAddCase}>
            <input
              type="text"
              placeholder="Case title"
              value={newCaseTitle}
              onChange={(e) => setNewCaseTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Case description"
              value={newCaseDesc}
              onChange={(e) => setNewCaseDesc(e.target.value)}
            />
            <button type="submit">Add&nbsp;Case</button>
          </form>
          <h3>Search</h3>
          <input
            type="text"
            placeholder="Search cases, documents, evidence…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchResults.length > 0 && (
            <ul className="list search" id="search-results">
              {searchResults.map((res, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    handleSelectCase(res.caseId);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                >
                  {`${res.type}: ${res.title}`}
                </li>
              ))}
            </ul>
          )}
        </aside>
        <main id="case-details">
          <h2>Case&nbsp;Details</h2>
          {!selectedCase ? (
            <div id="no-selection">Select a case to view its details.</div>
          ) : (
            <div id="case-info">
              <h3>{selectedCase.title || 'Untitled case'}</h3>
              <p>{selectedCase.description}</p>
              {/* Documents Section */}
              <section>
                <h4>Documents</h4>
                <ul id="documents-list" className="list">
                  {(!selectedCase.documents ||
                    selectedCase.documents.length === 0) && (
                    <li>No documents.</li>
                  )}
                  {selectedCase.documents?.map((doc) => (
                    <li key={doc.id}>
                      {doc.content ? (
                        <a href={doc.content} target="_blank" rel="noopener noreferrer">
                          {doc.name}
                        </a>
                      ) : (
                        doc.name
                      )}
                    </li>
                  ))}
                </ul>
                <form
                  id="add-document-form"
                  className="form inline"
                  onSubmit={handleAddDocument}
                >
                  <input
                    type="text"
                    placeholder="Document name"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    required
                  />
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    onChange={(e) => setDocumentFile(e.target.files[0])}
                  />
                  <button type="submit">Add&nbsp;Document</button>
                </form>
              </section>
              {/* Evidence Section */}
              <section>
                <h4>Evidence</h4>
                <ul id="evidence-list" className="list">
                  {(!selectedCase.evidence || selectedCase.evidence.length === 0) && (
                    <li>No evidence.</li>
                  )}
                  {selectedCase.evidence?.map((ev) => (
                    <li key={ev.id}>
                      {ev.content ? (
                        <a href={ev.content} target="_blank" rel="noopener noreferrer">
                          {ev.name}
                        </a>
                      ) : (
                        ev.name
                      )}
                    </li>
                  ))}
                </ul>
                <form
                  id="add-evidence-form"
                  className="form inline"
                  onSubmit={handleAddEvidence}
                >
                  <input
                    type="text"
                    placeholder="Evidence name"
                    value={evidenceName}
                    onChange={(e) => setEvidenceName(e.target.value)}
                    required
                  />
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setEvidenceFile(e.target.files[0])}
                  />
                  <button type="submit">Add&nbsp;Evidence</button>
                </form>
              </section>
              {/* Timeline Section */}
              <section>
                <h4>Timeline</h4>
                <ul id="timeline-list" className="list">
                  {(!selectedCase.timeline ||
                    selectedCase.timeline.length === 0) && (
                    <li>No timeline events.</li>
                  )}
                  {selectedCase.timeline?.map((evt) => (
                    <li key={evt.id}>
                      {evt.date}: {evt.title}
                      {evt.description ? ` — ${evt.description}` : ''}
                    </li>
                  ))}
                </ul>
                <form
                  id="add-timeline-form"
                  className="form inline"
                  onSubmit={handleAddEvent}
                >
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Event title"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    required
                  />
                    <input
                      type="text"
                      placeholder="Event description"
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
                    />
                  <button type="submit">Add&nbsp;Event</button>
                </form>
              </section>
              {/* FOIA Section */}
              <section>
                <h4>FOIA&nbsp;Requests</h4>
                <ul id="foia-list" className="list">
                  {(!selectedCase.foia || selectedCase.foia.length === 0) && (
                    <li>No FOIA requests.</li>
                  )}
                  {selectedCase.foia?.map((req) => (
                    <li key={req.id}>
                      {req.subject}
                      {req.description ? ` — ${req.description}` : ''}
                    </li>
                  ))}
                </ul>
                <form
                  id="add-foia-form"
                  className="form"
                  onSubmit={handleAddFoia}
                >
                  <input
                    type="text"
                    placeholder="Request subject"
                    value={foiaSubject}
                    onChange={(e) => setFoiaSubject(e.target.value)}
                    required
                  />
                  <textarea
                    placeholder="Request description"
                    value={foiaDesc}
                    onChange={(e) => setFoiaDesc(e.target.value)}
                  />
                  <button type="submit">Add&nbsp;FOIA&nbsp;Request</button>
                </form>
              </section>
            </div>
          )}
        </main>
      </div>
      <footer>
        <p>&copy; 2025 CaseBuddy – All rights reserved.</p>
      </footer>
    </div>
  );
}