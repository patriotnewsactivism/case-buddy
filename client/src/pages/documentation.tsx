
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Globe, File } from "lucide-react";
import { exportAsText, exportAsHTML, exportAsWord, getFormattedFilename } from "@/utils/documentExporter";

const CASEBUDDY_FEATURES = `# CaseBuddy - Your Comprehensive Legal Case Management Platform

CaseBuddy is a cutting-edge legal case management and intelligence platform designed to revolutionize how legal professionals handle complex cases. Here's your complete feature rundown:

## 🏛️ **Core Case Management**
- **Multi-Case Dashboard**: Handle multiple complex cases simultaneously with intelligent case switching
- **Case Timeline Tracking**: Comprehensive chronological event management with evidence linking
- **Document Management**: Secure cloud storage with Google Cloud Storage integration
- **Evidence Organization**: Visual evidence gallery with metadata and tagging systems
- **FOIA Request Tracking**: Government transparency request management and status monitoring

## 🤖 **AI-Powered Legal Analytics (Premium)**
- **Case Outcome Prediction**: Advanced ML algorithms predict case success likelihood
- **Judge Analytics**: Historical judge behavior analysis and ruling patterns
- **Precedent Research**: Intelligent legal precedent discovery and analysis
- **Strategy Recommendations**: AI-generated legal strategy suggestions
- **Evidence Analysis**: Automated evidence strength assessment
- **Similar Case Discovery**: Find relevant cases with similar fact patterns

## 📄 **Document Intelligence Suite**
- **OCR Processing**: Extract text from scanned documents and images
- **Semantic Search**: Advanced document search using natural language queries
- **Document Similarity**: Find related documents across your case files
- **Legal Concept Search**: Search by legal principles and doctrines
- **Evidence Pattern Recognition**: Identify supporting evidence automatically

## ✍️ **Brief Generation Engine (Premium)**
- **AI Brief Writing**: Generate professional legal briefs from case data
- **Multiple Templates**: Motion templates, memorandums, and pleadings
- **Brief Summarization**: Automatic executive summaries
- **Citation Integration**: Proper legal citation formatting
- **Custom Template Support**: Create organization-specific brief formats

## 🔐 **Enterprise Security & Access Control**
- **Role-Based Access**: Admin, Member, and Guest permission levels
- **Multi-User Collaboration**: Team-based case management
- **Secure Authentication**: Session-based auth with PostgreSQL storage
- **Object-Level Security**: Granular file access controls
- **GDPR Compliance**: Privacy-first data handling

## 💼 **Business Features**
- **Subscription Management**: Tiered pricing with premium feature gates
- **Coupon System**: Flexible discount and promotional code management
- **Analytics Dashboard**: Usage tracking and performance metrics
- **Export Capabilities**: Print-friendly reports and case summaries
- **Mobile Responsive**: Full functionality across all devices

## 🔍 **Advanced Search & Discovery**
- **Fuzzy Search**: Intelligent search across all case data
- **Multi-Filter System**: Filter by case type, status, priority, dates
- **Tag-Based Organization**: Flexible tagging system for categorization
- **Cross-Reference Linking**: Connect related documents and events
- **Real-Time Search**: Instant results as you type

## 📊 **Data Visualization & Reporting**
- **Case Statistics**: Visual dashboards with key metrics
- **Timeline Visualization**: Interactive case progression charts
- **Priority Management**: Color-coded priority and status systems
- **Progress Tracking**: Case milestone and deadline monitoring
- **Custom Reports**: Generate tailored case reports

## 🌐 **Technical Excellence**
- **React + TypeScript**: Modern, type-safe frontend development
- **Express.js Backend**: Robust server architecture
- **Real-Time Updates**: Live data synchronization
- **Cloud Storage**: Scalable file management
- **Print Optimization**: Professional document printing
- **Dark/Light Mode**: User preference themes

## 💎 **Premium Subscription Benefits**
- Unlimited AI-powered legal analytics
- Advanced brief generation tools
- OCR and document intelligence
- Semantic search capabilities
- Priority customer support
- Extended storage limits

## 🎯 **Perfect For:**
- **Solo Practitioners**: Streamline case management workflows
- **Law Firms**: Collaborative case handling with team access controls
- **Public Interest Lawyers**: Government transparency and civil rights cases
- **Corporate Legal**: Enterprise-grade security and compliance
- **Legal Researchers**: Advanced precedent discovery and analysis

CaseBuddy transforms traditional legal case management into an intelligent, AI-powered platform that saves time, improves outcomes, and provides unprecedented insights into your legal practice. Whether you're handling constitutional cases, FOIA appeals, or complex litigation, CaseBuddy provides the tools you need to excel.

**Ready to revolutionize your legal practice?** Start with our free tier and upgrade to unlock the full power of AI-driven legal intelligence.`;

export default function Documentation() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'txt' | 'html' | 'word') => {
    setIsExporting(true);
    
    try {
      const filename = getFormattedFilename('CaseBuddy_Features');
      
      switch (format) {
        case 'txt':
          exportAsText(CASEBUDDY_FEATURES, filename);
          break;
        case 'html':
          exportAsHTML(CASEBUDDY_FEATURES, filename, 'CaseBuddy Features & Sales Pitch');
          break;
        case 'word':
          exportAsWord(CASEBUDDY_FEATURES, filename, 'CaseBuddy Features & Sales Pitch');
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(CASEBUDDY_FEATURES);
      alert('Content copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <div className="flex-1 overflow-hidden">
      <div className="p-6 h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">CaseBuddy Documentation</h1>
            <p className="text-gray-600 mb-6">Complete feature rundown and sales pitch for CaseBuddy Legal Case Management Platform</p>
            
            {/* Export Controls */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Documentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={() => handleExport('txt')}
                    disabled={isExporting}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Export as Text
                  </Button>
                  
                  <Button 
                    onClick={() => handleExport('html')}
                    disabled={isExporting}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    Export as HTML
                  </Button>
                  
                  <Button 
                    onClick={() => handleExport('word')}
                    disabled={isExporting}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <File className="w-4 h-4" />
                    Export as Word
                  </Button>
                  
                  <Button 
                    onClick={handleCopyToClipboard}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Copy to Clipboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documentation Content */}
          <Card>
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {CASEBUDDY_FEATURES}
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
