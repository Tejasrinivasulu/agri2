import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Edit, Save, X, MapPin, Phone, Mail, Calendar, Award, TrendingUp, Settings, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { STATE_OPTIONS, STATES_DISTRICTS } from '@/data/cropRates';

interface ProfileScreenProps {
  onBack: () => void;
}

type Tab = 'profile' | 'farm' | 'activity' | 'settings';

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  state: string;
  district: string;
  address: string;
  date_of_birth: string;
  profile_image?: string;
}

interface FarmData {
  farm_name: string;
  farm_size_acres: number;
  soil_type: string;
  main_crops: string[];
  irrigation_type: string;
  farming_experience_years: number;
}

interface ActivityItem {
  id: string;
  type: 'listing' | 'purchase' | 'sale' | 'test' | 'connection';
  title: string;
  description: string;
  date: string;
  emoji: string;
}

const STORAGE_KEY_PROFILE = 'user_profile';
const STORAGE_KEY_FARM = 'farm_data';
const STORAGE_KEY_ACTIVITY = 'activity_history';

const getStoredProfile = (): ProfileData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return null;
};

const saveStoredProfile = (profile: ProfileData) => {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch {}
};

const getStoredFarm = (): FarmData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_FARM);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return null;
};

const saveStoredFarm = (farm: FarmData) => {
  try {
    localStorage.setItem(STORAGE_KEY_FARM, JSON.stringify(farm));
  } catch {}
};

const getStoredActivity = (): ActivityItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ACTIVITY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {}
  return [];
};

const saveStoredActivity = (activity: ActivityItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVITY, JSON.stringify(activity));
  } catch {}
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileData>(() => {
    const stored = getStoredProfile();
    return {
      full_name: stored?.full_name || 'Farmer',
      email: stored?.email || '',
      phone: stored?.phone || '',
      state: stored?.state || 'Tamil Nadu',
      district: stored?.district || 'Chennai',
      address: stored?.address || '',
      date_of_birth: stored?.date_of_birth || '',
    };
  });

  // Farm state
  const [farm, setFarm] = useState<FarmData>({
    farm_name: '',
    farm_size_acres: 0,
    soil_type: 'Alluvial',
    main_crops: [],
    irrigation_type: 'Drip',
    farming_experience_years: 0,
  });

  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const districtOptions = profile.state ? STATES_DISTRICTS[profile.state] ?? [] : [];
  const soilTypes = ['Alluvial', 'Black', 'Red', 'Laterite', 'Sandy', 'Clay'];
  const irrigationTypes = ['Drip', 'Sprinkler', 'Flood', 'Rainfed'];
  const cropOptions = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Groundnut', 'Pulses', 'Vegetables', 'Fruits'];

  useEffect(() => {
    const storedProfile = getStoredProfile();
    if (storedProfile) {
      setProfile({ ...profile, ...storedProfile });
    }
    const storedFarm = getStoredFarm();
    if (storedFarm) {
      setFarm(storedFarm);
    }
    const storedActivity = getStoredActivity();
    if (storedActivity.length > 0) {
      setActivity(storedActivity);
    } else {
      // Sample activity
      const sampleActivity: ActivityItem[] = [
        { id: '1', type: 'listing', title: 'Posted Rice Listing', description: 'Listed 100kg rice for sale', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), emoji: '🌾' },
        { id: '2', type: 'test', title: 'Completed Soil Test', description: 'Soil test report generated', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), emoji: '🧪' },
        { id: '3', type: 'connection', title: 'Connected with Mitra', description: 'Connected with Raju Kumar', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), emoji: '🤝' },
      ];
      setActivity(sampleActivity);
      saveStoredActivity(sampleActivity);
    }
  }, []);

  const handleSaveProfile = () => {
    setSaving(true);
    setTimeout(() => {
      saveStoredProfile(profile);
      setSaveSuccess('✅ Profile updated successfully!');
      setEditing(false);
      setSaving(false);
      setTimeout(() => setSaveSuccess(null), 3000);
    }, 1000);
  };

  const handleSaveFarm = () => {
    setSaving(true);
    setTimeout(() => {
      saveStoredFarm(farm);
      setSaveSuccess('✅ Farm details updated successfully!');
      setEditing(false);
      setSaving(false);
      setTimeout(() => setSaveSuccess(null), 3000);
    }, 1000);
  };

  const renderProfileTab = () => (
    <div className="space-y-4 mt-2">
      {saveSuccess && (
        <div className="text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
          {saveSuccess}
        </div>
      )}

      <div className="bg-card rounded-2xl shadow-card p-6 text-center">
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center text-4xl">
            👨‍🌾
          </div>
          {editing && (
            <Button size="icon" className="absolute bottom-0 right-0 w-8 h-8 rounded-full">
              <Camera className="w-4 h-4" />
            </Button>
          )}
        </div>
        <h2 className="text-2xl font-bold text-foreground">{profile.full_name}</h2>
        <p className="text-sm text-muted-foreground mt-1">{profile.email}</p>
      </div>

      <div className="bg-card rounded-2xl shadow-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Personal Information</h3>
          {!editing ? (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setEditing(false); }}>
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveProfile} disabled={saving}>
                <Save className="w-3 h-3 mr-1" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>

        <Input
          placeholder="Full Name"
          className="bg-card/90 border-0 min-h-[44px]"
          value={profile.full_name}
          onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
          disabled={!editing}
        />

        <div className="flex items-center gap-1 bg-card/90 border-0 rounded-md px-3 min-h-[44px]">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Email"
            className="bg-transparent border-0 px-0 min-h-[44px]"
            value={profile.email}
            disabled
          />
        </div>

        <div className="flex items-center gap-1 bg-card/90 border-0 rounded-md px-3 min-h-[44px]">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <Input
            type="tel"
            placeholder="Phone Number"
            className="bg-transparent border-0 px-0 min-h-[44px]"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value.replace(/[^0-9]/g, '') })}
            disabled={!editing}
            maxLength={10}
          />
        </div>

        <Select value={profile.state} onValueChange={(val) => { setProfile({ ...profile, state: val, district: '' }); }} disabled={!editing}>
          <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            {STATE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={profile.district} onValueChange={(val) => setProfile({ ...profile, district: val })} disabled={!editing || !profile.state || districtOptions.length === 0}>
          <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
            <SelectValue placeholder={profile.state ? 'District' : 'Select State first'} />
          </SelectTrigger>
          <SelectContent>
            {districtOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>

        <Input
          type="date"
          placeholder="Date of Birth"
          className="bg-card/90 border-0 min-h-[44px]"
          value={profile.date_of_birth}
          onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
          disabled={!editing}
        />

        <textarea
          placeholder="Address"
          className="w-full bg-card/90 border-0 rounded-md p-3 min-h-[80px] text-sm"
          value={profile.address}
          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
          disabled={!editing}
        />
      </div>
    </div>
  );

  const renderFarmTab = () => (
    <div className="space-y-4 mt-2">
      {saveSuccess && (
        <div className="text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
          {saveSuccess}
        </div>
      )}

      <div className="bg-card rounded-2xl shadow-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Farm Details</h3>
          {!editing ? (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setEditing(false); }}>
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveFarm} disabled={saving}>
                <Save className="w-3 h-3 mr-1" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>

        <Input
          placeholder="Farm Name"
          className="bg-card/90 border-0 min-h-[44px]"
          value={farm.farm_name}
          onChange={(e) => setFarm({ ...farm, farm_name: e.target.value })}
          disabled={!editing}
        />

        <Input
          type="number"
          min="0"
          step="0.1"
          placeholder="Farm Size (Acres)"
          className="bg-card/90 border-0 min-h-[44px]"
          value={farm.farm_size_acres || ''}
          onChange={(e) => setFarm({ ...farm, farm_size_acres: Number(e.target.value) || 0 })}
          disabled={!editing}
        />

        <Select value={farm.soil_type} onValueChange={(val) => setFarm({ ...farm, soil_type: val })} disabled={!editing}>
          <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
            <SelectValue placeholder="Soil Type" />
          </SelectTrigger>
          <SelectContent>
            {soilTypes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={farm.irrigation_type} onValueChange={(val) => setFarm({ ...farm, irrigation_type: val })} disabled={!editing}>
          <SelectTrigger className="bg-card/90 border-0 min-h-[44px]">
            <SelectValue placeholder="Irrigation Type" />
          </SelectTrigger>
          <SelectContent>
            {irrigationTypes.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
          </SelectContent>
        </Select>

        <Input
          type="number"
          min="0"
          placeholder="Farming Experience (Years)"
          className="bg-card/90 border-0 min-h-[44px]"
          value={farm.farming_experience_years || ''}
          onChange={(e) => setFarm({ ...farm, farming_experience_years: Number(e.target.value) || 0 })}
          disabled={!editing}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Main Crops</p>
          <div className="flex flex-wrap gap-2">
            {cropOptions.map((crop) => (
              <Button
                key={crop}
                size="sm"
                variant={farm.main_crops.includes(crop) ? 'default' : 'outline'}
                onClick={() => {
                  if (!editing) return;
                  if (farm.main_crops.includes(crop)) {
                    setFarm({ ...farm, main_crops: farm.main_crops.filter(c => c !== crop) });
                  } else {
                    setFarm({ ...farm, main_crops: [...farm.main_crops, crop] });
                  }
                }}
                disabled={!editing}
              >
                {crop}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-2 mt-2">
      {activity.length === 0 ? (
        <div className="text-center py-8 px-4">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-sm font-medium text-foreground mb-1">No activity yet</p>
          <p className="text-xs text-muted-foreground">Your activities will appear here</p>
        </div>
      ) : (
        activity.map((item) => (
          <div key={item.id} className="bg-card rounded-2xl shadow-card p-4">
            <div className="flex items-start gap-3">
              <div className="text-3xl">{item.emoji}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-3 mt-2">
      <div className="bg-card rounded-2xl shadow-card p-4">
        <h3 className="font-semibold text-foreground mb-3">Account Settings</h3>
        <Button variant="outline" className="w-full justify-start">
          <Settings className="w-4 h-4 mr-2" />
          Notification Settings
        </Button>
        <Button variant="outline" className="w-full justify-start mt-2">
          <Settings className="w-4 h-4 mr-2" />
          Privacy Settings
        </Button>
        <Button variant="outline" className="w-full justify-start mt-2">
          <Settings className="w-4 h-4 mr-2" />
          Language Settings
        </Button>
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-nature p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-foreground">Profile 👤</h1>
            <p className="text-sm text-primary-foreground/80">Manage your profile and settings</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['profile', 'farm', 'activity', 'settings'] as Tab[]).map(tab => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'secondary' : 'ghost'}
              className={`flex-shrink-0 min-h-[44px] capitalize ${activeTab === tab ? 'bg-card text-foreground' : 'text-primary-foreground'}`}
              onClick={() => { setActiveTab(tab); setEditing(false); }}
            >
              {tab === 'profile' ? '👤 Profile' : tab === 'farm' ? '🚜 Farm' : tab === 'activity' ? '📊 Activity' : '⚙️ Settings'}
            </Button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4">
        {activeTab === 'profile' ? renderProfileTab() :
         activeTab === 'farm' ? renderFarmTab() :
         activeTab === 'activity' ? renderActivityTab() :
         renderSettingsTab()}
      </div>
    </div>
  );
};

export default ProfileScreen;
