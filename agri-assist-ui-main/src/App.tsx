import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import VoiceAssistantButton from "./components/VoiceAssistantButton";

// Feature screens
import CropRatesScreen from "./components/features/CropRatesScreen";
import WeatherScreen from "./components/features/WeatherScreen";
import BuySellScreen from "./components/features/BuySellScreen";
import CattlePetsScreen from "./components/features/CattlePetsScreen";
import TechniciansScreen from "./components/features/TechniciansScreen";
import AgriToolsScreen from "./components/features/AgriToolsScreen";
import PricePredictionScreen from "./components/features/PricePredictionScreen";
import SoilTestingScreen from "./components/features/SoilTestingScreen";
import GovtSchemesScreen from "./components/features/GovtSchemesScreen";
import AgriOfficersScreen from "./components/features/AgriOfficersScreen";
import LoanAssistanceScreen from "./components/features/LoanAssistanceScreen";
import CalculatorScreen from "./components/features/CalculatorScreen";
import RewardsScreen from "./components/features/RewardsScreen";
import LandRentingScreen from "./components/features/LandRentingScreen";
import AgriInvestScreen from "./components/features/AgriInvestScreen";
import FarmWorkScreen from "./components/features/FarmWorkScreen";
import FFSeedsScreen from "./components/features/FFSeedsScreen";
import FarmerGuideScreen from "./components/features/FarmerGuideScreen";
import WeekendFarmingScreen from "./components/features/WeekendFarmingScreen";
import FarmingClassesScreen from "./components/features/FarmingClassesScreen";
import MapScreen from "./components/features/MapScreen";
import MitraScreen from "./components/features/MitraScreen";
import SearchScreen from "./components/features/SearchScreen";
import ProfileScreen from "./components/features/ProfileScreen";
import CropScanScreen from "./components/features/CropScanScreen";

const queryClient = new QueryClient();

// Wrapper component to provide navigation to feature screens
const FeatureScreenWrapper = ({ Component }: { Component: React.ComponentType<{ onBack: () => void }> }) => {
  const navigate = useNavigate();
  return <Component onBack={() => navigate('/')} />;
};

// Layout: routes + global voice assistant. Hidden on dashboard (path "/") so it is not behind the chatbot.
const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/';
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/features/crop-rates" element={<FeatureScreenWrapper Component={CropRatesScreen} />} />
        <Route path="/features/weather" element={<FeatureScreenWrapper Component={WeatherScreen} />} />
        <Route path="/features/buy-sell" element={<FeatureScreenWrapper Component={BuySellScreen} />} />
        <Route path="/features/cattle" element={<FeatureScreenWrapper Component={CattlePetsScreen} />} />
        <Route path="/features/technicians" element={<FeatureScreenWrapper Component={TechniciansScreen} />} />
        <Route path="/features/agri-tools" element={<FeatureScreenWrapper Component={AgriToolsScreen} />} />
        <Route path="/features/price-prediction" element={<FeatureScreenWrapper Component={PricePredictionScreen} />} />
        <Route path="/features/crop-scan" element={<FeatureScreenWrapper Component={CropScanScreen} />} />
        <Route path="/features/soil-testing" element={<FeatureScreenWrapper Component={SoilTestingScreen} />} />
        <Route path="/features/govt-schemes" element={<FeatureScreenWrapper Component={GovtSchemesScreen} />} />
        <Route path="/features/agri-officers" element={<FeatureScreenWrapper Component={AgriOfficersScreen} />} />
        <Route path="/features/loan-assistance" element={<FeatureScreenWrapper Component={LoanAssistanceScreen} />} />
        <Route path="/features/calculator" element={<FeatureScreenWrapper Component={CalculatorScreen} />} />
        <Route path="/features/rewards" element={<FeatureScreenWrapper Component={RewardsScreen} />} />
        <Route path="/features/land-renting" element={<FeatureScreenWrapper Component={LandRentingScreen} />} />
        <Route path="/features/agri-invest" element={<FeatureScreenWrapper Component={AgriInvestScreen} />} />
        <Route path="/features/farm-work" element={<FeatureScreenWrapper Component={FarmWorkScreen} />} />
        <Route path="/features/ff-seeds" element={<FeatureScreenWrapper Component={FFSeedsScreen} />} />
        <Route path="/features/farmer-guide" element={<FeatureScreenWrapper Component={FarmerGuideScreen} />} />
        <Route path="/features/weekend-farming" element={<FeatureScreenWrapper Component={WeekendFarmingScreen} />} />
        <Route path="/features/farming-classes" element={<FeatureScreenWrapper Component={FarmingClassesScreen} />} />
        <Route path="/features/map" element={<FeatureScreenWrapper Component={MapScreen} />} />
        <Route path="/features/mitra" element={<FeatureScreenWrapper Component={MitraScreen} />} />
        <Route path="/features/search" element={<FeatureScreenWrapper Component={SearchScreen} />} />
        <Route path="/features/profile" element={<FeatureScreenWrapper Component={ProfileScreen} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isDashboard && (
        <div className="fixed bottom-24 right-4 z-[45] flex flex-col items-center gap-1">
          <VoiceAssistantButton onNavigate={navigate} className="shadow-lg" />
        </div>
      )}
    </>
  );
};

const App = () => (
  <LanguageProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </LanguageProvider>
);

export default App;
