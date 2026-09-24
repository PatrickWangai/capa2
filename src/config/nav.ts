import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  LineChart,
  Briefcase,
  ArrowLeftRight,
  ListOrdered,
  Star,
  Activity,
  Rss,
  Users,
  FileText,
  CircleDot,
  Compass,
  FlaskConical,
  Newspaper,
  GraduationCap,
  Wallet,
  Bell,
  Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

export const APP_SIDEBAR: NavSection[] = [
  {
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Markets", href: "/markets", icon: LineChart },
      { label: "Portfolio", href: "/portfolio", icon: Briefcase },
      { label: "Trade", href: "/trade", icon: ArrowLeftRight },
      { label: "Orders", href: "/orders", icon: ListOrdered },
      { label: "Watchlist", href: "/watchlist", icon: Star },
    ],
  },
  {
    label: "Discover",
    items: [
      { label: "Market Pulse", href: "/discover", icon: Activity },
      { label: "Social Feed", href: "/social", icon: Rss },
      { label: "Investors", href: "/social/investors", icon: Users },
      { label: "Investment Theses", href: "/social/theses", icon: FileText },
      { label: "Circles", href: "/social/circles", icon: CircleDot },
    ],
  },
  {
    label: "Tools",
    items: [
      { label: "Simulator", href: "/simulate", icon: FlaskConical },
      { label: "Market Brief", href: "/briefing", icon: Newspaper },
      { label: "Learn", href: "/learn", icon: GraduationCap },
    ],
  },
];

export const APP_SIDEBAR_FOOTER: NavItem[] = [
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const MOBILE_NAV: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Markets", href: "/markets", icon: LineChart },
  { label: "Discover", href: "/discover", icon: Compass },
  { label: "Portfolio", href: "/portfolio", icon: Briefcase },
];

export const MARKETING_NAV: NavItem[] = [
  { label: "Markets", href: "/markets", icon: LineChart },
  { label: "Learn", href: "/learn", icon: GraduationCap },
  { label: "Pricing", href: "/pricing", icon: Wallet },
  { label: "About", href: "/about", icon: Users },
];
