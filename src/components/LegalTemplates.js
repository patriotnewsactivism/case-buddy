import React, { useState } from 'react';
import { FileText, Download, Search, Filter, Tag, Copy, CheckCircle, AlertCircle, Eye } from 'lucide-react';

const LegalTemplates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // Template categories
  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'pleadings', name: 'Pleadings' },
    { id: 'motions', name: 'Motions' },
    { id: 'discovery', name: 'Discovery' },
    { id: 'contracts', name: 'Contracts' },
    { id: 'letters', name: 'Legal Letters' },
    { id: 'civil_rights', name: 'Civil Rights' }
  ];
  
  // Jurisdictions
  const jurisdictions = [
    { id: 'all', name: 'All Jurisdictions' },
    { id: 'federal', name: 'Federal' },
    { id: 'state', name: 'State' }
  ];
  
  // Legal document templates
  const templates = [
    {
      id: 1,
      title: 'Civil Rights Complaint (42 U.S.C. § 1983)',
      category: 'pleadings',
      jurisdiction: 'federal',
      description: 'Template for filing a federal civil rights lawsuit under 42 U.S.C. § 1983 for constitutional violations by state actors.',
      tags: ['civil rights', 'federal', 'complaint', 'section 1983'],
      downloadCount: 1245,
      lastUpdated: '2025-08-15'
    },
    {
      id: 2,
      title: 'Motion to Dismiss (FRCP 12(b)(6))',
      category: 'motions',
      jurisdiction: 'federal',
      description: 'Federal motion to dismiss for failure to state a claim upon which relief can be granted under Rule 12(b)(6).',
      tags: ['motion', 'federal', 'dismiss', 'FRCP 12'],
      downloadCount: 987,
      lastUpdated: '2025-09-01'
    },
    {
      id: 3,
      title: 'First Set of Interrogatories',
      category: 'discovery',
      jurisdiction: 'federal',
      description: 'Standard interrogatories for federal civil litigation with instructions and definitions.',
      tags: ['discovery', 'interrogatories', 'federal'],
      downloadCount: 756,
      lastUpdated: '2025-07-22'
    },
    {
      id: 4,
      title: 'Request for Production of Documents',
      category: 'discovery',
      jurisdiction: 'federal',
      description: 'Template for requesting documents and electronically stored information in federal litigation.',
      tags: ['discovery', 'documents', 'federal', 'ESI'],
      downloadCount: 689,
      lastUpdated: '2025-08-05'
    },
    {
      id: 5,
      title: 'Motion for Summary Judgment',
      category: 'motions',
      jurisdiction: 'federal',
      description: 'Federal motion for summary judgment under Rule 56 with supporting memorandum structure.',
      tags: ['motion', 'federal', 'summary judgment', 'FRCP 56'],
      downloadCount: 842,
      lastUpdated: '2025-09-10'
    },
    {
      id: 6,
      title: 'Settlement Agreement and Release',
      category: 'contracts',
      jurisdiction: 'all',
      description: 'Comprehensive settlement agreement template with mutual release of claims.',
      tags: ['settlement', 'contract', 'release', 'agreement'],
      downloadCount: 1102,
      lastUpdated: '2025-08-30'
    },
    {
      id: 7,
      title: 'FOIA Request Letter',
      category: 'letters',
      jurisdiction: 'federal',
      description: 'Freedom of Information Act request letter template for federal agencies.',
      tags: ['FOIA', 'letter', 'federal', 'information request'],
      downloadCount: 578,
      lastUpdated: '2025-07-15'
    },
    {
      id: 8,
      title: 'State Court Complaint',
      category: 'pleadings',
      jurisdiction: 'state',
      description: 'General state court complaint template adaptable to various causes of action.',
      tags: ['complaint', 'state', 'pleading'],
      downloadCount: 923,
      lastUpdated: '2025-08-12'
    },
    {
      id: 9,
      title: 'Motion for Protective Order',
      category: 'motions',
      jurisdiction: 'federal',
      description: 'Motion for protective order regarding discovery under FRCP 26(c).',
      tags: ['motion', 'discovery', 'protective order', 'federal'],
      downloadCount: 456,
      lastUpdated: '2025-09-05'
    },
    {
      id: 10,
      title: 'Demand Letter',
      category: 'letters',
      jurisdiction: 'all',
      description: 'Pre-litigation demand letter template for various civil claims.',
      tags: ['demand', 'letter', 'pre-litigation'],
      downloadCount: 1356,
      lastUpdated: '2025-08-20'
    },
    {
      id: 11,
      title: 'Police Misconduct Complaint',
      category: 'civil_rights',
      jurisdiction: 'federal',
      description: 'Specialized complaint for police misconduct cases including excessive force and false arrest claims.',
      tags: ['civil rights', 'police misconduct', 'excessive force', 'section 1983'],
      downloadCount: 876,
      lastUpdated: '2025-09-08'
    },
    {
      id: 12,
      title: 'Employment Discrimination Complaint',
      category: 'civil_rights',
      jurisdiction: 'federal',
      description: 'Federal complaint template for Title VII employment discrimination claims.',
      tags: ['civil rights', 'employment', 'discrimination', 'Title VII'],
      downloadCount: 742,
      lastUpdated: '2025-08-25'
    }
  ];
  
  // Filter templates based on search query, category, and jurisdiction
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesJurisdiction = selectedJurisdiction === 'all' || template.jurisdiction === selectedJurisdiction || template.jurisdiction === 'all';
    
    return matchesSearch && matchesCategory && matchesJurisdiction;
  });
  
  // Template content examples (in a real app, these would be loaded from a database or files)
  const templateContents = {
    1: `IN THE UNITED STATES DISTRICT COURT
FOR THE [DISTRICT NAME] DISTRICT OF [STATE]

[PLAINTIFF NAME],                  )
                                   )
          Plaintiff,               )
                                   )
v.                                 )  Case No. ______________
                                   )
[DEFENDANT NAME(S)],               )
                                   )
          Defendant(s).            )

COMPLAINT FOR VIOLATION OF CIVIL RIGHTS
(42 U.S.C. § 1983)

I. JURISDICTION AND VENUE

1. This action arises under 42 U.S.C. § 1983. Jurisdiction is conferred on this Court by 28 U.S.C. §§ 1331 and 1343(a)(3) and (4).

2. Venue is proper in this district under 28 U.S.C. § 1391(b) because the events giving rise to this claim occurred within this district.

II. PARTIES

3. Plaintiff [PLAINTIFF NAME] is a resident of [CITY, STATE].

4. Defendant [DEFENDANT NAME] is a [POSITION/TITLE] employed by [EMPLOYER] and was acting under color of state law at all times relevant to this complaint. Defendant is sued in [his/her] [individual/official] capacity.

[ADD ADDITIONAL DEFENDANTS AS NECESSARY]

III. STATEMENT OF FACTS

[PROVIDE A CLEAR, CHRONOLOGICAL ACCOUNT OF THE EVENTS THAT FORM THE BASIS OF YOUR CLAIM]

5. On [DATE], at approximately [TIME], [DESCRIBE WHAT HAPPENED].

6. [CONTINUE WITH RELEVANT FACTS]

IV. CONSTITUTIONAL VIOLATIONS

COUNT I: [SPECIFY VIOLATION, e.g., "EXCESSIVE FORCE IN VIOLATION OF THE FOURTH AMENDMENT"]

7. Plaintiff incorporates by reference paragraphs 1-6 above.

8. Defendant [NAME], acting under color of state law, violated Plaintiff's rights under the [SPECIFY AMENDMENT] Amendment to the United States Constitution by [DESCRIBE CONDUCT].

9. As a direct and proximate result of Defendant's actions, Plaintiff suffered [DESCRIBE INJURIES AND DAMAGES].

[ADD ADDITIONAL COUNTS AS NECESSARY]

V. PRAYER FOR RELIEF

WHEREFORE, Plaintiff respectfully requests that this Court:

a) Enter judgment in favor of Plaintiff and against Defendant;
b) Award compensatory damages in an amount to be determined at trial;
c) Award punitive damages against Defendant in [his/her] individual capacity;
d) Award costs and attorneys' fees pursuant to 42 U.S.C. § 1988; and
e) Grant such other relief as the Court deems just and proper.

JURY DEMAND

Plaintiff demands a trial by jury on all issues so triable.

Respectfully submitted,

Dated: [DATE]                      ______________________________
                                   [ATTORNEY NAME]
                                   [BAR NUMBER]
                                   [ADDRESS]
                                   [PHONE]
                                   [EMAIL]
                                   Attorney for Plaintiff`,
    
    11: `IN THE UNITED STATES DISTRICT COURT
FOR THE [DISTRICT NAME] DISTRICT OF [STATE]

[PLAINTIFF NAME],                  )
                                   )
          Plaintiff,               )
                                   )
v.                                 )  Case No. ______________
                                   )
[OFFICER NAME(S)], individually    )
and in [his/her] official capacity )
as [POSITION] of the [DEPARTMENT], )
                                   )
and                                )
                                   )
[MUNICIPALITY/COUNTY/DEPARTMENT],  )
                                   )
          Defendants.              )

COMPLAINT FOR POLICE MISCONDUCT
(42 U.S.C. § 1983)

I. JURISDICTION AND VENUE

1. This action arises under 42 U.S.C. § 1983 and the Fourth and Fourteenth Amendments to the United States Constitution. Jurisdiction is conferred on this Court by 28 U.S.C. §§ 1331 and 1343(a)(3) and (4).

2. Venue is proper in this district under 28 U.S.C. § 1391(b) because the events giving rise to this claim occurred within this district.

II. PARTIES

3. Plaintiff [PLAINTIFF NAME] is a resident of [CITY, STATE].

4. Defendant [OFFICER NAME] is a police officer employed by the [DEPARTMENT] and was acting under color of state law at all times relevant to this complaint. Defendant [OFFICER NAME] is sued in both [his/her] individual and official capacities.

5. Defendant [MUNICIPALITY/COUNTY/DEPARTMENT] is a [municipal corporation/county/law enforcement agency] organized under the laws of the State of [STATE]. Defendant [MUNICIPALITY/COUNTY/DEPARTMENT] is sued for maintaining policies, practices, and customs that caused the constitutional violations alleged herein.

III. STATEMENT OF FACTS

[PROVIDE A CLEAR, CHRONOLOGICAL ACCOUNT OF THE POLICE MISCONDUCT]

6. On [DATE], at approximately [TIME], Plaintiff was [DESCRIBE LOCATION AND ACTIVITY].

7. Defendant [OFFICER NAME] [DESCRIBE OFFICER'S ACTIONS IN DETAIL].

8. At no time did Plaintiff [DESCRIBE PLAINTIFF'S CONDUCT, e.g., "resist arrest, threaten the officer, or commit any crime"].

9. As a result of Defendant [OFFICER NAME]'s actions, Plaintiff suffered [DESCRIBE PHYSICAL INJURIES, EMOTIONAL DISTRESS, AND OTHER DAMAGES].

10. Defendant [MUNICIPALITY/COUNTY/DEPARTMENT] has a policy, practice, or custom of [DESCRIBE POLICY, PRACTICE, OR CUSTOM THAT LED TO THE VIOLATION, e.g., "failing to properly train officers on the use of force" or "ignoring complaints of excessive force"].

IV. CONSTITUTIONAL VIOLATIONS

COUNT I: EXCESSIVE FORCE IN VIOLATION OF THE FOURTH AMENDMENT

11. Plaintiff incorporates by reference paragraphs 1-10 above.

12. Defendant [OFFICER NAME], acting under color of state law, used excessive and unreasonable force against Plaintiff in violation of the Fourth Amendment to the United States Constitution.

13. The force used by Defendant [OFFICER NAME] was objectively unreasonable under the circumstances and was not justified by any legitimate law enforcement purpose.

14. As a direct and proximate result of Defendant [OFFICER NAME]'s actions, Plaintiff suffered physical injuries, pain, emotional distress, and other damages.

COUNT II: MUNICIPAL LIABILITY

15. Plaintiff incorporates by reference paragraphs 1-14 above.

16. Defendant [MUNICIPALITY/COUNTY/DEPARTMENT] has established and maintained policies, practices, and customs showing deliberate indifference to the constitutional rights of persons in [JURISDICTION], which caused the violation of Plaintiff's rights.

17. These policies, practices, and customs include, but are not limited to:
   a. Failing to properly train officers regarding the proper use of force;
   b. Failing to properly supervise and discipline officers who engage in excessive force;
   c. Tolerating and encouraging officers to use excessive force; and
   d. Failing to properly investigate complaints of excessive force.

18. Defendant [MUNICIPALITY/COUNTY/DEPARTMENT]'s policies, practices, and customs were the moving force behind the constitutional violations suffered by Plaintiff.

[ADD ADDITIONAL COUNTS AS NECESSARY, SUCH AS FALSE ARREST, MALICIOUS PROSECUTION, ETC.]

V. PRAYER FOR RELIEF

WHEREFORE, Plaintiff respectfully requests that this Court:

a) Enter judgment in favor of Plaintiff and against Defendants;
b) Award compensatory damages in an amount to be determined at trial;
c) Award punitive damages against Defendant [OFFICER NAME] in [his/her] individual capacity;
d) Award costs and attorneys' fees pursuant to 42 U.S.C. § 1988;
e) Order appropriate equitable relief, including policy changes and training; and
f) Grant such other relief as the Court deems just and proper.

JURY DEMAND

Plaintiff demands a trial by jury on all issues so triable.

Respectfully submitted,

Dated: [DATE]                      ______________________________
                                   [ATTORNEY NAME]
                                   [BAR NUMBER]
                                   [ADDRESS]
                                   [PHONE]
                                   [EMAIL]
                                   Attorney for Plaintiff`
  };
  
  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };
  
  // Handle copy to clipboard
  const handleCopyTemplate = () => {
    if (selectedTemplate && templateContents[selectedTemplate.id]) {
      navigator.clipboard.writeText(templateContents[selectedTemplate.id]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // Handle download template
  const handleDownloadTemplate = () => {
    if (selectedTemplate && templateContents[selectedTemplate.id]) {
      const element = document.createElement('a');
      const file = new Blob([templateContents[selectedTemplate.id]], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${selectedTemplate.title.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };
  
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <div className="flex items-center mb-4">
        <FileText className="w-6 h-6 text-blue-600 mr-2" />
        <h3 className="font-semibold text-xl text-gray-900">Legal Document Templates</h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        Access professional legal document templates for various case types. Customize and download templates to save time and ensure proper formatting.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="mb-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Filter className="w-4 h-4 mr-1" />
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Filter className="w-4 h-4 mr-1" />
              Jurisdiction
            </label>
            <select
              value={selectedJurisdiction}
              onChange={(e) => setSelectedJurisdiction(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {jurisdictions.map(jurisdiction => (
                <option key={jurisdiction.id} value={jurisdiction.id}>
                  {jurisdiction.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Template Usage Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Customize all bracketed text [LIKE THIS]</li>
                  <li>• Review local court rules for formatting</li>
                  <li>• Update citations to current law</li>
                  <li>• Remove sections that don't apply</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Popular Tags</h4>
            <div className="flex flex-wrap gap-2">
              {['civil rights', 'federal', 'complaint', 'motion', 'discovery', 'section 1983'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="flex items-center bg-white border border-gray-300 rounded-full px-3 py-1 text-xs text-gray-700 hover:bg-gray-100"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          {selectedTemplate ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg text-gray-900">{selectedTemplate.title}</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopyTemplate}
                    className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-gray-700 text-sm">{selectedTemplate.description}</p>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <span className="mr-3">Last updated: {selectedTemplate.lastUpdated}</span>
                  <span>{selectedTemplate.downloadCount} downloads</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTemplate.tags.map(tag => (
                    <span key={tag} className="bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-4 py-2">
                  <span className="font-medium text-gray-700">Template Preview</span>
                  <div className="flex items-center text-xs text-gray-500">
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </div>
                </div>
                <pre className="p-4 text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap font-mono">
                  {templateContents[selectedTemplate.id] || 'Template content not available'}
                </pre>
              </div>
              
              <button
                onClick={() => setSelectedTemplate(null)}
                className="mt-4 text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                ← Back to template list
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">
                  {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'} found
                </h4>
                <div className="text-sm text-gray-500">
                  {selectedCategory !== 'all' && categories.find(c => c.id === selectedCategory)?.name}
                  {selectedCategory !== 'all' && selectedJurisdiction !== 'all' && ' • '}
                  {selectedJurisdiction !== 'all' && jurisdictions.find(j => j.id === selectedJurisdiction)?.name}
                </div>
              </div>
              
              {filteredTemplates.length > 0 ? (
                <div className="space-y-3">
                  {filteredTemplates.map(template => (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">{template.title}</h5>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        </div>
                        <div className="flex items-center text-blue-600 hover:text-blue-800">
                          <Eye className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex flex-wrap gap-1">
                          {template.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-xs">
                              {tag}
                            </span>
                          ))}
                          {template.tags.length > 3 && (
                            <span className="bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-xs">
                              +{template.tags.length - 3}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Download className="w-3 h-3 mr-1" />
                          {template.downloadCount}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No templates found matching your criteria</p>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search terms</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalTemplates;