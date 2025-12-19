"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Href = LinkProps["href"];

export interface NavLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: Href;
  activeClassName?: string;
  exact?: boolean;
}

const hrefToString = (href: Href) => {
  if (typeof href === "string") return href;
  // `UrlObject` – best-effort for active matching
  return href.pathname?.toString() || "";
};

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ href, className, activeClassName, exact = true, ...props }, ref) => {
    const pathname = usePathname() || "/";
    const target = hrefToString(href) || "/";

    const isActive = exact ? pathname === target : pathname.startsWith(target);

    return (
      <Link
        href={href}
        ref={ref}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    );
  }
);

NavLink.displayName = "NavLink";
