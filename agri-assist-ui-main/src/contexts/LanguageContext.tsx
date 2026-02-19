import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'te' | 'hi';

interface Translations {
  // App
  appName: string;
  tagline: string;
  
  // Auth
  login: string;
  signUp: string;
  welcomeBack: string;
  createAccount: string;
  nameOrPhone: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  continueWith: string;
  google: string;
  facebook: string;
  apple: string;
  voiceAssistant: string;
  dontHaveAccount: string;
  alreadyHaveAccount: string;
  forgotPassword: string;
  orContinueWith: string;
  emailAddress: string;
  loggingIn: string;
  signingUp: string;
  
  // Dashboard
  welcomeBackUser: string;
  services: string;
  home: string;
  mitra: string;
  search: string;
  rewards: string;
  profile: string;
  settings: string;
  logout: string;
  comingSoon: string;
  connectWithFarmers: string;
  findCropsAndServices: string;
  earnRewardsDesc: string;
  
  // Features
  cropRates: string;
  weather: string;
  buySell: string;
  cattlePets: string;
  agriTools: string;
  technicians: string;
  aiPrediction: string;
  soilTesting: string;
  govtSchemes: string;
  agriOfficers: string;
  loanAssistance: string;
  landRenting: string;
  agriInvest: string;
  farmWork: string;
  ffSeeds: string;
  farmerGuide: string;
  weekendFarming: string;
  farmingClasses: string;
  calculator: string;
  
  // Common Actions
  call: string;
  message: string;
  buy: string;
  sell: string;
  rent: string;
  search2: string;
  filter: string;
  back: string;
  submit: string;
  cancel: string;
  save: string;
  loading: string;
  selectLocation: string;
  selectCrop: string;
  all: string;
  allTypes: string;
  allClasses: string;
  filterBy: string;
  applyNow: string;
  viewDetails: string;
  buyNow: string;
  bookNow: string;
  booked: string;
  enrollNow: string;
  enrolled: string;
  claimed: string;
  claim: string;
  hearGuide: string;
  tips: string;
  
  // Crop Rates
  nearbyMarkets: string;
  priceHistory: string;
  minPrice: string;
  maxPrice: string;
  avgPrice: string;
  trend: string;
  aiAdvice: string;
  
  // Weather
  currentWeather: string;
  forecast: string;
  farmingAdvice: string;
  humidity: string;
  wind: string;
  rain: string;
  temperature: string;
  
  // Buy & Sell
  vegetables: string;
  fruits: string;
  grains: string;
  spices: string;
  allCategories: string;
  pricePerKg: string;
  quantity: string;
  quality: string;
  sampleAvailable: string;
  tradeCrops: string;
  searchCrops: string;
  
  // Cattle & Pets
  cows: string;
  buffalos: string;
  oxen: string;
  goats: string;
  sheep: string;
  pets: string;
  age: string;
  healthStatus: string;
  price: string;
  
  // Technicians
  electricians: string;
  mechanics: string;
  experience: string;
  services2: string;
  available: string;
  
  // Agri Tools
  tractors: string;
  fertilizers: string;
  instruments: string;
  rentPerDay: string;
  ownerDetails: string;
  
  // Govt Schemes
  centralSchemes: string;
  stateSchemes: string;
  subsidies: string;
  howToApply: string;
  eligibility: string;
  
  // Loan
  banks: string;
  privateLenders: string;
  interestRate: string;
  loanAmount: string;
  emiCalculator: string;
  setReminders: string;
  maxAmount: string;
  tenure: string;
  processing: string;
  
  // Soil Testing
  soilKit: string;
  manualInput: string;
  soilType: string;
  suitableCrops: string;
  
  // Calculator
  calculateInterest: string;
  principal: string;
  rate: string;
  time: string;
  result: string;
  interest: string;
  totalAmount: string;
  
  // Voice
  tapToSpeak: string;
  listening: string;
  thinking: string;
  speaking: string;
  
  // News
  farmingNews: string;
  readMore: string;
  
  // Errors
  errorOccurred: string;
  tryAgain: string;
  noResults: string;
  
  // Officers
  agriOfficerTitle: string;
  veterinaryOfficer: string;
  requestVisit: string;
  
  // Land
  pricePerAcre: string;
  landType: string;
  irrigated: string;
  nonIrrigated: string;
  enterLocation: string;
  acres: string;
  
  // Investment
  profitSharing: string;
  investor: string;
  landOwner: string;
  seekingInvestment: string;
  investorAvailable: string;
  crop: string;
  requiredInvestment: string;
  expectedReturn: string;
  investmentAmount: string;
  minLandRequired: string;
  expectedROI: string;
  
  // Farm Work
  workType: string;
  dailyWage: string;
  duration: string;
  workersNeeded: string;
  
  // FF Seeds
  labTested: string;
  growthGuarantee: string;
  refundPolicy: string;
  
  // Guide
  fertilizerGuide: string;
  cropCare: string;
  animalCare: string;
  
  // Classes
  onlineClasses: string;
  offlineClasses: string;
  weekendBatch: string;
  monthlyBatch: string;
  classType: string;
  
  // Rewards
  yourPoints: string;
  earnMorePoints: string;
  
  // Weekend Farming
  bookedSessions: string;
  almostFull: string;
  
  // Farming Classes
  enrolledIn: string;
}

const translations: Record<Language, Translations> = {
  en: {
    appName: 'Farmers Friendly',
    tagline: 'Empowering Farmers with Technology',
    login: 'Login',
    signUp: 'Sign Up',
    welcomeBack: 'Welcome Back to Farmers Friendly',
    createAccount: 'Create Your Farmers Friendly Account',
    nameOrPhone: 'Name or Phone Number',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    continueWith: 'Continue with',
    google: 'Google',
    facebook: 'Facebook',
    apple: 'Apple',
    voiceAssistant: 'Tap for voice help',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    forgotPassword: 'Forgot Password?',
    orContinueWith: 'Or continue with',
    emailAddress: 'Email Address',
    loggingIn: 'Logging in...',
    signingUp: 'Signing up...',
    welcomeBackUser: 'Welcome back,',
    services: 'Services',
    home: 'Home',
    mitra: 'Mitra',
    search: 'Search',
    rewards: 'Rewards',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    comingSoon: 'Coming Soon!',
    connectWithFarmers: 'Connect with fellow farmers in your area.',
    findCropsAndServices: 'Find crops, farmers, and services.',
    earnRewardsDesc: 'Earn rewards and government benefits.',
    cropRates: 'Crop Rates',
    weather: 'Weather',
    buySell: 'Buy & Sell',
    cattlePets: 'Cattle & Pets',
    agriTools: 'Agri Tools',
    technicians: 'Technicians',
    aiPrediction: 'AI Prediction',
    soilTesting: 'Soil Testing',
    govtSchemes: 'Govt Schemes',
    agriOfficers: 'Agri Officers',
    loanAssistance: 'Loan Assistance',
    landRenting: 'Land Renting',
    agriInvest: 'Agri Invest',
    farmWork: 'Farm Work',
    ffSeeds: 'FF Seeds',
    farmerGuide: 'Farmer Guide',
    weekendFarming: 'Weekend Farming',
    farmingClasses: 'Farming Classes',
    calculator: 'Calculator',
    call: 'Call',
    message: 'Message',
    buy: 'Buy',
    sell: 'Sell',
    rent: 'Rent',
    search2: 'Search',
    filter: 'Filter',
    back: 'Back',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    loading: 'Loading...',
    selectLocation: 'Select Location',
    selectCrop: 'Select Crop',
    all: 'All',
    allTypes: 'All Types',
    allClasses: 'All Classes',
    filterBy: 'Filter By',
    applyNow: 'Apply Now',
    viewDetails: 'View Details',
    buyNow: 'Buy Now',
    bookNow: 'Book Now',
    booked: 'Booked',
    enrollNow: 'Enroll Now',
    enrolled: 'Enrolled',
    claimed: 'Claimed',
    claim: 'Claim',
    hearGuide: 'Hear Guide',
    tips: 'Tips',
    nearbyMarkets: 'Nearby Markets',
    priceHistory: 'Price History',
    minPrice: 'Min Price',
    maxPrice: 'Max Price',
    avgPrice: 'Avg Price',
    trend: 'Trend',
    aiAdvice: 'AI Advice',
    currentWeather: 'Current Weather',
    forecast: 'Forecast',
    farmingAdvice: 'Farming Advice',
    humidity: 'Humidity',
    wind: 'Wind',
    rain: 'Rain',
    temperature: 'Temperature',
    vegetables: 'Vegetables',
    fruits: 'Fruits',
    grains: 'Grains',
    spices: 'Spices',
    allCategories: 'All Categories',
    pricePerKg: 'Price/Kg',
    quantity: 'Quantity',
    quality: 'Quality',
    sampleAvailable: 'Sample Available',
    tradeCrops: 'Trade crops directly with farmers',
    searchCrops: 'Search crops...',
    cows: 'Cows',
    buffalos: 'Buffalos',
    oxen: 'Oxen',
    goats: 'Goats',
    sheep: 'Sheep',
    pets: 'Pets',
    age: 'Age',
    healthStatus: 'Health Status',
    price: 'Price',
    electricians: 'Electricians',
    mechanics: 'Mechanics',
    experience: 'Experience',
    services2: 'Services',
    available: 'Available',
    tractors: 'Tractors',
    fertilizers: 'Fertilizers',
    instruments: 'Instruments',
    rentPerDay: 'Rent/Day',
    ownerDetails: 'Owner Details',
    centralSchemes: 'Central Schemes',
    stateSchemes: 'State Schemes',
    subsidies: 'Subsidies',
    howToApply: 'How to Apply',
    eligibility: 'Eligibility',
    banks: 'Banks',
    privateLenders: 'Private Lenders',
    interestRate: 'Interest Rate',
    loanAmount: 'Loan Amount',
    emiCalculator: 'EMI Calculator',
    setReminders: 'Set Reminders',
    maxAmount: 'Max Amount',
    tenure: 'Tenure',
    processing: 'Processing',
    soilKit: 'FF Soil Test Kit',
    manualInput: 'Manual Input',
    soilType: 'Soil Type',
    suitableCrops: 'Suitable Crops',
    calculateInterest: 'Calculate Interest',
    principal: 'Principal Amount',
    rate: 'Interest Rate',
    time: 'Time Period',
    result: 'Result',
    interest: 'Interest',
    totalAmount: 'Total Amount',
    tapToSpeak: 'Tap to Speak',
    listening: 'Listening...',
    thinking: 'Thinking...',
    speaking: 'Speaking...',
    farmingNews: 'Farming News',
    readMore: 'Read More',
    errorOccurred: 'An error occurred',
    tryAgain: 'Try Again',
    noResults: 'No results found',
    agriOfficerTitle: 'Agriculture Officer',
    veterinaryOfficer: 'Veterinary Officer',
    requestVisit: 'Request Visit',
    pricePerAcre: 'Price/Acre',
    landType: 'Land Type',
    irrigated: 'Irrigated',
    nonIrrigated: 'Non-Irrigated',
    enterLocation: 'Enter location',
    acres: 'Acres',
    profitSharing: 'Profit Sharing',
    investor: 'Investor',
    landOwner: 'Land Owner',
    seekingInvestment: 'Seeking Investment',
    investorAvailable: 'Investor Available',
    crop: 'Crop',
    requiredInvestment: 'Required Investment',
    expectedReturn: 'Expected Return',
    investmentAmount: 'Investment Amount',
    minLandRequired: 'Min Land Required',
    expectedROI: 'Expected ROI',
    workType: 'Work Type',
    dailyWage: 'Daily Wage',
    duration: 'Duration',
    workersNeeded: 'workers needed',
    labTested: 'Lab Tested',
    growthGuarantee: 'Growth Guarantee',
    refundPolicy: 'Refund Policy',
    fertilizerGuide: 'Fertilizer Guide',
    cropCare: 'Crop Care',
    animalCare: 'Animal Care',
    onlineClasses: 'Online Classes',
    offlineClasses: 'Offline Classes',
    weekendBatch: 'Weekend Batch',
    monthlyBatch: 'Monthly Batch',
    classType: 'Class Type',
    yourPoints: 'Your Points',
    earnMorePoints: 'Earn More Points',
    bookedSessions: 'booked session(s)',
    almostFull: 'Almost Full',
    enrolledIn: 'You are enrolled in',
  },
  te: {
    appName: 'రైతు మిత్ర',
    tagline: 'సాంకేతికతతో రైతులను సాధికారత',
    login: 'లాగిన్',
    signUp: 'సైన్ అప్',
    welcomeBack: 'రైతు మిత్రకు తిరిగి స్వాగతం',
    createAccount: 'మీ రైతు మిత్ర ఖాతాను సృష్టించండి',
    nameOrPhone: 'పేరు లేదా ఫోన్ నంబర్',
    password: 'పాస్వర్డ్',
    confirmPassword: 'పాస్వర్డ్ నిర్ధారించండి',
    fullName: 'పూర్తి పేరు',
    phoneNumber: 'ఫోన్ నంబర్',
    continueWith: 'దీనితో కొనసాగించండి',
    google: 'గూగుల్',
    facebook: 'ఫేస్‌బుక్',
    apple: 'ఆపిల్',
    voiceAssistant: 'వాయిస్ సహాయం కోసం నొక్కండి',
    dontHaveAccount: 'ఖాతా లేదా?',
    alreadyHaveAccount: 'ఇప్పటికే ఖాతా ఉందా?',
    forgotPassword: 'పాస్వర్డ్ మర్చిపోయారా?',
    orContinueWith: 'లేదా దీనితో కొనసాగించండి',
    emailAddress: 'ఇమెయిల్ చిరునామా',
    loggingIn: 'లాగిన్ అవుతోంది...',
    signingUp: 'సైన్ అప్ అవుతోంది...',
    welcomeBackUser: 'తిరిగి స్వాగతం,',
    services: 'సేవలు',
    home: 'హోమ్',
    mitra: 'మిత్ర',
    search: 'వెతకండి',
    rewards: 'రివార్డ్స్',
    profile: 'ప్రొఫైల్',
    settings: 'సెట్టింగ్స్',
    logout: 'లాగ్ అవుట్',
    comingSoon: 'త్వరలో వస్తుంది!',
    connectWithFarmers: 'మీ ప్రాంతంలోని తోటి రైతులతో కనెక్ట్ అవ్వండి.',
    findCropsAndServices: 'పంటలు, రైతులు మరియు సేవలను కనుగొనండి.',
    earnRewardsDesc: 'రివార్డ్స్ మరియు ప్రభుత్వ ప్రయోజనాలను పొందండి.',
    cropRates: 'పంట ధరలు',
    weather: 'వాతావరణం',
    buySell: 'కొనుగోలు & అమ్మకం',
    cattlePets: 'పశువులు & పెంపుడు జంతువులు',
    agriTools: 'వ్యవసాయ పరికరాలు',
    technicians: 'టెక్నీషియన్లు',
    aiPrediction: 'AI అంచనా',
    soilTesting: 'నేల పరీక్ష',
    govtSchemes: 'ప్రభుత్వ పథకాలు',
    agriOfficers: 'వ్యవసాయ అధికారులు',
    loanAssistance: 'రుణ సహాయం',
    landRenting: 'భూమి అద్దె',
    agriInvest: 'వ్యవసాయ పెట్టుబడి',
    farmWork: 'వ్యవసాయ పని',
    ffSeeds: 'FF విత్తనాలు',
    farmerGuide: 'రైతు గైడ్',
    weekendFarming: 'వారాంతపు వ్యవసాయం',
    farmingClasses: 'వ్యవసాయ తరగతులు',
    calculator: 'కాలిక్యులేటర్',
    call: 'కాల్ చేయండి',
    message: 'సందేశం',
    buy: 'కొనుగోలు',
    sell: 'అమ్మకం',
    rent: 'అద్దె',
    search2: 'వెతకండి',
    filter: 'ఫిల్టర్',
    back: 'వెనుకకు',
    submit: 'సమర్పించండి',
    cancel: 'రద్దు',
    save: 'సేవ్',
    loading: 'లోడ్ అవుతోంది...',
    selectLocation: 'ప్రదేశాన్ని ఎంచుకోండి',
    selectCrop: 'పంటను ఎంచుకోండి',
    all: 'అన్ని',
    allTypes: 'అన్ని రకాలు',
    allClasses: 'అన్ని తరగతులు',
    filterBy: 'ఫిల్టర్',
    applyNow: 'ఇప్పుడు దరఖాస్తు చేయండి',
    viewDetails: 'వివరాలు చూడండి',
    buyNow: 'ఇప్పుడు కొనండి',
    bookNow: 'ఇప్పుడు బుక్ చేయండి',
    booked: 'బుక్ అయింది',
    enrollNow: 'ఇప్పుడు చేరండి',
    enrolled: 'చేరారు',
    claimed: 'క్లెయిమ్ చేసారు',
    claim: 'క్లెయిమ్ చేయండి',
    hearGuide: 'గైడ్ వినండి',
    tips: 'చిట్కాలు',
    nearbyMarkets: 'సమీపంలోని మార్కెట్లు',
    priceHistory: 'ధర చరిత్ర',
    minPrice: 'కనిష్ట ధర',
    maxPrice: 'గరిష్ట ధర',
    avgPrice: 'సగటు ధర',
    trend: 'ట్రెండ్',
    aiAdvice: 'AI సలహా',
    currentWeather: 'ప్రస్తుత వాతావరణం',
    forecast: 'వాతావరణ సూచన',
    farmingAdvice: 'వ్యవసాయ సలహా',
    humidity: 'తేమ',
    wind: 'గాలి',
    rain: 'వర్షం',
    temperature: 'ఉష్ణోగ్రత',
    vegetables: 'కూరగాయలు',
    fruits: 'పండ్లు',
    grains: 'ధాన్యాలు',
    spices: 'మసాలా దినుసులు',
    allCategories: 'అన్ని వర్గాలు',
    pricePerKg: 'కిలో ధర',
    quantity: 'పరిమాణం',
    quality: 'నాణ్యత',
    sampleAvailable: 'నమూనా అందుబాటులో',
    tradeCrops: 'రైతులతో నేరుగా పంటలు వ్యాపారం చేయండి',
    searchCrops: 'పంటలను వెతకండి...',
    cows: 'ఆవులు',
    buffalos: 'గేదెలు',
    oxen: 'ఎద్దులు',
    goats: 'మేకలు',
    sheep: 'గొర్రెలు',
    pets: 'పెంపుడు జంతువులు',
    age: 'వయస్సు',
    healthStatus: 'ఆరోగ్య స్థితి',
    price: 'ధర',
    electricians: 'ఎలక్ట్రీషియన్లు',
    mechanics: 'మెకానిక్స్',
    experience: 'అనుభవం',
    services2: 'సేవలు',
    available: 'అందుబాటులో',
    tractors: 'ట్రాక్టర్లు',
    fertilizers: 'ఎరువులు',
    instruments: 'పరికరాలు',
    rentPerDay: 'రోజు అద్దె',
    ownerDetails: 'యజమాని వివరాలు',
    centralSchemes: 'కేంద్ర పథకాలు',
    stateSchemes: 'రాష్ట్ర పథకాలు',
    subsidies: 'సబ్సిడీలు',
    howToApply: 'ఎలా దరఖాస్తు చేయాలి',
    eligibility: 'అర్హత',
    banks: 'బ్యాంకులు',
    privateLenders: 'ప్రైవేట్ రుణదాతలు',
    interestRate: 'వడ్డీ రేటు',
    loanAmount: 'రుణ మొత్తం',
    emiCalculator: 'EMI కాలిక్యులేటర్',
    setReminders: 'రిమైండర్లు సెట్ చేయండి',
    maxAmount: 'గరిష్ట మొత్తం',
    tenure: 'కాలవ్యవధి',
    processing: 'ప్రాసెసింగ్',
    soilKit: 'FF నేల పరీక్ష కిట్',
    manualInput: 'మాన్యువల్ ఇన్‌పుట్',
    soilType: 'నేల రకం',
    suitableCrops: 'అనుకూలమైన పంటలు',
    calculateInterest: 'వడ్డీ లెక్కించండి',
    principal: 'అసలు మొత్తం',
    rate: 'వడ్డీ రేటు',
    time: 'కాల వ్యవధి',
    result: 'ఫలితం',
    interest: 'వడ్డీ',
    totalAmount: 'మొత్తం',
    tapToSpeak: 'మాట్లాడటానికి నొక్కండి',
    listening: 'వింటోంది...',
    thinking: 'ఆలోచిస్తోంది...',
    speaking: 'మాట్లాడుతోంది...',
    farmingNews: 'వ్యవసాయ వార్తలు',
    readMore: 'మరింత చదవండి',
    errorOccurred: 'లోపం సంభవించింది',
    tryAgain: 'మళ్ళీ ప్రయత్నించండి',
    noResults: 'ఫలితాలు కనుగొనబడలేదు',
    agriOfficerTitle: 'వ్యవసాయ అధికారి',
    veterinaryOfficer: 'పశువైద్య అధికారి',
    requestVisit: 'సందర్శన అభ్యర్థన',
    pricePerAcre: 'ఎకరా ధర',
    landType: 'భూమి రకం',
    irrigated: 'సాగు నీరు',
    nonIrrigated: 'వర్షాధారం',
    enterLocation: 'ప్రదేశాన్ని నమోదు చేయండి',
    acres: 'ఎకరాలు',
    profitSharing: 'లాభ పంపిణీ',
    investor: 'పెట్టుబడిదారుడు',
    landOwner: 'భూ యజమాని',
    seekingInvestment: 'పెట్టుబడి కోరుతోంది',
    investorAvailable: 'పెట్టుబడిదారుడు అందుబాటులో',
    crop: 'పంట',
    requiredInvestment: 'అవసరమైన పెట్టుబడి',
    expectedReturn: 'అంచనా రాబడి',
    investmentAmount: 'పెట్టుబడి మొత్తం',
    minLandRequired: 'కనీస భూమి అవసరం',
    expectedROI: 'అంచనా ROI',
    workType: 'పని రకం',
    dailyWage: 'రోజు వేతనం',
    duration: 'వ్యవధి',
    workersNeeded: 'కార్మికులు అవసరం',
    labTested: 'ల్యాబ్ పరీక్షించబడింది',
    growthGuarantee: 'పెరుగుదల హామీ',
    refundPolicy: 'వాపసు విధానం',
    fertilizerGuide: 'ఎరువుల గైడ్',
    cropCare: 'పంట సంరక్షణ',
    animalCare: 'జంతు సంరక్షణ',
    onlineClasses: 'ఆన్‌లైన్ తరగతులు',
    offlineClasses: 'ఆఫ్‌లైన్ తరగతులు',
    weekendBatch: 'వారాంతపు బ్యాచ్',
    monthlyBatch: 'నెలవారీ బ్యాచ్',
    classType: 'తరగతి రకం',
    yourPoints: 'మీ పాయింట్లు',
    earnMorePoints: 'మరిన్ని పాయింట్లు సంపాదించండి',
    bookedSessions: 'బుక్ చేసిన సెషన్(లు)',
    almostFull: 'దాదాపు నిండింది',
    enrolledIn: 'మీరు చేరారు',
  },
  hi: {
    appName: 'किसान मित्र',
    tagline: 'तकनीक से किसानों को सशक्त बनाना',
    login: 'लॉगिन',
    signUp: 'साइन अप',
    welcomeBack: 'किसान मित्र में वापस स्वागत है',
    createAccount: 'अपना किसान मित्र खाता बनाएं',
    nameOrPhone: 'नाम या फोन नंबर',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    fullName: 'पूरा नाम',
    phoneNumber: 'फोन नंबर',
    continueWith: 'के साथ जारी रखें',
    google: 'गूगल',
    facebook: 'फेसबुक',
    apple: 'एप्पल',
    voiceAssistant: 'वॉइस सहायता के लिए टैप करें',
    dontHaveAccount: 'खाता नहीं है?',
    alreadyHaveAccount: 'पहले से खाता है?',
    forgotPassword: 'पासवर्ड भूल गए?',
    orContinueWith: 'या इसके साथ जारी रखें',
    emailAddress: 'ईमेल पता',
    loggingIn: 'लॉगिन हो रहा है...',
    signingUp: 'साइन अप हो रहा है...',
    welcomeBackUser: 'वापस स्वागत है,',
    services: 'सेवाएं',
    home: 'होम',
    mitra: 'मित्र',
    search: 'खोजें',
    rewards: 'पुरस्कार',
    profile: 'प्रोफाइल',
    settings: 'सेटिंग्स',
    logout: 'लॉगआउट',
    comingSoon: 'जल्द आ रहा है!',
    connectWithFarmers: 'अपने क्षेत्र के साथी किसानों से जुड़ें।',
    findCropsAndServices: 'फसलें, किसान और सेवाएं खोजें।',
    earnRewardsDesc: 'पुरस्कार और सरकारी लाभ अर्जित करें।',
    cropRates: 'फसल दरें',
    weather: 'मौसम',
    buySell: 'खरीदें और बेचें',
    cattlePets: 'पशु और पालतू',
    agriTools: 'कृषि उपकरण',
    technicians: 'तकनीशियन',
    aiPrediction: 'AI भविष्यवाणी',
    soilTesting: 'मिट्टी परीक्षण',
    govtSchemes: 'सरकारी योजनाएं',
    agriOfficers: 'कृषि अधिकारी',
    loanAssistance: 'ऋण सहायता',
    landRenting: 'भूमि किराया',
    agriInvest: 'कृषि निवेश',
    farmWork: 'खेती का काम',
    ffSeeds: 'FF बीज',
    farmerGuide: 'किसान गाइड',
    weekendFarming: 'सप्ताहांत खेती',
    farmingClasses: 'खेती की कक्षाएं',
    calculator: 'कैलकुलेटर',
    call: 'कॉल करें',
    message: 'संदेश',
    buy: 'खरीदें',
    sell: 'बेचें',
    rent: 'किराया',
    search2: 'खोजें',
    filter: 'फ़िल्टर',
    back: 'वापस',
    submit: 'जमा करें',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    loading: 'लोड हो रहा है...',
    selectLocation: 'स्थान चुनें',
    selectCrop: 'फसल चुनें',
    all: 'सभी',
    allTypes: 'सभी प्रकार',
    allClasses: 'सभी कक्षाएं',
    filterBy: 'फ़िल्टर करें',
    applyNow: 'अभी आवेदन करें',
    viewDetails: 'विवरण देखें',
    buyNow: 'अभी खरीदें',
    bookNow: 'अभी बुक करें',
    booked: 'बुक हो गया',
    enrollNow: 'अभी नामांकन करें',
    enrolled: 'नामांकित',
    claimed: 'प्राप्त किया',
    claim: 'प्राप्त करें',
    hearGuide: 'गाइड सुनें',
    tips: 'सुझाव',
    nearbyMarkets: 'नजदीकी बाजार',
    priceHistory: 'मूल्य इतिहास',
    minPrice: 'न्यूनतम मूल्य',
    maxPrice: 'अधिकतम मूल्य',
    avgPrice: 'औसत मूल्य',
    trend: 'रुझान',
    aiAdvice: 'AI सलाह',
    currentWeather: 'वर्तमान मौसम',
    forecast: 'पूर्वानुमान',
    farmingAdvice: 'खेती सलाह',
    humidity: 'नमी',
    wind: 'हवा',
    rain: 'बारिश',
    temperature: 'तापमान',
    vegetables: 'सब्जियां',
    fruits: 'फल',
    grains: 'अनाज',
    spices: 'मसाले',
    allCategories: 'सभी श्रेणियां',
    pricePerKg: 'किलो का दाम',
    quantity: 'मात्रा',
    quality: 'गुणवत्ता',
    sampleAvailable: 'नमूना उपलब्ध',
    tradeCrops: 'किसानों से सीधे फसल व्यापार करें',
    searchCrops: 'फसलें खोजें...',
    cows: 'गाय',
    buffalos: 'भैंस',
    oxen: 'बैल',
    goats: 'बकरी',
    sheep: 'भेड़',
    pets: 'पालतू जानवर',
    age: 'उम्र',
    healthStatus: 'स्वास्थ्य स्थिति',
    price: 'कीमत',
    electricians: 'इलेक्ट्रीशियन',
    mechanics: 'मैकेनिक',
    experience: 'अनुभव',
    services2: 'सेवाएं',
    available: 'उपलब्ध',
    tractors: 'ट्रैक्टर',
    fertilizers: 'उर्वरक',
    instruments: 'उपकरण',
    rentPerDay: 'प्रति दिन किराया',
    ownerDetails: 'मालिक विवरण',
    centralSchemes: 'केंद्रीय योजनाएं',
    stateSchemes: 'राज्य योजनाएं',
    subsidies: 'सब्सिडी',
    howToApply: 'आवेदन कैसे करें',
    eligibility: 'पात्रता',
    banks: 'बैंक',
    privateLenders: 'निजी ऋणदाता',
    interestRate: 'ब्याज दर',
    loanAmount: 'ऋण राशि',
    emiCalculator: 'EMI कैलकुलेटर',
    setReminders: 'रिमाइंडर सेट करें',
    maxAmount: 'अधिकतम राशि',
    tenure: 'अवधि',
    processing: 'प्रोसेसिंग',
    soilKit: 'FF मिट्टी परीक्षण किट',
    manualInput: 'मैन्युअल इनपुट',
    soilType: 'मिट्टी का प्रकार',
    suitableCrops: 'उपयुक्त फसलें',
    calculateInterest: 'ब्याज की गणना करें',
    principal: 'मूल राशि',
    rate: 'ब्याज दर',
    time: 'समय अवधि',
    result: 'परिणाम',
    interest: 'ब्याज',
    totalAmount: 'कुल राशि',
    tapToSpeak: 'बोलने के लिए टैप करें',
    listening: 'सुन रहा है...',
    thinking: 'सोच रहा है...',
    speaking: 'बोल रहा है...',
    farmingNews: 'कृषि समाचार',
    readMore: 'और पढ़ें',
    errorOccurred: 'एक त्रुटि हुई',
    tryAgain: 'पुनः प्रयास करें',
    noResults: 'कोई परिणाम नहीं मिला',
    agriOfficerTitle: 'कृषि अधिकारी',
    veterinaryOfficer: 'पशु चिकित्सा अधिकारी',
    requestVisit: 'दौरे का अनुरोध',
    pricePerAcre: 'एकड़ की कीमत',
    landType: 'भूमि प्रकार',
    irrigated: 'सिंचित',
    nonIrrigated: 'असिंचित',
    enterLocation: 'स्थान दर्ज करें',
    acres: 'एकड़',
    profitSharing: 'लाभ साझाकरण',
    investor: 'निवेशक',
    landOwner: 'भूमि मालिक',
    seekingInvestment: 'निवेश की तलाश',
    investorAvailable: 'निवेशक उपलब्ध',
    crop: 'फसल',
    requiredInvestment: 'आवश्यक निवेश',
    expectedReturn: 'अपेक्षित रिटर्न',
    investmentAmount: 'निवेश राशि',
    minLandRequired: 'न्यूनतम भूमि आवश्यक',
    expectedROI: 'अपेक्षित ROI',
    workType: 'काम का प्रकार',
    dailyWage: 'दैनिक मजदूरी',
    duration: 'अवधि',
    workersNeeded: 'कार्यकर्ता चाहिए',
    labTested: 'लैब परीक्षित',
    growthGuarantee: 'विकास गारंटी',
    refundPolicy: 'वापसी नीति',
    fertilizerGuide: 'उर्वरक गाइड',
    cropCare: 'फसल देखभाल',
    animalCare: 'पशु देखभाल',
    onlineClasses: 'ऑनलाइन कक्षाएं',
    offlineClasses: 'ऑफलाइन कक्षाएं',
    weekendBatch: 'सप्ताहांत बैच',
    monthlyBatch: 'मासिक बैच',
    classType: 'कक्षा प्रकार',
    yourPoints: 'आपके अंक',
    earnMorePoints: 'और अंक कमाएं',
    bookedSessions: 'बुक किए गए सत्र',
    almostFull: 'लगभग भरा हुआ',
    enrolledIn: 'आपने नामांकन किया है',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  te: 'తెలుగు',
  hi: 'हिंदी',
};

export type { Language };
