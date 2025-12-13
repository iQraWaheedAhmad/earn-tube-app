"use client";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import {
  Users,
  Video,
  DollarSign,
  Eye,
  Target,
  Shield,
  Award,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const stats = [
  {
    icon: Users,
    value: "600K+",
    label: "Registered Users",
  },
  {
    icon: Video,
    value: "10K+",
    label: "Videos Available",
  },
  {
    icon: DollarSign,
    value: "$5M",
    label: "Total Cash Paid",
  },
  {
    icon: Eye,
    value: "100M+",
    label: "Video Views",
  },
];

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To provide the easiest and most rewarding way for people worldwide to earn money online through simple tasks and engagement.",
  },
  {
    icon: Shield,
    title: "Trust & Security",
    description:
      "We prioritize the security of your data and earnings. All transactions are encrypted and processed securely.",
  },
  {
    icon: Award,
    title: "Best Rates",
    description:
      "We offer the highest payout rates in the industry, ensuring you get maximum value for your time and effort.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-6">
                About EarnTube
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                EarnTube is a rewards platform where you can take part in
                watching paid videos, completing online surveys, installing
                apps, finishing tasks, and watching ads in your free time to
                turn it into real money.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-card rounded-2xl p-6 card-shadow hover:card-shadow-lg transition-smooth text-center"
                >
                  <div className="w-12 h-12 rounded-xl hero-gradient flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-display font-bold text-foreground mb-8 text-center">
                Finally You Reached Your Destination for Highest Earnings!
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                <p className="text-lg leading-relaxed">
                  We started EarnTube with a simple vision: to create a platform
                  where anyone, anywhere in the world, can earn real money by
                  doing simple online tasks. No complex requirements, no hidden
                  fees - just honest work for honest pay.
                </p>
                <p className="text-lg leading-relaxed">
                  Over the years, we've grown from a small startup to a platform
                  serving over 600,000 users globally. We've paid out millions
                  of dollars to our members, and we're proud to say that we
                  maintain the highest payout rates in the industry.
                </p>
                <p className="text-lg leading-relaxed">
                  Our platform offers diverse earning opportunities including
                  watching videos, completing surveys, installing apps, and
                  participating in various promotional tasks. Each activity is
                  carefully vetted to ensure it's legitimate and rewarding for
                  our members.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-bold text-foreground mb-12 text-center">
              Our Core Values
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <Card
                  key={index}
                  className="p-8 card-shadow hover:card-shadow-lg transition-smooth"
                >
                  <div className="w-14 h-14 rounded-xl hero-gradient flex items-center justify-center mb-6">
                    <value.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                Ready to Start Earning?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join 600,000+ users who are already earning daily with EarnTube
              </p>
              <a href="/register" className="inline-block">
                <button className="hero-gradient text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-smooth">
                  Get Started Now - Get $5 Bonus
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

export default About;
