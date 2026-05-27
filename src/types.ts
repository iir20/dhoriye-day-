export type CorruptionCategory = 'Bribery' | 'Embezzlement' | 'Extortion' | 'Nepotism' | 'Power Abuse' | 'Procurement Fraud';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';

export interface EvidenceFile {
  name: string;
  size: number;
  type: string;
  contentUrl: string; // simulated or real data url
}

export interface AIAnalysis {
  spamConfidence: number;      // 0 - 100
  toxicPercent: number;         // 0 - 100
  credibilityScore: number;     // 0 - 100
  isAuthentic: boolean;
  priority: SeverityLevel;
  analysisSummary: string;
  flaggedKeywords: string[];
  reviewedAt: string;
}

export interface CorruptionReport {
  id: string;
  title: string;
  category: CorruptionCategory;
  ministry: string;
  district: string;
  division: string;
  location: string;
  date: string;
  involvedPeople: string;
  description: string;
  evidence: EvidenceFile[];
  isAnonymous: boolean;
  reporterName?: string;
  upvotes: number; // True votes
  downvotes: number; // False votes
  votedUserIds?: string[]; // track who voted
  aiAnalysis?: AIAnalysis;
  status: 'PENDING' | 'AI_VERIFIED' | 'UNDER_INVESTIGATION' | 'SPAM' | 'APPROVED';
  createdAt: string;
  lat?: number;
  lng?: number;
  timeline: {
    status: string;
    description: string;
    timestamp: string;
  }[];
}

export interface MinistryStats {
  name: string;
  totalReports: number;
  bribesReported: number;
  credibilityRate: number; // percentage verified
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
