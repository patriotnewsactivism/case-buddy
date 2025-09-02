// Legal Brief Templates and Generation Logic

import { Case } from "@/lib/case-context";
import { CASE_TIMELINE, CASE_DOCUMENTS, LEGAL_ISSUES } from "@/lib/case-data";
import { formatDate } from "@/lib/case-data";

export interface BriefSection {
  title: string;
  content: string;
  required: boolean;
  order: number;
}

export interface BriefTemplate {
  id: string;
  name: string;
  description: string;
  sections: BriefSection[];
  caseTypes: string[];
}

export interface BriefGenerationOptions {
  templateId: string;
  caseId: string;
  customSections?: Partial<BriefSection>[];
  includeTimeline: boolean;
  includeDocuments: boolean;
  includeLegalIssues: boolean;
  attorneyName: string;
  attorneyBar: string;
  clientName?: string;
  courtName?: string;
}

// Legal Brief Templates
export const BRIEF_TEMPLATES: BriefTemplate[] = [
  {
    id: "motion-to-dismiss",
    name: "Motion to Dismiss",
    description: "Standard motion to dismiss for failure to state a claim",
    caseTypes: ["criminal", "civil_rights", "constitutional"],
    sections: [
      {
        title: "Caption",
        content: "",
        required: true,
        order: 1
      },
      {
        title: "Introduction",
        content: "This matter comes before the Court on Defendant's Motion to Dismiss the charges pursuant to Federal Rule of Criminal Procedure 12(b).",
        required: true,
        order: 2
      },
      {
        title: "Factual Background",
        content: "",
        required: true,
        order: 3
      },
      {
        title: "Legal Standard",
        content: "A motion to dismiss challenges the legal sufficiency of the charges. The Court must accept all factual allegations as true and determine whether the government has stated a valid claim for relief.",
        required: true,
        order: 4
      },
      {
        title: "Argument",
        content: "",
        required: true,
        order: 5
      },
      {
        title: "Conclusion",
        content: "For the foregoing reasons, Defendant respectfully requests that this Court grant the Motion to Dismiss.",
        required: true,
        order: 6
      }
    ]
  },
  {
    id: "motion-suppress",
    name: "Motion to Suppress Evidence",
    description: "Motion to suppress evidence obtained in violation of constitutional rights",
    caseTypes: ["criminal"],
    sections: [
      {
        title: "Caption",
        content: "",
        required: true,
        order: 1
      },
      {
        title: "Introduction",
        content: "Defendant hereby moves to suppress all evidence obtained in violation of the Fourth Amendment to the United States Constitution.",
        required: true,
        order: 2
      },
      {
        title: "Factual Background",
        content: "",
        required: true,
        order: 3
      },
      {
        title: "Legal Standard",
        content: "Evidence obtained in violation of the Fourth Amendment must be suppressed under the exclusionary rule established in Mapp v. Ohio, 367 U.S. 643 (1961).",
        required: true,
        order: 4
      },
      {
        title: "Argument",
        content: "",
        required: true,
        order: 5
      },
      {
        title: "Conclusion",
        content: "For the foregoing reasons, Defendant respectfully requests that this Court grant the Motion to Suppress Evidence.",
        required: true,
        order: 6
      }
    ]
  },
  {
    id: "civil-rights-complaint",
    name: "Civil Rights Complaint",
    description: "42 U.S.C. § 1983 civil rights violation complaint",
    caseTypes: ["civil_rights", "constitutional"],
    sections: [
      {
        title: "Caption",
        content: "",
        required: true,
        order: 1
      },
      {
        title: "Jurisdiction and Venue",
        content: "This Court has jurisdiction over this action pursuant to 28 U.S.C. §§ 1331 and 1343, as this case arises under the Constitution and laws of the United States, specifically 42 U.S.C. § 1983.",
        required: true,
        order: 2
      },
      {
        title: "Parties",
        content: "",
        required: true,
        order: 3
      },
      {
        title: "Factual Allegations",
        content: "",
        required: true,
        order: 4
      },
      {
        title: "Count I: Violation of Constitutional Rights Under 42 U.S.C. § 1983",
        content: "",
        required: true,
        order: 5
      },
      {
        title: "Prayer for Relief",
        content: "WHEREFORE, Plaintiff respectfully requests that this Court enter judgment in favor of Plaintiff and award compensatory damages, punitive damages, attorney's fees, and such other relief as the Court deems just and proper.",
        required: true,
        order: 6
      }
    ]
  },
  {
    id: "response-brief",
    name: "Response Brief",
    description: "Response to opposing party's motion or brief",
    caseTypes: ["criminal", "civil_rights", "constitutional", "administrative"],
    sections: [
      {
        title: "Caption",
        content: "",
        required: true,
        order: 1
      },
      {
        title: "Introduction",
        content: "",
        required: true,
        order: 2
      },
      {
        title: "Statement of Facts",
        content: "",
        required: true,
        order: 3
      },
      {
        title: "Legal Standard",
        content: "",
        required: true,
        order: 4
      },
      {
        title: "Argument",
        content: "",
        required: true,
        order: 5
      },
      {
        title: "Conclusion",
        content: "",
        required: true,
        order: 6
      }
    ]
  },
  {
    id: "appeal-brief",
    name: "Appellate Brief",
    description: "Brief for appellate court proceedings",
    caseTypes: ["criminal", "civil_rights", "constitutional", "administrative"],
    sections: [
      {
        title: "Caption",
        content: "",
        required: true,
        order: 1
      },
      {
        title: "Table of Contents",
        content: "",
        required: true,
        order: 2
      },
      {
        title: "Table of Authorities",
        content: "",
        required: true,
        order: 3
      },
      {
        title: "Statement of the Issues",
        content: "",
        required: true,
        order: 4
      },
      {
        title: "Statement of the Case",
        content: "",
        required: true,
        order: 5
      },
      {
        title: "Statement of Facts",
        content: "",
        required: true,
        order: 6
      },
      {
        title: "Summary of Argument",
        content: "",
        required: true,
        order: 7
      },
      {
        title: "Argument",
        content: "",
        required: true,
        order: 8
      },
      {
        title: "Conclusion",
        content: "",
        required: true,
        order: 9
      }
    ]
  }
];

// Brief Generation Functions
export class BriefGenerator {
  
  static generateCaption(caseData: Case, attorneyName: string, courtName?: string): string {
    const court = courtName || caseData.court || "UNITED STATES DISTRICT COURT";
    const caseTitle = caseData.title;
    const caseNumber = caseData.caseNumber ? `Case No. ${caseData.caseNumber}` : "";
    
    return `
${court.toUpperCase()}

${caseTitle}                                    ${caseNumber}

${this.getPartyDesignation(caseData)}

                                               ${attorneyName}
                                               Attorney for ${this.getClientDesignation(caseData)}
`.trim();
  }

  static getPartyDesignation(caseData: Case): string {
    if (caseData.caseType === "criminal") {
      return `${caseData.opposingParty || "Defendant"},`;
    }
    return "Plaintiff,\n\nv.\n\n" + (caseData.opposingParty || "Defendant") + ",\n\nDefendant.";
  }

  static getClientDesignation(caseData: Case): string {
    if (caseData.caseType === "criminal") {
      return "Defendant";
    }
    return "Plaintiff";
  }

  static generateFactualBackground(caseData: Case, includeTimeline: boolean = true): string {
    let content = `This case involves ${caseData.description || "the matters set forth in the complaint."}\n\n`;
    
    if (includeTimeline && CASE_TIMELINE.length > 0) {
      content += "CHRONOLOGY OF EVENTS\n\n";
      
      const relevantEvents = CASE_TIMELINE
        .filter(event => event.date >= "2025-06-01") // Filter to recent events
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      relevantEvents.forEach((event, index) => {
        content += `${index + 1}. ${formatDate(event.date)}: ${event.title}\n`;
        if (event.summary) {
          content += `   ${event.summary}\n`;
        }
        content += "\n";
      });
    }
    
    return content.trim();
  }

  static generateDocumentReferences(includeDocuments: boolean = true): string {
    if (!includeDocuments || CASE_DOCUMENTS.length === 0) {
      return "";
    }
    
    let content = "SUPPORTING DOCUMENTATION\n\n";
    content += "The following documents support the factual allegations in this brief:\n\n";
    
    CASE_DOCUMENTS.forEach((doc, index) => {
      content += `${index + 1}. ${doc.title}`;
      if (doc.date) {
        content += ` (${formatDate(doc.date)})`;
      }
      if (doc.summary) {
        content += ` - ${doc.summary}`;
      }
      content += "\n";
    });
    
    return content;
  }

  static generateLegalIssuesAnalysis(includeLegalIssues: boolean = true): string {
    if (!includeLegalIssues || LEGAL_ISSUES.length === 0) {
      return "";
    }
    
    let content = "LEGAL ISSUES IDENTIFIED\n\n";
    
    const priorityOrder = { "critical": 1, "high": 2, "medium": 3, "low": 4 };
    const sortedIssues = LEGAL_ISSUES.sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );
    
    sortedIssues.forEach((issue, index) => {
      content += `${index + 1}. ${issue.title} (${issue.priority.toUpperCase()} PRIORITY)\n`;
      content += `   Category: ${issue.category.replace("-", " ").toUpperCase()}\n`;
      content += `   ${issue.description}\n\n`;
    });
    
    return content.trim();
  }

  static generateBrief(options: BriefGenerationOptions, caseData: Case): string {
    const template = BRIEF_TEMPLATES.find(t => t.id === options.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    let briefContent = "";
    const sections = [...template.sections].sort((a, b) => a.order - b.order);

    sections.forEach(section => {
      briefContent += `${section.title.toUpperCase()}\n\n`;
      
      // Generate section content based on type
      switch (section.title) {
        case "Caption":
          briefContent += this.generateCaption(caseData, options.attorneyName, options.courtName);
          break;
          
        case "Factual Background":
        case "Statement of Facts":
        case "Factual Allegations":
          briefContent += this.generateFactualBackground(caseData, options.includeTimeline);
          break;
          
        case "Parties":
          briefContent += this.generatePartiesSection(caseData);
          break;
          
        default:
          // Use template content or custom content
          const customSection = options.customSections?.find(cs => cs.title === section.title);
          briefContent += customSection?.content || section.content;
      }
      
      briefContent += "\n\n";
      
      // Add supporting sections if requested
      if (section.title === "Factual Background" || section.title === "Statement of Facts") {
        if (options.includeDocuments) {
          briefContent += this.generateDocumentReferences(true) + "\n\n";
        }
        if (options.includeLegalIssues) {
          briefContent += this.generateLegalIssuesAnalysis(true) + "\n\n";
        }
      }
    });

    // Add signature block
    briefContent += this.generateSignatureBlock(options.attorneyName, options.attorneyBar);
    
    return briefContent.trim();
  }

  static generatePartiesSection(caseData: Case): string {
    let content = "";
    
    if (caseData.caseType === "criminal") {
      content += `Defendant ${caseData.opposingParty || "MATTHEW REARDON"} is the individual charged in this matter.\n\n`;
      content += `The United States of America, acting through the U.S. Attorney's Office, is the prosecuting party.\n\n`;
    } else {
      content += `Plaintiff is an individual whose constitutional rights were violated as described herein.\n\n`;
      content += `Defendant ${caseData.opposingParty || "UNKNOWN DEFENDANTS"} `;
      content += caseData.caseType === "civil_rights" 
        ? "acted under color of state law to deprive Plaintiff of rights secured by the Constitution and laws of the United States.\n\n"
        : "is responsible for the actions described in this complaint.\n\n";
    }
    
    return content;
  }

  static generateSignatureBlock(attorneyName: string, attorneyBar: string): string {
    return `
Respectfully submitted,

/s/ ${attorneyName}
${attorneyName}
${attorneyBar ? `Bar No. ${attorneyBar}` : ""}
Attorney for ${BRIEF_TEMPLATES[0] ? "Defendant" : "Plaintiff"}

Date: ${new Date().toLocaleDateString()}
`.trim();
  }

  static getTemplatesForCaseType(caseType: string): BriefTemplate[] {
    return BRIEF_TEMPLATES.filter(template => 
      template.caseTypes.includes(caseType) || template.caseTypes.includes("all")
    );
  }
}

// Export utility functions
export const generateBriefPreview = (options: BriefGenerationOptions, caseData: Case): string => {
  try {
    return BriefGenerator.generateBrief(options, caseData);
  } catch (error) {
    return `Error generating brief: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
};

export const getAllTemplates = (): BriefTemplate[] => BRIEF_TEMPLATES;

export const getTemplateById = (id: string): BriefTemplate | undefined => 
  BRIEF_TEMPLATES.find(template => template.id === id);