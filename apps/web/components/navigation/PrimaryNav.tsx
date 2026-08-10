import {
  Compass,
  Home,
  MessageCircle,
  Users,
  Video,
} from "lucide-react";

export const primaryNavItems = [
  {
    label: "Stream",
    description: "Your personal world",
    href: "/stream",
    icon: Home,
  },
  {
    label: "Flow",
    description: "Create and share",
    href: "/flow",
    icon: MessageCircle,
  },
  {
    label: "Discover",
    description: "Find something new",
    href: "/discover",
    icon: Compass,
  },
  {
    label: "Spaces",
    description: "People and communities",
    href: "/spaces",
    icon: Users,
  },
  {
    label: "Clips",
    description: "Short-form moments",
    href: "/clips",
    icon: Video,
  },
] as const;

export default primaryNavItems;