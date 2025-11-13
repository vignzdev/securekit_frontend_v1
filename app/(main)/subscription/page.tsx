"use client";

import { Check } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getSubscriptionPlans, createCheckout } from "@/app/api/subscription";

interface PricingPlan {
  name: string;
  badge: string;
  monthlyPrice: string;
  description: string;
  features: string[];
  benefits: string[];
  buttonText: string;
  isPopular?: boolean;
  variantId?: string | null;
  id?: string;
  billingPeriod: "MONTHLY" | "YEARLY";
}

export default function SubscriptionPage() {
  const [allPlans, setAllPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const subscriptionPlans = await getSubscriptionPlans();

        // Transform API data to match PricingPlan interface
        const transformedPlans: PricingPlan[] = subscriptionPlans.map(
          (plan) => {
            return {
              name: plan.name,
              badge: plan.name,
              monthlyPrice: `$${plan.monthly_price}`,
              description: plan.plan_description?.short || "",
              features: plan.plan_description?.features || [],
              benefits: plan.plan_description?.benefits || [],
              buttonText:
                plan.monthly_price === "0" ? "Get Started" : "Subscribe",
              isPopular: plan.name === "Pro",
              variantId: plan.lemon_squeezy_variant_id,
              id: plan.id,
              billingPeriod: plan.billing_period,
            };
          }
        );

        setAllPlans(transformedPlans);
      } catch (error) {
        console.error("Error fetching subscription plans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Filter plans based on billing period
  const plans = useMemo(() => {
    return allPlans.filter((plan) => {
      const selectedPeriod = billingPeriod.toUpperCase();
      return plan.billingPeriod === selectedPeriod;
    });
  }, [allPlans, billingPeriod]);

  const handleSubscribe = async (plan: PricingPlan) => {
    try {
      setButtonLoading(plan.id || plan.name);

      const data = await createCheckout({
        variantId: plan.variantId || undefined,
        planName: plan.name,
      });

      if (data.checkoutUrl) {
        // Redirect to Lemon Squeezy checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setButtonLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="container px-4 py-8">
        <div className="flex items-center justify-center">
          <p className="text-muted-foreground">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="px-4 pt-8 pb-16">
      <div className="container mx-auto">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <h1 className="text-3xl font-bold tracking-tight">Plans</h1>
          <div className="flex flex-col justify-between gap-10 md:flex-row">
            <p className="text-muted-foreground max-w-3xl lg:text-xl">
              Check out our affordable pricing plans.
            </p>
            <div className="bg-muted flex h-11 w-fit shrink-0 items-center rounded-md p-1 text-lg">
              <RadioGroup
                value={billingPeriod}
                className="h-full grid-cols-2"
                onValueChange={(value) => {
                  setBillingPeriod(value as "monthly" | "yearly");
                }}
              >
                <div className='has-[button[data-state="checked"]]:bg-background h-full rounded-md transition-all'>
                  <RadioGroupItem
                    value="monthly"
                    id="monthly"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="monthly"
                    className="text-muted-foreground peer-data-[state=checked]:text-primary flex h-full cursor-pointer items-center justify-center px-7 font-semibold"
                  >
                    Pay monthly
                  </Label>
                </div>
                <div className='has-[button[data-state="checked"]]:bg-background h-full rounded-md transition-all'>
                  <RadioGroupItem
                    value="yearly"
                    id="yearly"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="yearly"
                    className="text-muted-foreground peer-data-[state=checked]:text-primary flex h-full cursor-pointer items-center justify-center px-7 font-semibold"
                  >
                    Pay yearly
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          {plans.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">
                No plans available for {billingPeriod} billing.
              </p>
            </div>
          ) : (
            <div className="flex w-full flex-col items-stretch gap-6 md:flex-row">
              {plans.map((plan) => (
                <div
                  key={plan.id || plan.name}
                  className={`flex w-full flex-col rounded-lg border p-6 text-left ${
                    plan.isPopular ? "bg-muted" : ""
                  }`}
                >
                  <Badge className="mb-4 block w-fit uppercase">
                    {plan.badge}
                  </Badge>
                  {plan.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.description}
                    </p>
                  )}
                  <span className="text-4xl font-medium">
                    {plan.monthlyPrice}
                  </span>
                  <p
                    className={`text-muted-foreground mb-6 ${
                      plan.monthlyPrice === "$0" ? "invisible" : ""
                    }`}
                  >
                    {billingPeriod === "monthly" ? "Per month" : "Per year"}
                  </p>
                  <Separator className="my-6" />
                  <div className="flex h-full flex-col justify-between gap-6">
                    <div>
                      {plan.features.length > 0 && (
                        <ul className="text-muted-foreground space-y-4 mb-6">
                          {plan.features.map((feature, featureIndex) => (
                            <li
                              key={featureIndex}
                              className="flex items-center gap-2"
                            >
                              <Check className="size-4 shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Button
                      className="w-full mt-auto"
                      onClick={() => handleSubscribe(plan)}
                      disabled={buttonLoading === (plan.id || plan.name)}
                    >
                      {buttonLoading === (plan.id || plan.name)
                        ? "Processing..."
                        : plan.buttonText}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
