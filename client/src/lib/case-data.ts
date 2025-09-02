// Case Intelligence Portal Data
// This file contains the case data structure and initial dataset

export type DocType = "pdf" | "image" | "audio" | "video" | "transcript" | "letter" | "other";

export type Doc = {
  id: string;
  title: string;
  type: DocType;
  date?: string | null;
  path?: string | null;
  summary?: string | null;
  tags?: string[] | null;
  sourceNote?: string | null;
};

export type TimelineEvent = {
  id: string;
  date: string;
  title: string;
  summary?: string | null;
  docRefs?: string[] | null;
  tags?: string[] | null;
};

export type FoiaRequest = {
  id: string;
  agency: string;
  requestNumber?: string;
  status: "submitted" | "pending" | "completed" | "denied";
  submittedDate: string;
  responseDate?: string;
  description: string;
  responseSummary?: string;
  documentsReceived?: string[];
};

export type LegalIssue = {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  category: "constitutional" | "civil-rights" | "procedural" | "evidence";
};

// Case Documents Data - Real Federal Civil Rights Case Documents
export const CASE_DOCUMENTS: Doc[] = [
  {
    id: "foia-us-marshals",
    title: "FOIA Request to US Marshals Service",
    type: "pdf",
    date: "2025-06-27",
    path: "/src/assets/documents/foia-us marshalls_1756543299931.pdf",
    summary: "Freedom of Information Act request seeking communications, BOLOs, and surveillance records related to coordinated interstate targeting of journalist Matthew Reardon.",
    tags: ["FOIA", "US Marshals", "surveillance", "BOLOs", "First Amendment"],
    sourceNote: "Official FOIA request filed June 27, 2025 - seeking evidence of gangstalking and coordinated harassment.",
  },
  {
    id: "june-courthouse-transcripts",
    title: "June 23 & 26, 2025 – Federal Courthouse Interactions",
    type: "transcript",
    date: "2025-06-23",
    path: "/src/assets/documents/6-23 and 26_1756543299931.pdf",
    summary: "Detailed transcripts of First Amendment audit interactions with US Marshals at Lafayette federal courthouse. Shows escalation from peaceful journalism to threats of arrest.",
    tags: ["transcript", "courthouse", "First Amendment", "US Marshals", "audit"],
    sourceNote: "Court reporter style transcript of verbal exchanges - evidence of constitutional rights violations.",
  },
  {
    id: "marshal-assault-statement",
    title: "Public Statement on Federal Marshal Assault",
    type: "pdf",
    date: "2025-08-26",
    path: "/src/assets/documents/my public address of the marshall attack_1756543299931.pdf",
    summary: "Detailed first-person account of August 25th assault by US Marshal Hayden Newsom. Documents destruction of camera equipment, physical assault, torture, and unlawful detention.",
    tags: ["assault", "police brutality", "torture", "First Amendment", "civil rights"],
    sourceNote: "Official public statement documenting federal crimes and constitutional violations.",
  },
  {
    id: "foia-response-redacted",
    title: "US Marshals FOIA Response - Heavily Redacted",
    type: "pdf",
    date: "2025-08-22",
    path: "/src/assets/documents/Final Response Letter for PA Redacted Documents_1756543299931.pdf",
    summary: "Partial release of 10 pages with heavy redactions. Confirms multi-state surveillance operation involving JSD, W/LA, N/MS, S/TX, D/UT offices. Cites law enforcement exemptions.",
    tags: ["FOIA", "USMS", "redacted", "surveillance", "multi-state", "conspiracy"],
    sourceNote: "Evidence of coordinated federal surveillance across multiple jurisdictions - smoking gun document.",
  },
  {
    id: "aug25-livestream",
    title: "August 25, 2025 - Livestream of Federal Courthouse Protest",
    type: "transcript",
    date: "2025-08-25",
    path: "/src/assets/documents/Aug 25_1756543299931.pdf",
    summary: "Real-time documentation of events leading to assault. Shows peaceful protest, marshal's invitation to enter (entrapment), and immediate threats upon entry. Critical evidence.",
    tags: ["livestream", "entrapment", "assault", "federal courthouse", "evidence"],
    sourceNote: "Live video transcript showing premeditated entrapment by federal agents.",
  },
  {
    id: "podcast-testimony",
    title: "TalksGow Podcast - Legal Case Background",
    type: "transcript",
    date: "2025-07-15",
    path: "/src/assets/documents/podcast talksgow_1756543299931.pdf",
    summary: "Detailed testimony and background on the federal civil rights case. References Bennett v. Hendricks precedent and similarities to current gangstalking patterns.",
    tags: ["testimony", "podcast", "legal precedent", "Bennett case", "background"],
    sourceNote: "Public testimony providing legal context and case background for civil rights violations.",
  },
  {
    id: "responsive-records",
    title: "Responsive Records Package",
    type: "pdf",
    date: "2025-08-22",
    path: "/src/assets/documents/responsive records_1756543299931.pdf",
    summary: "Collection of government responsive documents and forms related to the FOIA requests and federal surveillance operations.",
    tags: ["responsive records", "government documents", "FOIA", "surveillance"],
    sourceNote: "Official government records responsive to FOIA requests - evidence package.",
  },
];

// Timeline Events Data
export const CASE_TIMELINE: TimelineEvent[] = [
  {
    id: "t1",
    date: "2025-06-23",
    title: "Lobby interaction recorded; First Amendment discussion",
    summary: "Transcript includes exchanges with officers, supervisor arrival, and recording purpose.",
    docRefs: ["june-transcripts"],
    tags: ["recording", "lobby"],
  },
  {
    id: "t2",
    date: "2025-06-27",
    title: "FOIA filed with USMS",
    summary: "Seeks comms/BOLOs and interstate dissemination of info.",
    docRefs: ["foia-request"],
    tags: ["FOIA"],
  },
  {
    id: "t3",
    date: "2025-08-22",
    title: "USMS FOIA response (partial release & exemptions)",
    summary: "Cites privacy and law-enforcement exemptions; multiple districts identified.",
    docRefs: ["foia-response"],
    tags: ["FOIA", "exemptions"],
  },
  {
    id: "t4",
    date: "2025-08-25",
    title: "Livestream at courthouse and doorway exchange",
    summary: "Alleges being waved in then threatened with arrest; signage and BOLO remarks.",
    docRefs: ["aug25-stream", "bill-image"],
    tags: ["livestream", "courthouse"],
  },
  {
    id: "t5",
    date: "2025-08-25",
    title: "Criminal Incident at Federal Courthouse",
    summary: "Defendant Matthew Reardon allegedly engaged in disorderly conduct on federal property. Created loud or unusual noise, created a nuisance, and/or unreasonably obstructed entrances, foyers, lobbies, or corridors at the United States District Court, Western District of Louisiana, Lafayette Division.",
    docRefs: ["complaint", "incident-report"],
    tags: ["criminal-incident", "federal-property", "disorderly-conduct", "41-cfr"],
  },
  {
    id: "t6",
    date: "2025-08-25",
    title: "Criminal Charges Filed",
    summary: "United States v. Matthew Reardon - Criminal complaint filed in U.S. District Court, Western District of Louisiana. Case No. 6:25-MJ-00153-01 assigned to Magistrate Whitehurst. Charges under 41 C.F.R. § 102-74.390 for conduct on federal property.",
    docRefs: ["criminal-complaint", "case-filing"],
    tags: ["criminal-charges", "magistrate", "federal-court", "filing"],
  },
  {
    id: "t7",
    date: "2025-08-26",
    title: "Public address on Marshal incident",
    summary: "Detailed narrative of force, detention, medical care, transport, and conditions.",
    docRefs: ["public-address"],
    tags: ["statement"],
  },
  {
    id: "t8",
    date: "2025-08-26",
    title: "Case Assignment and Legal Team",
    summary: "Acting U.S. Attorney Alexander C. Van Hook and Assistant U.S. Attorney Ladonte A. Murphy (La. Bar No. 32772) assigned to prosecute United States v. Matthew Reardon. Prosecution team established at U.S. Attorney's Office, 800 Lafayette Street, Suite 2200, Lafayette, Louisiana.",
    docRefs: ["case-assignment", "prosecutor-assignment"],
    tags: ["legal-team", "prosecution", "assignment", "usao"],
  },
  {
    id: "t9",
    date: "2025-08-27",
    title: "Initial Appearance Scheduled",
    summary: "Initial appearance and arraignment scheduled before Magistrate Whitehurst for United States v. Matthew Reardon, Case No. 6:25-MJ-00153-01. Defendant to be advised of charges under 41 C.F.R. § 102-74.390 and potential penalties under 41 C.F.R. § 102-74.450.",
    docRefs: ["scheduling-order", "court-notice"],
    tags: ["initial-appearance", "arraignment", "magistrate", "scheduling"],
  },
];

// FOIA Requests Data
export const FOIA_REQUESTS: FoiaRequest[] = [
  {
    id: "foia-1",
    agency: "US Marshals Service",
    requestNumber: "2025-FOIA-08901",
    status: "completed",
    submittedDate: "2025-06-27",
    responseDate: "2025-08-22",
    description: "Request for communications, BOLOs, and inter-agency records",
    responseSummary: "14 pages released with exemptions (b)(6), (b)(7)(C), (b)(7)(E)",
    documentsReceived: ["foia-response"],
  },
  {
    id: "foia-2",
    agency: "FBI Field Office",
    status: "pending",
    submittedDate: "2025-08-15",
    description: "Request for field office communications and surveillance records",
  },
  {
    id: "foia-3",
    agency: "Mississippi Lafayette County Court",
    status: "submitted",
    submittedDate: "2025-08-28",
    description: "Request for state court records and proceedings",
  },
];

// Legal Issues Analysis
export const LEGAL_ISSUES: LegalIssue[] = [
  {
    id: "issue-1",
    title: "First Amendment Violation",
    description: "Prior restraint on protected speech in public forum",
    priority: "high",
    category: "constitutional",
  },
  {
    id: "issue-2",
    title: "Excessive Force",
    description: "Physical assault without legal justification",
    priority: "critical",
    category: "civil-rights",
  },
  {
    id: "issue-3",
    title: "Due Process Violation",
    description: "Procedural irregularities in detention process",
    priority: "medium",
    category: "procedural",
  },
  {
    id: "issue-4",
    title: "Retaliation",
    description: "Pattern of escalating response to protected activity",
    priority: "high",
    category: "civil-rights",
  },
];

// Case Statistics
export const CASE_STATS = {
  totalDocuments: CASE_DOCUMENTS.length,
  timelineEvents: CASE_TIMELINE.length,
  evidenceItems: CASE_DOCUMENTS.filter(d => d.type === "image" || d.type === "audio").length,
  foiaRequests: FOIA_REQUESTS.length,
  potentialViolations: LEGAL_ISSUES.length,
};

// Utility Functions
export function formatDate(d?: string) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString(undefined, { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  } catch {
    return d;
  }
}

export function getDocumentsByType(type: DocType) {
  return CASE_DOCUMENTS.filter(doc => doc.type === type);
}

export function getTimelineEventsByDateRange(startDate: string, endDate: string) {
  return CASE_TIMELINE.filter(event => 
    event.date >= startDate && event.date <= endDate
  );
}

export function getDocumentById(id: string) {
  return CASE_DOCUMENTS.find(doc => doc.id === id);
}
