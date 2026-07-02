export const COMPANY_STATUSES = [
  "Interested",
  "Applied",
  "OA Scheduled",
  "OA Cleared",
  "Interview",
  "HR Round",
  "Selected",
  "Rejected",
  "Offer Received",
] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export type Company = {
  id: string;
  name: string;
  role: string;
  ctc: string;
  location: string;
  eligibility: string;
  deadline: string; // ISO date
  status: CompanyStatus;
  interviewDate?: string;
  tags: string[];
  link?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Resume = {
  id: string;
  label: string;
  version: string;
  targetRole: string;
  atsScore: number;
  notes: string;
  fileName?: string;
  fileDataUrl?: string;
  updatedAt: string;
};

export type Offer = {
  id: string;
  companyId?: string;
  companyName: string;
  role: string;
  base: number;
  bonus: number;
  stock: number;
  location: string;
  joiningDate: string;
  status: "Pending" | "Accepted" | "Declined";
  fileName?: string;
  fileDataUrl?: string;
  notes?: string;
  createdAt: string;
};

export type Note = {
  id: string;
  type: "Interview Experience" | "Company Notes" | "Salary Notes";
  title: string;
  company: string;
  body: string;
  createdAt: string;
};

export type Settings = {
  leetcodeUsername: string;
  githubUsername: string;
};

export type LeetCodeStats = {
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
  ranking?: number;
  fetchedAt: string;
} | null;

export type GitHubStats = {
  totalContributions: number;
  streak: number;
  last12Weeks: { date: string; count: number }[];
  fetchedAt: string;
} | null;
