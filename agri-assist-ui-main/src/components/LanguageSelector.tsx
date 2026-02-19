import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage, languageNames, Language } from '@/contexts/LanguageContext';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages: Language[] = ['en', 'te', 'hi'];

  return (
    <div className="relative">
      <Button
        variant="language"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Globe className="w-4 h-4" />
        <span>{languageNames[language]}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-card rounded-xl shadow-card border border-border overflow-hidden z-50 animate-scale-in">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-secondary transition-colors ${
                language === lang ? 'bg-secondary font-semibold text-primary' : 'text-foreground'
              }`}
            >
              {languageNames[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
