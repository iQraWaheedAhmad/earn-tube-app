"use client";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

const testimonials = [
  {
    name: "Abdul Javad",
    location: "Saudi Arabia",
    rating: 5,
    text: "This is completely legitimate man, I remember the first day I doubted this but it gave me fortune completely! I have been earning consistently for months now.",
  },
  {
    name: "Allison Richard",
    location: "USA",
    rating: 5,
    text: "I used to use those other sites that used to pay me a little. It used to take me months to make minimum payment amount. Now I have earned my first real cash online with EarnTube, I can't wait to make more. I'm finally making money with social media.",
  },
  {
    name: "Adam Walls",
    location: "USA",
    rating: 5,
    text: "Great network with high payouts! I have never missed a payment with EarnTube. I have been with them for 5 months now and I have already earned more than an engineer's salary.",
  },
  {
    name: "Vickie Linneman",
    location: "United Kingdom",
    rating: 5,
    text: "Good app, many offers and tasks, also have a good UI. Very easy to navigate and find earning opportunities. Highly recommend!",
  },
  {
    name: "Francisco Bezanilla",
    location: "Brazil",
    rating: 5,
    text: "Before finding EarnTube, I was really struggling financially. Now I started earning decent money for myself with this website. It changed my life!",
  },
  {
    name: "Shyam Prasad",
    location: "India",
    rating: 5,
    text: "I personally enjoy this app very much. Super fast payments and lots of earning opportunities available every day.",
  },
  {
    name: "Sarah Johnson",
    location: "New York, USA",
    rating: 5,
    text: "I've been using EarnTube for 6 months and already earned over $2,500! The payouts are fast and reliable. Best platform ever!",
  },
  {
    name: "Michael Chen",
    location: "Singapore",
    rating: 5,
    text: "Finally a legitimate way to earn money online. I make an extra $500 every month just watching videos during my free time.",
  },
  {
    name: "Emma Wilson",
    location: "London, UK",
    rating: 5,
    text: "The surveys are easy and actually pay well. I got my first payout within 24 hours. Highly recommend to anyone looking to earn online!",
  },
  {
    name: "Carlos Rodriguez",
    location: "Spain",
    rating: 5,
    text: "Excellent platform with many opportunities. Customer support is also very helpful and responsive when needed.",
  },
  {
    name: "Yuki Tanaka",
    location: "Japan",
    rating: 5,
    text: "Best earning platform I've ever used. The interface is clean, payments are fast, and there are always new tasks available.",
  },
  {
    name: "Maria Santos",
    location: "Philippines",
    rating: 5,
    text: "As a student, this platform helps me earn extra money for my expenses. Very grateful for EarnTube!",
  },
];

const TestimonialsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-6">
                What Our Users Say
              </h1>
              <p className="text-xl text-muted-foreground">
                They are doing great things with us. Join thousands of satisfied
                members earning daily.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-12 bg-primary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-foreground mb-2">
                  600K+
                </div>
                <div className="text-sm text-muted-foreground">Happy Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground mb-2">
                  4.8★
                </div>
                <div className="text-sm text-muted-foreground">
                  Average Rating
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground mb-2">
                  $5M+
                </div>
                <div className="text-sm text-muted-foreground">Paid Out</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground mb-2">
                  98%
                </div>
                <div className="text-sm text-muted-foreground">
                  Satisfaction Rate
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card
                  key={index}
                  className="p-6 card-shadow hover:card-shadow-lg transition-smooth hover:-translate-y-1"
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full hero-gradient flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.location}
                      </div>
                    </div>
                  </div>
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
                Join Our Success Stories
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Start your earning journey today and become our next success
                story
              </p>
              <a href="/register" className="inline-block">
                <button className="hero-gradient text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-smooth">
                  Get Started - Claim $5 Bonus
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

export default TestimonialsPage;
