"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, User, LogOut } from "lucide-react";

import { Button } from "./button";
import { Navigation, NavItem } from "./navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "./sheet";
import { cn } from "../lib/utils";

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  logoHref?: string;
  title?: string;
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
  navItems: NavItem[];
  basePath?: string;
  onLogout?: () => void;
  showUserMenu?: boolean;
}

export function Header({
  logo,
  logoHref = "/",
  title = "Academic Compliance Hub",
  user,
  navItems,
  basePath = "",
  onLogout,
  showUserMenu = true,
  className,
  ...props
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
      {...props}
    >
      <div className="container flex h-16 items-center">
        <div className="mr-8 flex items-center gap-2">
          {logoHref && logo ? (
            <Link href={logoHref} className="flex items-center gap-2">
              {logo}
              {title && (
                <span className="hidden font-bold sm:inline-block">
                  {title}
                </span>
              )}
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              {logo}
              {title && <span className="font-bold">{title}</span>}
            </div>
          )}
        </div>

        <Navigation
          items={navItems}
          basePath={basePath}
          variant="desktop"
          className="hidden md:flex"
        />

        <div className="ml-auto flex items-center gap-2">
          {showUserMenu && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name || "User"}
                    </p>
                    {user.email && (
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                {onLogout && (
                  <DropdownMenuItem
                    onClick={onLogout}
                    className="text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : showUserMenu ? (
            <Button asChild variant="default" size="sm">
              <Link href={`${basePath}/sign-in`}>Sign In</Link>
            </Button>
          ) : null}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <nav className="flex flex-col space-y-4">
                {title && (
                  <Link
                    href={logoHref}
                    className="flex items-center gap-2 text-lg font-bold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {logo}
                    {title}
                  </Link>
                )}
                <Navigation
                  items={navItems}
                  basePath={basePath}
                  variant="mobile"
                />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
