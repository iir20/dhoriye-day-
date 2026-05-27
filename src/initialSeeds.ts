import { CorruptionReport } from './types';

export const INITIAL_SEEDS: CorruptionReport[] = [
  {
    id: "REP-9810-BD",
    title: "Bribery Demand at Land Registration Sub-Registry Office",
    category: "Bribery",
    ministry: "Ministry of Land",
    division: "Dhaka",
    district: "Dhaka",
    location: "Tejgaon Sub-Registry Office, Dhaka",
    date: "2026-05-12",
    involvedPeople: "Sub-Registrar Deputy and Desk Clerks",
    description: "During a routine commercial property registration, a flat speed money of 50,000 Taka was demanded off-the-books under the guise of an 'expediting fee'. The clerk refused to process the deed without cash-in-hand transaction. When documented video evidence was hinted, physical access to the room was restricted.",
    evidence: [
      {
        name: "bribe_ledger_covert.jpg",
        size: 142400,
        type: "image/jpeg",
        contentUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400"
      }
    ],
    isAnonymous: true,
    upvotes: 42,
    downvotes: 1,
    status: "APPROVED",
    createdAt: "2026-05-12T10:30:00Z",
    lat: 23.8103,
    lng: 90.4125,
    aiAnalysis: {
      spamConfidence: 12,
      toxicPercent: 4,
      credibilityScore: 89,
      isAuthentic: true,
      priority: "HIGH",
      analysisSummary: "This report includes specific locations, logical timeline context, and an attached photo showing transactional records. High probability of authentic institutional bribe coercion.",
      flaggedKeywords: ["expediting", "speed money", "deed", "land"],
      reviewedAt: "2026-05-12T11:15:00Z"
    },
    timeline: [
      {
        status: "RECORD_CREATED",
        description: "Anonymous encrypted node lodged allegation file.",
        timestamp: "2026-05-12T10:30:00Z"
      },
      {
        status: "AI_VERIFIED",
        description: "Gemini AI model audited report credibility at 89%. spam risk is clear.",
        timestamp: "2026-05-12T11:15:00Z"
      },
      {
        status: "UNDER_INVESTIGATION",
        description: "Assigned to independent anti-corruption auditing panel.",
        timestamp: "2026-05-13T09:00:00Z"
      },
      {
        status: "APPROVED",
        description: "Dhoraiya De central desk authenticated with surrounding local press corroboration.",
        timestamp: "2026-05-14T15:30:00Z"
      }
    ]
  },
  {
    id: "REP-4315-BD",
    title: "Embezzlement in Cyclone Shelter Construction Funding",
    category: "Embezzlement",
    ministry: "Ministry of Disaster Management and Relief",
    division: "Chittagong",
    district: "Cox's Bazar",
    location: "Chakaria Cyclone Center Site, Cox's Bazar",
    date: "2026-04-20",
    involvedPeople: "Local Union Parishad Chairman and Primary Contractor",
    description: "Out of a sanctioned budget of 8.5 Crore Taka for building a double-story reinforced cyclone shelter, sub-standard materials (low-grade brick chips and brittle iron rods) were used. Concrete core tests show structure failure density. It is suspected that over 2 Crore Taka was siphoned Off-shore through ghost contractor bills.",
    evidence: [],
    isAnonymous: false,
    reporterName: "Er. Sayed Rahman (Civil Investigator)",
    upvotes: 89,
    downvotes: 0,
    status: "UNDER_INVESTIGATION",
    createdAt: "2026-04-20T14:15:00Z",
    lat: 21.4272,
    lng: 92.0058,
    aiAnalysis: {
      spamConfidence: 8,
      toxicPercent: 1,
      credibilityScore: 94,
      isAuthentic: true,
      priority: "EXTREME",
      analysisSummary: "Extremely serious allegation submitted with engineering measurements and specific financial figures. Strong indications of systemic embezzlement that compromises human safety.",
      flaggedKeywords: ["siphoned", "embellish", "concrete", "contractor", "disaster"],
      reviewedAt: "2026-04-20T15:00:00Z"
    },
    timeline: [
      {
        status: "RECORD_CREATED",
        description: "Public disclosure filed under non-anonymous credential.",
        timestamp: "2026-04-20T14:15:00Z"
      },
      {
        status: "AI_VERIFIED",
        description: "Gemini audited safety hazard priority as extreme.",
        timestamp: "2026-04-20T15:00:00Z"
      },
      {
        status: "UNDER_INVESTIGATION",
        description: "Citizen verification committee dispatched for field-level concrete compression tests.",
        timestamp: "2026-04-22T08:00:00Z"
      }
    ]
  },
  {
    id: "REP-2018-BD",
    title: "Ghost Procurement in Sylhet Government Hospital Supply Chain",
    category: "Procurement Fraud",
    ministry: "Ministry of Health and Family Welfare",
    division: "Sylhet",
    district: "Sylhet",
    location: "M.A.G. Osmani Medical College Hospital, Sylhet",
    date: "2026-05-18",
    involvedPeople: "Supply-Chain Procurement Director & Elite Supplier Consortium",
    description: "Official documents state the acquisition of 5 units of advanced MRI scanning machines valued at 12 Crore Taka each. However, inventory logs confirm only 2 physical scanners were installed, with the other 3 existing strictly as 'virtual paper assets'. Dummy invoices were certified as received by the local desk.",
    evidence: [],
    isAnonymous: true,
    upvotes: 61,
    downvotes: 2,
    status: "AI_VERIFIED",
    createdAt: "2026-05-18T08:45:00Z",
    lat: 24.8949,
    lng: 91.8687,
    aiAnalysis: {
      spamConfidence: 15,
      toxicPercent: 2,
      credibilityScore: 82,
      isAuthentic: true,
      priority: "HIGH",
      analysisSummary: "Claims match public budget allocations. The presence of specific inventory details and scanner model details indicates structural inside intelligence. High severity.",
      flaggedKeywords: ["MRI", "procurement", "acquisition", "medical"],
      reviewedAt: "2026-05-18T10:00:00Z"
    },
    timeline: [
      {
        status: "RECORD_CREATED",
        description: "Encrypted submission log successfully saved.",
        timestamp: "2026-05-18T08:45:00Z"
      },
      {
        status: "AI_VERIFIED",
        description: "Enrolled in active ledger after pass through Gemini analysis flow.",
        timestamp: "2026-05-18T10:00:00Z"
      }
    ]
  },
  {
    id: "REP-3342-BD",
    title: "Illegal Toll Extortion Rackeet at Jashore Cargo Terminal",
    category: "Extortion",
    ministry: "Ministry of Road Transport and Bridges",
    division: "Khulna",
    district: "Jessore",
    location: "Benapole Land Port Freight Yards, Jashore",
    date: "2026-05-24",
    involvedPeople: "Local Transport Syndicate Supervisors",
    description: "Every cross-border cargo truck entering the Jashore highway is forced to pay 5,000 Taka to local un-authorized collectors. Failure to pay result in driver assault or off-loading delayed for days. Local police refuse to file complaints, claiming the transport committee handles all yard issues.",
    evidence: [],
    isAnonymous: true,
    upvotes: 35,
    downvotes: 1,
    status: "APPROVED",
    createdAt: "2026-05-24T11:20:00Z",
    lat: 23.1634,
    lng: 89.2182,
    aiAnalysis: {
      spamConfidence: 22,
      toxicPercent: 7,
      credibilityScore: 78,
      isAuthentic: true,
      priority: "MEDIUM",
      analysisSummary: "Extortion allegations corroborated by recent truck driver strike actions in Benapole. Systemic extortion syndicate likely operating with regional municipal backing.",
      flaggedKeywords: ["extortion", "Benapole", "toll", "freight"],
      reviewedAt: "2026-05-24T12:00:00Z"
    },
    timeline: [
      {
        status: "RECORD_CREATED",
        description: "Allegation intercepted in secure payload queue.",
        timestamp: "2026-05-24T11:20:00Z"
      },
      {
        status: "AI_VERIFIED",
        description: "Threat priority elevated to MEDIUM based on transport union disruptions.",
        timestamp: "2026-05-24T12:00:00Z"
      },
      {
        status: "APPROVED",
        description: "Approved for public visibility after media and transport strike validation.",
        timestamp: "2026-05-25T14:00:00Z"
      }
    ]
  }
];
