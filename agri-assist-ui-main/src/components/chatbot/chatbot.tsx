import { useState, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles, Zap, TrendingUp, Cloud, Bug, DollarSign, BookOpen, Calculator, MapPin, Users, Award, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isQuestion?: boolean;
}

interface QuickQuestion {
  id: string;
  text: string;
  icon: React.ReactNode;
  category: string;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "🌾 Welcome to Agri-Assist! I'm your smart farming companion with 30+ specialized topics! From weather forecasts to farming jokes, I've got you covered! Choose from the quick questions below or ask me anything! 🚜✨",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const quickQuestions: QuickQuestion[] = [
    { id: 'weather', text: 'Weather Forecast', icon: <Cloud className="h-4 w-4" />, category: 'weather' },
    { id: 'crop-prices', text: 'Crop Prices', icon: <TrendingUp className="h-4 w-4" />, category: 'market' },
    { id: 'pest-control', text: 'Pest Control', icon: <Bug className="h-4 w-4" />, category: 'pest' },
    { id: 'soil-testing', text: 'Soil Testing', icon: <MapPin className="h-4 w-4" />, category: 'soil' },
    { id: 'loans', text: 'Loan Assistance', icon: <DollarSign className="h-4 w-4" />, category: 'finance' },
    { id: 'govt-schemes', text: 'Government Schemes', icon: <Award className="h-4 w-4" />, category: 'schemes' },
    { id: 'agri-tools', text: 'Agri Tools', icon: <Wrench className="h-4 w-4" />, category: 'tools' },
    { id: 'farming-guide', text: 'Farming Guide', icon: <BookOpen className="h-4 w-4" />, category: 'guide' },
    { id: 'calculator', text: 'Farm Calculator', icon: <Calculator className="h-4 w-4" />, category: 'calculator' },
    { id: 'technicians', text: 'Find Technicians', icon: <Users className="h-4 w-4" />, category: 'technicians' },
    { id: 'seasonal-advice', text: 'Seasonal Farming', icon: <Sparkles className="h-4 w-4" />, category: 'seasonal' },
    { id: 'crop-diseases', text: 'Crop Diseases', icon: <Bug className="h-4 w-4" />, category: 'diseases' },
    { id: 'organic-farming', text: 'Organic Farming', icon: <Zap className="h-4 w-4" />, category: 'organic' },
    { id: 'market-trends', text: 'Market Trends', icon: <TrendingUp className="h-4 w-4" />, category: 'trends' },
    { id: 'irrigation-tips', text: 'Irrigation Tips', icon: <Cloud className="h-4 w-4" />, category: 'irrigation' },
    { id: 'fertilizer-guide', text: 'Fertilizer Guide', icon: <MapPin className="h-4 w-4" />, category: 'fertilizer' },
    { id: 'crop-rotation', text: 'Crop Rotation', icon: <BookOpen className="h-4 w-4" />, category: 'rotation' },
    { id: 'farming-costs', text: 'Farming Costs', icon: <DollarSign className="h-4 w-4" />, category: 'costs' },
    { id: 'export-opportunities', text: 'Export Opportunities', icon: <Award className="h-4 w-4" />, category: 'export' },
    { id: 'climate-smart', text: 'Climate Smart Farming', icon: <Sparkles className="h-4 w-4" />, category: 'climate' },
    { id: 'water-management', text: 'Water Management', icon: <Cloud className="h-4 w-4" />, category: 'water' },
    { id: 'seed-selection', text: 'Seed Selection', icon: <Wrench className="h-4 w-4" />, category: 'seeds' },
    { id: 'pesticide-safety', text: 'Pesticide Safety', icon: <Bug className="h-4 w-4" />, category: 'safety' },
    { id: 'farming-apps', text: 'Farming Apps', icon: <Calculator className="h-4 w-4" />, category: 'apps' },
    { id: 'success-stories', text: 'Success Stories', icon: <Users className="h-4 w-4" />, category: 'stories' },
    { id: 'farming-challenges', text: 'Farming Challenges', icon: <Zap className="h-4 w-4" />, category: 'challenges' },
    { id: 'yield-improvement', text: 'Increase Yield', icon: <TrendingUp className="h-4 w-4" />, category: 'yield' },
    { id: 'beginner-guide', text: 'Beginner Farming', icon: <BookOpen className="h-4 w-4" />, category: 'beginner' },
    { id: 'drought-management', text: 'Drought Management', icon: <Cloud className="h-4 w-4" />, category: 'drought' },
    { id: 'pesticide-alternatives', text: 'Natural Pest Control', icon: <Bug className="h-4 w-4" />, category: 'natural' },
    { id: 'farming-myths', text: 'Farming Myths', icon: <Sparkles className="h-4 w-4" />, category: 'myths' },
    { id: 'smart-farming', text: 'Smart Farming', icon: <Wrench className="h-4 w-4" />, category: 'smart' },
    { id: 'farming-quiz', text: 'Farming Quiz', icon: <Sparkles className="h-4 w-4" />, category: 'quiz' },
    { id: 'daily-tips', text: 'Daily Farming Tips', icon: <BookOpen className="h-4 w-4" />, category: 'tips' },
    { id: 'crop-calendar', text: 'Crop Calendar', icon: <Calculator className="h-4 w-4" />, category: 'calendar' },
    { id: 'farming-jokes', text: 'Farming Jokes', icon: <Users className="h-4 w-4" />, category: 'jokes' },
  ];

  const sendMessage = (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate bot response with typing indicator
    setTimeout(() => {
      const botMessage: Message = {
        id: messages.length + 2,
        text: getBotResponse(textToSend),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    // Project-specific questions with varied responses
    if (input.includes('weather') || input.includes('forecast') || input.includes('rain') || input.includes('climate')) {
      const responses = [
        "🌤️ **Weather Wisdom**: Mother Nature's mood swings can make or break your harvest! Our weather screen shows real-time conditions, 7-day forecasts, and smart alerts for optimal farming timing. Did you know that planting during the right moon phase can increase yields by up to 30%?",
        "🌦️ **Climate Companion**: From monsoon magic to winter whispers, our weather tools help you dance with the seasons. Get personalized alerts for irrigation, harvesting, and even festival farming tips. What's your region's current weather challenge?",
        "🌈 **Weather Wizard**: Beyond forecasts, we provide farming-specific insights! Know when to spray pesticides, when humidity affects crop quality, or when a coming storm might delay your harvest. Weather-smart farming starts here!",
        "⛅ **Atmospheric Advisor**: Every cloud has a farming story! Our weather intelligence includes humidity alerts for disease prevention, wind speed warnings for pollination, and temperature trends for crop selection. Ready to become weather-wise?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('price') || input.includes('market') || input.includes('rates') || input.includes('sell') || input.includes('buy')) {
      const responses = [
        "📈 **Market Maverick**: Prices fluctuate like monsoon winds, but knowledge is your anchor! Check real-time rates, predict trends, and connect with verified buyers. Pro tip: Sell at peak demand times for maximum profit!",
        "💰 **Price Prophet**: From mandi madness to export excellence, our market tools show you the money! Get SMS alerts for price spikes, quality-based pricing, and bulk deal opportunities. What's your star crop this season?",
        "🛒 **Trading Titan**: Beyond prices, we connect you with the right buyers! Whether it's local retailers or international traders, find the perfect match for your harvest. Quality crops command premium prices!",
        "📊 **Commerce Captain**: Market intelligence is your secret weapon! Track seasonal trends, understand demand patterns, and get expert tips on storage for better prices. Ready to turn your harvest into profit?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('pest') || input.includes('disease') || input.includes('insect') || input.includes('control')) {
      const responses = [
        "🐛 **Pest Protector**: Those tiny invaders can cause big headaches! Learn organic warfare with neem, beneficial insects, and companion planting. Early detection saves 70% of potential losses. What's bugging your crops?",
        "🌿 **Disease Detective**: From fungal foes to bacterial bandits, identify problems before they spread! Our guides cover 50+ common issues with prevention strategies. Remember: Healthy soil = Healthy plants!",
        "🛡️ **Crop Guardian**: Nature's pharmacy is your best defense! Try integrated pest management combining cultural, biological, and chemical methods. Sustainable farming protects both crops and profits!",
        "🔬 **Bug Buster**: Every pest has a weakness! Learn about life cycles, natural predators, and eco-friendly controls. Did you know ladybugs can eat 50 aphids per day? Let's build your pest defense strategy!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('soil') || input.includes('testing') || input.includes('fertility') || input.includes('test')) {
      const responses = [
        "🧪 **Soil Sorcerer**: Your soil is alive and talking! Get detailed nutrient analysis, pH balance checks, and microbial health reports. Great soil grows great crops - let's unlock your land's potential!",
        "🌱 **Earth Expert**: Soil is the foundation of farming fortune! Test for NPK levels, organic matter, and micronutrients. Did you know that 1% increase in organic matter can boost yields by 10-20%?",
        "🪱 **Ground Guru**: From clay to sandy, every soil type has secrets! Learn amendment strategies, crop rotation benefits, and water retention techniques. Your soil test results are the map to better farming!",
        "🌍 **Terra Teacher**: Soil health determines harvest wealth! Get recommendations for compost, green manure, and mineral supplements. Sustainable soil management ensures farming success for generations!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('loan') || input.includes('finance') || input.includes('money') || input.includes('credit')) {
      const responses = [
        "💰 **Finance Farmer**: Dreams need dollars too! Explore Kisan Credit Cards, PM-KISAN benefits, and low-interest agricultural loans. Many schemes offer up to 85% subsidy on equipment. What's your farming investment goal?",
        "🏦 **Capital Captain**: From seed to harvest, financing fuels farming! Check eligibility for crop loans, equipment financing, and export credit. Pro tip: Combine multiple schemes for maximum benefits!",
        "📊 **Money Mentor**: Smart farmers invest smartly! Learn about interest subvention schemes, crop insurance, and government grants. Did you know some loans have 0% interest for timely repayment?",
        "💎 **Wealth Wizard**: Turn farming into fortune! Access microfinance, cooperative loans, and digital banking solutions. Many farmers have doubled their income through proper financial planning!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('government') || input.includes('scheme') || input.includes('govt') || input.includes('subsidy')) {
      const responses = [
        "🏛️ **Scheme Superstar**: India's farming gets VIP treatment! From PM-KISAN (₹6,000/year) to soil health cards, discover schemes that support every farming stage. Which program interests you most?",
        "📜 **Policy Pal**: Government support makes farming rewarding! Explore MSP guarantees, input subsidies, and market linkages. Many schemes offer free training and equipment. Ready to claim your benefits?",
        "🎁 **Benefit Buddy**: Hidden treasures in government schemes! From irrigation subsidies to organic farming incentives, maximize your entitlements. Did you know some states offer additional local benefits?",
        "🌟 **Support System**: Farming is a national priority! Access schemes for women farmers, young entrepreneurs, and sustainable practices. Let's find the perfect government support for your needs!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('tool') || input.includes('equipment') || input.includes('machine') || input.includes('agri tool')) {
      const responses = [
        "🔧 **Tool Titan**: From ancient plow to AI tractor, farming evolves! Discover modern equipment with government subsidies up to 50%. What's your current farming challenge that needs a tool solution?",
        "🚜 **Equipment Expert**: Right tool, right job, maximum output! Learn about precision farming tech, solar-powered pumps, and smart irrigation. Many tools pay for themselves in one season!",
        "⚙️ **Gear Guru**: Technology transforms farming! Explore drones for crop monitoring, automated harvesters, and climate-controlled storage. Which farming operation needs upgrading?",
        "🛠️ **Innovation Insider**: Farming 2.0 is here! From app-controlled tractors to soil sensors, embrace tools that save time and increase yields. Let's find your perfect farming companion!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('guide') || input.includes('learn') || input.includes('tutorial') || input.includes('how to')) {
      const responses = [
        "📚 **Knowledge Knight**: Farming wisdom passed through generations! Access crop-specific guides, seasonal calendars, and expert techniques. What farming skill would you like to master?",
        "🎓 **Learning Legend**: From seed to supper, every step matters! Get detailed guides on organic farming, pest management, and value addition. Knowledge is the best fertilizer!",
        "🧠 **Wisdom Warrior**: Ancient techniques meet modern science! Learn about biodynamic farming, permaculture, and sustainable practices. Which farming mystery shall we unravel?",
        "📖 **Guide Guru**: Your farming journey starts with knowledge! Explore crop rotation secrets, companion planting benefits, and market timing strategies. Ready to become a farming expert?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('calculator') || input.includes('calculate') || input.includes('cost') || input.includes('profit')) {
      const responses = [
        "🧮 **Profit Prophet**: Numbers don't lie, but they can guide! Calculate costs, predict profits, and optimize your farming business. A 10% cost reduction can double your net income!",
        "💹 **Finance Forecaster**: From input costs to market prices, our calculator shows the money trail! Factor in labor, equipment, and risk premiums. Smart calculations lead to smart farming!",
        "📊 **Budget Buddy**: Plan your farming fortune! Compare crop profitability, calculate break-even points, and optimize resource allocation. What's your target profit margin?",
        "🔢 **Math Magician**: Farming economics made simple! Calculate ROI on investments, compare farming systems, and plan for scale. Numbers are your roadmap to farming success!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('technician') || input.includes('expert') || input.includes('help') || input.includes('service')) {
      const responses = [
        "👨‍🔧 **Expert Explorer**: Need specialized help? Connect with certified technicians for equipment repair, soil testing, and pest control. Quality service ensures quality farming!",
        "🔍 **Helper Hero**: From tractor troubles to crop puzzles, find the right expert! Our network includes agricultural engineers, entomologists, and farming consultants. What's your urgent need?",
        "🛠️ **Service Superstar**: Professional help when you need it! Access emergency repairs, technical consultations, and specialized farming services. Good technicians are worth their weight in gold!",
        "🎯 **Support Specialist**: Farming challenges need expert solutions! Find certified consultants for irrigation design, organic certification, and export compliance. Let's connect you with the perfect expert!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('cattle') || input.includes('pet') || input.includes('animal') || input.includes('livestock')) {
      const responses = [
        "🐄 **Livestock Legend**: Animals are farming's best friends! Learn about breed selection, nutrition, health management, and profitable animal husbandry. From dairy to draught power, maximize your livestock potential!",
        "🐖 **Animal Ally**: Your farm's living assets need care! Get vaccination schedules, breeding calendars, and feed optimization tips. Healthy animals mean healthy profits and sustainable farming!",
        "🐑 **Herd Hero**: From goats to poultry, livestock adds income streams! Learn about integrated farming systems combining crops and animals. Did you know integrated farms can be 30% more profitable?",
        "🐔 **Farm Friend**: Animals complete the farming ecosystem! Discover biogas production, manure management, and multi-species farming benefits. Your livestock can power your farm and fertilize your fields!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('seed') || input.includes('plant') || input.includes('sowing') || input.includes('ff seed')) {
      const responses = [
        "🌱 **Seed Sorcerer**: Quality seeds are quality crops! Choose from hybrid vigor, heirloom heritage, or GM goodness. Good seeds can increase yields by 20-50%. What's your dream crop?",
        "🌾 **Germination Guru**: From tiny seeds to towering crops! Learn about seed treatment, germination techniques, and variety selection. The right seed in the right soil at the right time = Success!",
        "🌿 **Seed Specialist**: Your harvest starts with a single seed! Explore drought-resistant varieties, pest-tolerant hybrids, and climate-smart seeds. Quality seeds pay for themselves many times over!",
        "🌰 **Planting Pro**: Seed selection is science and art! Consider maturity periods, market preferences, and risk factors. Did you know seed quality can affect 70% of your final yield?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('invest') || input.includes('investment') || input.includes('agri invest')) {
      const responses = [
        "📊 **Investment Innovator**: Farming is fortune farming! Explore high-value crops, value addition, and export opportunities. Smart farmers turn acres into assets worth lakhs!",
        "💎 **Wealth Farmer**: Beyond subsistence to prosperity! Learn about contract farming, cooperative models, and agricultural entrepreneurship. Many farmers have built crores through smart investments!",
        "🏆 **Profit Pioneer**: Agriculture offers unlimited potential! From mushroom cultivation to hydroponics, discover high-ROI ventures. What's your risk appetite and investment capacity?",
        "🚀 **Growth Guru**: Scale up your farming fortune! Explore vertical farming, precision agriculture, and export-oriented crops. Modern farming can generate 5-10x returns on investment!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('officer') || input.includes('agri officer') || input.includes('contact')) {
      const responses = [
        "👮‍♂️ **Officer Oracle**: Government experts are your farming allies! Connect with agricultural officers for scheme guidance, technical advice, and official support. They know the system inside out!",
        "🎖️ **Authority Ally**: From block to district level, officers provide crucial support! Get help with certifications, subsidies, and regulatory compliance. Building relationships pays dividends!",
        "🏛️ **System Sage**: Agricultural officers are knowledge banks! They provide weather alerts, market intelligence, and disaster management support. A good officer relationship is priceless!",
        "📞 **Contact Captain**: Need official help? Find the right officer for your specific need - whether it's irrigation, seeds, or marketing. Government support can transform your farming!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('class') || input.includes('training') || input.includes('course') || input.includes('learn')) {
      const responses = [
        "🎓 **Education Enthusiast**: Knowledge is power, especially in farming! Join training programs on modern techniques, organic farming, and business management. Trained farmers earn 40% more!",
        "📚 **Skill Builder**: From traditional wisdom to cutting-edge tech! Access workshops on drone farming, hydroponics, and export procedures. Continuous learning keeps you competitive!",
        "🧠 **Learning Leader**: Farming education never stops! Explore specialized courses in agribusiness, sustainable farming, and climate adaptation. What's your farming knowledge gap?",
        "🎯 **Training Titan**: Invest in yourself, harvest success! Find government-sponsored training, online courses, and peer learning groups. Skilled farmers lead the industry!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('work') || input.includes('job') || input.includes('employment') || input.includes('farm work')) {
      const responses = [
        "💼 **Employment Explorer**: Farming creates jobs for all! Find opportunities in farm management, equipment operation, and agricultural services. Skilled farm workers earn ₹300-500/day!",
        "👷‍♂️ **Labor Leader**: Quality workforce drives quality farming! Access trained laborers, equipment operators, and specialized technicians. Good workers multiply your productivity!",
        "🔍 **Job Hunter**: From seasonal harvesting to permanent positions! Find farm managers, supervisors, and technical experts. Agricultural jobs offer stability and growth!",
        "🎯 **Career Captain**: Farming careers are diverse and rewarding! Explore roles in farm management, agricultural consulting, input supply, and processing. Your farming passion can become your profession!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('land') || input.includes('rent') || input.includes('lease') || input.includes('property')) {
      const responses = [
        "🏞️ **Land Lord**: Quality land is quality life! Find fertile plots, irrigation access, and suitable terrain for your crops. Good land appreciates faster than gold!",
        "🌍 **Property Pro**: Location, location, location! Consider soil type, water availability, and market access when choosing land. Smart land selection doubles your farming success rate!",
        "🏡 **Terrain Titan**: From plains to hills, every landscape has potential! Learn about land preparation, contour farming, and microclimate advantages. The right land maximizes your investment!",
        "🗺️ **Geography Guru**: Land is your farming foundation! Evaluate topography, soil depth, drainage, and climate suitability. Premium land commands premium profits!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('weekend') || input.includes('hobby') || input.includes('part time')) {
      const responses = [
        "🌅 **Leisure Farmer**: Farming can be fun and profitable! Try container gardening, mushroom cultivation, or herb farming. Many hobby farmers earn extra income on weekends!",
        "🌱 **Part-time Pro**: Balance work and farming joy! Start with small plots, vertical gardens, or aquaculture. Weekend farming can become a serious side business!",
        "🏡 **Urban Farmer**: City slicker turned soil expert! Explore balcony farming, hydroponics, and community gardens. Fresh produce and peace of mind in one package!",
        "⏰ **Time Maximizer**: Make every hour count! Learn efficient farming techniques perfect for busy schedules. Many part-time farmers achieve full-time incomes!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('reward') || input.includes('bonus') || input.includes('incentive')) {
      const responses = [
        "🎁 **Reward Ranger**: Sustainable farming pays double! Earn bonuses for organic certification, water conservation, and biodiversity. Good farming gets recognized and rewarded!",
        "🏆 **Incentive Innovator**: Government and markets reward excellence! Get bonuses for quality produce, timely delivery, and innovative practices. Rewards can add 20-30% to your income!",
        "💎 **Bonus Builder**: Recognition drives excellence! Participate in farming challenges, quality competitions, and sustainability programs. Rewards come in cash and reputation!",
        "🌟 **Achievement Ace**: Your hard work deserves rewards! From export premiums to government incentives, maximize your earnings through excellence. Quality farming = Premium rewards!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('prediction') || input.includes('forecast') || input.includes('future price')) {
      const responses = [
        "🔮 **Crystal Crop**: See the future of farming! Our AI predicts price trends, demand patterns, and seasonal fluctuations. Knowledge of tomorrow builds wealth today!",
        "📈 **Trend Teller**: Market prediction is profit prediction! Analyze historical data, weather patterns, and economic indicators. Smart timing can increase profits by 50%!",
        "🎭 **Fortune Farmer**: Predict to prosper! Use data-driven insights for crop selection, harvesting timing, and market entry. The crystal ball of agriculture is here!",
        "🔍 **Insight Innovator**: Future-focused farming! Get predictions on climate impacts, technological changes, and market evolution. Stay ahead of the farming curve!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // New comprehensive question responses
    if (input.includes('seasonal') || input.includes('season') || input.includes('kharif') || input.includes('rabi') || input.includes('zaid')) {
      const responses = [
        "🌱 **Season Master**: Timing is everything in farming! Kharif brings monsoon magic, Rabi offers winter wealth, Zaid fills summer gaps. Each season has its crown jewels - what season are you planning for?",
        "🌾 **Calendar Captain**: Seasons dictate success! Learn optimal sowing times, crop varieties for each season, and rotation strategies. A seasonal calendar can increase yields by 25-40%!",
        "🌸 **Season Sage**: From spring blossoms to winter harvests! Master seasonal transitions, understand climate patterns, and adapt your farming calendar. Seasonal wisdom = Year-round success!",
        "🍂 **Time Teller**: Seasons are nature's schedule! Plan for Kharif rice, Rabi wheat, and Zaid vegetables. Each season offers unique opportunities and challenges. Ready to sync with nature's rhythm?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('crop disease') || input.includes('plant disease') || input.includes('blight') || input.includes('rust') || input.includes('wilt')) {
      const responses = [
        "🌿 **Disease Detective**: Spot trouble before it spreads! Learn to identify fungal foes, bacterial bandits, and viral villains. Early diagnosis saves 60-80% of potential crop losses!",
        "🔬 **Pathogen Pro**: Every disease tells a story! Understand symptoms, causes, and cures for 100+ crop diseases. Prevention is cheaper than cure - let's build your disease defense!",
        "🛡️ **Health Guardian**: Disease-free crops = Dream harvests! Master integrated disease management combining resistant varieties, cultural practices, and biological controls. Your crops' bodyguard awaits!",
        "🌱 **Wellness Warrior**: Healthy plants, happy farmer! Learn about soil health, plant immunity, and eco-friendly treatments. Did you know healthy soil prevents 70% of plant diseases?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('organic') || input.includes('natural') || input.includes('eco') || input.includes('sustainable')) {
      const responses = [
        "🌍 **Green Guru**: Organic farming feeds the soul and the soil! Learn natural pest control, compost magic, and biodynamic principles. Organic crops often sell at 20-50% premium!",
        "🌱 **Eco Expert**: Nature's way is the best way! Discover companion planting, green manures, and beneficial insects. Organic farming builds living soil that lasts generations!",
        "🌿 **Sustainability Star**: Farm for the future, not just today! Master organic certification, carbon farming, and regenerative agriculture. Sustainable farmers are the new rockstars!",
        "🌸 **Natural Navigator**: Let nature be your guide! Explore organic fertilizers, natural pesticides, and holistic farm management. Organic farming = Healthy food + Healthy profits!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('market trend') || input.includes('trend') || input.includes('analysis') || input.includes('market analysis')) {
      const responses = [
        "📊 **Trend Tracker**: Markets dance to many tunes! Analyze seasonal patterns, consumer preferences, and global influences. Smart trend-spotting can triple your profits!",
        "📈 **Market Mystic**: Predict the harvest gold rush! Study demand cycles, price elasticity, and competition analysis. Market intelligence turns farmers into fortune tellers!",
        "🔍 **Pattern Pro**: History repeats, profits compound! Learn to read market signals, understand supply chains, and anticipate demand shifts. Trend masters always stay ahead!",
        "🎯 **Analysis Ace**: Data-driven farming pays dividends! Track export demands, domestic consumption, and price volatility. Market analysis transforms uncertainty into opportunity!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('irrigation') || input.includes('water') || input.includes('watering') || input.includes('drip') || input.includes('sprinkler')) {
      const responses = [
        "💧 **Water Wizard**: Every drop counts in farming gold! Master drip irrigation, sprinkler systems, and moisture sensors. Efficient irrigation can increase yields by 30-50%!",
        "🚰 **Hydration Hero**: Water is wealth in agriculture! Learn about micro-irrigation, rainwater harvesting, and soil moisture management. Smart water use = Sustainable success!",
        "🌊 **Flow Master**: From floods to droughts, control the flow! Explore pivot systems, subsurface irrigation, and automated watering. Water-efficient farms are future-ready!",
        "💦 **Moisture Maven**: Perfect watering = Perfect growing! Understand crop water requirements, soil types, and irrigation scheduling. Did you know 40% of water can be saved with smart irrigation?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('fertilizer') || input.includes('manure') || input.includes('nutrition') || input.includes('npk')) {
      const responses = [
        "🌾 **Nutrition Ninja**: Feed your soil, harvest the rewards! Master NPK balance, micronutrients, and organic amendments. Proper nutrition can boost yields by 40-60%!",
        "🧪 **Fertility Expert**: Soil hunger = Crop failure! Learn about soil testing, nutrient deficiencies, and customized fertilization. Healthy soil = Healthy profits!",
        "🌱 **Growth Guru**: From seed to harvest, nutrition matters! Explore slow-release fertilizers, foliar feeding, and bio-fertilizers. The right nutrients at the right time = Magic!",
        "🌿 **Balance Master**: Too little or too much - find the sweet spot! Understand nutrient interactions, soil pH effects, and deficiency symptoms. Fertilizer wisdom = Farming wizardry!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('rotation') || input.includes('crop rotation') || input.includes('diversity')) {
      const responses = [
        "🔄 **Rotation Genius**: Nature's own pest control! Learn 4-year rotation cycles, nitrogen-fixing crops, and soil-restoring sequences. Smart rotation prevents disease and boosts fertility!",
        "🌾 **Cycle Master**: Break the pest cycle, build soil health! Explore cereal-legume rotations, cover crops, and multi-cropping systems. Rotation wizards harvest more with less work!",
        "🔄 **Diversity Driver**: Monoculture is monotony! Discover crop diversity benefits, companion planting, and intercropping magic. Diverse farms are resilient and profitable!",
        "🌱 **Sequence Sage**: Plan your planting puzzle! Learn about crop families, nutrient demands, and seasonal sequencing. Perfect rotation = Perfect soil health!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('cost') || input.includes('budget') || input.includes('expense') || input.includes('profitability')) {
      const responses = [
        "💵 **Budget Boss**: Penny wise, pound profitable! Track every rupee from seed to sale. Many farmers reduce costs by 20% through smart management!",
        "📊 **Expense Expert**: Hidden costs kill profits! Learn about input optimization, waste reduction, and efficiency improvements. Cost control = Profit multiplication!",
        "💰 **Profit Pilot**: Fly high with farming finance! Calculate true costs, understand margins, and optimize resource allocation. Smart budgeting turns acres into assets!",
        "🧮 **Cost Commander**: Know your numbers, grow your fortune! Master cost-benefit analysis, break-even calculations, and investment returns. Financial wisdom = Farming freedom!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('export') || input.includes('international') || input.includes('global market') || input.includes('trade')) {
      const responses = [
        "🌐 **Export Emperor**: From farm to world! Learn about quality standards, documentation, and international markets. Indian farmers are conquering global taste buds!",
        "🚀 **Global Guru**: Think beyond borders! Explore spice exports, basmati rice markets, and organic produce opportunities. Export farming can multiply your income!",
        "🌍 **Trade Titan**: Quality opens world markets! Master GAP certification, phytosanitary requirements, and export logistics. Your crops can travel the world!",
        "✈️ **International Innovator**: Farm for the planet! Discover niche markets, premium pricing, and direct buyer connections. Export success stories inspire thousands!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('climate') || input.includes('climate smart') || input.includes('adaptation') || input.includes('resilient')) {
      const responses = [
        "🌡️ **Climate Champion**: Farm through any weather! Learn drought-resistant varieties, flood-tolerant crops, and climate adaptation strategies. Future-ready farming starts now!",
        "🌍 **Adaptation Ace**: Climate change is the new normal! Master heat-tolerant seeds, water conservation, and carbon farming. Resilient farmers thrive in any condition!",
        "🌱 **Weather Warrior**: Beat climate challenges! Explore shade farming, windbreaks, and microclimate creation. Climate-smart farming = Sustainable success!",
        "🌤️ **Resilience Ranger**: Turn threats into opportunities! Learn about climate forecasting, risk management, and adaptive technologies. Climate warriors lead agriculture's future!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('water management') || input.includes('conservation') || input.includes('groundwater') || input.includes('rainwater')) {
      const responses = [
        "🚰 **Conservation Captain**: Water is liquid gold! Master rainwater harvesting, groundwater recharge, and efficient irrigation. Smart water management ensures farming continuity!",
        "💧 **Resource Ranger**: Protect your water wealth! Learn watershed management, check dams, and aquifer recharge. Water-wise farmers never go thirsty!",
        "🌊 **Flow Guardian**: From source to soil! Explore conjunctive use, water budgeting, and conservation farming. Integrated water management = Drought-proof farming!",
        "💦 **Hydrology Hero**: Water security = Food security! Master water auditing, efficiency monitoring, and sustainable extraction. Your water wisdom protects future generations!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('seed selection') || input.includes('variety') || input.includes('hybrid') || input.includes('quality seed')) {
      const responses = [
        "🌱 **Variety Virtuoso**: Choose champions, not survivors! Select high-yielding, disease-resistant, and market-preferred varieties. Quality seeds pay for themselves 5-10 times!",
        "🌾 **Selection Sage**: Seed choice = Harvest choice! Learn about trait selection, adaptability testing, and performance trials. The right variety maximizes your potential!",
        "🌿 **Breeding Expert**: From traditional to transgenic! Understand hybrid vigor, GM traits, and heirloom advantages. Seed science = Farming's foundation!",
        "🌰 **Quality Quest**: Certified seeds = Certified success! Learn about seed testing, germination rates, and genetic purity. Premium seeds = Premium harvests!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('safety') || input.includes('pesticide safety') || input.includes('protection') || input.includes('precaution')) {
      const responses = [
        "🛡️ **Safety Sentinel**: Farm safely, live healthily! Learn PPE usage, safe handling procedures, and emergency responses. Knowledge protects both crops and farmers!",
        "⚠️ **Protection Pro**: Pesticides are tools, not toys! Master safe application, storage, and disposal. Safe farming = Sustainable farming!",
        "🧤 **Guardian Guide**: Your health matters most! Understand toxicity levels, first aid measures, and long-term health effects. Safety first = Success always!",
        "🔒 **Risk Manager**: Prevention beats cure! Learn about integrated safety systems, monitoring, and regulatory compliance. Safe farmers are successful farmers!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('app') || input.includes('application') || input.includes('mobile') || input.includes('technology')) {
      const responses = [
        "📱 **Tech Trailblazer**: Apps revolutionize farming! Discover weather apps, pest identification tools, and market platforms. Digital farming boosts efficiency by 40%!",
        "🤖 **App Ace**: Your smartphone, farming's best friend! Explore crop management apps, drone controllers, and AI advisors. Tech-savvy farmers lead the pack!",
        "📊 **Digital Dynamo**: From field to market, apps connect everything! Learn about farm management software, weather stations, and automated systems. Welcome to smart farming!",
        "🚀 **Innovation Navigator**: Technology transforms tradition! Discover IoT sensors, blockchain traceability, and AI crop doctors. App-powered farming = Future farming!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('story') || input.includes('success') || input.includes('case study') || input.includes('example')) {
      const responses = [
        "🏆 **Inspiration Icon**: Real farmers, real success! Read stories of debt-free farmers, export champions, and innovation leaders. Your success story starts with learning from others!",
        "🌟 **Achievement Atlas**: From rags to riches farming tales! Discover how ordinary farmers became extraordinary through smart choices and hard work. Motivation meets practical wisdom!",
        "🎖️ **Success Sage**: Case studies that inspire action! Learn from organic pioneers, drought survivors, and market innovators. Every success story teaches valuable lessons!",
        "🏅 **Triumph Teller**: Farming heroes walk among us! Explore stories of women farmers, young entrepreneurs, and community champions. Your journey to success begins here!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('challenge') || input.includes('problem') || input.includes('difficulty') || input.includes('issue')) {
      const responses = [
        "🎯 **Challenge Champion**: Problems are opportunities in disguise! Learn to overcome pest outbreaks, market crashes, and climate shocks. Every challenge builds farming wisdom!",
        "🔥 **Obstacle Overcomer**: Turn problems into progress! Master drought management, price volatility solutions, and labor challenges. Resilient farmers write success stories!",
        "💪 **Problem Solver**: Farming challenges test your mettle! Discover innovative solutions for water scarcity, soil degradation, and market access. Challenges = Growth opportunities!",
        "🎪 **Crisis Manager**: From floods to frosts, handle anything! Learn contingency planning, risk assessment, and recovery strategies. Crisis-tested farmers are crisis-proof!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('yield') || input.includes('increase') || input.includes('productivity') || input.includes('output')) {
      const responses = [
        "📈 **Yield Yoda**: More from less - the farming mantra! Master high-density planting, precision nutrition, and stress management. Some farmers double yields through smart techniques!",
        "🌾 **Productivity Pro**: Efficiency is the new yield! Learn about SRI methods, integrated farming, and technology adoption. Smart farming = Maximum output!",
        "📊 **Output Optimizer**: Quality × Quantity = Success! Explore hybrid varieties, fertigation, and canopy management. Yield improvement = Profit explosion!",
        "🚀 **Harvest Hero**: Push the boundaries of possibility! Learn about record-breaking yields, innovative techniques, and genetic breakthroughs. Your farm's potential is limitless!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('beginner') || input.includes('new') || input.includes('start') || input.includes('basic')) {
      const responses = [
        "🌱 **Newbie Navigator**: Welcome to farming family! Start with small plots, learn basic tools, and master one crop at a time. Every expert was once a beginner!",
        "🌟 **Starter Star**: Your farming journey begins today! Learn soil preparation, seed sowing, and basic pest control. Small steps lead to big harvests!",
        "🎯 **Foundation Builder**: Build strong farming fundamentals! Understand seasons, soil types, and basic economics. A great farmer starts with great basics!",
        "🚀 **Launch Pad**: From zero to hero farming! Get beginner guides, tool recommendations, and success checklists. Your first harvest is just weeks away!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('drought') || input.includes('dry') || input.includes('water scarcity') || input.includes('arid')) {
      const responses = [
        "🏜️ **Drought Defender**: Beat the dry spell! Master drought-resistant crops, moisture conservation, and emergency irrigation. Many farmers turn droughts into opportunities!",
        "💧 **Aridity Ace**: Water scarcity isn't the end! Learn about desert farming techniques, xeriscaping, and water harvesting. Drought-smart farming = Year-round success!",
        "🌵 **Dryland Dynamo**: Thrive where others struggle! Explore drought-tolerant varieties, conservation tillage, and micro-irrigation. Dryland farmers are the real water wizards!",
        "🏝️ **Scarcity Survivor**: Turn limitations into innovations! Master water budgeting, alternate crops, and moisture management. Drought survivors become drought victors!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('natural') || input.includes('eco-friendly') || input.includes('biological') || input.includes('alternative')) {
      const responses = [
        "🌿 **Nature's Ally**: Let biology do the work! Learn about beneficial insects, trap crops, and microbial controls. Natural methods often work better than chemicals!",
        "🦋 **Eco Warrior**: Farm with nature, not against it! Discover pheromone traps, companion planting, and botanical pesticides. Eco-friendly farming = Future farming!",
        "🌱 **Biological Buddy**: Microbes are your secret weapons! Explore Trichoderma, Pseudomonas, and other beneficial organisms. Biological control = Chemical-free success!",
        "🌸 **Green Guardian**: Protect the planet, profit from it! Learn about IPM strategies, organic amendments, and ecosystem restoration. Sustainable farming = Lasting success!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('myth') || input.includes('false') || input.includes('belief') || input.includes('common mistake')) {
      const responses = [
        "🛡️ **Myth Buster**: Separate fact from farming fiction! Learn why some 'traditional wisdom' actually hurts yields. Science-backed farming beats superstition!",
        "🔍 **Truth Teller**: Common mistakes cost crores annually! Discover why over-fertilizing harms soil, why monoculture fails, and why timing matters most. Knowledge = Power!",
        "🎭 **Wisdom Weaver**: Ancient myths meet modern science! Learn which old wives' tales work and which ones waste time and money. Smart farming starts with smart thinking!",
        "💡 **Reality Check**: Farming facts that surprise! Understand why some popular methods actually reduce yields. Evidence-based farming = Maximum profits!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('smart') || input.includes('technology') || input.includes('iot') || input.includes('automation')) {
      const responses = [
        "🤖 **Tech Titan**: Welcome to farming 4.0! Explore sensor networks, automated irrigation, and AI crop advisors. Smart farms use 50% less water and get 30% higher yields!",
        "📡 **IoT Innovator**: Connect your farm to the future! Learn about soil sensors, weather stations, and automated systems. Data-driven farming = Precision profits!",
        "🚀 **Automation Ace**: Let machines do the heavy lifting! Discover robotic harvesters, drone sprayers, and smart tractors. Technology amplifies your farming power!",
        "🔮 **Future Farmer**: Embrace the digital revolution! Learn about blockchain traceability, AI disease detection, and predictive analytics. Smart farming = Smarter profits!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('quiz') || input.includes('test') || input.includes('game') || input.includes('challenge')) {
      const responses = [
        "🎯 **Quiz Master**: Test your farming IQ! Challenge yourself with crop identification, pest diagnosis, and farming economics. Learning through fun = Knowledge that sticks!",
        "🧠 **Knowledge Game**: Farm facts meet fun challenges! Take quizzes on soil science, weather wisdom, and market mastery. Gamified learning makes farming fascinating!",
        "🎲 **Challenge Champion**: Put your farming knowledge to the test! From seed to sale, prove your expertise. Every question brings you closer to farming mastery!",
        "🏆 **Test Titan**: Quiz your way to farming excellence! Learn through interactive challenges covering all aspects of agriculture. Fun learning = Lasting knowledge!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('tip') || input.includes('advice') || input.includes('daily') || input.includes('suggestion')) {
      const responses = [
        "💡 **Wisdom Whisperer**: Daily drops of farming gold! Get seasonal reminders, pest alerts, and market tips. Small daily wisdom = Big annual success!",
        "🌅 **Morning Mentor**: Start your day with farming insights! Learn about optimal planting times, soil preparation tips, and harvest timing. Daily wisdom = Weekly wins!",
        "📅 **Tip Timekeeper**: Farming success, one day at a time! Discover crop rotation reminders, fertilization schedules, and market timing advice. Consistency creates champions!",
        "🎯 **Advice Ace**: Practical wisdom for every farmer! Get daily tips on water management, pest prevention, and profit optimization. Daily improvement = Extraordinary results!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('calendar') || input.includes('schedule') || input.includes('timeline') || input.includes('planning')) {
      const responses = [
        "📅 **Time Master**: Your farming clock never stops! Learn optimal sowing windows, harvest peaks, and market cycles. A good calendar prevents 80% of farming failures!",
        "🕐 **Schedule Sage**: Plan for perfection! Master crop calendars, labor planning, and equipment maintenance schedules. Time management = Yield management!",
        "📆 **Planning Pro**: From seed to sale, timing is everything! Learn about seasonal windows, lunar planting, and market cycles. Perfect planning = Perfect profits!",
        "⏰ **Calendar Captain**: Your farming roadmap! Discover optimal timing for every farming activity. A well-planned calendar turns potential into performance!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (input.includes('joke') || input.includes('fun') || input.includes('laugh') || input.includes('humor')) {
      const responses = [
        "😄 **Joke Jester**: Farming fun for the soul! Why did the farmer win the race? Because he was outstanding in his field! 🌾 Want more farming humor?",
        "😂 **Comedy Crop**: Laughter is the best fertilizer! What do you call a sleeping bull? A bulldozer! 🐂 More jokes to brighten your farming day?",
        "😆 **Humor Harvester**: Smile while you sow! Why did the tomato turn red? Because it saw the salad dressing! 🍅 Need another farming funny?",
        "🤣 **Giggle Grower**: Fun facts with farming flair! Why don't farmers play cards? Too many cheaters (cheat grass)! 🌱 Ready for more farm fun?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // General responses
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "👋 Hello! Welcome to Agri-Assist! I'm here to help you with all your farming needs. What would you like to know about? You can ask me about weather, crop prices, farming techniques, or any other agricultural topic!";
    }

    if (input.includes('help') || input.includes('what can you do') || input.includes('features')) {
      return "🤖 **Agri-Assist Features**: I can help you with:\n\n🌤️ Weather & seasonal farming advice\n📈 Market trends & price predictions\n🐛 Pest control & disease management\n🧪 Soil testing & fertilizer guidance\n💰 Loan assistance & cost analysis\n🏛️ Government schemes & export opportunities\n🔧 Modern tools & irrigation techniques\n📚 Organic farming & crop rotation\n🧮 Farm calculators & profitability\n👨‍🔧 Technician connections & safety tips\n🌱 Seed selection & yield improvement\n💧 Water management & drought strategies\n📱 Smart farming & technology\n🏆 Success stories & farming challenges\n\nWhat specific area interests you?";
    }

    return "🌾 That's a great question! As your Agri-Assist companion, I can help you with weather forecasts, crop prices, farming techniques, pest control, soil testing, loans, government schemes, seasonal farming, organic methods, and much more. What specific farming topic would you like to explore?";
  };

  const handleQuickQuestion = (question: QuickQuestion) => {
    sendMessage(question.text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Pulse animation for the chat button
  useEffect(() => {
    if (!isOpen) {
      const interval = setInterval(() => {
        // Pulse effect is handled in CSS
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating Chat Button with enhanced animation */}
      <div className="fixed bottom-20 right-6 z-50">
        <div className="relative">
          {/* Pulse ring animation */}
          {!isOpen && (
            <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></div>
          )}

          <Button
            onClick={() => setIsOpen(!isOpen)}
            size="icon"
            className={cn(
              "h-16 w-16 rounded-full shadow-2xl transition-all duration-500 hover:scale-110 relative z-10",
              "bg-gradient-to-r from-green-500 via-emerald-500 to-green-600",
              "hover:from-green-600 hover:via-emerald-600 hover:to-green-700",
              "border-2 border-white/20 backdrop-blur-sm",
              isOpen && "rotate-180 scale-110"
            )}
          >
            {isOpen ? (
              <X className="h-7 w-7 text-white drop-shadow-lg" />
            ) : (
              <div className="relative">
                <MessageCircle className="h-7 w-7 text-white drop-shadow-lg" />
                <Sparkles className="h-3 w-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
              </div>
            )}
          </Button>
        </div>

        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute bottom-20 right-0 bg-black/80 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap animate-fade-in">
            💬 Ask me about farming!
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
          </div>
        )}
      </div>

      {/* Enhanced Chat Window - correct size when opened */}
      <div
        className={cn(
          "fixed bottom-40 right-2 sm:right-6 z-40 transition-all duration-500 ease-out w-[calc(100vw-1rem)] max-w-[384px] sm:max-w-[400px]",
          isOpen ? "translate-x-0 opacity-100 scale-100" : "translate-x-full opacity-0 scale-95 pointer-events-none"
        )}
      >
        <Card className="w-full h-[min(500px,75vh)] min-h-[400px] shadow-2xl border-2 border-green-200 bg-white/98 backdrop-blur-md flex flex-col overflow-hidden">
          <CardHeader className="flex-shrink-0 bg-gradient-to-r from-green-50 via-emerald-50 to-green-100 border-b border-green-200">
            <CardTitle className="flex items-center gap-3 text-green-800">
              <div className="relative">
                <Bot className="h-6 w-6" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <div className="font-bold">Agri-Assist AI</div>
                <div className="text-xs text-green-600 font-normal">Your Smart Farming Companion</div>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 flex flex-col flex-1 min-h-0">
            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 max-w-[85%] animate-slide-in",
                    message.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md",
                    message.sender === 'user'
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : "bg-gradient-to-r from-emerald-100 to-green-100 border-2 border-emerald-200"
                  )}>
                    {message.sender === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-emerald-600" />
                    )}
                  </div>

                  <div className={cn(
                    "rounded-2xl px-4 py-3 text-sm shadow-md",
                    message.sender === 'user'
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      : "bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 text-emerald-900"
                  )}>
                    <div className="whitespace-pre-line">{message.text}</div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3 max-w-[85%] animate-slide-in">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md bg-gradient-to-r from-emerald-100 to-green-100 border-2 border-emerald-200">
                    <Bot className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl px-4 py-3 shadow-md">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Questions */}
            {showWelcome && messages.length <= 1 && (
              <div className="px-4 pb-2 max-h-32 overflow-y-auto">
                <div className="text-xs text-green-600 font-medium mb-2">💡 Quick Questions:</div>
                <div className="grid grid-cols-2 gap-2">
                  {quickQuestions.slice(0, 16).map((question) => (
                    <Button
                      key={question.id}
                      onClick={() => handleQuickQuestion(question)}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200 hover:scale-105"
                    >
                      {question.icon}
                      <span className="ml-1 truncate">{question.text}</span>
                    </Button>
                  ))}
                </div>
                <div className="text-center mt-2">
                  <span className="text-xs text-green-500">💬 Ask me anything or click above!</span>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex-shrink-0 p-4 border-t border-green-200 bg-gradient-to-r from-green-50/50 to-emerald-50/50">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about farming, weather, prices..."
                  className="flex-1 h-10 text-sm border-green-300 focus:border-green-500 bg-white/80"
                />
                <Button
                  onClick={() => sendMessage()}
                  size="icon"
                  className="h-10 w-10 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-200 hover:scale-105"
                  disabled={!input.trim() || isTyping}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Chatbot;
