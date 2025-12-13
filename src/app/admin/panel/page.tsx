"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Shield, ExternalLink } from "lucide-react";

export default function AdminPanelPlaceholder() {
  const router = useRouter();

  useEffect(() => {
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
        <div className="max-w-3xl mx-auto">
          <Card className="p-8 card-shadow">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Admin Panel
              </span>
            </div>

            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Panel Link Placeholder
            </h1>
            <p className="text-muted-foreground mb-6">
              Next step: we’ll deploy your admin panel on Railway (or keep it
              inside this app) and then connect this page/button to that URL.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="outline">
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
              </Button>

              <Button asChild className="hero-gradient" disabled>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center gap-2"
                >
                  Open Railway Panel <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
