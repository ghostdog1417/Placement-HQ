import type { Company, Resume, Offer, Note } from "./types";

const now = new Date();
const iso = (daysFromNow: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
};

export const seedCompanies: Company[] = [
  {
    id: "seed-c-1",
    name: "Google",
    role: "SWE Intern",
    ctc: "₹1.8L/mo",
    location: "Bangalore",
    eligibility: "CGPA ≥ 8.0",
    deadline: iso(7),
    status: "Applied",
    interviewDate: iso(14),
    tags: ["Tier-1", "Dream"],
    link: "https://careers.google.com",
    notes: "Referral from senior. Focus on DP + graphs.",
    createdAt: iso(-10),
    updatedAt: iso(-2),
  },
  {
    id: "seed-c-2",
    name: "Atlassian",
    role: "Software Engineer",
    ctc: "₹32 LPA",
    location: "Bangalore",
    eligibility: "All branches",
    deadline: iso(3),
    status: "OA Scheduled",
    interviewDate: iso(5),
    tags: ["Tier-1"],
    link: "https://atlassian.com/careers",
    createdAt: iso(-6),
    updatedAt: iso(-1),
  },
  {
    id: "seed-c-3",
    name: "Zoho",
    role: "Member Technical Staff",
    ctc: "₹9 LPA",
    location: "Chennai",
    eligibility: "60% throughout",
    deadline: iso(-2),
    status: "Interview",
    tags: ["Tier-2"],
    createdAt: iso(-15),
    updatedAt: iso(-3),
  },
  {
    id: "seed-c-4",
    name: "Razorpay",
    role: "Backend Engineer",
    ctc: "₹24 LPA",
    location: "Bangalore",
    eligibility: "CGPA ≥ 7.5",
    deadline: iso(10),
    status: "Interested",
    tags: ["Fintech"],
    createdAt: iso(-1),
    updatedAt: iso(-1),
  },
];

export const seedResumes: Resume[] = [
  {
    id: "seed-r-1",
    label: "SWE — General",
    version: "v3",
    targetRole: "Software Engineer",
    atsScore: 82,
    notes: "Emphasized system design projects.",
    updatedAt: iso(-4),
  },
  {
    id: "seed-r-2",
    label: "Data Roles",
    version: "v1",
    targetRole: "Data Analyst",
    atsScore: 71,
    notes: "SQL + Python focused variant.",
    updatedAt: iso(-20),
  },
];

export const seedOffers: Offer[] = [
  {
    id: "seed-o-1",
    companyName: "Zoho",
    role: "MTS",
    base: 900000,
    bonus: 50000,
    stock: 0,
    location: "Chennai",
    joiningDate: iso(90),
    status: "Pending",
    createdAt: iso(-3),
  },
];

export const seedNotes: Note[] = [
  {
    id: "seed-n-1",
    type: "Interview Experience",
    title: "Google — Round 1",
    company: "Google",
    body: "Two DSA problems: sliding window + trees. 45 min each. Interviewer friendly, expected verbal walkthrough before code.",
    createdAt: iso(-5),
  },
];
