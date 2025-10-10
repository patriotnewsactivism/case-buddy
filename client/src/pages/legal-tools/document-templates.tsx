import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Document templates
const TEMPLATES = [
  { 
    id: 'cease-desist', 
    name: 'Cease and Desist Letter',
    description: 'A formal letter demanding that a person or entity stop doing something that is causing harm.',
    category: 'General'
  },
  { 
    id: 'notice-of-claim', 
    name: 'Notice of Claim',
    description: 'A legal document informing a party that they may be held liable for damages.',
    category: 'General'
  },
  { 
    id: 'power-of-attorney', 
    name: 'Power of Attorney',
    description: 'A legal document giving someone the authority to act on your behalf.',
    category: 'Estate Planning'
  },
  { 
    id: 'renters-rights', 
    name: 'Renters Rights Notice',
    description: 'A notice informing landlords of tenant rights protected by law.',
    category: 'Housing'
  },
  { 
    id: 'demand-letter', 
    name: 'Demand Letter',
    description: 'A letter demanding payment or action before legal proceedings.',
    category: 'Collections'
  },
  { 
    id: 'nda', 
    name: 'Non-Disclosure Agreement',
    description: 'An agreement to keep certain information confidential.',
    category: 'Business'
  },
];

const TEMPLATE_CONTENT: Record<string, string> = {
  'cease-desist': `[Your Name]
[Your Address]
[City, State ZIP Code]
[Phone Number]
[Email Address]

[Date]

[Recipient Name]
[Recipient Address]
[City, State ZIP Code]

Re: Cease and Desist Letter

Dear [Recipient Name],

I am writing to formally demand that you immediately cease and desist from [specific activity causing harm]. This activity is causing me significant harm and is in violation of [relevant laws/statutes].

Specifically, you are engaged in the following conduct:
[Detailed description of harmful conduct]

This conduct has resulted in the following damages:
[Description of damages]

I request that you:
1. Immediately stop [specific activity]
2. [Any additional demands, e.g., remove content, return property, etc.]
3. Provide written confirmation within [timeframe] that you will comply with this demand

Failure to comply with this demand may result in legal action, including but not limited to filing a lawsuit in civil court. I reserve all rights and remedies available to me under the law.

Please direct all correspondence regarding this matter to the address listed above.

Sincerely,

[Your Signature]
[Your Printed Name]`,

  'notice-of-claim': `[Your Name]
[Your Address]
[City, State ZIP Code]
[Phone Number]
[Email Address]

[Date]

[Recipient Name]
[Recipient Address]
[City, State ZIP Code]

Re: Notice of Potential Claim

Dear [Recipient Name],

I am writing to notify you of a potential claim against you for [type of harm/damage]. This notice is being provided in accordance with [relevant statute/law] which requires that potential claimants provide advance notice of claims.

INCIDENT DETAILS:
Date of Incident: [Date]
Location: [Location]
Description: [Brief description of incident]

The nature of the claim involves [detailed description of incident and how it occurred]. As a result of this incident, I have suffered the following damages:

1. [Type of damage 1]
2. [Type of damage 2]
3. [Type of damage 3]

REQUESTED RELIEF:
I am requesting the following:
1. [Specific remedy, e.g., compensation, action to be taken, etc.]
2. [Any additional requests]

Please respond to this notice within [timeframe] to discuss resolution of this matter. If we cannot reach a satisfactory resolution, I will be forced to pursue all available legal remedies.

Sincerely,

[Your Signature]
[Your Printed Name]`,

  'power-of-attorney': `POWER OF ATTORNEY

I, [Your Name], of [Your Address], [City, State ZIP Code], hereby appoint [Agent Name], of [Agent Address], [City, State ZIP Code], as my true and lawful attorney-in-fact and agent, with full power of substitution and revocation, to act for me in the following matters:

POWERS GRANTED:
[Specific powers granted to the agent, such as:]
1. To manage my financial affairs
2. To make healthcare decisions on my behalf
3. To access my bank accounts and financial records
4. To sign documents on my behalf
5. [Additional specific powers]

LIMITATIONS:
This Power of Attorney [does/does not] grant authority to make healthcare decisions.
This Power of Attorney [does/does not] grant authority to make gifts on my behalf.

EFFECTIVE DATE AND DURATION:
This Power of Attorney is effective as of [Date] and will continue until [Termination condition/date, or "until revoked by me in writing"].

SUCCESSOR AGENT:
If [Agent Name] is unable or unwilling to serve, I appoint [Successor Agent Name] as my successor attorney-in-fact.

IN WITNESS WHEREOF, I have hereunto set my hand and seal this [Date].

_______________________________
[Your Signature]
[Your Printed Name]

STATE OF [State]
COUNTY OF [County]

On this [Date], before me personally appeared [Your Name], known to me to be the person whose name is subscribed to the foregoing instrument, and acknowledged that they executed the same.

_______________________________
Notary Public
My Commission Expires: [Date]`,

  'renters-rights': `[Your Name]
[Your Address]
[City, State ZIP Code]
[Phone Number]
[Email Address]

[Date]

[Landlord Name]
[Landlord Address]
[City, State ZIP Code]

Re: Tenant Rights Notification

Dear [Landlord Name],

As a tenant in your property located at [Property Address], I am writing to notify you of my rights under state and local law. This letter serves as a formal reminder of the legal obligations you have as a landlord and the rights I have as a tenant.

TENANT RIGHTS:
I am aware of and assert the following rights:

1. Right to Habitable Living Conditions: The property must meet basic health and safety standards.
2. Right to Privacy: You must provide proper notice (typically 24-48 hours) before entering the rental unit.
3. Right to Security Deposit Return: My security deposit must be returned within the statutory timeframe with an itemized list of any deductions.
4. Right to Non-Retaliation: I have the right to request repairs and report violations without fear of retaliation.
5. [Additional specific rights under state/local law]

CURRENT ISSUES:
[If applicable, describe any current issues or concerns]

I expect that these rights will be respected throughout my tenancy. Please acknowledge receipt of this notice and confirm your understanding of these legal obligations.

If you have any questions or concerns, please contact me at the phone number or email address listed above.

Sincerely,

[Your Signature]
[Your Printed Name]`,

  'demand-letter': `[Your Name]
[Your Address]
[City, State ZIP Code]
[Phone Number]
[Email Address]

[Date]

[Recipient Name]
[Recipient Address]
[City, State ZIP Code]

Re: Demand for Payment

Dear [Recipient Name],

This letter serves as formal demand for payment of the amount owed to me in the sum of $[Amount].

BACKGROUND:
On [Date], [description of transaction or agreement]. According to our agreement, payment was due on [Due Date]. Despite multiple attempts to contact you regarding this matter, the amount remains unpaid.

AMOUNT OWED:
Principal Amount: $[Amount]
Late Fees: $[Amount]
Interest: $[Amount]
Total Amount Due: $[Total Amount]

DEMAND FOR PAYMENT:
I hereby demand payment of the full amount of $[Total Amount] within [Number] days of the date of this letter. Payment should be made by [Payment Method] to the address listed above.

CONSEQUENCES OF NON-PAYMENT:
If payment is not received within the specified timeframe, I will be forced to pursue all available legal remedies, including but not limited to:
1. Filing a lawsuit in small claims or civil court
2. Reporting this debt to credit bureaus
3. Seeking collection through a collection agency
4. Pursuing additional damages and attorney's fees

Please treat this matter with the urgency it deserves. I prefer to resolve this matter amicably without resorting to legal action.

Sincerely,

[Your Signature]
[Your Printed Name]`,

  'nda': `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of [Date] by and between:

DISCLOSING PARTY:
[Your Name/Company Name]
[Address]
[City, State ZIP Code]

RECEIVING PARTY:
[Recipient Name/Company Name]
[Address]
[City, State ZIP Code]

WHEREAS, the Disclosing Party possesses certain confidential and proprietary information; and

WHEREAS, the Receiving Party desires to receive such confidential information for the purpose of [Purpose];

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. CONFIDENTIAL INFORMATION
"Confidential Information" means any information disclosed by the Disclosing Party to the Receiving Party, including but not limited to: [List types of information]

2. OBLIGATIONS
The Receiving Party agrees to:
a) Hold all Confidential Information in strict confidence
b) Not disclose Confidential Information to any third party without prior written consent
c) Use Confidential Information solely for the purpose stated above
d) Protect Confidential Information with the same degree of care used for its own confidential information

3. EXCLUSIONS
This Agreement does not apply to information that:
a) Is or becomes publicly available through no breach of this Agreement
b) Was rightfully in the Receiving Party's possession prior to disclosure
c) Is independently developed by the Receiving Party
d) Is required to be disclosed by law or court order

4. TERM
This Agreement shall remain in effect for [Duration] from the date of execution.

5. RETURN OF MATERIALS
Upon request or termination of this Agreement, the Receiving Party shall return or destroy all Confidential Information.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

DISCLOSING PARTY:

_______________________________
Signature
[Printed Name]
Date: _______________

RECEIVING PARTY:

_______________________________
Signature
[Printed Name]
Date: _______________`,
};

interface Replacements {
  [key: string]: string;
}

export default function DocumentTemplates() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [replacements, setReplacements] = useState<Replacements>({});
  const [placeholders, setPlaceholders] = useState<string[]>([]);

  useEffect(() => {
    if (selectedTemplate) {
      const content = TEMPLATE_CONTENT[selectedTemplate] || '';
      setDocumentContent(content);
      
      // Extract placeholders
      const matches = content.match(/\[.*?\]/g);
      if (matches) {
        const uniquePlaceholders = [...new Set(matches.map(match => match.slice(1, -1)))];
        setPlaceholders(uniquePlaceholders);
      } else {
        setPlaceholders([]);
      }
      
      setReplacements({});
    }
  }, [selectedTemplate]);

  const handleReplacementChange = (key: string, value: string) => {
    setReplacements(prev => ({ ...prev, [key]: value }));
  };

  const generateDocument = () => {
    if (!selectedTemplate) {
      toast({
        title: "No Template Selected",
        description: "Please select a document template first.",
        variant: "destructive",
      });
      return;
    }

    let content = TEMPLATE_CONTENT[selectedTemplate];
    Object.entries(replacements).forEach(([key, value]) => {
      const regex = new RegExp(`\\[${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'g');
      content = content.replace(regex, value);
    });

    setDocumentContent(content);
    toast({
      title: "Document Generated",
      description: "Your document has been generated with your custom information.",
    });
  };

  const downloadDocument = () => {
    if (!documentContent) {
      toast({
        title: "No Document to Download",
        description: "Please generate a document first.",
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([documentContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: "Your document has been downloaded.",
    });
  };

  const clearForm = () => {
    setSelectedTemplate('');
    setDocumentContent('');
    setReplacements({});
    setPlaceholders([]);
    toast({
      title: "Form Cleared",
      description: "All form data has been cleared.",
    });
  };

  const selectedTemplateInfo = TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Legal Document Templates</h1>
        </div>
        <p className="text-muted-foreground">
          Create legal documents using pre-built templates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template">Document Template</Label>
              <Select onValueChange={setSelectedTemplate} value={selectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a document template" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplateInfo && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">{selectedTemplateInfo.category}</p>
                  <p className="text-sm text-muted-foreground">{selectedTemplateInfo.description}</p>
                </div>
              )}
            </div>

            {selectedTemplate && placeholders.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Customize Document</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {placeholders.map((placeholder) => (
                    <div key={placeholder} className="space-y-2">
                      <Label htmlFor={placeholder} className="text-sm">
                        {placeholder}
                      </Label>
                      <Input
                        id={placeholder}
                        placeholder={`Enter ${placeholder.toLowerCase()}`}
                        value={replacements[placeholder] || ''}
                        onChange={(e) => handleReplacementChange(placeholder, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTemplate && (
              <div className="flex gap-2 pt-4">
                <Button onClick={generateDocument} className="flex-1">
                  Generate Document
                </Button>
                <Button onClick={clearForm} variant="outline">
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Document</CardTitle>
          </CardHeader>
          <CardContent>
            {documentContent ? (
              <div className="space-y-4">
                <Textarea
                  value={documentContent}
                  onChange={(e) => setDocumentContent(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                />
                <Button onClick={downloadDocument} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Document
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">Your generated document will appear here</p>
                <p className="text-sm">Select a template and fill in the required information</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Important Legal Notice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Disclaimer:</strong> These templates are provided for informational purposes only and do not constitute legal advice. 
            The use of these templates does not create an attorney-client relationship.
          </p>
          <p>
            Legal requirements vary by jurisdiction, and these templates may not be suitable for your specific situation. 
            We strongly recommend consulting with a qualified attorney before using any legal document.
          </p>
          <p>
            By using these templates, you acknowledge that you understand these limitations and agree to use them at your own risk.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}