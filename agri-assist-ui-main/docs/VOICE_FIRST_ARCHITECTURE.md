# Farmer Application – Voice-First System Architecture (No Login, Multi-Language)

**Fully integrated AI Voice Assistant | English, Hindi, Telugu | No authentication | Voice-only lifecycle**

---

## 1. End-to-End Voice-Only Lifecycle (Sequential Flow)

```mermaid
flowchart LR
    subgraph User
        A[Farmer/User speaks]
    end
    subgraph Capture
        B[Voice Capture Interface]
    end
    subgraph Processing
        C[Auto Language Detection]
        D[Multi-Lang STT]
        E[Noise Filter & Accent]
        F[NLU: Intent + Entities]
        G[LLM AI Agent]
        H[Session Context Manager]
        I[Intent Router]
    end
    subgraph Backend
        J[API Gateway]
        K[Microservices]
        L[DBs & External APIs]
    end
    subgraph Response
        M[AI Response Composer]
        N[Translation Layer]
        O[TTS EN/HI/TE]
        P[Voice Response]
    end
    A --> B --> C --> D --> E --> F --> G --> H --> I --> J --> K --> L
    L --> K --> J --> M --> N --> O --> P --> A
```

---

## 2. Detailed Voice Pipeline (Step-by-Step)

```mermaid
flowchart TB
    subgraph Entry["🎤 ENTRY POINT – Voice Commands (No Login)"]
        V1["EN: What is today's tomato price?"]
        V2["HI: आज मेरे जिले की मौसम रिपोर्ट बताओ"]
        V3["TE: నా భూమికి సరిపోయే పంట ఏది?"]
    end

    subgraph VoiceCapture["Voice Capture Interface"]
        MIC[Microphone - Mobile/Web]
        VAD[Voice Activity Detection]
    end

    subgraph LangSpeech["Language & Speech"]
        LID[Automatic Language Detection Engine]
        STT[Multi-Language Speech-to-Text]
        NF[Noise Filtering & Accent Normalization]
    end

    subgraph Understanding["Natural Language Understanding"]
        IC[Intent Classification]
        EE[Entity Extraction]
    end

    subgraph Orchestration["AI Orchestration (No Login)"]
        LLM[LLM-based AI Agent]
        SCM[Session Context Manager - Anonymous]
        CONV[Conversational Memory]
        LOC[Location-Based Intelligence]
    end

    subgraph Routing["Intent Router"]
        ROUTER[Route by Intent]
    end

    subgraph Gateway["API Layer"]
        GW[API Gateway]
        LB[Load Balancer]
        CACHE[Caching Layer]
    end

    subgraph Services["Backend Microservices"]
        CS[Crop Service]
        WS[Weather Service]
        MS[Market Service]
        FS[Finance Service]
        KS[Knowledge Service]
        MAP[Map/Location Service]
    end

    subgraph Data["Data & External APIs"]
        DB[(Databases)]
        EXT[External APIs - Agmarknet, IMD, etc.]
    end

    subgraph Compose["Response Pipeline"]
        COMP[AI Response Composer]
        TRANS[Language Translation Layer]
        TTS[TTS - English / Hindi / Telugu]
    end

    Entry --> MIC --> VAD --> LID --> STT --> NF --> IC --> EE
    EE --> LLM --> SCM --> ROUTER --> GW --> LB
    LB --> CACHE
    CACHE --> CS & WS & MS & FS & KS & MAP
    CS & WS & MS & FS & KS & MAP --> DB & EXT
    DB & EXT --> COMP --> TRANS --> TTS --> FARMER[Farmer hears response]
    SCM --> CONV
    SCM --> LOC
```

---

## 3. Voice-Accessible Features (Intent → Service Mapping)

| Feature | Voice Intent Examples | Backend Service | Notes |
|--------|------------------------|-----------------|--------|
| **Crop Prices** | "What is tomato price?", "चावल की कीमत?" | Crop Service | Agmarknet/Govt API |
| **Weather** | "मौसम रिपोर्ट बताओ", "Weather today?" | Weather Service | IMD/OpenWeather |
| **Buy & Sell Crops** | "I want to sell paddy", "Buy tomato" | Market Service | Listings, contact |
| **Cattle & Pets** | "Sell buffalo", "Buy goats" | Market Service | Livestock listings |
| **Agri Tools** | "Rent tractor", "Sprayer available?" | Market Service | Tools, booking |
| **Technicians** | "Find electrician for pump", "Technician near me" | Knowledge / Map Service | Directory, location |
| **AI Prediction** | "Best crop for my soil?", "Yield prediction" | Knowledge Service + LLM | AI + rules |
| **Soil Test** | "Soil test report", "Recommend crop for my soil" | Knowledge Service | Reports, recommendations |
| **Government Schemes** | "Govt schemes for farmers", "Subsidy eligibility" | Finance / Knowledge Service | Schemes DB |
| **Agri Officers** | "Contact agriculture officer", "Officer in my district" | Knowledge Service | Directory |
| **Loans** | "Loan eligibility", "KCC loan" | Finance Service | Banks, EMI |
| **Land Rent** | "Rent out land", "Land for rent" | Market Service | Land listings |
| **Agri Invest** | "Investment opportunities", "Farmer seeking investor" | Finance / Market Service | Proposals |
| **Farm Work** | "Post job", "Find farm workers" | Market Service | Jobs |
| **FF Seeds** | "Seed catalog", "Order seeds" | Market Service | Catalog, orders |
| **Farmer Guide** | "How to grow paddy?", "Organic farming tips" | Knowledge Service | CMS, multilingual |
| **Weekend Farm** | "Book weekend farm", "Farming experience" | Market Service | Bookings |
| **Classes** | "Farming classes", "Enroll in course" | Knowledge Service | Courses, enrollment |
| **Calculator** | "Fertilizer for 2 acres", "Profit calculator" | Knowledge Service | In-app calc engine |
| **Rewards** | "My points", "Redeem rewards" | Finance / Session | Points, redemption |
| **Map View** | "Farms near me", "Markets in district" | Map Service | OSM/Google, markers |

---

## 4. Session & Identity (No Login)

```mermaid
flowchart TB
    subgraph NoAuth["No Authentication / No Login"]
        TMP[Temporary Voice Session ID]
        DEV[Device / Browser Fingerprint - Optional]
        GEO[Location - GPS / District]
    end

    subgraph Context["Session Context Manager"]
        SID[Session ID - Anonymous]
        HISTORY[Conversational Memory - last N turns]
        PREF[Detected Language Preference]
        LOC_CACHE[Cached Location]
    end

    subgraph Intelligence["Location-Based Intelligence"]
        DISTRICT[District from voice or GPS]
        STATE[State]
        USE[Used for: prices, weather, schemes, officers]
    end

    TMP --> SID
    DEV --> SID
    GEO --> LOC_CACHE
    SID --> HISTORY
    SID --> PREF
    LOC_CACHE --> DISTRICT --> STATE --> USE
```

- **Temporary voice session**: Created on first utterance; expires after inactivity (e.g. 30 min).
- **Conversational memory**: Last few turns kept in session for follow-up questions (no login DB).
- **Location**: From “my district” in voice or device GPS; used for weather, prices, schemes, officers.

---

## 5. Scalability & Reliability

```mermaid
flowchart TB
    subgraph Clients["Clients"]
        M[Mobile App]
        W[Web / PWA]
    end

    subgraph Edge["Edge & Gateway"]
        LB2[Load Balancer]
        GW2[API Gateway]
        THROTTLE[Rate Limiting / Throttling]
    end

    subgraph Compute["Compute"]
        V1[Voice Service]
        V2[Voice Service]
        A1[AI Agent]
        A2[AI Agent]
    end

    subgraph DataLayer["Data & Cache"]
        REDIS[(Caching Layer)]
        DB2[(Primary DB)]
        REPLICA[(Read Replicas)]
    end

    subgraph External["External"]
        CLOUD_AI[Cloud AI - STT/TTS/LLM]
        EXT_API[External APIs]
    end

    subgraph Reliability["Reliability"]
        ERR[Error Handling & Fallbacks]
        VOICE_FB[Voice Fallback Responses]
        OFFLINE[Offline / Low-Network Handling]
        LOG[Analytics & Logging]
    end

    M & W --> LB2 --> GW2 --> THROTTLE
    THROTTLE --> V1 & V2 & A1 & A2
    V1 & V2 --> CLOUD_AI
    A1 & A2 --> REDIS --> DB2
    A1 & A2 --> EXT_API
    DB2 --> REPLICA
    V1 & V2 & A1 & A2 --> ERR --> VOICE_FB
    ERR --> OFFLINE
    V1 & V2 & A1 & A2 --> LOG
```

| Component | Role |
|-----------|------|
| **API Gateway** | Single entry, routing, auth (optional), rate limit. |
| **Load Balancer** | Distribute voice and agent traffic. |
| **Caching Layer** | Cache crop prices, weather, scheme list by location. |
| **Microservices** | Crop, Weather, Market, Finance, Knowledge, Map. |
| **Cloud AI Services** | STT, TTS, LLM (e.g. Whisper, multilingual TTS, GPT/Claude). |
| **Error Handling** | Timeouts, retries, fallback answers. |
| **Voice Fallback** | “Sorry, I couldn’t get prices. Try again or say your district.” |
| **Offline / Low-Network** | “Connectivity is low. I’ll answer from cached data.” or queue and retry. |
| **Analytics / Logging** | Anonymized intents, success/failure, latency (no PII). |

---

## 6. Voice Command Examples at Entry Point

| Language | Example Command | Intent |
|----------|-----------------|--------|
| **English** | What is today’s tomato price? | Crop Prices |
| **English** | Weather in my district. | Weather |
| **English** | Which crop suits my land? | AI Prediction / Soil |
| **Hindi** | आज मेरे जिले की मौसम रिपोर्ट बताओ | Weather |
| **Hindi** | चावल की कीमत क्या है? | Crop Prices |
| **Hindi** | सरकारी योजना बताओ | Government Schemes |
| **Telugu** | నా భూమికి సరిపోయే పంట ఏది? | AI Prediction / Soil |
| **Telugu** | ఈ రోజు వేరుకెల ఎంత? | Crop Prices |
| **Telugu** | వాతావరణ సమాచారం చెప్పండి | Weather |

---

## 7. AI Agent Flow (Intent → Data → Response)

```mermaid
sequenceDiagram
    participant U as Farmer
    participant V as Voice Interface
    participant A as AI Agent
    participant R as Intent Router
    participant CS as Crop Service
    participant WS as Weather Service
    participant MS as Market Service
    participant KS as Knowledge Service

    U->>V: Speaks (e.g. "Tomato price?")
    V->>A: Text + Language + Session + Location
    A->>A: NLU: intent=crop_price, entity=crop=tomato
    A->>R: intent, entities, location
    R->>CS: getPrice(tomato, district)
    CS->>CS: Agmarknet/DB
    CS-->>R: price, market, date
    R-->>A: structured data
    A->>A: Compose reply in user language
    A-->>V: Response text (EN/HI/TE)
    V->>V: TTS
    V->>U: Voice response
```

---

## 8. Summary Diagram – Full System

```mermaid
flowchart TB
    FARMER[Farmer - No Login]
    VOICE[Voice Capture]
    LID[Language Detection]
    STT[STT]
    NLU[NLU]
    AGENT[LLM AI Agent]
    SESSION[Session + Location + Memory]
    ROUTER[Intent Router]
    GW[API Gateway]
    SVCS[Microservices]
    DATA[DBs + APIs]
    COMPOSE[Response Composer]
    TRANS[Translate to User Lang]
    TTS[TTS]
    FARMER --> VOICE --> LID --> STT --> NLU --> AGENT
    AGENT --> SESSION
    AGENT --> ROUTER --> GW --> SVCS --> DATA
    DATA --> SVCS --> COMPOSE --> TRANS --> TTS --> FARMER
```

---

This document describes a **voice-first, no-login, multi-language (English, Hindi, Telugu)** architecture for the Farmer Application, with all listed features accessible via voice, session and location-based context, and scalable backend and reliability components.
