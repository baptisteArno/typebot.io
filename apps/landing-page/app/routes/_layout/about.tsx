import { ContentPageWrapper } from "@/components/ContentPageWrapper";
import { WhyTypebotCta } from "@/components/cta/WhyTypebotCta";
import { BuildingsGradientIcon } from "@/features/about/BuildingsGradientIcon";
import { HeartGradientIcon } from "@/features/about/HeartGradientIcon";
import { MessageSquareGradientIcon } from "@/features/about/MessageSquareGradientIcon";
import { ZapGradientIcon } from "@/features/about/ZapGradientIcon";
import { createMetaTags } from "@/lib/createMetaTags";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/about")({
  head: () => ({
    meta: createMetaTags({
      title: "About | Typebot",
      description:
        "Typebot empowers businesses to craft personalized, interactive experiences that foster deeper connections with users.",
      imagePath: "/images/default-og.png",
      path: "/about",
    }),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ContentPageWrapper>
      <div className="max-w-3xl mx-auto gap-16 flex flex-col">
        <h1>Nice conversations makes good relations</h1>
        <div className="flex flex-col gap-10 font-heading text-3xl md:text-justify">
          <p>
            At Typebot, we believe that{" "}
            <span className="group font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#c13eaa] to-[#ff491f] to-30%">
              <MessageSquareGradientIcon className="size-6 inline-flex group-hover:motion-preset-seesaw-lg" />{" "}
              great conversations
            </span>{" "}
            build strong relationships.
          </p>
          <p>
            Every day, people chat with friends, colleagues, and family on
            messaging apps because it's natural, engaging, and familiar. <br />
            We think businesses should tap into this same dynamic because where{" "}
            <span className="group font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#c13eaa] to-[#ff491f] to-20%">
              <HeartGradientIcon className="size-6 inline-flex group-hover:motion-preset-pulse-lg" />{" "}
              people love to chat
            </span>
            , conversion rates rise.
          </p>
          <p>
            Most chatbots today are limited to basic customer support, but we
            know they can be so much more. We see chatbots as tools for{" "}
            <span className="group font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#c13eaa] to-[#ff491f] to-50%">
              <ZapGradientIcon className="size-6 inline-flex group-hover:motion-preset-oscillate-lg" />{" "}
              meaningful interactions
            </span>{" "}
            that go beyond scripted responses. Our mission is to transform cold,
            transactional chats into lively conversations that reflect the true
            voice of your brand.
          </p>
          <p>
            Typebot{" "}
            <span className="group font-medium bg-clip-text text-transparent bg-gradient-to-r from-[#c13eaa] to-[#ff491f] to-70%">
              <BuildingsGradientIcon className="size-6 inline-flex group-hover:motion-preset-bounce" />{" "}
              empowers businesses
            </span>{" "}
            to craft personalized, interactive experiences that foster deeper
            connections with users.
          </p>
          <p>
            I'm Baptiste, a software engineer passionate about user experience
            and design.
          </p>
          <p className="font-bold">
            That's why I created Typebot—to unlock the full potential of
            chatbots and make them intuitive, beautiful, and impactful.
          </p>
          <p>Let's bot!</p>
        </div>
      </div>
      <WhyTypebotCta />
    </ContentPageWrapper>
  );
}
