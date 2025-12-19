import { UserPlus, Video, DollarSign } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Sign Up Free",
    description: "Create your account in seconds and get instant $5 welcome bonus to start earning.",
  },
  {
    icon: Video,
    step: "02",
    title: "Watch & Complete",
    description: "Watch videos, complete surveys, install apps, and finish simple tasks at your own pace.",
  },
  {
    icon: DollarSign,
    step: "03",
    title: "Get Paid Daily",
    description: "Withdraw your earnings daily via PayPal, Cash App, Venmo, or bank transfer.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Start earning in 3 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection Lines (hidden on mobile) */}
          <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary via-primary to-primary"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-card rounded-2xl p-8 card-shadow hover:card-shadow-lg transition-smooth text-center relative z-10">
                <div className="w-16 h-16 rounded-full hero-gradient flex items-center justify-center mx-auto mb-6 relative">
                  <step.icon className="w-8 h-8 text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
