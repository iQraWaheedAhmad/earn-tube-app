"use client";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card border border-border rounded-2xl p-8 card-shadow">
          <h1 className="text-3xl font-display font-bold text-foreground mb-4">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome, admin! Dashboard features will be added here.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;

