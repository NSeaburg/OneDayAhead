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
    <div className="bg-gray-50/30 border border-gray-200/50 rounded-lg p-3">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Check className="w-4 h-4 text-gray-500" />
          <span>Details submitted</span>
        </div>
        
        <div className="space-y-1 text-sm">
          {Object.entries(data).map(([label, value]) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-gray-600">{label}:</span>
              <span className="text-gray-800 font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
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
    <Card className="bg-gray-50/50 border-gray-200/60 shadow-none">
      <CardContent className="p-3">
        <div className="space-y-3">
          <div className="text-sm text-gray-600 font-medium">
            Just need a few more details:
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
                  className="bg-white border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-gray-200"
                />
              </div>
            ))}
          </div>
          
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white"
            size="sm"
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