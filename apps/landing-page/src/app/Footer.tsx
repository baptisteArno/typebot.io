import { TypebotLogoFull } from "@/assets/logos/TypebotLogo";
import { TextLink } from "@/components/text-link";
import {
  blueskyUrl,
  discordUrl,
  docsUrl,
  githubRepoUrl,
  linkedInUrl,
} from "./constants";

const data = [
  {
    title: "Product",
    links: [
      {
        label: "Documentation",
        href: docsUrl,
      },
      {
        label: "Pricing",
        href: "/pricing",
      },
    ],
  },
  {
    title: "Community",
    links: [
      {
        label: "Discord",
        href: discordUrl,
      },
      {
        label: "Blog",
        href: "/blog",
      },
      {
        label: "Github",
        href: githubRepoUrl,
      },
      {
        label: "Bluesky",
        href: blueskyUrl,
      },
      {
        label: "LinkedIn",
        href: linkedInUrl,
      },
      {
        label: "OSS Friends",
        href: "/oss-friends",
      },
    ],
  },
  {
    title: "Company",
    links: [
      {
        label: "About",
        href: "/about",
      },
      {
        label: "Terms of Service",
        href: "/terms-of-service",
      },
      {
        label: "Privacy Policy",
        href: "/privacy-policy",
      },
    ],
  },
];

export const Footer = () => {
  return (
    <div className="dark flex flex-col gap-12 px-6 py-12">
      <TypebotLogoFull />
      <div className="flex flex-col gap-8">
        {data.map((item) => (
          <div className="flex flex-col gap-3">
            <h3 className="text-2xl">{item.title}</h3>
            <ul className="flex flex-col gap-1">
              {item.links.map((link) => (
                <li>
                  <TextLink
                    href={link.href}
                    target={link.href.startsWith("/") ? undefined : "_blank"}
                    className="text-gray-11 font-normal"
                    size="sm"
                  >
                    {link.label}
                  </TextLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="text-gray-11">All rights reserved 2024 - Typebot</p>
    </div>
  );
};
