"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Shield } from "lucide-react";

const AdminDashboard = () => {
  const router = useRouter();
  const adminPanelUrl =
    process.env.NEXT_PUBLIC_ADMIN_PANEL_URL ||
    "https://directus-production-2ee7.up.railway.app/admin";

  useEffect(() => {
    // Simple client-side guard (admin auth is currently stored in localStorage)
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    if (role !== "admin" || !token) {
      router.replace("/admin/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-3">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Admin Dashboard
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Welcome back. Use the panel to manage the app.
              </p>
            </div>

            <div className="flex gap-3">
              <Button asChild className="hero-gradient">
                <a
                  href={adminPanelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Admin Panel <ArrowUpRight className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
