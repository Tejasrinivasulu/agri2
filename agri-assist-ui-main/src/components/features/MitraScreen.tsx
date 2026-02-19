import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Users, Search, MessageCircle, UserPlus, CheckCircle, XCircle, Phone, MapPin, Star, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { STATE_OPTIONS, STATES_DISTRICTS } from '@/data/cropRates';
import { useAuth } from '@/hooks/useAuth';

interface MitraScreenProps {
  onBack: () => void;
}

type Tab = 'discover' | 'requests' | 'connections' | 'chat';

interface Mitra {
  id: string;
  name: string;
  district: string;
  state: string;
  crops: string[];
  experience_years: number;
  phone: string;
  bio: string;
  rating: number;
  created_at?: string;
}

interface MitraRequest {
  id: string;
  mitra_id: string;
  mitra_name: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  created_at?: string;
}

interface ChatMessage {
  id: string;
  mitra_id: string;
  mitra_name: string;
  message: string;
  timestamp: string;
  is_sent: boolean;
}

const STORAGE_KEY_MITRAS = 'mitras_local';
const STORAGE_KEY_REQUESTS = 'mitra_requests_local';
const STORAGE_KEY_CHATS = 'mitra_chats_local';

const SAMPLE_MITRAS: Mitra[] = [
  { id: '1', name: 'Raju Kumar', district: 'Chennai', state: 'Tamil Nadu', crops: ['Rice', 'Wheat'], experience_years: 15, phone: '9876543210', bio: 'Experienced farmer specializing in organic farming', rating: 4.5, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', name: 'Priya Sharma', district: 'Coimbatore', state: 'Tamil Nadu', crops: ['Cotton', 'Sugarcane'], experience_years: 12, phone: '9876543211', bio: 'Expert in modern irrigation techniques', rating: 4.8, created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', name: 'Suresh Reddy', district: 'Thanjavur', state: 'Tamil Nadu', crops: ['Groundnut', 'Pulses'], experience_years: 20, phone: '9876543212', bio: 'Organic farming advocate with 20 years experience', rating: 4.9, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '4', name: 'Lakshmi Devi', district: 'Madurai', state: 'Tamil Nadu', crops: ['Vegetables', 'Fruits'], experience_years: 10, phone: '9876543213', bio: 'Sustainable farming practices specialist', rating: 4.6, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
];

const getStoredMitras = (): Mitra[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MITRAS);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {}
  return [];
};

const saveStoredMitras = (items: Mitra[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_MITRAS, JSON.stringify(items));
  } catch {}
};

const getStoredRequests = (): MitraRequest[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_REQUESTS);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {}
  return [];
};

const saveStoredRequests = (items: MitraRequest[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(items));
  } catch {}
};

const getStoredChats = (mitraId: string): ChatMessage[] => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_CHATS}_${mitraId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {}
  return [];
};

const saveStoredChats = (mitraId: string, messages: ChatMessage[]) => {
  try {
    localStorage.setItem(`${STORAGE_KEY_CHATS}_${mitraId}`, JSON.stringify(messages));
  } catch {}
};

const MitraScreen: React.FC<MitraScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [mitras, setMitras] = useState<Mitra[]>(SAMPLE_MITRAS);
  const [requests, setRequests] = useState<MitraRequest[]>([]);
  const [loadingMitras, setLoadingMitras] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<string>('');
  const [filterDistrict, setFilterDistrict] = useState<string>('');
  const [filterCrop, setFilterCrop] = useState<string>('');

  // Chat state
  const [selectedMitra, setSelectedMitra] = useState<Mitra | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const districtOptions = filterState ? STATES_DISTRICTS[filterState] ?? [] : [];
  const cropOptions = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Groundnut', 'Pulses', 'Vegetables', 'Fruits'];

  useEffect(() => {
    if (activeTab === 'discover') {
      void loadMitras();
    } else if (activeTab === 'requests') {
      void loadRequests();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedMitra) {
      const stored = getStoredChats(selectedMitra.id);
      setChatMessages(stored);
    }
  }, [selectedMitra]);

  const loadMitras = async () => {
    setLoadingMitras(true);
    const localMitras = getStoredMitras();
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      const supabasePromise = supabase.from('mitras').select('*').order('created_at', { ascending: false });
      const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;
      if (error) throw error;
      const dbMitras = (data || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        district: r.district,
        state: r.state,
        crops: Array.isArray(r.crops) ? r.crops : (r.crops || '').split(',').map((c: string) => c.trim()),
        experience_years: Number(r.experience_years) || 0,
        phone: r.phone,
        bio: r.bio || '',
        rating: Number(r.rating) || 0,
        created_at: r.created_at,
      }));
      const merged = [...dbMitras, ...localMitras.filter((l) => !dbMitras.some((d) => d.id === l.id))];
      setMitras(merged.length > 0 ? merged : [...SAMPLE_MITRAS, ...localMitras]);
    } catch {
      const combined = localMitras.length > 0 ? localMitras : SAMPLE_MITRAS;
      setMitras(combined);
    } finally {
      setLoadingMitras(false);
    }
  };

  const loadRequests = () => {
    const stored = getStoredRequests();
    setRequests(stored);
  };

  const handleSendRequest = (mitra: Mitra) => {
    const newRequest: MitraRequest = {
      id: `req-${Date.now()}`,
      mitra_id: mitra.id,
      mitra_name: mitra.name,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    const updated = [...requests, newRequest];
    setRequests(updated);
    saveStoredRequests(updated);
    alert(`✅ Connection request sent to ${mitra.name}!`);
  };

  const handleAcceptRequest = (requestId: string) => {
    const updated = requests.map(r => r.id === requestId ? { ...r, status: 'accepted' as const } : r);
    setRequests(updated);
    saveStoredRequests(updated);
    alert('✅ Request accepted! You can now chat.');
  };

  const handleRejectRequest = (requestId: string) => {
    const updated = requests.map(r => r.id === requestId ? { ...r, status: 'rejected' as const } : r);
    setRequests(updated);
    saveStoredRequests(updated);
  };

  const handleSendMessage = () => {
    if (!selectedMitra || !newMessage.trim()) return;
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      mitra_id: selectedMitra.id,
      mitra_name: selectedMitra.name,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      is_sent: true,
    };
    const updated = [...chatMessages, message];
    setChatMessages(updated);
    saveStoredChats(selectedMitra.id, updated);
    setNewMessage('');
  };

  const filteredMitras = useMemo(() => {
    return mitras.filter(mitra => {
      if (filterState && mitra.state !== filterState) return false;
      if (filterDistrict && mitra.district !== filterDistrict) return false;
      if (filterCrop && !mitra.crops.some(c => c.toLowerCase().includes(filterCrop.toLowerCase()))) return false;
      if (searchQuery.trim()) {
        const term = searchQuery.toLowerCase();
        return (
          mitra.name.toLowerCase().includes(term) ||
          mitra.district.toLowerCase().includes(term) ||
          mitra.bio.toLowerCase().includes(term) ||
          mitra.crops.some(c => c.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }, [mitras, filterState, filterDistrict, filterCrop, searchQuery]);

  const renderDiscoverTab = () => (
    <>
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search Mitras..."
            className="pl-10 bg-card/90 border-0 min-h-[44px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => loadMitras()} disabled={loadingMitras} className="min-h-[44px] min-w-[44px]">
          <RefreshCw className={`w-4 h-4 ${loadingMitras ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex gap-2 mb-2">
        <Select value={filterState || undefined} onValueChange={(val) => { setFilterState(val === "all" ? "" : val); setFilterDistrict(''); }}>
          <SelectTrigger className="bg-card/90 border-0 min-h-[44px] text-xs">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any State</SelectItem>
            {STATE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterDistrict || undefined} onValueChange={(val) => setFilterDistrict(val === "all" ? "" : val)} disabled={!filterState}>
          <SelectTrigger className="bg-card/90 border-0 min-h-[44px] text-xs">
            <SelectValue placeholder="District" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any District</SelectItem>
            {districtOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCrop || undefined} onValueChange={(val) => setFilterCrop(val === "all" ? "" : val)}>
          <SelectTrigger className="bg-card/90 border-0 min-h-[44px] text-xs">
            <SelectValue placeholder="Crop" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Crop</SelectItem>
            {cropOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filteredMitras.length > 0 && !loadingMitras && (
        <p className="text-xs text-muted-foreground mb-2 mt-3">
          Showing {filteredMitras.length} {filteredMitras.length === 1 ? 'Mitra' : 'Mitras'}
        </p>
      )}

      <div className="space-y-3 mt-4">
        {loadingMitras && mitras.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading Mitras...</p>
          </div>
        ) : filteredMitras.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="text-4xl mb-3">🤝</div>
            <p className="text-sm font-medium text-foreground mb-1">No Mitras found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
          </div>
        ) : (
          filteredMitras.map((mitra) => {
            const hasRequest = requests.some(r => r.mitra_id === mitra.id && r.status === 'pending');
            const isConnected = requests.some(r => r.mitra_id === mitra.id && r.status === 'accepted');
            return (
              <div key={mitra.id} className="bg-card rounded-2xl shadow-card p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-3xl flex-shrink-0">
                    👨‍🌾
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{mitra.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{mitra.district}, {mitra.state}</span>
                          <Star className="w-3 h-3 fill-accent text-accent" />
                          <span className="text-xs font-medium text-foreground">{mitra.rating}</span>
                          {mitra.created_at && (
                            <span className="text-xs text-muted-foreground ml-1">
                              • {new Date(mitra.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{mitra.bio}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {mitra.crops.map((crop) => (
                        <span key={crop} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                          {crop}
                        </span>
                      ))}
                      <span className="px-2 py-1 bg-secondary rounded text-xs text-muted-foreground">
                        {mitra.experience_years} years exp
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isConnected ? (
                    <Button size="sm" className="flex-1 gap-1" onClick={() => { setSelectedMitra(mitra); setActiveTab('chat'); }}>
                      <MessageCircle className="w-3 h-3" />
                      Chat
                    </Button>
                  ) : hasRequest ? (
                    <Button size="sm" variant="outline" className="flex-1" disabled>
                      Request Sent
                    </Button>
                  ) : (
                    <Button size="sm" className="flex-1 gap-1" onClick={() => handleSendRequest(mitra)}>
                      <UserPlus className="w-3 h-3" />
                      Connect
                    </Button>
                  )}
                  <a href={`tel:${mitra.phone}`} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full">
                      <Phone className="w-3 h-3" />
                      Call
                    </Button>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );

  const renderRequestsTab = () => (
    <div className="space-y-3 mt-2">
      {requests.length === 0 ? (
        <div className="text-center py-8 px-4">
          <div className="text-4xl mb-3">📨</div>
          <p className="text-sm font-medium text-foreground mb-1">No requests</p>
          <p className="text-xs text-muted-foreground">Connection requests will appear here</p>
        </div>
      ) : (
        requests.map((request) => (
          <div key={request.id} className="bg-card rounded-2xl shadow-card p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{request.mitra_name}</h3>
                <p className="text-xs text-muted-foreground">
                  {request.created_at && new Date(request.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                request.status === 'accepted' ? 'bg-green-100 text-green-700' :
                request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {request.status}
              </span>
            </div>
            {request.status === 'pending' && (
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => handleAcceptRequest(request.id)}>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Accept
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleRejectRequest(request.id)}>
                  <XCircle className="w-3 h-3 mr-1" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  const renderConnectionsTab = () => {
    const connectedMitras = mitras.filter(m => requests.some(r => r.mitra_id === m.id && r.status === 'accepted'));
    return (
      <div className="space-y-3 mt-2">
        {connectedMitras.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="text-4xl mb-3">🤝</div>
            <p className="text-sm font-medium text-foreground mb-1">No connections yet</p>
            <p className="text-xs text-muted-foreground">Connect with Mitras to see them here</p>
          </div>
        ) : (
          connectedMitras.map((mitra) => (
            <div key={mitra.id} className="bg-card rounded-2xl shadow-card p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-3xl flex-shrink-0">
                  👨‍🌾
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{mitra.name}</h3>
                  <p className="text-xs text-muted-foreground">{mitra.district}, {mitra.state}</p>
                  <p className="text-xs text-muted-foreground mt-1">{mitra.bio}</p>
                </div>
              </div>
              <Button size="sm" className="w-full" onClick={() => { setSelectedMitra(mitra); setActiveTab('chat'); }}>
                <MessageCircle className="w-3 h-3 mr-1" />
                Open Chat
              </Button>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderChatTab = () => {
    if (!selectedMitra) {
      return (
        <div className="text-center py-8 px-4">
          <div className="text-4xl mb-3">💬</div>
          <p className="text-sm font-medium text-foreground mb-1">Select a Mitra to chat</p>
          <p className="text-xs text-muted-foreground">Go to Connections tab to start chatting</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-[calc(100vh-200px)]">
        <div className="bg-card rounded-2xl p-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-2xl">
              👨‍🌾
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{selectedMitra.name}</h3>
              <p className="text-xs text-muted-foreground">{selectedMitra.district}, {selectedMitra.state}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 mb-2">
          {chatMessages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.is_sent ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-lg p-3 ${
                  msg.is_sent ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            className="bg-card/90 border-0 min-h-[44px]"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage} className="min-h-[44px] min-w-[44px]">
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-foreground">Mitra 🤝</h1>
            <p className="text-sm text-primary-foreground/80">Connect with fellow farmers</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['discover', 'requests', 'connections', 'chat'] as Tab[]).map(tab => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'secondary' : 'ghost'}
              className={`flex-shrink-0 min-h-[44px] ${activeTab === tab ? 'bg-card text-foreground' : 'text-primary-foreground'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'discover' ? '🔍 Discover' : tab === 'requests' ? '📨 Requests' : tab === 'connections' ? '🤝 Connections' : '💬 Chat'}
            </Button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4">
        {activeTab === 'discover' ? renderDiscoverTab() :
         activeTab === 'requests' ? renderRequestsTab() :
         activeTab === 'connections' ? renderConnectionsTab() :
         renderChatTab()}
      </div>
    </div>
  );
};

export default MitraScreen;
