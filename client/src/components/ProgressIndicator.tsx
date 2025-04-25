interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const percentComplete = (currentStep / totalSteps) * 100;
  
  return (
    <div className="w-full bg-gray-100 h-2">
      <div 
        className="bg-primary h-full transition-all duration-500" 
        style={{ width: `${percentComplete}%` }}
      />
    </div>
  );
}
