import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  DollarSign,
  User,
  LogOut,
  Shield,
  Wallet,
  AlertCircle,
  Play,
  ArrowUpRight,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDepositStatus } from "@/hooks/useDepositStatus";
import { useUser } from "@/hooks/useUser";
import { useTaskStatus } from "@/hooks/useTaskStatus";
import { Modal } from "@/components/ui/modal";

interface User {
  name?: string;
  email?: string;
  id?: string;
  userNo?: number;
  balance?: number;
  referralCode?: string;
}

export const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const { user: fetchedUser, loading: userLoading, refetchUser } = useUser();
  const { depositStatus, loading: statusLoading } = useDepositStatus();
  const { taskStatus } = useTaskStatus();
  const [isRejectedModalOpen, setIsRejectedModalOpen] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatCountdown = (ms: number) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const hh = String(Math.floor(s / 3600)).padStart(2, "0");
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedRole = localStorage.getItem("role");
    const storedToken = localStorage.getItem("token");
    let parsedUser: User | null = null;
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) parsedUser = JSON.parse(userStr) as User;
    } catch (error) {
      console.error("Failed to parse user data:", error);
    }
    setRole(storedRole);
    setHasToken(!!storedToken);
    setUser(parsedUser);
  }, []);

  // Update user data when fetched user is available
  useEffect(() => {
    if (fetchedUser) {
      setUser(fetchedUser);
    }
  }, [fetchedUser]);

  // Refresh user data periodically to get updated balance from referral rewards
  useEffect(() => {
    if (!hasToken) return;

    const refreshInterval = setInterval(() => {
      refetchUser();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [hasToken, refetchUser]);

  const isAdmin = role === "admin";
  const isLoggedIn = hasToken;
  const name =
    user?.name ||
    (user?.email && user.email.split("@")[0]) ||
    (isAdmin ? "Admin" : "User");
  const email = user?.email;

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      window.location.href = "/"; // refresh and redirect home
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg hero-gradient flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">
              EarnTube
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/about"
              className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
            >
              About
            </Link>
            <Link
              href="/features"
              className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
            >
              Features
            </Link>
            <Link
              href="/plans"
              className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
            >
              Plans
            </Link>
            <Link
              href="/testimonials"
              className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
            >
              Testimonials
            </Link>
            <Link
              href="/partners"
              className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
            >
              Payment
            </Link>
            {isLoggedIn && !statusLoading && (
              <>
                {depositStatus.hasRejectedDeposit ? (
                  <button
                    onClick={() => setIsRejectedModalOpen(true)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Deposit Rejected
                  </button>
                ) : depositStatus.status === "PENDING" ? (
                  <Link
                    href="/deposit"
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                  >
                    <Wallet className="w-4 h-4" />
                    Deposit Pending
                  </Link>
                ) : depositStatus.status === "COMPLETED" ? (
                  <Link
                    href="/tasks"
                    className="hero-gradient text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                  >
                    <Play className="w-4 h-4" />
                    {taskStatus?.completedToday && taskStatus?.nextAvailableAt
                      ? `Next Task in ${formatCountdown(
                          new Date(taskStatus.nextAvailableAt).getTime() - nowMs
                        )}`
                      : "Start Task"}
                  </Link>
                ) : (
                  <Link
                    href="/deposit"
                    className="hero-gradient text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                  >
                    <Wallet className="w-4 h-4" />
                    Deposit
                  </Link>
                )}
                {/* Always show Withdraw button when logged in */}
                <Link
                  href="/withdraw"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 transform hover:scale-105 "
                  style={{
                    background: "linear-gradient(90deg, #1e90ff, #00d4ff)",
                  }}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Withdraw
                </Link>
              </>
            )}
            {/* Withdraw button is only visible if logged in */}
          </div>

          {/* Profile/Admin/Login-Register area (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {isAdmin ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    className="flex items-center gap-2 px-4"
                  >
                    <Shield className="w-4 h-4 mr-1" /> Admin
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-3 pt-2 pb-2">
                    <div className="font-semibold text-sm">
                      {name || "Admin"}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : isLoggedIn ? (
              <div className="flex items-center gap-3">
                {/* Balance Display */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold text-green-500">
                    ${user?.balance?.toFixed(2) || "0.00"}
                  </span>
                </div>

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 px-4 outline-none ring-0 focus:outline-none focus:ring-0 active:outline-none active:ring-0 hover:bg-transparent border-0 shadow-none data-[state=open]:outline-none data-[state=open]:ring-0"
                      style={{
                        outline: "none !important",
                        border: "none !important",
                        boxShadow: "none !important",
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <Avatar className="h-9 w-9 text-base hero-gradient rounded-full">
                        <AvatarFallback className="text-white font-bold bg-transparent">
                          {name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-3 pt-2 pb-2">
                      <div className="font-semibold text-sm">
                        {name || "User"}
                      </div>
                      {email && (
                        <div className="text-xs text-muted-foreground">
                          {email}
                        </div>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2">
                        <Users className="h-4 w-4 mr-2" /> Refer Friends
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link href="/admin/login">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Admin
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button className="hero-gradient">Register</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-border">
            <Link
              href="/about"
              className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/features"
              className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/plans"
              className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
              onClick={() => setMobileMenuOpen(false)}
            >
              Plans
            </Link>
            <Link
              href="/testimonials"
              className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
              onClick={() => setMobileMenuOpen(false)}
            >
              Testimonials
            </Link>
            <Link
              href="/partners"
              className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
              onClick={() => setMobileMenuOpen(false)}
            >
              Partners
            </Link>
            {isLoggedIn && !statusLoading && (
              <>
                {depositStatus.hasRejectedDeposit ? (
                  <button
                    onClick={() => {
                      setIsRejectedModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Deposit Rejected
                  </button>
                ) : depositStatus.status === "PENDING" ? (
                  <Link
                    href="/deposit"
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Wallet className="w-4 h-4" />
                    Deposit Pending
                  </Link>
                ) : depositStatus.status === "COMPLETED" ? (
                  <Link
                    href="/tasks"
                    className="hero-gradient text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Play className="w-4 h-4" />
                    {taskStatus?.completedToday && taskStatus?.nextAvailableAt
                      ? `Next Task in ${formatCountdown(
                          new Date(taskStatus.nextAvailableAt).getTime() - nowMs
                        )}`
                      : "Start Task"}
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/deposit"
                      className="hero-gradient text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Wallet className="w-4 h-4" />
                      Deposit
                    </Link>
                    <Link
                      href="/withdraw"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 ml-0.5"
                      style={{
                        background: "linear-gradient(90deg, #1e90ff, #00d4ff)",
                      }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Wallet className="w-4 h-4" />
                      Withdraw
                    </Link>
                  </>
                )}
              </>
            )}
            {/* Withdraw button is only visible if logged in */}
            <div className="flex flex-col gap-2 pt-2">
              {isAdmin ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      className="w-full flex items-center gap-2 justify-center"
                    >
                      <Shield className="w-4 h-4 mr-1" /> Admin
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-3 pt-2 pb-2">
                      <div className="font-semibold text-sm">
                        {name || "Admin"}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : isLoggedIn ? (
                <div className="flex flex-col gap-3">
                  {/* Balance Display */}
                  <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-500">
                      ${user?.balance?.toFixed(2) || "0.00"}
                    </span>
                  </div>

                  {/* Profile Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full flex items-center gap-2 justify-center"
                      >
                        <Avatar className="h-7 w-7 text-xs hero-gradient rounded-full">
                          <AvatarFallback className="text-white font-bold bg-transparent">
                            {name?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="inline-block">
                          {name || "Profile"}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <div className="px-3 pt-2 pb-2">
                        <div className="font-semibold text-sm">
                          {name || "User"}
                        </div>
                        {email && (
                          <div className="text-xs text-muted-foreground">
                            {email}
                          </div>
                        )}
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2"
                        >
                          <Users className="h-4 w-4 mr-2" /> Refer Friends
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-destructive"
                      >
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <>
                  <Link
                    href="/admin/login"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-2 justify-center"
                    >
                      <Shield className="w-4 h-4" /> Admin
                    </Button>
                  </Link>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="hero-gradient w-full">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Rejected Deposit Modal */}
      <Modal
        isOpen={isRejectedModalOpen}
        onClose={() => setIsRejectedModalOpen(false)}
        title="Deposit Rejected"
        message="We're sorry, but your deposit has been rejected. This could be due to insufficient payment proof, incorrect transaction details, or other verification issues. Please contact our support team for assistance."
        email="support@earntube.com"
        type="error"
      />
    </nav>
  );
};
