import type { CompanyStatus } from "./types";

export function statusColor(status: CompanyStatus): string {
  switch (status) {
    case "Interested":
      return "border-muted-foreground/30 text-muted-foreground";
    case "Applied":
      return "border-info/40 text-info";
    case "OA Scheduled":
      return "border-warning/40 text-warning";
    case "OA Cleared":
      return "border-warning/60 text-warning";
    case "Interview":
      return "border-info/60 text-info";
    case "HR Round":
      return "border-info/60 text-info";
    case "Selected":
    case "Offer Received":
      return "border-primary/60 text-primary bg-primary/10";
    case "Rejected":
      return "border-destructive/40 text-destructive";
    default:
      return "";
  }
}

export function formatINR(n: number): string {
  if (!n) return "—";
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}
