import React from 'react';
import { ArrowLeft, Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeaturePlaceholderProps {
  title: string;
  emoji: string;
  onBack: () => void;
}

const FeaturePlaceholder: React.FC<FeaturePlaceholderProps> = ({ title, emoji, onBack }) => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">{title} {emoji}</h1>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center px-4 mt-20">
        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
          <Construction className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Coming Soon!</h2>
        <p className="text-muted-foreground text-center max-w-xs">
          We're working hard to bring you the {title} feature. Stay tuned for updates!
        </p>
        <Button onClick={onBack} className="mt-6">
          Go Back Home
        </Button>
      </div>
    </div>
  );
};

export default FeaturePlaceholder;
