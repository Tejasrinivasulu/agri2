import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Building2, Search, ExternalLink, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { STATE_OPTIONS } from '@/data/cropRates';

interface GovtSchemesScreenProps {
  onBack: () => void;
}

interface Scheme {
  id: string;
  scheme_name: string;
  scheme_type: string;
  state: string;
  benefit_details: string;
  eligibility: string;
  subsidy_percentage: string | null;
  official_link: string | null;
  created_at?: string;
}

const SAMPLE_SCHEMES: Scheme[] = [
  { id: '1', scheme_name: 'PM-KISAN', scheme_type: 'Central', state: 'All States', benefit_details: '₹6,000 per year direct benefit', eligibility: 'All farmers owning cultivable land', subsidy_percentage: 'Direct Transfer', official_link: 'pmkisan.gov.in', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', scheme_name: 'Pradhan Mantri Fasal Bima Yojana', scheme_type: 'Central', state: 'All States', benefit_details: 'Crop insurance coverage', eligibility: 'All farmers growing notified crops', subsidy_percentage: 'Premium subsidy up to 90%', official_link: 'pmfby.gov.in', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', scheme_name: 'Tamil Nadu Free Electricity Scheme', scheme_type: 'State', state: 'Tamil Nadu', benefit_details: 'Free electricity for agriculture', eligibility: 'Farmers with agricultural connections', subsidy_percentage: '100%', official_link: 'tangedco.gov.in', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '4', scheme_name: 'Kisan Credit Card', scheme_type: 'Central', state: 'All States', benefit_details: 'Credit facility for farmers', eligibility: 'All farmers, tenant farmers, sharecroppers', subsidy_percentage: 'Interest subvention', official_link: 'pmkisan.gov.in', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
];

const GovtSchemesScreen: React.FC<GovtSchemesScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'Central' | 'State'>('Central');
  const [schemes, setSchemes] = useState<Scheme[]>(SAMPLE_SCHEMES);
  const [loadingSchemes, setLoadingSchemes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<string>('');

  // Eligibility check state
  const [showEligibilityCheck, setShowEligibilityCheck] = useState(false);
  const [userState, setUserState] = useState('Tamil Nadu');
  const [userCrop, setUserCrop] = useState('');
  const [landOwnership, setLandOwnership] = useState('yes');
  const [eligibilityResults, setEligibilityResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void loadSchemes();
  }, []);

  const loadSchemes = async () => {
    setLoadingSchemes(true);
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      const supabasePromise = supabase.from('government_schemes').select('*').order('created_at', { ascending: false });
      const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;
      if (error) throw error;
      const dbSchemes = (data || []).map((r: any) => ({
        id: r.id,
        scheme_name: r.scheme_name,
        scheme_type: r.scheme_type,
        state: r.state,
        benefit_details: r.benefit_details,
        eligibility: r.eligibility,
        subsidy_percentage: r.subsidy_percentage,
        official_link: r.official_link,
        created_at: r.created_at,
      }));
      setSchemes(dbSchemes.length > 0 ? dbSchemes : SAMPLE_SCHEMES);
    } catch {
      setSchemes(SAMPLE_SCHEMES);
    } finally {
      setLoadingSchemes(false);
    }
  };

  const checkEligibility = () => {
    const results: Record<string, boolean> = {};
    
    schemes.forEach(scheme => {
      let eligible = true;
      
      // Check state eligibility
      if (scheme.state !== 'All States' && scheme.state !== userState) {
        eligible = false;
      }
      
      // Check scheme type
      if (scheme.scheme_type !== activeTab) {
        eligible = false;
      }
      
      // Basic eligibility checks
      if (scheme.eligibility.toLowerCase().includes('owning') && landOwnership === 'no') {
        eligible = false;
      }
      
      if (scheme.eligibility.toLowerCase().includes('tenant') && landOwnership === 'yes') {
        // Some schemes are for tenants, but most require ownership
        if (!scheme.eligibility.toLowerCase().includes('all farmers')) {
          eligible = false;
        }
      }
      
      results[scheme.id] = eligible;
    });
    
    setEligibilityResults(results);
    setShowEligibilityCheck(true);
  };

  const filteredSchemes = useMemo(() => {
    return schemes.filter(scheme => {
      const matchesTab = scheme.scheme_type === activeTab;
      const matchesState = !filterState || scheme.state === filterState || scheme.state === 'All States';
      const matchesSearch = !searchQuery.trim() || 
        scheme.scheme_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.benefit_details.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesState && matchesSearch;
    });
  }, [schemes, activeTab, filterState, searchQuery]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-foreground">{t.govtSchemes || 'Govt Schemes'} 🏛️</h1>
            <p className="text-sm text-primary-foreground/80">Find eligible government schemes</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t.search2 || 'Search schemes...'}
              className="pl-10 bg-card/90 border-0 min-h-[44px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => loadSchemes()} disabled={loadingSchemes} className="min-h-[44px] min-w-[44px]">
            <RefreshCw className={`w-4 h-4 ${loadingSchemes ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex gap-2 mb-2">
          {(['Central', 'State'] as const).map(tab => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'secondary' : 'ghost'}
              className={`flex-1 min-h-[44px] ${activeTab === tab ? 'bg-card text-foreground' : 'text-primary-foreground'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Central' ? '🇮🇳 Central' : '🏛️ State'}
            </Button>
          ))}
        </div>

        <Select value={filterState || undefined} onValueChange={(val) => setFilterState(val === "all" ? "" : val)}>
          <SelectTrigger className="bg-card/90 border-0 min-h-[44px] text-xs mt-2">
            <SelectValue placeholder="Filter by State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {STATE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <Button
          className="w-full min-h-[44px] mt-2 bg-accent text-accent-foreground"
          onClick={checkEligibility}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Check My Eligibility
        </Button>
      </div>

      <div className="px-4 mt-4">
        {showEligibilityCheck && (
          <div className="bg-card rounded-2xl shadow-card p-4 mb-4 space-y-3">
            <h3 className="font-semibold text-foreground">Eligibility Check</h3>
            <Select value={userState} onValueChange={setUserState}>
              <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
                <SelectValue placeholder="Your State" />
              </SelectTrigger>
              <SelectContent>
                {STATE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={landOwnership} onValueChange={setLandOwnership}>
              <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
                <SelectValue placeholder="Land Ownership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">I own land</SelectItem>
                <SelectItem value="no">I don't own land</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full" onClick={checkEligibility}>
              Check Eligibility
            </Button>
          </div>
        )}

        {filteredSchemes.length > 0 && !loadingSchemes && (
          <p className="text-xs text-muted-foreground mb-2">
            Showing {filteredSchemes.length} {filteredSchemes.length === 1 ? 'scheme' : 'schemes'}
          </p>
        )}

        <div className="space-y-3 mt-4">
          {loadingSchemes && schemes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading schemes...</p>
            </div>
          ) : filteredSchemes.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="text-4xl mb-3">🏛️</div>
              <p className="text-sm font-medium text-foreground mb-1">No schemes found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : (
            filteredSchemes.map((scheme) => {
              const isEligible = eligibilityResults[scheme.id];
              return (
                <div key={scheme.id} className="bg-card rounded-2xl shadow-card p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{scheme.scheme_name}</h3>
                        {showEligibilityCheck && (
                          isEligible ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )
                        )}
                      </div>
                      <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mt-1">
                        {scheme.scheme_type}
                      </span>
                    </div>
                    <span className="text-2xl">{scheme.scheme_type === 'Central' ? '🇮🇳' : '🏛️'}</span>
                  </div>

                  <div className="bg-leaf-light rounded-lg p-3">
                    <p className="text-xs font-medium text-leaf-dark mb-1">💰 Benefits</p>
                    <p className="text-sm text-leaf-dark">{scheme.benefit_details}</p>
                  </div>

                  <div className="bg-secondary rounded-lg p-3">
                    <p className="text-xs font-medium text-foreground mb-1">📋 Eligibility</p>
                    <p className="text-sm text-muted-foreground">{scheme.eligibility}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">📍 {scheme.state}</span>
                    {scheme.subsidy_percentage && (
                      <span className="font-semibold text-primary">💵 {scheme.subsidy_percentage}</span>
                    )}
                    {scheme.created_at && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(scheme.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      📖 View Details
                    </Button>
                    {scheme.official_link && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(`https://${scheme.official_link}`, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Apply Now
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default GovtSchemesScreen;
