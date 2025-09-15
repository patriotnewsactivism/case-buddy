import React, { useState, useCallback } from 'react';
import {
  Search,
  Plus,
  FileText,
  Calendar,
  Users,
  Brain,
  Settings,
  Bell,
  Filter,
  MoreVertical,
  Eye,
  Download,
  Upload,
  Clock,
  AlertCircle,
  CheckCircle,
  Target,
  TrendingUp,
  Shield,
  Scale,
  Gavel,
  BookOpen,
  MessageSquare,
  Camera,
  Mic,
  Video,
  Map,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Star,
  Flag,
  Archive,
  Edit3,
  Trash2,
  Share,
  Copy,
  Link,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Timer,
  Briefcase,
  Award,
  Globe,
  Lock,
  Unlock,
  Database,
  Cloud,
  Smartphone,
  Monitor,
  Headphones,
  Printer,
  Wifi,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  X,
  Menu,
  Home,
  Folder,
  Tag,
  Hash,
  AtSign,
  Paperclip,
  Send,
  Save,
  Power,
  LogOut,
  UserPlus,
  Key,
  ShieldCheck,
  AlertTriangle,
  Info,
  HelpCircle,
  ExternalLink,
  Loader2,
  PlayCircle,
  StopCircle,
  RotateCcw,
  FileSearch,
  Sparkles,
  ArrowRight,
  Check,
  AlertOctagon,
  TrendingDown
} from 'lucide-react';

const CaseBuddy = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedCase, setSelectedCase] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);

  // AI Tool States
  const [documentAnalysis, setDocumentAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [caseAnalysisResult, setCaseAnalysisResult] = useState(null);
  const [isAnalyzingCase, setIsAnalyzingCase] = useState(false);
  const [draftedDocument, setDraftedDocument] = useState(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [isCreatingTimeline, setIsCreatingTimeline] = useState(false);

  // Mock data for demonstration
  const cases = [
    {
      id: 1,
      title: 'Johnson v. Metro PD',
      type: 'Civil Rights - § 1983',
      status: 'active',
      priority: 'high',
      lastActivity: '2 hours ago',
      dueDate: '2025-09-15',
      progress: 75,
      evidenceCount: 47,
      filingCount: 12,
      clientName: 'Marcus Johnson',
      damages: '$500,000',
      jurisdiction: 'Federal District Court',
      description: 'Excessive force claim against Metro Police Department involving wrongful arrest and injuries during traffic stop.'
    },
    {
      id: 2,
      title: 'Davis Employment Discrimination',
      type: 'Title VII - Workplace',
      status: 'discovery',
      priority: 'medium',
      lastActivity: '1 day ago',
      dueDate: '2025-10-01',
      progress: 45,
      evidenceCount: 23,
      filingCount: 8,
      clientName: 'Sarah Davis',
      damages: '$125,000',
      jurisdiction: 'State Superior Court',
      description: 'Gender discrimination and retaliation claim against tech company for denial of promotion and hostile work environment.'
    },
    {
      id: 3,
      title: 'Williams Housing Rights',
      type: 'Fair Housing Act',
      status: 'filing',
      priority: 'low',
      lastActivity: '3 days ago',
      dueDate: '2025-09-30',
      progress: 20,
      evidenceCount: 15,
      filingCount: 3,
      clientName: 'Robert Williams',
      damages: '$75,000',
      jurisdiction: 'Federal District Court',
      description: 'Housing discrimination based on race and family status in apartment rental denial.'
    }
  ];

  const evidenceItems = [
    {
      id: 1,
      title: 'Police Body Camera Footage',
      type: 'video',
      dateAdded: '2025-09-10',
      size: '2.4 GB',
      tags: ['key evidence', 'video', 'incident'],
      status: 'analyzed',
      aiConfidence: 92,
      content:
        'Body camera footage showing traffic stop and subsequent arrest. Video clearly shows excessive force used during arrest process.'
    },
    {
      id: 2,
      title: 'Medical Records - Emergency Room',
      type: 'pdf',
      dateAdded: '2025-09-08',
      size: '12 MB',
      tags: ['medical', 'damages', 'injuries'],
      status: 'reviewed',
      aiConfidence: 88,
      content:
        'Emergency room records documenting injuries sustained during arrest including bruising, lacerations, and concussion.'
    },
    {
      id: 3,
      title: 'Witness Statement - John Doe',
      type: 'text',
      dateAdded: '2025-09-05',
      size: '2 KB',
      tags: ['witness', 'statement', 'eyewitness'],
      status: 'pending',
      aiConfidence: 0,
      content:
        'Witness statement from bystander who observed the entire incident and can testify to excessive force used by officers.'
    }
  ];

  const recentActivity = [
    { action: 'AI Analysis completed for Police Report', time: '30 minutes ago', type: 'ai' },
    { action: 'Motion for Summary Judgment filed', time: '2 hours ago', type: 'filing' },
    { action: 'New evidence uploaded: Surveillance Video', time: '4 hours ago', type: 'evidence' },
    { action: 'Deposition scheduled for plaintiff', time: '1 day ago', type: 'schedule' }
  ];

  const upcomingDeadlines = [
    { task: 'Discovery Response Due', date: '2025-09-15', priority: 'high', daysLeft: 4 },
    { task: 'Expert Witness Disclosure', date: '2025-09-20', priority: 'medium', daysLeft: 9 },
    { task: 'Pretrial Conference', date: '2025-10-05', priority: 'high', daysLeft: 24 }
  ];

  // Simulate AI Document Analysis
  const analyzeDocument = useCallback(async (file) => {
    setIsAnalyzing(true);
    setUploadedFile(file);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const mockAnalysis = {
      extractedText: `IN THE UNITED STATES DISTRICT COURT
FOR THE SOUTHERN DISTRICT OF NEW YORK

MARCUS JOHNSON,
                    Plaintiff,
v.                                    Case No. 1:25-cv-12345

METRO POLICE DEPARTMENT, et al.,
                    Defendants.

COMPLAINT FOR VIOLATION OF CIVIL RIGHTS

Plaintiff Marcus Johnson, by and through his attorneys, brings this action under 42 U.S.C. § 1983 for violations of his constitutional rights, and alleges as follows:

JURISDICTION AND VENUE

1. This Court has subject matter jurisdiction over this action pursuant to 28 U.S.C. §§ 1331 and 1343, as this action arises under the Constitution and laws of the United States.

2. Venue is proper in this district pursuant to 28 U.S.C. § 1391(b), as the events giving rise to this claim occurred within this judicial district.

PARTIES

3. Plaintiff Marcus Johnson is a resident of New York, New York.

4. Defendant Metro Police Department is a municipal entity organized under the laws of New York.`,

      confidence: 94,
      documentType: 'Civil Rights Complaint',
      keyFindings: [
        'Federal civil rights claim under 42 U.S.C. § 1983',
        'Subject matter jurisdiction properly alleged under 28 U.S.C. § 1331',
        'Proper venue established under 28 U.S.C. § 1391(b)',
        'Municipal defendant identified for potential Monell liability'
      ],

      legalAnalysis: `DOCUMENT ANALYSIS SUMMARY:

This is a federal civil rights complaint filed under 42 U.S.C. § 1983 against a municipal police department. The document demonstrates proper federal court jurisdiction and venue.

KEY LEGAL ELEMENTS IDENTIFIED:
• Constitutional Claims: The complaint appears to allege violations of the Fourth and Fourteenth Amendments
• Municipal Liability: The inclusion of the Metro Police Department as a defendant suggests potential Monell claims
• Proper Jurisdiction: Federal question jurisdiction is properly established under § 1331
• Venue: Properly established in the district where events occurred

STRATEGIC CONSIDERATIONS:
• Strong jurisdictional foundation for federal civil rights claim
• Municipal defendant opens possibility for policy/custom claims
• Document follows proper federal court formatting requirements
• Consider adding individual officer defendants if not already included

RECOMMENDED NEXT STEPS:
• Review for completeness of factual allegations
• Ensure all constitutional violations are properly pled
• Verify all defendants are properly identified and served
• Consider supplemental state law claims if applicable`,

      extractedDates: ['2025-09-15', '2025-08-23', '2025-07-12'],
      extractedParties: ['Marcus Johnson', 'Metro Police Department'],
      citations: ['42 U.S.C. § 1983', '28 U.S.C. § 1331', '28 U.S.C. § 1391(b)'],

      riskAssessment: {
        strengthScore: 85,
        risks: [
          'Ensure proper service of municipal defendant',
          'Verify statute of limitations compliance',
          'Consider qualified immunity defenses for individual officers'
        ],
        opportunities: [
          'Strong constitutional foundation',
          'Municipal liability potential',
          'Proper federal jurisdiction'
        ]
      }
    };

    setDocumentAnalysis(mockAnalysis);
    setIsAnalyzing(false);
  }, []);

  // Simulate Case Analysis
  const analyzeCaseFile = useCallback(async (caseId) => {
    setIsAnalyzingCase(true);

    await new Promise((resolve) => setTimeout(resolve, 4000));

    const mockCaseAnalysis = {
      caseId: caseId,
      overallScore: 78,
      winProbability: 82,

      caseTheory: {
        primary: 'Excessive Force under Fourth Amendment',
        alternative: 'Due Process Violation under Fourteenth Amendment',
        strengths: [
          'Clear video evidence of excessive force',
          'Medical documentation of injuries',
          'Independent witness testimony',
          'Municipal policy review potential'
        ],
        weaknesses: [
          'Need more evidence of municipal policy/custom',
          'Officer qualified immunity potential',
          'Conflicting witness accounts possible'
        ]
      },

      evidenceGaps: [
        'Officer training records',
        'Department use of force policies',
        'Previous complaint history',
        'Additional witness statements'
      ],

      recommendedActions: [
        'Request officer personnel files through discovery',
        'Subpoena department training materials',
        'Interview additional witnesses',
        'Engage use of force expert witness',
        'File motion for preservation of evidence'
      ],

      damagesAnalysis: {
        medical: '$45,000',
        painSuffering: '$150,000',
        lostWages: '$25,000',
        punitive: '$280,000',
        total: '$500,000'
      },

      timelineGaps: [
        'Gap between arrest and medical treatment',
        'Missing body camera footage from second officer',
        'Unexplained delay in incident reporting'
      ],

      strategicInsights: `Based on comprehensive analysis of case materials, this excessive force claim shows strong potential for success. The video evidence combined with medical documentation creates a compelling narrative of constitutional violation.

KEY STRENGTHS:
• Video evidence clearly contradicts officer testimony
• Medical records support severity of force used
• Independent witness corroborates plaintiff's account
• Municipal defendant creates potential for significant damages

CRITICAL SUCCESS FACTORS:
• Establish municipal policy or custom that led to violation
• Counter qualified immunity arguments with clearly established law
• Demonstrate damages exceed de minimis threshold
• Maintain focus on constitutional rather than state law theories

SETTLEMENT CONSIDERATIONS:
• Strong case merits justify substantial settlement demand
• Municipal defendant likely has insurance coverage
• Early mediation could be cost-effective
• Consider timing of settlement discussions around discovery milestones`
    };

    setCaseAnalysisResult(mockCaseAnalysis);
    setIsAnalyzingCase(false);
  }, []);

  // Simulate Document Drafting
  const draftDocument = useCallback(async (type, requirements) => {
    setIsDrafting(true);

    await new Promise((resolve) => setTimeout(resolve, 3500));

    const mockDrafts = {
      motion_summary_judgment: `IN THE UNITED STATES DISTRICT COURT
FOR THE SOUTHERN DISTRICT OF NEW YORK

MARCUS JOHNSON,
                    Plaintiff,
v.                                    Case No. 1:25-cv-12345

METRO POLICE DEPARTMENT, et al.,
                    Defendants.

PLAINTIFF'S MOTION FOR SUMMARY JUDGMENT

TO THE HONORABLE COURT:

Plaintiff Marcus Johnson, by and through undersigned counsel, respectfully moves this Court for summary judgment on his claim for excessive force in violation of the Fourth Amendment to the United States Constitution pursuant to Federal Rule of Civil Procedure 56.

STATEMENT OF UNDISPUTED MATERIAL FACTS

1. On August 23, 2025, Plaintiff was lawfully driving his vehicle when stopped by Defendants' officers for an alleged traffic violation.

2. Body camera footage, which Defendants do not dispute, shows the entire encounter between Plaintiff and the officers.

3. The video evidence demonstrates that Plaintiff complied with all officer commands and posed no threat to officer safety.

4. Despite Plaintiff's compliance, officers used significant force including tasering, striking, and forcibly restraining Plaintiff.

5. Medical records establish that Plaintiff suffered substantial injuries requiring emergency medical treatment.

LEGAL ARGUMENT

I. STANDARD FOR SUMMARY JUDGMENT

Summary judgment is appropriate when there is no genuine dispute as to any material fact and the movant is entitled to judgment as a matter of law. Fed. R. Civ. P. 56(a).

II. THE UNDISPUTED FACTS ESTABLISH EXCESSIVE FORCE IN VIOLATION OF THE FOURTH AMENDMENT

The Fourth Amendment prohibits the use of excessive force during an arrest. Graham v. Connor, 490 U.S. 386 (1989). The reasonableness inquiry requires careful attention to the facts and circumstances of each particular case, including: (1) the severity of the crime at issue; (2) whether the suspect poses an immediate threat to the safety of the officers or others; and (3) whether he is actively resisting arrest or attempting to evade arrest by flight. Id. at 396.

Here, the undisputed video evidence establishes that all three Graham factors weigh in Plaintiff's favor...

CONCLUSION

For the foregoing reasons, Plaintiff respectfully requests that this Court grant his Motion for Summary Judgment and award appropriate relief.

Respectfully submitted,

[Attorney Name]
Attorney for Plaintiff`,

      discovery_requests: `PLAINTIFF'S FIRST SET OF INTERROGATORIES AND REQUESTS FOR PRODUCTION OF DOCUMENTS

TO: METRO POLICE DEPARTMENT

INTERROGATORIES

INTERROGATORY NO. 1: Identify all policies, procedures, or training materials in effect on August 23, 2025, relating to the use of force, arrest procedures, or the use of tasers or other electronic control devices.

INTERROGATORY NO. 2: Describe in detail all training received by Officers [Names] regarding use of force, de-escalation techniques, and constitutional requirements for arrests in the five years preceding August 23, 2025.

INTERROGATORY NO. 3: Identify all complaints, investigations, or disciplinary actions involving Officers [Names] relating to excessive force, constitutional violations, or improper arrest procedures for the period January 1, 2020 to present.

REQUESTS FOR PRODUCTION

REQUEST NO. 1: All documents, including but not limited to policies, procedures, training materials, and general orders, relating to the use of force by police officers in effect from January 1, 2025 to present.

REQUEST NO. 2: All body camera footage, dashcam footage, surveillance footage, or other recordings of the incident involving Plaintiff on August 23, 2025.

REQUEST NO. 3: Complete personnel files for Officers [Names], including all training records, disciplinary actions, complaints, and performance evaluations.

REQUEST NO. 4: All documents relating to any internal investigation of the August 23, 2025 incident involving Plaintiff.

REQUEST NO. 5: All communications, including emails, text messages, radio transmissions, and reports, relating to the August 23, 2025 incident involving Plaintiff.`,

      complaint_civil_rights: `IN THE UNITED STATES DISTRICT COURT
FOR THE SOUTHERN DISTRICT OF NEW YORK

[CLIENT NAME],
                    Plaintiff,
v.                                    Case No. ____________

[DEFENDANT NAME], et al.,
                    Defendants.

COMPLAINT FOR VIOLATION OF CIVIL RIGHTS

Plaintiff [CLIENT NAME], by and through undersigned counsel, brings this action under 42 U.S.C. § 1983 for violations of constitutional rights, and alleges as follows:

JURISDICTION AND VENUE

1. This Court has subject matter jurisdiction over this action pursuant to 28 U.S.C. §§ 1331 and 1343, as this action arises under the Constitution and laws of the United States.

2. Venue is proper in this district pursuant to 28 U.S.C. § 1391(b).

PARTIES

3. Plaintiff is a resident of [STATE].

4. At all times relevant herein, Defendants were acting under color of state law within the meaning of 42 U.S.C. § 1983.

STATEMENT OF FACTS

5. On [DATE], Plaintiff was [DESCRIBE INCIDENT].

6. Defendants' actions violated Plaintiff's constitutional rights as described herein.

CLAIMS FOR RELIEF

COUNT I - EXCESSIVE FORCE IN VIOLATION OF THE FOURTH AMENDMENT
(42 U.S.C. § 1983)

7-10. [Incorporate previous allegations]

11. Defendants' use of force was objectively unreasonable under the circumstances and violated Plaintiff's Fourth Amendment rights.

PRAYER FOR RELIEF

WHEREFORE, Plaintiff respectfully requests that this Court:
A. Award compensatory damages;
B. Award punitive damages;
C. Award attorney's fees and costs;
D. Grant such other relief as the Court deems just and proper.

Respectfully submitted,

[Attorney Name]
Attorney for Plaintiff`
    };

    const draft = {
      type: type,
      content: mockDrafts[type] || mockDrafts['complaint_civil_rights'],
      metadata: {
        wordCount: mockDrafts[type]?.split(' ').length || 850,
        generatedAt: new Date().toISOString(),
        requirements: requirements
      },
      reviewChecklist: [
        'Verify all factual allegations are supported by evidence',
        'Confirm proper jurisdiction and venue allegations',
        'Review legal standards and authority citations',
        'Check procedural deadline compliance',
        'Ensure all parties are properly identified'
      ]
    };

    setDraftedDocument(draft);
    setIsDrafting(false);
  }, []);

  // Simulate Timeline Creation
  const createTimeline = useCallback(async () => {
    setIsCreatingTimeline(true);

    await new Promise((resolve) => setTimeout(resolve, 2500));

    const mockTimeline = [
      {
        date: '2025-08-23',
        time: '14:30',
        event: 'Traffic Stop Initiated',
        description: 'Officer Jones initiates traffic stop for alleged speeding violation',
        source: 'Police Report',
        significance: 'high'
      },
      {
        date: '2025-08-23',
        time: '14:32',
        event: 'Plaintiff Exits Vehicle',
        description: 'Plaintiff complies with officer request to exit vehicle',
        source: 'Body Camera Footage',
        significance: 'medium'
      },
      {
        date: '2025-08-23',
        time: '14:34',
        event: 'Use of Force Begins',
        description: 'Officers deploy taser and begin physical restraint',
        source: 'Body Camera Footage, Witness Statement',
        significance: 'critical'
      },
      {
        date: '2025-08-23',
        time: '14:37',
        event: 'EMS Called',
        description: 'Emergency medical services requested due to plaintiff injuries',
        source: 'Radio Logs',
        significance: 'high'
      },
      {
        date: '2025-08-23',
        time: '15:15',
        event: 'Hospital Arrival',
        description: 'Plaintiff transported to Metro General Hospital',
        source: 'Medical Records',
        significance: 'high'
      },
      {
        date: '2025-08-24',
        time: '09:00',
        event: 'Internal Investigation Initiated',
        description: 'Police department begins internal review of incident',
        source: 'Internal Affairs Records',
        significance: 'medium'
      }
    ];

    setTimelineEvents(mockTimeline);
    setIsCreatingTimeline(false);
  }, []);

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-blue-600' },
    { id: 'cases', label: 'Cases', icon: Briefcase, color: 'text-green-600' },
    { id: 'evidence', label: 'Evidence', icon: Database, color: 'text-purple-600' },
    { id: 'filings', label: 'Filings', icon: FileText, color: 'text-orange-600' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'text-red-600' },
    { id: 'witnesses', label: 'Witnesses', icon: Users, color: 'text-indigo-600' },
    { id: 'ai-tools', label: 'AI Tools', icon: Brain, color: 'text-pink-600' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-teal-600' }
  ];

  const Sidebar = () => (
    <div
      className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 flex flex-col h-full border-r border-slate-700`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
            <Scale className="w-6 h-6 text-white" />
          </div>
          {sidebarOpen && (
            <div className="ml-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CaseBuddy
              </h1>
              <p className="text-xs text-slate-400">Legal AI Assistant</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
              activeView === item.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                : 'hover:bg-slate-700'
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeView === item.id ? 'text-white' : item.color}`} />
            {sidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">JD</span>
          </div>
          {sidebarOpen && (
            <div className="ml-3">
              <p className="text-sm font-medium">John Doe, Esq.</p>
              <p className="text-xs text-slate-400">Civil Rights Attorney</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const TopBar = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search cases, evidence, filings..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-96 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>

        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-sm">JD</span>
        </div>
      </div>
    </div>
  );

  const Dashboard = () => (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Active Cases</p>
              <p className="text-3xl font-bold text-blue-900">12</p>
              <p className="text-blue-600 text-sm">+2 this month</p>
            </div>
            <Briefcase className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Evidence Items</p>
              <p className="text-3xl font-bold text-green-900">247</p>
              <p className="text-green-600 text-sm">AI analyzed: 89%</p>
            </div>
            <Database className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Upcoming Deadlines</p>
              <p className="text-3xl font-bold text-purple-900">8</p>
              <p className="text-purple-600 text-sm">3 critical</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Win Rate</p>
              <p className="text-3xl font-bold text-orange-900">87%</p>
              <p className="text-orange-600 text-sm">+5% vs last year</p>
            </div>
            <Award className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Cases</h2>
            <button
              onClick={() => setActiveView('cases')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {cases.map((case_) => (
              <div
                key={case_.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{case_.title}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          case_.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : case_.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {case_.priority}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{case_.type}</p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {case_.clientName}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {case_.damages}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {case_.lastActivity}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                      <span className="text-lg font-bold text-gray-700">{case_.progress}%</span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${case_.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{deadline.task}</p>
                    <p className="text-xs text-gray-500">{deadline.date}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      deadline.daysLeft <= 5
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {deadline.daysLeft}d
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'ai'
                        ? 'bg-purple-500'
                        : activity.type === 'filing'
                        ? 'bg-blue-500'
                        : activity.type === 'evidence'
                        ? 'bg-green-500'
                        : 'bg-orange-500'
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Brain className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-purple-900">AI Insights</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-900 font-medium">Strong Evidence Pattern Detected</p>
                <p className="text-xs text-gray-600">Johnson v. Metro PD case shows 94% win probability based on similar cases</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-900 font-medium">Discovery Gap Identified</p>
                <p className="text-xs text-gray-600">Missing key witness statements in Davis case - recommend immediate action</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AIToolsView = () => (
    <div className="p-6 space-y-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Legal Tools</h1>
        <p className="text-gray-600">
          Leverage artificial intelligence to enhance your legal practice with working features
        </p>
      </div>

      {/* Document Analyzer Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
            <FileSearch className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-900">Document Analyzer</h2>
            <p className="text-gray-600">Upload and analyze legal documents with AI</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Upload a legal document for analysis</p>
              <button
                onClick={() => analyzeDocument({ name: 'sample_complaint.pdf', size: '2.4 MB' })}
                disabled={isAnalyzing}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Sample Document
                  </>
                )}
              </button>
            </div>
          </div>

          <div>
            {documentAnalysis && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Analysis Complete</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-green-600">Document Type:</span>
                    <span className="text-sm font-medium text-green-900">{documentAnalysis.documentType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600">Confidence:</span>
                    <span className="text-sm font-medium text-green-900">{documentAnalysis.confidence}%</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Key Findings</h4>
                  <ul className="space-y-1">
                    {documentAnalysis.keyFindings.map((finding, index) => (
                      <li key={index} className="text-sm text-blue-800 flex items-start">
                        <CheckCircle className="w-3 h-3 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                  onClick={() => setActiveView('document-analysis-detail')}
                >
                  View Detailed Analysis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Case Analyzer Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-900">Case Analyzer</h2>
            <p className="text-gray-600">Comprehensive AI analysis of your case files</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Select Case for Analysis</h3>
                <div className="space-y-2">
                  {cases.map((case_) => (
                    <div
                      key={case_.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{case_.title}</p>
                        <p className="text-sm text-gray-600">{case_.evidenceCount} evidence items</p>
                      </div>
                      <button
                        onClick={() => analyzeCaseFile(case_.id)}
                        disabled={isAnalyzingCase}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                      >
                        {isAnalyzingCase ? 'Analyzing...' : 'Analyze'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            {isAnalyzingCase && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
                <p className="text-blue-900 font-medium">Analyzing Case Files...</p>
                <p className="text-blue-600 text-sm">Processing evidence, filings, and timeline data</p>
              </div>
            )}

            {caseAnalysisResult && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-3">Case Analysis Complete</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-900">{caseAnalysisResult.winProbability}%</div>
                      <div className="text-sm text-green-600">Win Probability</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-900">{caseAnalysisResult.overallScore}</div>
                      <div className="text-sm text-green-600">Overall Score</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Key Strengths</h4>
                  <ul className="space-y-1">
                    {caseAnalysisResult.caseTheory.strengths.slice(0, 3).map((strength, index) => (
                      <li key={index} className="text-sm text-blue-800 flex items-start">
                        <CheckCircle className="w-3 h-3 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                  onClick={() => setActiveView('case-analysis-detail')}
                >
                  View Full Analysis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Drafter Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
            <Edit3 className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-900">Document Drafter</h2>
            <p className="text-gray-600">AI-powered legal document generation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                <option value="motion_summary_judgment">Motion for Summary Judgment</option>
                <option value="discovery_requests">Discovery Requests</option>
                <option value="complaint_civil_rights">Civil Rights Complaint</option>
                <option value="response_motion">Response to Motion</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Case Context</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
                placeholder="Provide case details and specific requirements..."
              />
            </div>

            <button
              onClick={() => draftDocument('motion_summary_judgment', 'Sample motion requirements')}
              disabled={isDrafting}
              className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isDrafting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Drafting Document...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Document
                </>
              )}
            </button>
          </div>

          <div>
            {draftedDocument && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Document Generated</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-green-600">Type:</span>
                    <span className="text-sm font-medium text-green-900 capitalize">
                      {draftedDocument.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600">Words:</span>
                    <span className="text-sm font-medium text-green-900">
                      {draftedDocument.metadata.wordCount}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                    {draftedDocument.content.substring(0, 500)}...
                  </pre>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Edit Document
                  </button>
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                    Save to Case
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Builder Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-900">Timeline Builder</h2>
            <p className="text-gray-600">AI-generated case chronology from evidence</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <button
              onClick={createTimeline}
              disabled={isCreatingTimeline}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-4"
            >
              {isCreatingTimeline ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Building Timeline...
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Build Timeline
                </>
              )}
            </button>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Source Evidence</h3>
              <div className="space-y-2">
                {evidenceItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-gray-700">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {timelineEvents.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Generated Timeline</h3>
                <div className="space-y-3">
                  {timelineEvents.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full mt-2 ${
                          event.significance === 'critical'
                            ? 'bg-red-500'
                            : event.significance === 'high'
                            ? 'bg-orange-500'
                            : 'bg-blue-500'
                        }`}
                      ></div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{event.event}</span>
                          <span className="text-sm text-gray-500">{event.date} {event.time}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{event.description}</p>
                        <span className="text-xs text-blue-600">Source: {event.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'ai-tools':
        return <AIToolsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto">{renderView()}</main>
      </div>
    </div>
  );
};

export default CaseBuddy;

