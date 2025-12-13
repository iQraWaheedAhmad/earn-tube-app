"use client";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { CreditCard, Smartphone, Banknote, Building2 } from "lucide-react";

const paymentPartners = [
  {
    name: "PayPal",
    description: "Fast and secure payments worldwide",
    icon: CreditCard,
    color: "text-blue-600",
  },
  {
    name: "Cash App",
    description: "Instant money transfers",
    icon: Smartphone,
    color: "text-green-600",
  },
  {
    name: "Venmo",
    description: "Quick peer-to-peer payments",
    icon: Smartphone,
    color: "text-blue-500",
  },
  {
    name: "Bank Transfer",
    description: "Direct deposit to your account",
    icon: Building2,
    color: "text-purple-600",
  },
  {
    name: "Wire Transfer",
    description: "International wire transfers",
    icon: Banknote,
    color: "text-orange-600",
  },
  {
    name: "Cryptocurrency",
    description: "Bitcoin and other crypto payments",
    icon: Banknote,
    color: "text-yellow-600",
  },
];

const advertisers = [
  "Google Surveys",
  "Amazon Associates",
  "Microsoft Rewards",
  "Survey Junkie",
  "Swagbucks",
  "InboxDollars",
  "MyPoints",
  "Vindale Research",
  "Opinion Outpost",
  "Toluna",
  "YouGov",
  "Survey Monkey",
];

const Partners = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-6">
                Our Trusted Partners
              </h1>
              <p className="text-xl text-muted-foreground">
                We work with the world's leading payment processors and
                advertisers to bring you the best earning opportunities
              </p>
            </div>
          </div>
        </section>

        {/* Payment Partners */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                Payment
              </h2>
              <p className="text-lg text-muted-foreground">
                Choose from multiple secure payment methods
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paymentPartners.map((partner, index) => (
                <Card
                  key={index}
                  className="p-8 card-shadow hover:card-shadow-lg transition-smooth hover:-translate-y-1 text-center"
                >
                  <div className="w-16 h-16 rounded-xl hero-gradient flex items-center justify-center mx-auto mb-4">
                    <partner.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {partner.name}
                  </h3>
                  <p className="text-muted-foreground">{partner.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">
                  650K+
                </div>
                <div className="text-muted-foreground">Users and Counting</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">100+</div>
                <div className="text-muted-foreground">Partner Companies</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">$5M+</div>
                <div className="text-muted-foreground">Total Paid Out</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-muted-foreground">Support Available</div>
              </div>
            </div>
          </div>
        </section>

        {/* Advertiser Partners */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                Advertiser & Survey Partners
              </h2>
              <p className="text-lg text-muted-foreground">
                We partner with leading brands and survey companies
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {advertisers.map((advertiser, index) => (
                <Card
                  key={index}
                  className="p-6 card-shadow hover:card-shadow-lg transition-smooth text-center"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <div className="font-semibold text-foreground">
                    {advertiser}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Partner Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-display font-bold text-foreground mb-8 text-center">
                Why Brands Partner With Us
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    600K+
                  </div>
                  <div className="font-semibold text-foreground mb-2">
                    Active Users
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Reach a massive engaged audience
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    100M+
                  </div>
                  <div className="font-semibold text-foreground mb-2">
                    Engagements
                  </div>
                  <p className="text-sm text-muted-foreground">
                    High-quality user interactions
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    Global
                  </div>
                  <div className="font-semibold text-foreground mb-2">
                    Reach
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Users from all around the world
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join our network of satisfied users and start earning with
                trusted partners
              </p>
              <a href="/register" className="inline-block">
                <button className="hero-gradient text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-smooth">
                  Sign Up Now - Get $5 Bonus
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

export default Partners;
