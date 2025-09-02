import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Case {
  id: string;
  title: string;
  caseNumber?: string;
  description?: string;
  caseType: string;
  status: string;
  priority: string;
  court?: string;
  jurisdiction?: string;
  opposingParty?: string;
  leadAttorney?: string;
  dateOpened: string;
  dateClosed?: string;
  tags: string[];
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

interface CaseContextType {
  currentCase: Case | null;
  setCurrentCase: (caseItem: Case | null) => void;
  cases: Case[];
  setCases: (cases: Case[]) => void;
  isLoading: boolean;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

interface CaseProviderProps {
  children: ReactNode;
}

// Sample cases that match your real case data
const SAMPLE_CASES: Case[] = [
  {
    id: "1",
    title: "United States v. Matthew Reardon",
    caseNumber: "6:25-MJ-00153-01",
    description: "Federal criminal case charging defendant with loitering, exhibiting disorderly conduct, or exhibiting other conduct on federal property. Allegations include creating loud or unusual noise, creating a nuisance, and/or unreasonably obstructing the usual use of entrances, foyers, lobbies, or corridors on federal property.",
    caseType: "criminal",
    status: "active",
    priority: "high",
    court: "United States District Court, Western District of Louisiana, Lafayette Division",
    jurisdiction: "Federal",
    opposingParty: "Matthew Reardon",
    leadAttorney: "Ladonte A. Murphy (AUSA)",
    dateOpened: "2025-08-25",
    tags: ["criminal", "federal-property", "disorderly-conduct", "magistrate", "41-cfr"],
    notes: "Case before Magistrate Whitehurst. Charges under 41 C.F.R. § 102-74.390 with penalty provision 41 C.F.R. § 102-74.450. Acting U.S. Attorney: Alexander C. Van Hook. Assistant U.S. Attorney: Ladonte A. Murphy (La. Bar No. 32772).",
    isActive: true,
    createdAt: "2025-08-25",
  },
  {
    id: "2",
    title: "Federal Civil Rights Violation Case",
    caseNumber: "2025-CV-8901",
    description: "Constitutional violations by US Marshals, unlawful arrest, and First Amendment rights infringement at Lafayette federal courthouse.",
    caseType: "civil_rights",
    status: "active",
    priority: "urgent",
    court: "US District Court - Western District of Louisiana",
    jurisdiction: "Federal",
    opposingParty: "United States Marshals Service",
    leadAttorney: "Constitutional Rights Attorney",
    dateOpened: "2025-08-25",
    tags: ["constitutional", "federal", "civil-rights", "first-amendment"],
    notes: "High-profile case involving federal agent misconduct and constitutional violations.",
    isActive: true,
    createdAt: "2025-08-25",
  },
  {
    id: "3",
    title: "FOIA Appeal Case",
    caseNumber: "2025-FOIA-001",
    description: "Appeal of denied FOIA requests for surveillance records and inter-agency communications.",
    caseType: "administrative",
    status: "active",
    priority: "high",
    court: "Administrative Court",
    jurisdiction: "Federal",
    opposingParty: "US Marshals Service",
    leadAttorney: "FOIA Specialist",
    dateOpened: "2025-06-27",
    tags: ["foia", "transparency", "government-records"],
    notes: "Multiple agencies involved, seeking disclosure of surveillance operations.",
    isActive: true,
    createdAt: "2025-06-27",
  },
];

export function CaseProvider({ children }: CaseProviderProps) {
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [cases, setCases] = useState<Case[]>(SAMPLE_CASES);
  const [isLoading, setIsLoading] = useState(false);

  // Set the first case as default if none selected
  useEffect(() => {
    if (!currentCase && cases.length > 0) {
      setCurrentCase(cases[0]); // This will now default to the Reardon case
    }
  }, [cases, currentCase]);

  // Save current case to localStorage
  useEffect(() => {
    if (currentCase) {
      localStorage.setItem('currentCaseId', currentCase.id);
    }
  }, [currentCase]);

  // Load current case from localStorage on mount
  useEffect(() => {
    const savedCaseId = localStorage.getItem('currentCaseId');
    if (savedCaseId && cases.length > 0) {
      const savedCase = cases.find(c => c.id === savedCaseId);
      if (savedCase) {
        setCurrentCase(savedCase);
      }
    }
  }, [cases]);

  const value = {
    currentCase,
    setCurrentCase,
    cases,
    setCases,
    isLoading,
  };

  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
}

export function useCase() {
  const context = useContext(CaseContext);
  if (context === undefined) {
    throw new Error('useCase must be used within a CaseProvider');
  }
  return context;
}

export function useCases() {
  const { cases, setCases } = useCase();
  return { cases, setCases };
}

export function useCurrentCase() {
  const { currentCase, setCurrentCase } = useCase();
  return { currentCase, setCurrentCase };
}