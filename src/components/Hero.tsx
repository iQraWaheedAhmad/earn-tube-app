import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-sm font-medium text-primary">
                {" "}
                Welcome Friends
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
              Watch Tasks & Earn Money
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              Turn your screen time into real money. Watch sponsored videos,
              complete surveys, and get paid daily. Join 600K+ users earning
              online.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="hero-gradient text-white font-semibold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Get Started Now
                </Button>
              </Link>
              <Link href="/#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Learn More
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-2xl font-bold text-foreground">600K+</div>
                <div className="text-sm text-muted-foreground">
                  Active Users
                </div>
              </div>
              <div className="w-px h-12 bg-border"></div>
              <div>
                <div className="text-2xl font-bold text-foreground">$5M+</div>
                <div className="text-sm text-muted-foreground">Paid Out</div>
              </div>
              <div className="w-px h-12 bg-border"></div>
              <div>
                <div className="text-2xl font-bold text-foreground">4.8★</div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </div>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right duration-700">
            <div className="relative z-10">
              <Image
                src="/assets/hero-illustration.png"
                alt="People earning money online"
                width={600}
                height={600}
                className="w-full h-auto"
                priority
              />
            </div>
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-accent/20 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
