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
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
          <Check className="w-4 h-4 text-green-600" />
          <span>Details submitted</span>
        </div>
        
        <div className="space-y-2">
          {Object.entries(data).map(([label, value]) => (
            <div key={label} className="space-y-1">
              <div className="text-green-700 text-sm font-medium">{label}:</div>
              <div className="text-green-900 text-sm bg-white rounded px-2 py-1 border border-green-100">
                {value}
              </div>
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
    console.log("🔧 DEBUG: Parsing intake card content:", content);
    const fields: CardField[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      console.log("🔧 DEBUG: Processing line:", trimmed);
      
      // Look for lines like "School District: _____ (or N/A)" or "Subject Area: _____"
      if (trimmed.includes(':') && trimmed.includes('_____')) {
        const parts = trimmed.split(':');
        if (parts.length >= 2) {
          const label = parts[0].trim();
          const isOptional = trimmed.includes('(or N/A)') || trimmed.includes('(or NA)');
          
          // Create field ID from label
          const id = label.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
          
          console.log("🔧 DEBUG: Found field -", label, "ID:", id, "Optional:", isOptional);
          
          fields.push({
            id,
            label,
            placeholder: isOptional ? `Enter ${label.toLowerCase()} or N/A` : `Enter ${label.toLowerCase()}`,
            required: !isOptional
          });
        }
      }
    }
    
    console.log("🔧 DEBUG: Parsed fields:", fields);
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
    <Card className="bg-gray-100 border border-gray-300 shadow-sm">
      <CardContent className="p-4">
        <div className="space-y-4">
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
                  onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
          
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
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