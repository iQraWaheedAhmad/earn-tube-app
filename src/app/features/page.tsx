"use client";

import Image from "next/image";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import {
  Calendar,
  TrendingUp,
  Globe,
  Smartphone,
  Shield,
  Zap,
  CreditCard,
  Clock,
  Award,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const mainFeatures = [
  {
    image: "/assets/feature-payout.png",
    icon: Calendar,
    title: "Daily Payouts",
    description:
      "We release cashouts of our members daily via PayPal, Cash App, Venmo, and more payment methods. Get your earnings fast without delays.",
  },
  {
    image: "/assets/feature-rates.png",
    icon: TrendingUp,
    title: "Higher Rates",
    description:
      "EarnTube always pays members the HIGHEST rates on all offers and surveys compared to other platforms. Maximize your earning potential with us.",
  },
  {
    image: "/assets/feature-global.png",
    icon: Globe,
    title: "Global Offers",
    description:
      "We have a huge inventory of surveys and offers in our system for all members across the globe. No matter where you are, there's always something to earn from.",
  },
];

const additionalFeatures = [
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description:
      "Access EarnTube from any device - desktop, tablet, or smartphone. Earn anywhere, anytime.",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description:
      "Your data and earnings are protected with enterprise-level security. We take your privacy seriously.",
  },
  {
    icon: Zap,
    title: "Instant Notifications",
    description:
      "Get real-time updates on new earning opportunities, completed tasks, and payment confirmations.",
  },
  {
    icon: CreditCard,
    title: "Multiple Payment Methods",
    description:
      "Choose from PayPal, Cash App, Venmo, bank transfer, and more withdrawal options.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description:
      "New tasks and videos are added round the clock. There's always something available to earn from.",
  },
  {
    icon: Award,
    title: "Loyalty Rewards",
    description:
      "Earn bonus rewards and higher rates as you complete more tasks. We reward our active members.",
  },
];

const FeaturesPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-6">
                Powerful Features for Maximum Earnings
              </h1>
              <p className="text-xl text-muted-foreground">
                Everything you need to turn your free time into real money
              </p>
            </div>
          </div>
        </section>

        {/* Main Features */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {mainFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-card rounded-2xl p-8 card-shadow hover:card-shadow-lg transition-smooth hover:-translate-y-1 group"
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-smooth">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      width={96}
                      height={96}
                      className="w-16 h-16 object-contain"
                      priority={index === 0}
                    />
                  </div>
                  <div className="w-12 h-12 rounded-xl hero-gradient flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-bold text-foreground mb-12 text-center">
              More Amazing Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {additionalFeatures.map((feature, index) => (
                <Card
                  key={index}
                  className="p-6 card-shadow hover:card-shadow-lg transition-smooth"
                >
                  <div className="w-12 h-12 rounded-xl hero-gradient flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                Experience All Features Today
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Sign up now and get instant access to all our premium features
                plus a $5 welcome bonus
              </p>
              <a href="/register" className="inline-block">
                <button className="hero-gradient text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-smooth">
                  Start Earning Now
                </button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FeaturesPage;
