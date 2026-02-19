import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, Filter, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface SearchScreenProps {
  onBack: () => void;
}

type Category = 'all' | 'crops' | 'tools' | 'services' | 'land' | 'officers' | 'schemes';

interface SearchResult {
  id: string;
  type: Category;
  title: string;
  description: string;
  location?: string;
  price?: string;
  route: string;
  emoji: string;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Mock data for search results - in real app, this would come from API
  const mockResults: SearchResult[] = [
    // Crops
    { id: '1', type: 'crops', title: 'Rice - Buy & Sell', description: 'High quality rice available', location: 'Chennai, Tamil Nadu', price: '₹45/kg', route: '/features/buy-sell', emoji: '🌾' },
    { id: '2', type: 'crops', title: 'Wheat - Buy & Sell', description: 'Organic wheat for sale', location: 'Thanjavur, Tamil Nadu', price: '₹30/kg', route: '/features/buy-sell', emoji: '🌾' },
    { id: '3', type: 'crops', title: 'Cotton - Buy & Sell', description: 'Premium cotton bales', location: 'Coimbatore, Tamil Nadu', price: '₹120/kg', route: '/features/buy-sell', emoji: '🌸' },
    
    // Tools
    { id: '4', type: 'tools', title: 'Tractor Rental', description: 'John Deere tractor available for rent', location: 'Madurai, Tamil Nadu', price: '₹2000/day', route: '/features/agri-tools', emoji: '🚜' },
    { id: '5', type: 'tools', title: 'Plough Equipment', description: 'Modern ploughing tools', location: 'Salem, Tamil Nadu', price: '₹500/day', route: '/features/agri-tools', emoji: '🚜' },
    
    // Services
    { id: '6', type: 'services', title: 'Tractor Repair Service', description: 'Expert technician for tractor maintenance', location: 'Chennai, Tamil Nadu', route: '/features/technicians', emoji: '🔧' },
    { id: '7', type: 'services', title: 'Irrigation System Setup', description: 'Professional irrigation installation', location: 'Coimbatore, Tamil Nadu', route: '/features/technicians', emoji: '💧' },
    
    // Land
    { id: '8', type: 'land', title: 'Agricultural Land for Rent', description: '5 acres fertile land', location: 'Thanjavur, Tamil Nadu', price: '₹15,000/acre', route: '/features/land-renting', emoji: '🗺️' },
    { id: '9', type: 'land', title: 'Farmland Available', description: '10 acres black soil land', location: 'Madurai, Tamil Nadu', price: '₹12,000/acre', route: '/features/land-renting', emoji: '🗺️' },
    
    // Officers
    { id: '10', type: 'officers', title: 'Dr. Ramesh Kumar - Agri Officer', description: '15 years experience, Chennai', location: 'Chennai, Tamil Nadu', route: '/features/agri-officers', emoji: '👨‍🌾' },
    { id: '11', type: 'officers', title: 'Dr. Priya Sharma - Veterinary Officer', description: '12 years experience, Coimbatore', location: 'Coimbatore, Tamil Nadu', route: '/features/agri-officers', emoji: '👨‍⚕️' },
    
    // Schemes
    { id: '12', type: 'schemes', title: 'PM-KISAN Scheme', description: '₹6,000 per year direct benefit', location: 'All States', route: '/features/govt-schemes', emoji: '🏛️' },
    { id: '13', type: 'schemes', title: 'Kisan Credit Card', description: 'Credit facility for farmers', location: 'All States', route: '/features/govt-schemes', emoji: '🏦' },
  ];

  useEffect(() => {
    const stored = localStorage.getItem('search_history');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 5));
        }
      } catch {}
    }
  }, []);

  const saveSearchHistory = (query: string) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('search_history', JSON.stringify(updated));
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    saveSearchHistory(searchQuery.trim());
    setSearchHistory([...searchHistory, searchQuery.trim()]);
  };

  const handleResultClick = (result: SearchResult) => {
    saveSearchHistory(searchQuery.trim());
    navigate(result.route);
  };

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return mockResults.filter(result => {
      const matchesCategory = selectedCategory === 'all' || result.type === selectedCategory;
      const matchesQuery = 
        result.title.toLowerCase().includes(query) ||
        result.description.toLowerCase().includes(query) ||
        result.location?.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const categories: { id: Category; label: string; emoji: string }[] = [
    { id: 'all', label: 'All', emoji: '🔍' },
    { id: 'crops', label: 'Crops', emoji: '🌾' },
    { id: 'tools', label: 'Tools', emoji: '🚜' },
    { id: 'services', label: 'Services', emoji: '🔧' },
    { id: 'land', label: 'Land', emoji: '🗺️' },
    { id: 'officers', label: 'Officers', emoji: '👨‍🌾' },
    { id: 'schemes', label: 'Schemes', emoji: '🏛️' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-foreground">Search 🔍</h1>
            <p className="text-sm text-primary-foreground/80">Find crops, tools, services & more</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for crops, tools, services..."
              className="pl-10 bg-card/90 border-0 min-h-[44px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} className="min-h-[44px] min-w-[44px]">
            <Search className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'secondary' : 'ghost'}
              className={`flex-shrink-0 min-h-[44px] ${selectedCategory === cat.id ? 'bg-card text-foreground' : 'text-primary-foreground'}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.emoji} {cat.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4">
        {!searchQuery.trim() ? (
          <>
            {recentSearches.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">Recent Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery(search);
                        handleSearch();
                      }}
                      className="text-xs"
                    >
                      {search}
                      <X className="w-3 h-3 ml-1" onClick={(e) => {
                        e.stopPropagation();
                        const updated = recentSearches.filter((_, i) => i !== idx);
                        setRecentSearches(updated);
                        localStorage.setItem('search_history', JSON.stringify(updated));
                      }} />
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground mb-2">Popular Searches</h3>
              {['Rice', 'Tractor', 'Soil Test', 'Government Schemes', 'Loan'].map((term) => (
                <Button
                  key={term}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setSearchQuery(term);
                    handleSearch();
                  }}
                >
                  <Search className="w-4 h-4 mr-2" />
                  {term}
                </Button>
              ))}
            </div>
          </>
        ) : (
          <>
            {filteredResults.length > 0 ? (
              <>
                <p className="text-xs text-muted-foreground mb-2">
                  Found {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}
                </p>
                <div className="space-y-3">
                  {filteredResults.map((result) => (
                    <div
                      key={result.id}
                      className="bg-card rounded-2xl shadow-card p-4 space-y-2 cursor-pointer hover:bg-secondary/50 transition-colors"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{result.emoji}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{result.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{result.description}</p>
                          {result.location && (
                            <p className="text-xs text-muted-foreground mt-1">📍 {result.location}</p>
                          )}
                          {result.price && (
                            <p className="text-sm font-semibold text-primary mt-1">{result.price}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 px-4">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-sm font-medium text-foreground mb-1">No results found</p>
                <p className="text-xs text-muted-foreground">Try different keywords or categories</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchScreen;
