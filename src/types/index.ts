// Complaint / Ticket types
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  assignedTo?: string;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: Date;
}
