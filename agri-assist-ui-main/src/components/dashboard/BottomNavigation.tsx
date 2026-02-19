import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Search, Gift, User } from 'lucide-react';

export type NavTab = 'home' | 'mitra' | 'search' | 'rewards' | 'profile';

interface BottomNavigationProps {
  activeTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Determine active tab based on current route
  const getActiveTab = (): NavTab => {
    if (activeTab) return activeTab;
    if (currentPath === '/') return 'home';
    if (currentPath.startsWith('/features/mitra')) return 'mitra';
    if (currentPath.startsWith('/features/search')) return 'search';
    if (currentPath.startsWith('/features/rewards')) return 'rewards';
    if (currentPath.startsWith('/features/profile')) return 'profile';
    return 'home';
  };

  const currentActiveTab = getActiveTab();

  const tabs = [
    { id: 'home' as NavTab, icon: Home, label: 'Home', path: '/' },
    { id: 'mitra' as NavTab, icon: Users, label: 'Mitra', path: '/features/mitra' },
    { id: 'search' as NavTab, icon: Search, label: 'Search', path: '/features/search' },
    { id: 'rewards' as NavTab, icon: Gift, label: 'Rewards', path: '/features/rewards' },
    { id: 'profile' as NavTab, icon: User, label: 'Profile', path: '/features/profile' },
  ];

  const handleClick = (tab: NavTab) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
      <div className="max-w-[430px] w-full mx-auto flex justify-around items-center py-2 px-2">
        {tabs.map((tab) => {
          const isActive = currentActiveTab === tab.id;
          return (
            <Link
              key={tab.id}
              to={tab.path}
              onClick={() => handleClick(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
