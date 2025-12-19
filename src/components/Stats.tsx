import { Users, Video, DollarSign, Eye } from "lucide-react";

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

export const Stats = () => {
  return (
    <section id="about" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Your Destination for Highest Earnings!
          </h2>
          <p className="text-lg text-muted-foreground">
            EarnTube is a rewards platform where you can watch paid videos, complete surveys, install apps, and complete tasks in your free time to earn real money.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 card-shadow hover:card-shadow-lg transition-smooth text-center"
            >
              <div className="w-12 h-12 rounded-xl hero-gradient flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
