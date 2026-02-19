import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  CloudSun,
  ShoppingCart,
  PawPrint,
  Wrench,
  Brain,
  FlaskConical,
  Building2,
  UserCheck,
  Landmark,
  MapPinned,
  Handshake,
  Briefcase,
  Leaf,
  BookOpen,
  GraduationCap,
  Calculator,
  Gift,
  Tractor,
  Calendar,
  Map
} from 'lucide-react';

export type FeatureId =
  | 'crop-rates'
  | 'weather'
  | 'buy-sell'
  | 'cattle'
  | 'agri-tools'
  | 'price-prediction'
  | 'soil-testing'
  | 'govt-schemes'
  | 'agri-officers'
  | 'loan-assistance'
  | 'land-renting'
  | 'agri-invest'
  | 'farm-work'
  | 'ff-seeds'
  | 'farmer-guide'
  | 'weekend-farming'
  | 'farming-classes'
  | 'calculator'
  | 'technicians'
  | 'rewards'
  | 'map';

interface Feature {
  id: FeatureId;
  icon: React.ElementType;
  label: string;
  emoji: string;
  color: string;
}

interface FeatureGridProps {
  onFeatureClick?: (featureId: FeatureId) => void;
}

const FeatureGrid: React.FC<FeatureGridProps> = ({ onFeatureClick }) => {
  const features: Feature[] = [
    { id: 'crop-rates', icon: TrendingUp, label: 'Crop Price', emoji: '🌾', color: 'bg-leaf-light' },
    { id: 'weather', icon: CloudSun, label: 'Weather', emoji: '🌦️', color: 'bg-secondary' },
    { id: 'buy-sell', icon: ShoppingCart, label: 'Buy & Sell', emoji: '🛒', color: 'bg-accent/20' },
    { id: 'cattle', icon: PawPrint, label: 'Cattle & Pets', emoji: '🐄', color: 'bg-earth-light' },
    { id: 'agri-tools', icon: Tractor, label: 'Agri Tools', emoji: '🚜', color: 'bg-sunrise/20' },
    { id: 'technicians', icon: Wrench, label: 'Technicians', emoji: '🔧', color: 'bg-muted' },
    { id: 'price-prediction', icon: Brain, label: 'AI Prediction', emoji: '🤖', color: 'bg-primary/20' },
    { id: 'soil-testing', icon: FlaskConical, label: 'Soil Test', emoji: '🧪', color: 'bg-earth-light' },
    { id: 'govt-schemes', icon: Building2, label: 'Govt Schemes', emoji: '🏛️', color: 'bg-secondary' },
    { id: 'agri-officers', icon: UserCheck, label: 'Agri Officers', emoji: '👨‍🌾', color: 'bg-leaf-light' },
    { id: 'loan-assistance', icon: Landmark, label: 'Loans', emoji: '🏦', color: 'bg-accent/20' },
    { id: 'land-renting', icon: MapPinned, label: 'Land Rent', emoji: '🗺️', color: 'bg-muted' },
    { id: 'agri-invest', icon: Handshake, label: 'Agri Invest', emoji: '🤝', color: 'bg-primary/20' },
    { id: 'farm-work', icon: Briefcase, label: 'Farm Work', emoji: '💼', color: 'bg-sunrise/20' },
    { id: 'ff-seeds', icon: Leaf, label: 'FF Seeds', emoji: '🌱', color: 'bg-leaf-light' },
    { id: 'farmer-guide', icon: BookOpen, label: 'Farmer Guide', emoji: '📖', color: 'bg-secondary' },
    { id: 'weekend-farming', icon: Calendar, label: 'Weekend Farm', emoji: '🌻', color: 'bg-accent/20' },
    { id: 'farming-classes', icon: GraduationCap, label: 'Classes', emoji: '🎓', color: 'bg-muted' },
    { id: 'calculator', icon: Calculator, label: 'Calculator', emoji: '🧮', color: 'bg-earth-light' },
    { id: 'rewards', icon: Gift, label: 'Rewards', emoji: '🎁', color: 'bg-sunrise/20' },
    { id: 'map', icon: Map, label: 'Map View', emoji: '🗺️', color: 'bg-primary/20' },
  ];

  const handleClick = (featureId: FeatureId) => {
    if (onFeatureClick) {
      onFeatureClick(featureId);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-3">
      {features.map((feature) => (
        <Link
          key={feature.id}
          to={`/features/${feature.id}`}
          onClick={() => handleClick(feature.id)}
          className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-secondary/50 transition-all active:scale-95"
        >
          <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center shadow-soft`}>
            <span className="text-2xl">{feature.emoji}</span>
          </div>
          <span className="text-xs text-foreground font-medium text-center leading-tight">{feature.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default FeatureGrid;
