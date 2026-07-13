export type PlanDuration = "monthly" | "yearly" | "weekly";
export const PLANS = ["free", "flex", "premium"] as const;
export type PlanName = (typeof PLANS)[number];

export type PricingPlan = {
  id: string;
  plan: PlanName;
  price: number;
  to: string;
  currency?: string;
  duration?: PlanDuration;
  cta?: string;
  badge?: string | null;
  features: string[];
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "plan-free",
    plan: "free",
    to: "/signup/modal",
    price: 0,
    currency: "$",
    duration: "monthly",
    cta: "Get Started",
    badge: null,
    features: [
      "Up to 5 project members",
      "Unlimited tasks and projects",
      "2GB storage",
      "Basic support",
    ],
  },
  {
    id: "plan-basic",
    plan: "flex",
    price: 3,
    currency: "$",
    to: "/signup/modal",

    duration: "monthly",
    cta: "Signup now!",
    badge: "Most popular",
    features: [
      "Up to 50 project members",
      "Unlimited tasks and projects",
      "50GB storage",
      "Integrations",
      "Priority support",
    ],
  },
  {
    id: "plan-pro",
    plan: "premium",
    price: 7,
    currency: "$",
    to: "/signup/modal",
    duration: "monthly",
    cta: "Get Started",
    badge: null,
    features: [
      "Unlimited project members",
      "Unlimited tasks and projects",
      "100GB storage",
      "Integrations",
      "Dedicated account manager",
      "Custom fields",
      "Advanced analytics",
    ],
  },
];

export const isPopularPlan = pricingPlans.find((p) => p.plan === "flex");
