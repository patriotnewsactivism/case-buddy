import React, { useState } from 'react';
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
  Target,
  TrendingUp,
  Scale,
  BookOpen,
  Video,
  BarChart3,
  Activity,
  Zap,
  Edit3,
  DollarSign,
  Briefcase,
  Award,
  Database,
  Menu,
  Home
} from 'lucide-react';

const CaseBuddy = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedCase, setSelectedCase] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);

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
      jurisdiction: 'Federal District Court'
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
      jurisdiction: 'State Superior Court'
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
      jurisdiction: 'Federal District Court'
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
      aiConfidence: 92
    },
    {
      id: 2,
      title: 'Medical Records - Emergency Room',
      type: 'pdf',
      dateAdded: '2025-09-08',
      size: '12 MB',
      tags: ['medical', 'damages', 'injuries'],
      status: 'reviewed',
      aiConfidence: 88
    },
    {
      id: 3,
      title: 'Witness Statement - John Doe',
      type: 'text',
      dateAdded: '2025-09-05',
      size: '2 KB',
      tags: ['witness', 'statement', 'eyewitness'],
      status: 'pending',
      aiConfidence: 0
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
    <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 flex flex-col h-full border-r border-slate-700`}>
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
            {sidebarOpen && (
              <span className="ml-3 font-medium">{item.label}</span>
            )}
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
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
          </div>

          <div className="space-y-4">
            {cases.map((case_) => (
              <div key={case_.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{case_.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        case_.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : case_.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
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
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{deadline.task}</p>
                    <p className="text-xs text-gray-500">{deadline.date}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    deadline.daysLeft <= 5 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
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
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'ai'
                      ? 'bg-purple-500'
                      : activity.type === 'filing'
                      ? 'bg-blue-500'
                      : activity.type === 'evidence'
                      ? 'bg-green-500'
                      : 'bg-orange-500'
                  }`}></div>
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

  const CasesView = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cases</h1>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            New Case
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {cases.map((case_) => (
          <div key={case_.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{case_.title}</h3>
                <p className="text-sm text-gray-600">{case_.type}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                case_.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : case_.status === 'discovery'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {case_.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Client:</span>
                <span className="font-medium text-gray-900">{case_.clientName}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Damages:</span>
                <span className="font-medium text-gray-900">{case_.damages}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Due:</span>
                <span className="font-medium text-gray-900">{case_.dueDate}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress:</span>
                <span className="font-medium text-gray-900">{case_.progress}%</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                  style={{ width: `${case_.progress}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center">
                  <Database className="w-4 h-4 mr-1" />
                  {case_.evidenceCount} evidence
                </span>
                <span className="flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  {case_.filingCount} filings
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">Updated {case_.lastActivity}</span>
              <div className="flex items-center space-x-2">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Edit3 className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const EvidenceView = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Evidence Management</h1>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700">
            <Upload className="w-4 h-4 mr-2" />
            Upload Evidence
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {evidenceItems.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {item.type === 'video' && <Video className="w-8 h-8 text-blue-600 mr-3" />}
                {item.type === 'pdf' && <FileText className="w-8 h-8 text-red-600 mr-3" />}
                {item.type === 'text' && <BookOpen className="w-8 h-8 text-green-600 mr-3" />}
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.size}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {item.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm mb-4">
              <span className="text-gray-600">Added: {item.dateAdded}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.status === 'analyzed'
                  ? 'bg-green-100 text-green-700'
                  : item.status === 'reviewed'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {item.status}
              </span>
            </div>

            {item.aiConfidence > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">AI Confidence</span>
                  <span className="font-medium text-gray-900">{item.aiConfidence}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${item.aiConfidence}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button className="flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                <button className="flex items-center px-3 py-1 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 text-sm">
                  <Brain className="w-4 h-4 mr-1" />
                  Analyze
                </button>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded">
                <Download className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AIToolsView = () => (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Legal Tools</h1>
        <p className="text-gray-600">Leverage artificial intelligence to enhance your legal practice</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Document Analyzer */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-purple-900">Document Analyzer</h3>
              <p className="text-sm text-purple-600">OCR + AI Analysis</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">Upload any legal document for instant OCR processing and AI-powered analysis including case law extraction, key issues identification, and strategic insights.</p>
          <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Start Analysis
          </button>
        </div>

        {/* Case Strategy Simulator */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-blue-900">Strategy Simulator</h3>
              <p className="text-sm text-blue-600">Test Arguments</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">Simulate different legal strategies and arguments. Get AI predictions on case outcomes, potential counterarguments, and strategic recommendations.</p>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Launch Simulator
          </button>
        </div>

        {/* Timeline Builder */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-green-900">Timeline Builder</h3>
              <p className="text-sm text-green-600">Chronology AI</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">Automatically extract dates and events from evidence to build comprehensive case timelines. Identify gaps and inconsistencies in testimony.</p>
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Build Timeline
          </button>
        </div>

        {/* Document Drafter */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
              <Edit3 className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-orange-900">Document Drafter</h3>
              <p className="text-sm text-orange-600">AI Legal Writing</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">Generate professional legal documents including motions, complaints, discovery requests, and responses using AI-powered templates and legal precedents.</p>
          <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            Start Drafting
          </button>
        </div>

        {/* Pattern Recognition */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-teal-900">Pattern Recognition</h3>
              <p className="text-sm text-teal-600">Evidence Patterns</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">Identify patterns across evidence, witnesses, and case law. Discover hidden connections and strengthen your legal arguments with data-driven insights.</p>
          <button className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
            Find Patterns
          </button>
        </div>

        {/* Legal Research Assistant */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-indigo-900">Research Assistant</h3>
              <p className="text-sm text-indigo-600">Case Law & Statutes</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">Intelligent legal research powered by AI. Find relevant case law, statutes, and legal precedents. Get summaries and cite checks automatically.</p>
          <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Start Research
          </button>
        </div>
      </div>

      {/* AI Analytics Dashboard */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Analytics Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">247</h3>
            <p className="text-sm text-gray-600">Documents Analyzed</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">94%</h3>
            <p className="text-sm text-gray-600">Average Accuracy</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">2.3x</h3>
            <p className="text-sm text-gray-600">Productivity Boost</p>
          </div>
        </div>
      </div>
    </div>
  );

  const AnalyticsView = () => (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics & Insights</h1>
        <p className="text-gray-600">Track your legal practice performance and case outcomes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Win Rate Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Win Rate Trends</h3>
          <div className="h-64 bg-gradient-to-t from-blue-50 to-transparent rounded-lg flex items-end justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">87%</div>
              <div className="text-sm text-gray-600">Overall Win Rate</div>
              <div className="text-xs text-green-600">+5% vs last year</div>
            </div>
          </div>
        </div>

        {/* Case Types Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Types</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Civil Rights (§1983)</span>
              <div className="flex items-center">
                <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                  <div className="w-20 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">62%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Employment Law</span>
              <div className="flex items-center">
                <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                  <div className="w-10 h-2 bg-green-600 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">31%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Housing Rights</span>
              <div className="flex items-center">
                <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">7%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 text-center">
          <Award className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-blue-900">$2.4M</div>
          <div className="text-sm text-blue-600">Total Damages Won</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
          <Clock className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-green-900">8.3</div>
          <div className="text-sm text-green-600">Avg Months to Resolution</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 text-center">
          <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-purple-900">156</div>
          <div className="text-sm text-purple-600">Clients Served</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6 text-center">
          <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-orange-900">94%</div>
          <div className="text-sm text-orange-600">Client Satisfaction</div>
        </div>
      </div>

      {/* Recent Case Outcomes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Case Outcomes</h3>
        <div className="space-y-3">
          {[
            { case: 'Johnson v. Metro PD', outcome: 'Settlement', amount: '$450,000', type: 'Civil Rights' },
            { case: 'Davis v. Tech Corp', outcome: 'Verdict', amount: '$275,000', type: 'Employment' },
            { case: 'Williams v. Housing Auth', outcome: 'Settlement', amount: '$85,000', type: 'Housing' }
          ].map((outcome, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{outcome.case}</div>
                <div className="text-sm text-gray-600">{outcome.type}</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-green-600">{outcome.amount}</div>
                <div className="text-sm text-gray-600">{outcome.outcome}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'cases':
        return <CasesView />;
      case 'evidence':
        return <EvidenceView />;
      case 'ai-tools':
        return <AIToolsView />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default CaseBuddy;

