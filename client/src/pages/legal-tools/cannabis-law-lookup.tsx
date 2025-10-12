import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Leaf, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

// Cannabis laws data by state
const CANNABIS_LAWS = {
  'AL': {
    state: 'Alabama',
    recreational: { status: 'Illegal', color: 'destructive' },
    medical: { status: 'Legal with restrictions', color: 'default' },
    possessionLimits: 'Medical: Up to 70 grams of cannabis flower per 90 days',
    cultivation: 'Not permitted for personal use',
    details: 'Alabama legalized medical cannabis in 2021. Patients with qualifying conditions can obtain cannabis through licensed dispensaries.',
  },
  'AK': {
    state: 'Alaska',
    recreational: { status: 'Legal', color: 'default' },
    medical: { status: 'Legal', color: 'default' },
    possessionLimits: 'Recreational: Up to 1 ounce in public, 4 ounces at home. Medical: Up to 1 ounce',
    cultivation: 'Recreational: Up to 6 plants (3 mature). Medical: Varies by patient needs',
    details: 'Alaska was one of the first states to legalize recreational cannabis in 2014.',
  },
  'AZ': {
    state: 'Arizona',
    recreational: { status: 'Legal', color: 'default' },
    medical: { status: 'Legal', color: 'default' },
    possessionLimits: 'Recreational: Up to 1 ounce (5 grams concentrate). Medical: Up to 2.5 ounces per 14 days',
    cultivation: 'Recreational: Up to 6 plants per person (12 per household). Medical: Up to 12 plants',
    details: 'Arizona legalized recreational cannabis in 2020 through Proposition 207.',
  },
  'CA': {
    state: 'California',
    recreational: { status: 'Legal', color: 'default' },
    medical: { status: 'Legal', color: 'default' },
    possessionLimits: 'Recreational: Up to 1 ounce (8 grams concentrate). Medical: Up to 8 ounces',
    cultivation: 'Recreational: Up to 6 plants per residence. Medical: Varies by local jurisdiction',
    details: 'California was the first state to legalize medical cannabis in 1996 and recreational in 2016.',
  },
  'CO': {
    state: 'Colorado',
    recreational: { status: 'Legal', color: 'default' },
    medical: { status: 'Legal', color: 'default' },
    possessionLimits: 'Recreational: Up to 1 ounce. Medical: Up to 2 ounces',
    cultivation: 'Recreational: Up to 6 plants (3 mature). Medical: Varies by patient needs',
    details: 'Colorado was one of the first states to legalize recreational cannabis in 2012.',
  },
  'CT': {
    state: 'Connecticut',
    recreational: { status: 'Legal', color: 'default' },
    medical: { status: 'Legal', color: 'default' },
    possessionLimits: 'Recreational: Up to 1.5 ounces on person, 5 ounces at home. Medical: Up to 2.5 ounces per month',
    cultivation: 'Recreational: Up to 6 plants (3 mature) starting July 2023. Medical: Not permitted',
    details: 'Connecticut legalized recreational cannabis in 2021.',
  },
  'FL': {
    state: 'Florida',
    recreational: { status: 'Illegal', color: 'destructive' },
    medical: { status: 'Legal', color: 'default' },
    possessionLimits: 'Medical: Up to 2.5 ounces per 35 days',
    cultivation: 'Not permitted',
    details: 'Florida has a medical cannabis program but recreational use remains illegal.',
  },
  'IL': {
    state: 'Illinois',
    recreational: { status: 'Legal', color: 'default' },
    medical: { status: 'Legal', color: 'default' },
    possessionLimits: 'Recreational: Up to 30 grams for residents, 15 grams for non-residents. Medical: Up to 2.5 ounces per 14 days',
    cultivation: 'Recreational: Not permitted. Medical: Up to 5 plants',
    details: 'Illinois legalized recreational cannabis in 2020.',
  },
  'MA': {
    state: 'Massachusetts',
    recreational: { status: 'Legal', color: 'default' },
    medical: { status: 'Legal', color: 'default' },
    possessionLimits: 'Recreational: Up to 1 ounce in public, 10 ounces at home. Medical: Up to 10 ounces per 60 days',
    cultivation: 'Recreational: Up to 6 plants per person (12 per household). Medical: Varies',
    details: 'Massachusetts legalized recreational cannabis in 2016.',
  },
  'MI': {
    state: 'Michigan',
    recreational: { status: 'Legal', color: 'default' },
    medical: { status: 'Legal', color: 'default' },
    possessionLimits: 'Recreational: Up to 2.5 ounces in public, 10 ounces at home. Medical: Up to 2.5 ounces',
    cultivation: 'Recreational: Up to 12 plants per household. Medical: Up to 12 plants',
    details: 'Michigan legalized recreational cannabis in 2018.',
  },
  'NV': {
    state: 'Nevada',
    recreational: { status: 'Legal', color: 'default' },
    medical: { status: 'Legal', color: 'default' },
    possessionLimits: 'Recreational: Up to 1 ounce. Medical: Up to 2.5 ounces per 14 days',
    cultivation: 'Recreational: Up to 6 plants if more than 25 miles from dispensary. Medical: Up to 12 plants',
    details: 'Nevada legalized recreational cannabis in 2017.',
  },
  'NY': {
    state: 'New York',
    recreational: { status: 'Legal', color: 'default' },
    medical: { status: 'Legal', color: 'default' },
    possessionLimits: 'Recreational: Up to 3 ounces in public, 5 pounds at home. Medical: Up to 2.5 ounces per 30 days',
    cultivation: 'Recreational: Up to 6 plants (3 mature). Medical: Not permitted',
    details: 'New York legalized recreational cannabis in 2021.',
  },
  'OR': {
    state: 'Oregon',
    recreational: { status: 'Legal', color: 'default' },
    medical: { status: 'Legal', color: 'default' },
    possessionLimits: 'Recreational: Up to 1 ounce in public, 8 ounces at home. Medical: Up to 24 ounces',
    cultivation: 'Recreational: Up to 4 plants per household. Medical: Up to 6 plants',
    details: 'Oregon legalized recreational cannabis in 2014.',
  },
  'PA': {
    state: 'Pennsylvania',
    recreational: { status: 'Illegal', color: 'destructive' },
    medical: { status: 'Legal', color: 'default' },
    possessionLimits: 'Medical: Up to a 30-day supply',
    cultivation: 'Not permitted',
    details: 'Pennsylvania has a medical cannabis program but recreational use remains illegal.',
  },
  'TX': {
    state: 'Texas',
    recreational: { status: 'Illegal', color: 'destructive' },
    medical: { status: 'Limited', color: 'secondary' },
    possessionLimits: 'Medical: Low-THC cannabis only for specific conditions',
    cultivation: 'Not permitted',
    details: 'Texas has a very limited medical cannabis program for specific conditions only.',
  },
  'WA': {
    state: 'Washington',
    recreational: { status: 'Legal', color: 'default' },
    medical: { status: 'Legal', color: 'default' },
    possessionLimits: 'Recreational: Up to 1 ounce. Medical: Up to 3 ounces',
    cultivation: 'Recreational: Not permitted. Medical: Up to 6 plants',
    details: 'Washington was one of the first states to legalize recreational cannabis in 2012.',
  },
};

export default function CannabisLawLookup() {
  const [selectedState, setSelectedState] = useState('');
  const [laws, setLaws] = useState<typeof CANNABIS_LAWS[keyof typeof CANNABIS_LAWS] | null>(null);

  const handleLookup = () => {
    if (!selectedState) return;
    
    const stateLaws = CANNABIS_LAWS[selectedState as keyof typeof CANNABIS_LAWS];
    if (stateLaws) {
      setLaws(stateLaws);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('Legal') && !status.includes('Limited')) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (status.includes('Limited') || status.includes('restrictions')) {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Leaf className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold">Cannabis Laws Lookup</h1>
        </div>
        <p className="text-muted-foreground">
          Find comprehensive information about cannabis laws by state
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>State Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="state">Select State</Label>
              <Select onValueChange={setSelectedState} value={selectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CANNABIS_LAWS).map(([id, law]) => (
                    <SelectItem key={id} value={id}>
                      {law.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleLookup} className="w-full" disabled={!selectedState}>
              Lookup Cannabis Laws
            </Button>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2 text-sm">Important Notice</h3>
              <p className="text-xs text-muted-foreground">
                This information is for educational purposes only and should not be considered legal advice. 
                Cannabis laws are subject to change and may vary by local jurisdiction. Always verify current 
                laws with official sources and consult with a legal professional for specific guidance.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cannabis Laws Information</CardTitle>
          </CardHeader>
          <CardContent>
            {laws ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-4">{laws.state}</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                    {getStatusIcon(laws.recreational.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">Recreational Use:</span>
                        <Badge variant={laws.recreational.color as any}>
                          {laws.recreational.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                    {getStatusIcon(laws.medical.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">Medical Use:</span>
                        <Badge variant={laws.medical.color as any}>
                          {laws.medical.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Possession Limits</h4>
                    <p className="text-sm text-muted-foreground">{laws.possessionLimits}</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Cultivation</h4>
                    <p className="text-sm text-muted-foreground">{laws.cultivation}</p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Additional Details</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">{laws.details}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Leaf className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">Select a state to view cannabis laws</p>
                <p className="text-sm">Choose a state from the dropdown and click "Lookup Cannabis Laws"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Understanding Cannabis Laws</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Legal
              </h4>
              <p className="text-sm text-muted-foreground">
                Cannabis is legal for recreational or medical use with proper licensing and within specified limits.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Limited/Restricted
              </h4>
              <p className="text-sm text-muted-foreground">
                Cannabis is legal only under specific conditions, such as medical use with restrictions or low-THC products only.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Illegal
              </h4>
              <p className="text-sm text-muted-foreground">
                Cannabis possession, use, and cultivation are prohibited by state law.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Federal Law</h4>
              <p className="text-sm text-muted-foreground">
                Cannabis remains illegal under federal law, regardless of state laws. This can affect federal employment, housing, and other areas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}