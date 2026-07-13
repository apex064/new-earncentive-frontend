import type { ComponentType } from "react";
import Instagram from "@/assets/icons/instagram.svg?react";
import X from "@/assets/icons/x.svg?react";
import Youtube from "@/assets/icons/youtube.svg?react";

interface SocialNavsType {
  icon: ComponentType;
  name: string;
  url: string;
}

export const socialNavs: SocialNavsType[] = [
  {
    icon: X,
    name: "Twitter",
    url: "#",
  },
  {
    icon: Instagram,
    name: "Instagram",
    url: "#",
  },
  {
    icon: Youtube,
    name: "YouTube",
    url: "#",
  },
];
