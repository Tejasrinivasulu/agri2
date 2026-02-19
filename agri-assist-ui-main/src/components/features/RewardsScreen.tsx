import React, { useState, useEffect } from 'react';
import { ArrowLeft, Gift, Trophy, Star, RefreshCw, CheckCircle, IndianRupee, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';

interface RewardsScreenProps {
  onBack: () => void;
}

type Tab = 'overview' | 'earn' | 'redeem' | 'history';

interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  emoji: string;
  category: 'activity' | 'achievement' | 'referral';
  claimed: boolean;
  available: boolean;
}

interface RedeemableReward {
  id: string;
  title: string;
  description: string;
  points_required: number;
  emoji: string;
  category: 'discount' | 'cashback' | 'voucher';
  available: boolean;
}

interface PointsHistory {
  id: string;
  type: 'earned' | 'redeemed';
  amount: number;
  description: string;
  date: string;
}

const STORAGE_KEY_POINTS = 'user_points';
const STORAGE_KEY_REWARDS = 'user_rewards';
const STORAGE_KEY_HISTORY = 'points_history';

const getStoredPoints = (): number => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_POINTS);
    if (stored) {
      return Number(stored) || 0;
    }
  } catch {}
  return 1250; // Default starting points
};

const saveStoredPoints = (points: number) => {
  try {
    localStorage.setItem(STORAGE_KEY_POINTS, points.toString());
  } catch {}
};

const getStoredHistory = (): PointsHistory[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {}
  return [];
};

const saveStoredHistory = (history: PointsHistory[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  } catch {}
};

const EARNING_REWARDS: Reward[] = [
  { id: '1', title: 'First Login Bonus', description: 'Welcome to Agri Assist!', points: 100, emoji: '🎉', category: 'activity', claimed: true, available: false },
  { id: '2', title: 'Complete Profile', description: 'Add your farm details', points: 50, emoji: '👤', category: 'activity', claimed: false, available: true },
  { id: '3', title: 'Post First Listing', description: 'List a crop or tool for sale', points: 200, emoji: '🌾', category: 'activity', claimed: false, available: true },
  { id: '4', title: 'Make First Purchase', description: 'Buy from marketplace', points: 150, emoji: '🛒', category: 'activity', claimed: false, available: true },
  { id: '5', title: 'Refer a Friend', description: 'Invite friends to join', points: 500, emoji: '👥', category: 'referral', claimed: false, available: true },
  { id: '6', title: 'Weekly Active User', description: 'Use app 7 days in a row', points: 150, emoji: '📅', category: 'achievement', claimed: false, available: true },
  { id: '7', title: 'Soil Test Completed', description: 'Complete a soil test report', points: 100, emoji: '🧪', category: 'activity', claimed: false, available: true },
  { id: '8', title: 'Connect with Mitra', description: 'Connect with 5 farmers', points: 250, emoji: '🤝', category: 'achievement', claimed: false, available: true },
];

const REDEEMABLE_REWARDS: RedeemableReward[] = [
  { id: '1', title: '₹100 Cashback', description: 'Get ₹100 credited to your account', points_required: 1000, emoji: '💰', category: 'cashback', available: true },
  { id: '2', title: '10% Discount Voucher', description: '10% off on next purchase', points_required: 500, emoji: '🎫', category: 'voucher', available: true },
  { id: '3', title: 'Free Soil Test Kit', description: 'Get a free soil testing kit', points_required: 800, emoji: '🧪', category: 'discount', available: true },
  { id: '4', title: 'Premium Support', description: '1 month premium support access', points_required: 600, emoji: '⭐', category: 'discount', available: true },
  { id: '5', title: '₹50 Cashback', description: 'Get ₹50 credited to your account', points_required: 500, emoji: '💰', category: 'cashback', available: true },
];

const RewardsScreen: React.FC<RewardsScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [points, setPoints] = useState(getStoredPoints());
  const [history, setHistory] = useState<PointsHistory[]>(getStoredHistory());
  const [claiming, setClaiming] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredHistory();
    if (stored.length === 0) {
      // Initialize with some default history
      const defaultHistory: PointsHistory[] = [
        { id: '1', type: 'earned', amount: 100, description: 'First Login Bonus', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '2', type: 'earned', amount: 50, description: 'Complete Profile', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      ];
      setHistory(defaultHistory);
      saveStoredHistory(defaultHistory);
    }
  }, []);

  const handleClaimReward = (reward: Reward) => {
    if (claiming || !reward.available || reward.claimed) return;
    
    setClaiming(reward.id);
    setTimeout(() => {
      const newPoints = points + reward.points;
      setPoints(newPoints);
      saveStoredPoints(newPoints);
      
      const newHistory: PointsHistory = {
        id: `hist-${Date.now()}`,
        type: 'earned',
        amount: reward.points,
        description: reward.title,
        date: new Date().toISOString(),
      };
      const updatedHistory = [newHistory, ...history];
      setHistory(updatedHistory);
      saveStoredHistory(updatedHistory);
      
      setClaimSuccess(`✅ Earned ${reward.points} points!`);
      setClaiming(null);
      setTimeout(() => setClaimSuccess(null), 3000);
    }, 1000);
  };

  const handleRedeemReward = (reward: RedeemableReward) => {
    if (redeeming || !reward.available || points < reward.points_required) return;
    
    setRedeeming(reward.id);
    setTimeout(() => {
      const newPoints = points - reward.points_required;
      setPoints(newPoints);
      saveStoredPoints(newPoints);
      
      const newHistory: PointsHistory = {
        id: `hist-${Date.now()}`,
        type: 'redeemed',
        amount: reward.points_required,
        description: reward.title,
        date: new Date().toISOString(),
      };
      const updatedHistory = [newHistory, ...history];
      setHistory(updatedHistory);
      saveStoredHistory(updatedHistory);
      
      setRedeemSuccess(`✅ ${reward.title} redeemed successfully!`);
      setRedeeming(null);
      setTimeout(() => setRedeemSuccess(null), 3000);
    }, 1000);
  };

  const renderOverviewTab = () => (
    <div className="space-y-4 mt-2">
      <div className="bg-card rounded-2xl shadow-card p-6 text-center">
        <Trophy className="w-16 h-16 mx-auto text-accent mb-3" />
        <p className="text-sm text-muted-foreground mb-1">Total Points</p>
        <p className="text-5xl font-bold text-primary mb-2">{points.toLocaleString('en-IN')}</p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Earned</p>
            <p className="text-lg font-semibold text-green-600">
              +{history.filter(h => h.type === 'earned').reduce((sum, h) => sum + h.amount, 0)}
            </p>
          </div>
          <div className="w-px h-8 bg-border"></div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Redeemed</p>
            <p className="text-lg font-semibold text-red-600">
              -{history.filter(h => h.type === 'redeemed').reduce((sum, h) => sum + h.amount, 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-card p-4">
        <h3 className="font-semibold text-foreground mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4" onClick={() => setActiveTab('earn')}>
            <TrendingUp className="w-6 h-6 text-primary" />
            <span className="text-xs">Earn Points</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4" onClick={() => setActiveTab('redeem')}>
            <Gift className="w-6 h-6 text-accent" />
            <span className="text-xs">Redeem</span>
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-card p-4">
        <h3 className="font-semibold text-foreground mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {history.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2">
                {item.type === 'earned' ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <Gift className="w-4 h-4 text-red-600" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">{item.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-semibold ${item.type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                {item.type === 'earned' ? '+' : '-'}{item.amount}
              </span>
            </div>
          ))}
          {history.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderEarnTab = () => (
    <div className="space-y-3 mt-2">
      {claimSuccess && (
        <div className="text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
          {claimSuccess}
        </div>
      )}
      {EARNING_REWARDS.map((reward) => (
        <div key={reward.id} className="bg-card rounded-2xl shadow-card p-4 space-y-3">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center text-2xl flex-shrink-0">
              {reward.emoji}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">{reward.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{reward.description}</p>
              <div className="flex items-center gap-1 mt-2">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span className="text-sm font-bold text-accent">{reward.points} pts</span>
              </div>
            </div>
            <Button
              size="sm"
              variant={reward.claimed ? 'outline' : 'default'}
              disabled={reward.claimed || !reward.available || claiming === reward.id}
              onClick={() => handleClaimReward(reward)}
            >
              {claiming === reward.id ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Claiming...
                </>
              ) : reward.claimed ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Claimed
                </>
              ) : (
                'Claim'
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderRedeemTab = () => (
    <div className="space-y-3 mt-2">
      {redeemSuccess && (
        <div className="text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
          {redeemSuccess}
        </div>
      )}
      {REDEEMABLE_REWARDS.map((reward) => {
        const canRedeem = points >= reward.points_required && reward.available;
        return (
          <div key={reward.id} className="bg-card rounded-2xl shadow-card p-4 space-y-3">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                {reward.emoji}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{reward.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{reward.description}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="text-sm font-bold text-accent">{reward.points_required} pts</span>
                </div>
              </div>
              <Button
                size="sm"
                variant={canRedeem ? 'default' : 'outline'}
                disabled={!canRedeem || redeeming === reward.id}
                onClick={() => handleRedeemReward(reward)}
              >
                {redeeming === reward.id ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Redeeming...
                  </>
                ) : canRedeem ? (
                  'Redeem'
                ) : (
                  'Insufficient Points'
                )}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-2 mt-2">
      {history.length === 0 ? (
        <div className="text-center py-8 px-4">
          <div className="text-4xl mb-3">📜</div>
          <p className="text-sm font-medium text-foreground mb-1">No history yet</p>
          <p className="text-xs text-muted-foreground">Start earning points to see your history</p>
        </div>
      ) : (
        history.map((item) => (
          <div key={item.id} className="bg-card rounded-2xl shadow-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {item.type === 'earned' ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <Gift className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">{item.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <span className={`text-lg font-bold ${item.type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                {item.type === 'earned' ? '+' : '-'}{item.amount}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-sunrise p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-foreground">{t.rewards || 'Rewards'} 🎁</h1>
            <p className="text-sm text-primary-foreground/80">Earn and redeem points</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['overview', 'earn', 'redeem', 'history'] as Tab[]).map(tab => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'secondary' : 'ghost'}
              className={`flex-shrink-0 min-h-[44px] capitalize ${activeTab === tab ? 'bg-card text-foreground' : 'text-primary-foreground'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' ? '📊 Overview' : tab === 'earn' ? '💰 Earn' : tab === 'redeem' ? '🎁 Redeem' : '📜 History'}
            </Button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4">
        {activeTab === 'overview' ? renderOverviewTab() :
         activeTab === 'earn' ? renderEarnTab() :
         activeTab === 'redeem' ? renderRedeemTab() :
         renderHistoryTab()}
      </div>
    </div>
  );
};

export default RewardsScreen;
