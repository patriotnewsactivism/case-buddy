import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Download, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// US States data
const US_STATES = [
  { id: 'AL', name: 'Alabama' },
  { id: 'AK', name: 'Alaska' },
  { id: 'AZ', name: 'Arizona' },
  { id: 'AR', name: 'Arkansas' },
  { id: 'CA', name: 'California' },
  { id: 'CO', name: 'Colorado' },
  { id: 'CT', name: 'Connecticut' },
  { id: 'DE', name: 'Delaware' },
  { id: 'FL', name: 'Florida' },
  { id: 'GA', name: 'Georgia' },
  { id: 'HI', name: 'Hawaii' },
  { id: 'ID', name: 'Idaho' },
  { id: 'IL', name: 'Illinois' },
  { id: 'IN', name: 'Indiana' },
  { id: 'IA', name: 'Iowa' },
  { id: 'KS', name: 'Kansas' },
  { id: 'KY', name: 'Kentucky' },
  { id: 'LA', name: 'Louisiana' },
  { id: 'ME', name: 'Maine' },
  { id: 'MD', name: 'Maryland' },
  { id: 'MA', name: 'Massachusetts' },
  { id: 'MI', name: 'Michigan' },
  { id: 'MN', name: 'Minnesota' },
  { id: 'MS', name: 'Mississippi' },
  { id: 'MO', name: 'Missouri' },
  { id: 'MT', name: 'Montana' },
  { id: 'NE', name: 'Nebraska' },
  { id: 'NV', name: 'Nevada' },
  { id: 'NH', name: 'New Hampshire' },
  { id: 'NJ', name: 'New Jersey' },
  { id: 'NM', name: 'New Mexico' },
  { id: 'NY', name: 'New York' },
  { id: 'NC', name: 'North Carolina' },
  { id: 'ND', name: 'North Dakota' },
  { id: 'OH', name: 'Ohio' },
  { id: 'OK', name: 'Oklahoma' },
  { id: 'OR', name: 'Oregon' },
  { id: 'PA', name: 'Pennsylvania' },
  { id: 'RI', name: 'Rhode Island' },
  { id: 'SC', name: 'South Carolina' },
  { id: 'SD', name: 'South Dakota' },
  { id: 'TN', name: 'Tennessee' },
  { id: 'TX', name: 'Texas' },
  { id: 'UT', name: 'Utah' },
  { id: 'VT', name: 'Vermont' },
  { id: 'VA', name: 'Virginia' },
  { id: 'WA', name: 'Washington' },
  { id: 'WV', name: 'West Virginia' },
  { id: 'WI', name: 'Wisconsin' },
  { id: 'WY', name: 'Wyoming' },
];

interface FormData {
  state: string;
  requestDetails: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  agency: string;
}

export default function PublicRecordsGenerator() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    state: '',
    requestDetails: '',
    name: '',
    address: '',
    email: '',
    phone: '',
    agency: '',
  });
  const [generatedRequest, setGeneratedRequest] = useState('');

  // Auto-save functionality
  useEffect(() => {
    const savedData = localStorage.getItem('publicRecordsFormData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    if (Object.values(formData).some(val => val !== '')) {
      localStorage.setItem('publicRecordsFormData', JSON.stringify(formData));
    }
  }, [formData]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateRequest = () => {
    if (!formData.state || !formData.requestDetails || !formData.name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (State, Request Details, and Name)",
        variant: "destructive",
      });
      return;
    }

    const stateName = US_STATES.find(s => s.id === formData.state)?.name || formData.state;
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const template = `${formData.name}
${formData.address}
${formData.email}
${formData.phone}

${today}

${formData.agency || '[Agency Name]'}
${stateName} Public Records Office
[Agency Address]

Re: Public Records Request under ${stateName} Public Records Law

Dear Public Records Officer,

Pursuant to the ${stateName} Public Records Law, I hereby request access to and copies of the following records:

${formData.requestDetails}

If there are any fees for searching or copying these records, please inform me before you fill the request. If the request is denied in whole or in part, I ask that you justify all deletions by reference to specific exemptions of the Public Records Law.

I would prefer to receive these records in electronic format if possible. If you determine that some portion of the requested records is exempt from disclosure, I request that you provide me with the non-exempt portions.

I look forward to your reply within the time period required by law. If you have any questions or need clarification, please contact me at ${formData.email} or ${formData.phone}.

Thank you for your assistance.

Sincerely,

${formData.name}

---
This request was generated using CaseBuddy Legal Toolkit
Date Generated: ${today}
State: ${stateName}
`;

    setGeneratedRequest(template);
    toast({
      title: "Request Generated",
      description: "Your public records request has been generated successfully.",
    });
  };

  const downloadRequest = () => {
    if (!generatedRequest) {
      toast({
        title: "No Request Generated",
        description: "Please generate a request first before downloading.",
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([generatedRequest], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `public_records_request_${formData.state}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: "Your public records request has been downloaded.",
    });
  };

  const clearForm = () => {
    setFormData({
      state: '',
      requestDetails: '',
      name: '',
      address: '',
      email: '',
      phone: '',
      agency: '',
    });
    setGeneratedRequest('');
    localStorage.removeItem('publicRecordsFormData');
    toast({
      title: "Form Cleared",
      description: "All form data has been cleared.",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Public Records Request Generator</h1>
        <p className="text-muted-foreground">
          Generate state-specific FOIA/public records request forms
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select onValueChange={(value) => handleChange('state', value)} value={formData.state}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agency">Agency Name (Optional)</Label>
              <Input
                id="agency"
                placeholder="e.g., Department of Public Safety"
                value={formData.agency}
                onChange={(e) => handleChange('agency', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Request Details *</Label>
              <Textarea
                id="details"
                placeholder="Describe the records you're requesting in detail..."
                value={formData.requestDetails}
                onChange={(e) => handleChange('requestDetails', e.target.value)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Be as specific as possible about the records you're requesting
              </p>
            </div>

            <div className="border-t pt-4 space-y-4">
              <h3 className="font-semibold">Your Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Your mailing address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={generateRequest} className="flex-1">
                Generate Request
              </Button>
              <Button onClick={clearForm} variant="outline">
                Clear Form
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Request</CardTitle>
          </CardHeader>
          <CardContent>
            {generatedRequest ? (
              <div className="space-y-4">
                <Textarea
                  value={generatedRequest}
                  readOnly
                  rows={20}
                  className="font-mono text-sm"
                />
                <Button onClick={downloadRequest} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Request
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-2">Your generated public records request will appear here</p>
                <p className="text-sm">Fill out the form and click "Generate Request" to begin</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Tips for Public Records Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Be as specific as possible about the records you're requesting</li>
            <li>Include date ranges when applicable</li>
            <li>Specify the format you prefer (electronic, paper, etc.)</li>
            <li>Keep a copy of your request for your records</li>
            <li>Follow up if you don't receive a response within the statutory timeframe</li>
            <li>Be prepared to pay reasonable fees for copying and searching</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}