import { Bell, Goal, Leaf, Lock, type LucideIcon } from "lucide-react";

export interface FeaturesTypes {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const featuresInfo: FeaturesTypes[] = [
  {
    title: "Goal setting and tracking",
    description:
      "Define and track your goals, breaking down objectives into achievable tasks to keep your targets in sight.",
    icon: Goal,
  },
  {
    title: "Integration ecosystem",
    description:
      "Enhance your productivity by connecting with your favorite tools, keeping all your essentials in one place.",
    icon: Leaf,
  },
  {
    title: "Secure data encryption",
    description:
      "With end-to-end encryption, your data is securely stored and protected from unauthorized access.",
    icon: Lock,
  },
  {
    title: "Customizable notifications",
    description: "Get alerts on tasks and deadlines that matter most.",
    icon: Bell,
  },
];
