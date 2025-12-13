import Image from "next/image";

const features = [
  {
    image: "/assets/feature-payout.png",
    title: "Daily Payouts",
    description:
      "We release cashouts of our members daily via PayPal, Cash App, Venmo, and more payment methods.",
  },
  {
    image: "/assets/feature-rates.png",
    title: "Higher Rates",
    description:
      "EarnTube always pays members the HIGHEST rates on all offers and surveys compared to other platforms.",
  },
  {
    image: "/assets/feature-global.png",
    title: "Global Offers",
    description:
      "We have a huge inventory of surveys and offers in our system for all members across the globe.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Why Choose EarnTube?
          </h2>
          <p className="text-lg text-muted-foreground">
            We provide the best earning opportunities with unmatched benefits
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-8 card-shadow hover:card-shadow-lg transition-smooth hover:-translate-y-1 group"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-smooth">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain"
                  priority={index === 0}
                />
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
  );
};
