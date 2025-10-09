import React, { useState } from 'react';
import { Search, BookOpen, Filter, Download, Copy, Star, Clock, AlertCircle, CheckCircle, ExternalLink, Tag, ChevronDown, ChevronUp } from 'lucide-react';

const CaseLawResearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    court: 'all',
    yearStart: '',
    yearEnd: '',
    jurisdiction: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    'qualified immunity police excessive force',
    'fourth amendment search warrant',
    'section 1983 municipal liability',
    'Brady violation evidence'
  ]);
  
  // Court options
  const courts = [
    { id: 'all', name: 'All Courts' },
    { id: 'scotus', name: 'Supreme Court' },
    { id: 'appeals', name: 'Circuit Courts of Appeals' },
    { id: 'district', name: 'District Courts' },
    { id: 'state', name: 'State Courts' }
  ];
  
  // Jurisdiction options
  const jurisdictions = [
    { id: 'all', name: 'All Jurisdictions' },
    { id: 'federal', name: 'Federal' },
    { id: '1st', name: '1st Circuit' },
    { id: '2nd', name: '2nd Circuit' },
    { id: '3rd', name: '3rd Circuit' },
    { id: '4th', name: '4th Circuit' },
    { id: '5th', name: '5th Circuit' },
    { id: '6th', name: '6th Circuit' },
    { id: '7th', name: '7th Circuit' },
    { id: '8th', name: '8th Circuit' },
    { id: '9th', name: '9th Circuit' },
    { id: '10th', name: '10th Circuit' },
    { id: '11th', name: '11th Circuit' },
    { id: 'dc', name: 'D.C. Circuit' },
    { id: 'state_ny', name: 'New York' },
    { id: 'state_ca', name: 'California' },
    { id: 'state_tx', name: 'Texas' }
  ];
  
  // Sample case law data (in a real app, this would come from an API)
  const caseData = {
    'qualified immunity police excessive force': [
      {
        id: 1,
        title: 'Graham v. Connor',
        citation: '490 U.S. 386 (1989)',
        court: 'Supreme Court',
        date: '1989-05-15',
        summary: 'Established the "objective reasonableness" standard for evaluating excessive force claims under the Fourth Amendment.',
        relevance: 95,
        cited_by: 8742,
        tags: ['excessive force', 'fourth amendment', 'objective reasonableness']
      },
      {
        id: 2,
        title: 'Saucier v. Katz',
        citation: '533 U.S. 194 (2001)',
        court: 'Supreme Court',
        date: '2001-06-18',
        summary: 'Established a two-step analysis for qualified immunity in excessive force cases, later modified by Pearson v. Callahan.',
        relevance: 92,
        cited_by: 5231,
        tags: ['qualified immunity', 'excessive force', 'two-step analysis']
      },
      {
        id: 3,
        title: 'Pearson v. Callahan',
        citation: '555 U.S. 223 (2009)',
        court: 'Supreme Court',
        date: '2009-01-21',
        summary: 'Modified Saucier, holding that courts have discretion to decide which of the two prongs of qualified immunity analysis to address first.',
        relevance: 90,
        cited_by: 4876,
        tags: ['qualified immunity', 'Saucier', 'discretionary approach']
      },
      {
        id: 4,
        title: 'Kisela v. Hughes',
        citation: '138 S. Ct. 1148 (2018)',
        court: 'Supreme Court',
        date: '2018-04-02',
        summary: 'Police officer entitled to qualified immunity for shooting a woman holding a knife. Reinforced that immunity protects all but the plainly incompetent.',
        relevance: 88,
        cited_by: 1245,
        tags: ['qualified immunity', 'excessive force', 'clearly established law']
      },
      {
        id: 5,
        title: 'Torres v. Madrid',
        citation: '141 S. Ct. 989 (2021)',
        court: 'Supreme Court',
        date: '2021-03-25',
        summary: 'Application of physical force with intent to restrain constitutes a "seizure" under the Fourth Amendment, even if the person does not submit and temporarily eludes custody.',
        relevance: 85,
        cited_by: 487,
        tags: ['seizure', 'fourth amendment', 'use of force']
      }
    ]
  };
  
  // Sample case content (in a real app, this would come from an API)
  const caseContents = {
    1: `GRAHAM v. CONNOR
490 U.S. 386 (1989)

CHIEF JUSTICE REHNQUIST delivered the opinion of the Court.

This case requires us to decide what constitutional standard governs a free citizen's claim that law enforcement officials used excessive force in the course of making an arrest, investigatory stop, or other "seizure" of his person. We hold that such claims are properly analyzed under the Fourth Amendment's "objective reasonableness" standard, rather than under a substantive due process standard.

[...]

Our Fourth Amendment jurisprudence has long recognized that the right to make an arrest or investigatory stop necessarily carries with it the right to use some degree of physical coercion or threat thereof to effect it. See Terry v. Ohio, 392 U.S. 1, 22-27 (1968). Because "[t]he test of reasonableness under the Fourth Amendment is not capable of precise definition or mechanical application," Bell v. Wolfish, 441 U.S. 520, 559 (1979), however, its proper application requires careful attention to the facts and circumstances of each particular case, including the severity of the crime at issue, whether the suspect poses an immediate threat to the safety of the officers or others, and whether he is actively resisting arrest or attempting to evade arrest by flight. See Tennessee v. Garner, 471 U.S. 1, 8-9 (1985) (the question is "whether the totality of the circumstances justifie[s] a particular sort of . . . seizure").

The "reasonableness" of a particular use of force must be judged from the perspective of a reasonable officer on the scene, rather than with the 20/20 vision of hindsight. See Terry v. Ohio, supra, at 20-22. The Fourth Amendment is not violated by an arrest based on probable cause, even though the wrong person is arrested, Hill v. California, 401 U.S. 797 (1971), nor by the mistaken execution of a valid search warrant on the wrong premises, Maryland v. Garrison, 480 U.S. 79 (1987). With respect to a claim of excessive force, the same standard of reasonableness at the moment applies: "Not every push or shove, even if it may later seem unnecessary in the peace of a judge's chambers," Johnson v. Glick, 481 F.2d, at 1033, violates the Fourth Amendment. The calculus of reasonableness must embody allowance for the fact that police officers are often forced to make split-second judgments — in circumstances that are tense, uncertain, and rapidly evolving — about the amount of force that is necessary in a particular situation.

As in other Fourth Amendment contexts, however, the "reasonableness" inquiry in an excessive force case is an objective one: the question is whether the officers' actions are "objectively reasonable" in light of the facts and circumstances confronting them, without regard to their underlying intent or motivation. See Scott v. United States, 436 U.S. 128, 137-139 (1978); see also Terry v. Ohio, supra, at 21 (in analyzing the reasonableness of a particular search or seizure, "it is imperative that the facts be judged against an objective standard"). An officer's evil intentions will not make a Fourth Amendment violation out of an objectively reasonable use of force; nor will an officer's good intentions make an objectively unreasonable use of force constitutional. See Scott v. United States, supra, at 138, citing United States v. Robinson, 414 U.S. 218 (1973).

[...]

Because petitioner's excessive force claim is one arising under the Fourth Amendment, the Court of Appeals erred in analyzing it under the four-part Johnson v. Glick test. That test, which requires consideration of whether force was applied in a good faith effort to maintain and restore discipline or maliciously and sadistically for the very purpose of causing harm, is incompatible with a proper Fourth Amendment analysis. We accordingly reverse the judgment of the Court of Appeals and remand the case for reconsideration under the proper Fourth Amendment standard.

It is so ordered.`
  };
  
  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // In a real app, this would be an API call
    setTimeout(() => {
      // Check if we have mock data for this query
      if (caseData[searchQuery.toLowerCase()]) {
        setSearchResults(caseData[searchQuery.toLowerCase()]);
      } else {
        // If no exact match, use the first mock data we have
        setSearchResults(caseData['qualified immunity police excessive force']);
      }
      
      // Add to recent searches if not already there
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches([searchQuery, ...recentSearches.slice(0, 3)]);
      }
      
      setIsSearching(false);
    }, 1500);
  };
  
  // Handle case selection
  const handleCaseSelect = (caseItem) => {
    setSelectedCase(caseItem);
  };
  
  // Handle copy citation
  const handleCopyCitation = () => {
    if (selectedCase) {
      navigator.clipboard.writeText(selectedCase.citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // Handle filter change
  const handleFilterChange = (field, value) => {
    setSearchFilters({
      ...searchFilters,
      [field]: value
    });
  };
  
  // Handle recent search click
  const handleRecentSearchClick = (query) => {
    setSearchQuery(query);
    // Trigger search immediately
    setTimeout(() => handleSearch(), 100);
  };
  
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <div className="flex items-center mb-4">
        <BookOpen className="w-6 h-6 text-blue-600 mr-2" />
        <h3 className="font-semibold text-xl text-gray-900">Case Law Research</h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        Search for relevant case law to support your legal arguments. Find precedents, citations, and key holdings from federal and state courts.
      </p>
      
      <div className="mb-6">
        <div className="flex items-stretch">
          <div className="relative flex-grow">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search case law (e.g., 'qualified immunity police excessive force')"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-r-md transition-colors disabled:opacity-50 flex items-center"
          >
            {isSearching ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Search
              </>
            )}
          </button>
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            {showFilters ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Hide Filters
              </>
            ) : (
              <>
                <Filter className="w-4 h-4 mr-1" />
                Show Filters
              </>
            )}
          </button>
          
          {recentSearches.length > 0 && (
            <div className="text-sm text-gray-500 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Recent:
              <div className="flex ml-2 space-x-2">
                {recentSearches.slice(0, 3).map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(query)}
                    className="text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[150px]"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {showFilters && (
          <div className="mt-3 p-4 bg-gray-50 rounded-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Court</label>
              <select
                value={searchFilters.court}
                onChange={(e) => handleFilterChange('court', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {courts.map(court => (
                  <option key={court.id} value={court.id}>
                    {court.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
              <select
                value={searchFilters.jurisdiction}
                onChange={(e) => handleFilterChange('jurisdiction', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {jurisdictions.map(jurisdiction => (
                  <option key={jurisdiction.id} value={jurisdiction.id}>
                    {jurisdiction.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year (From)</label>
              <input
                type="number"
                value={searchFilters.yearStart}
                onChange={(e) => handleFilterChange('yearStart', e.target.value)}
                placeholder="e.g., 1990"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year (To)</label>
              <input
                type="number"
                value={searchFilters.yearEnd}
                onChange={(e) => handleFilterChange('yearEnd', e.target.value)}
                placeholder="e.g., 2025"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${selectedCase ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
          {searchResults.length > 0 ? (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
                Search Results ({searchResults.length})
              </h4>
              
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {searchResults.map(caseItem => (
                  <div
                    key={caseItem.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedCase && selectedCase.id === caseItem.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                    onClick={() => handleCaseSelect(caseItem)}
                  >
                    <div className="flex justify-between items-start">
                      <h5 className="font-medium text-gray-900">{caseItem.title}</h5>
                      <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {caseItem.relevance}% relevant
                      </div>
                    </div>
                    
                    <p className="text-sm font-medium text-gray-700 mt-1">{caseItem.citation}</p>
                    <p className="text-sm text-gray-600 mt-1">{caseItem.court} • {caseItem.date}</p>
                    
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">{caseItem.summary}</p>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {caseItem.tags.map(tag => (
                          <span key={tag} className="bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Star className="w-3 h-3 mr-1 text-amber-500" />
                        Cited {caseItem.cited_by} times
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            !isSearching && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Enter a search query to find relevant case law</p>
                <p className="text-sm text-gray-500 mt-1">Example: "qualified immunity police excessive force"</p>
              </div>
            )
          )}
        </div>
        
        {selectedCase && (
          <div className="lg:col-span-2">
            <div className="border border-gray-200 rounded-lg">
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900">{selectedCase.title}</h4>
                    <p className="text-gray-700">{selectedCase.citation}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCopyCitation}
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
                          Copy Citation
                        </>
                      )}
                    </button>
                    <button
                      className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                  </div>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-2">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Court:</span> {selectedCase.court}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Date:</span> {selectedCase.date}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Cited by:</span> {selectedCase.cited_by} cases
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">Summary</h5>
                  <p className="text-gray-700">{selectedCase.summary}</p>
                </div>
                
                <div className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">Full Text</h5>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
                      {caseContents[selectedCase.id] || 'Full text not available for this case.'}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Key Points</h5>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {selectedCase.id === 1 ? (
                      <>
                        <li>Established "objective reasonableness" standard for excessive force claims</li>
                        <li>Force must be judged from perspective of reasonable officer on the scene</li>
                        <li>Analysis must consider the facts and circumstances, including:
                          <ul className="list-circle pl-5 mt-1">
                            <li>Severity of the crime</li>
                            <li>Whether suspect poses immediate threat</li>
                            <li>Whether actively resisting or attempting to flee</li>
                          </ul>
                        </li>
                        <li>Officer's subjective intent is irrelevant to Fourth Amendment analysis</li>
                      </>
                    ) : (
                      <>
                        <li>Key holding related to {selectedCase.tags[0]}</li>
                        <li>Established precedent for {selectedCase.tags[1]}</li>
                        <li>Important implications for similar cases</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-50 border-t border-blue-200 p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-blue-900">Research Note</h5>
                    <p className="text-sm text-blue-800">
                      Always verify that this case is still good law before citing. Check for subsequent history and treatment by other courts.
                    </p>
                    <div className="mt-2">
                      <a href="#" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Check citation history
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseLawResearch;