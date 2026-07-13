import Section from "@/components/globals/section";
import PricingCard from "@/components/landing-page/pricing/pricing-card";
import { isPopularPlan, pricingPlans } from "@/constants/pricing";
import { cn } from "@/lib/utils";

function Pricing() {
  return (
    <Section
      id="pricing"
      className="from-background to-primary min-h-screen bg-gradient-to-b"
    >
      <Section.Header>
        <Section.Title>Price that suits your needs</Section.Title>
        <Section.Description>
          A more effective way to track progress, make every task a meaningful
          step toward success.
        </Section.Description>
      </Section.Header>

      <Section.Body className="grid grid-cols-1 items-center justify-items-center gap-6 md:grid-cols-3 md:justify-items-normal">
        {pricingPlans.map((p) => (
          <PricingCard className="w-full max-w-sm" key={p.id} {...p}>
            <PricingCard.Header>
              <div className="flex items-center justify-between">
                <h3
                  className={cn(
                    "font-heading font-semibold capitalize",
                    p.plan === isPopularPlan?.plan &&
                      "bg-gradient-to-br from-emerald-400/80 via-indigo-500/75 to-rose-400/70 bg-clip-text text-transparent",
                  )}
                >
                  {p.plan}
                </h3>

                {p.badge ? (
                  <PricingCard.SubHeader>
                    <PricingCard.Badge>{p.badge}</PricingCard.Badge>
                  </PricingCard.SubHeader>
                ) : null}
              </div>

              <div className="flex flex-col gap-4">
                <PricingCard.Price>{p.price}</PricingCard.Price>
                <PricingCard.Button>{p.cta}</PricingCard.Button>
              </div>
            </PricingCard.Header>

            <PricingCard.FeaturesList />
          </PricingCard>
        ))}
      </Section.Body>
    </Section>
  );
}

export default Pricing;
