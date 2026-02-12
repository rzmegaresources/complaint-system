const fs = require("fs");
const path = require("path");

const directories = [
  // Authentication Group
  "src/app/(auth)/login",
  "src/app/(auth)/register",

  // Dashboard Group
  "src/app/(dashboard)/admin",
  "src/app/(dashboard)/user",

  // API Routes
  "src/app/api/tickets/create",
  "src/app/api/tickets/list",
  "src/app/api/chat/send",
  "src/app/api/rag/upload",
  "src/app/api/admin/analytics",

  // Core Libraries
  "src/lib/db",
  "src/lib/ai",
  "src/lib/utils",

  // Components
  "src/components/ui",
  "src/components/forms",
  "src/components/layout",
  "src/components/charts",

  // Types
  "src/types",
];

const placeholderFiles = [
  // Dashboard layout
  {
    path: "src/app/(dashboard)/layout.tsx",
    content: `export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex min-h-screen">{children}</div>;
}
`,
  },
  // Auth pages
  {
    path: "src/app/(auth)/login/page.tsx",
    content: `export default function LoginPage() {
  return <div>Login Page</div>;
}
`,
  },
  {
    path: "src/app/(auth)/register/page.tsx",
    content: `export default function RegisterPage() {
  return <div>Register Page</div>;
}
`,
  },
  // Dashboard pages
  {
    path: "src/app/(dashboard)/admin/page.tsx",
    content: `export default function AdminDashboard() {
  return <div>Admin Dashboard</div>;
}
`,
  },
  {
    path: "src/app/(dashboard)/user/page.tsx",
    content: `export default function UserDashboard() {
  return <div>User Dashboard</div>;
}
`,
  },
  // API Route handlers
  {
    path: "src/app/api/tickets/create/route.ts",
    content: `import { NextResponse } from "next/server";

export async function POST(req: Request) {
  return NextResponse.json({ message: "Create ticket endpoint" });
}
`,
  },
  {
    path: "src/app/api/tickets/list/route.ts",
    content: `import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return NextResponse.json({ message: "List tickets endpoint" });
}
`,
  },
  {
    path: "src/app/api/chat/send/route.ts",
    content: `import { NextResponse } from "next/server";

export async function POST(req: Request) {
  return NextResponse.json({ message: "Chat send endpoint" });
}
`,
  },
  {
    path: "src/app/api/rag/upload/route.ts",
    content: `import { NextResponse } from "next/server";

export async function POST(req: Request) {
  return NextResponse.json({ message: "RAG upload endpoint" });
}
`,
  },
  {
    path: "src/app/api/admin/analytics/route.ts",
    content: `import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return NextResponse.json({ message: "Admin analytics endpoint" });
}
`,
  },
  // Lib files
  {
    path: "src/lib/db/prisma.ts",
    content: `import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
`,
  },
  {
    path: "src/lib/ai/gemini.ts",
    content: `import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-pro",
});

export default genAI;
`,
  },
  {
    path: "src/lib/utils/cn.ts",
    content: `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`,
  },
  // Types
  {
    path: "src/types/index.ts",
    content: `// Complaint / Ticket types
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
`,
  },
];

console.log("🏗️  Creating project architecture...\n");

// Create directories
directories.forEach((dir) => {
  const fullPath = path.join(__dirname, dir);
  fs.mkdirSync(fullPath, { recursive: true });
  console.log(`  📁 Created: ${dir}`);
});

console.log("");

// Create placeholder files
placeholderFiles.forEach((file) => {
  const fullPath = path.join(__dirname, file.path);
  const dir = path.dirname(fullPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, file.content);
  console.log(`  📄 Created: ${file.path}`);
});

console.log("\n✅ Architecture setup complete!");
console.log("   Total directories: " + directories.length);
console.log("   Total files: " + placeholderFiles.length);
