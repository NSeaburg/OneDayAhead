import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

interface IntakeCardProps {
  cardContent: string;
  onSubmit: (data: Record<string, string>) => void;
}

interface CardField {
  id: string;
  label: string;
  placeholder: string;
  required: boolean;
}

// Component to show completed form data
interface CompletedIntakeCardProps {
  data: Record<string, string>;
}

export function CompletedIntakeCard({ data }: CompletedIntakeCardProps) {
  return (
    <Card className="bg-green-50 border-green-200 shadow-sm">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-700 font-medium">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <span>Details submitted</span>
          </div>
          
          <div className="space-y-2">
            {Object.entries(data).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{label}:</span>
                <span className="text-sm text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function IntakeCard({ cardContent, onSubmit }: IntakeCardProps) {
  // Parse the card content to extract fields
  const parseCardFields = (content: string): CardField[] => {
    const fields: CardField[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Look for lines like "School District: _____ (or N/A)"
      if (trimmed.includes(':') && trimmed.includes('_____')) {
        const parts = trimmed.split(':');
        if (parts.length >= 2) {
          const label = parts[0].trim();
          const isOptional = trimmed.includes('(or N/A)') || trimmed.includes('(or NA)');
          
          // Create field ID from label
          const id = label.toLowerCase().replace(/\s+/g, '');
          
          fields.push({
            id,
            label,
            placeholder: isOptional ? `Enter ${label.toLowerCase()} or N/A` : `Enter ${label.toLowerCase()}`,
            required: !isOptional
          });
        }
      }
    }
    
    return fields;
  };

  const fields = parseCardFields(cardContent);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Convert form data to human-readable format
    const submissionData: Record<string, string> = {};
    fields.forEach(field => {
      const value = formData[field.id] || '';
      submissionData[field.label] = value;
    });
    
    onSubmit(submissionData);
  };

  const isFormValid = fields.every(field => 
    !field.required || (formData[field.id] && formData[field.id].trim())
  );

  if (fields.length === 0) {
    return null; // Don't render if no valid fields found
  }

  return (
    <Card className="bg-gray-50 border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">i</span>
            </div>
            <span>Just need a few more details</span>
          </div>
          
          <div className="space-y-3">
            {fields.map((field) => (
              <div key={field.id} className="space-y-1">
                <Label htmlFor={field.id} className="text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Input
                  id={field.id}
                  placeholder={field.placeholder}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="bg-white"
                />
              </div>
            ))}
          </div>
          
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Continue
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}