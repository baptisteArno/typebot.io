import { Flex, Heading, SimpleGrid, Stack, VStack } from "@chakra-ui/react";
import type { StaticImageData } from "next/image";
import abhayPictureSrc from "public/images/abhay.jpeg";
import annaFilouPictureSrc from "public/images/annaFilou.jpeg";
import invictuzPictureSrc from "public/images/invictuz.png";
import joshuaPictureSrc from "public/images/joshua.jpg";
import julienPictureSrc from "public/images/julien.jpeg";
import kurniaPictureSrc from "public/images/kurnia.jpeg";
import laszloPictureSrc from "public/images/laszlo.jpeg";
import lucasPictureSrc from "public/images/lucas.png";
import nicolaiPictureSrc from "public/images/nicolai.jpg";
import oscarPictureSrc from "public/images/oscar.jpeg";
import stevePictureSrc from "public/images/steve.jpg";
import theoPictureSrc from "public/images/theo.jpeg";
import type * as React from "react";
import { Testimonial } from "./Testimonial";

export type TestimonialData = {
  name: string;
  avatarSrc?: StaticImageData;
  provider: "email" | "productHunt" | "capterra" | "reddit";
  role?: string;
  content: string | React.ReactNode;
};

const testimonials: TestimonialData[][] = [
  [
    {
      name: "Joshua Lim",
      role: "Growth Strategist @ Socialhackrs Media",
      avatarSrc: joshuaPictureSrc,
      provider: "email",
      content:
        "I upgraded my typeforms to typebots and saw a conversion rate increase from 14% to 43% on my marketing campaigns. I noticed the improvement on day one. That was a game-changer.",
    },
    {
      name: "Laszlo Csömör",
      role: "Digital Marketing Expert",
      provider: "email",
      avatarSrc: laszloPictureSrc,
      content: (
        <>
          Typebot is one of the best chatbot builders with its intelligent
          features and drag-and-drop simplicity. Its UI/UX is an earthly
          paradise...
          <br />
          What&apos;s even more important is the person who stands behind it. He
          guarantees that the platform will work and progress for a long time.
        </>
      ),
    },
    {
      name: "Mario Barretta",
      role: "Customer Care Manager",
      provider: "email",
      content: (
        <>
          Thanks to typebot I can finally make site forms much more modern and I
          can collect information that I would have missed before. Also ,thanks
          to Baptiste, the service is always evolving and has excellent
          assistance not only in solving but also in listening to suggestions
          and putting it into action.
          <br />
          <br />
          Thank you thank you and thank you again .
        </>
      ),
    },
    {
      name: "Lucas Barp",
      provider: "email",
      avatarSrc: lucasPictureSrc,
      role: "Founder at Barp Digital",
      content:
        "The result of your work is incredible and can make life easier for many people.",
    },
    {
      name: "Igor T.",
      role: "CTO",
      provider: "capterra",
      content:
        "Nice work. The developer promptly makes changes, which is quite rare. There was a suggestion for improvement and improvement, in 2 days it was implemented. Amazing! Good luck and thanks a lot",
    },
  ],
  [
    {
      name: "Oscar",
      role: "CEO",
      provider: "capterra",
      avatarSrc: oscarPictureSrc,
      content:
        "Within 5 minutes of signing up you can already have your bot running thanks to the templates it comes with. I have used many tools to make bots but none as simple, easy and powerful as Typebot.",
    },
    {
      name: "Julien Muratot",
      role: "Growth Manager @ Hornetwork",
      avatarSrc: julienPictureSrc,
      provider: "email",
      content:
        "I run Google ads all year long on our landing page that contains a typebot. I saw a 2x increase on our conversation rate compared to our old WordPress form.",
    },
    {
      name: "_Invictuz",
      provider: "reddit",
      avatarSrc: invictuzPictureSrc,
      content:
        "This is the sickest open-source project I've ever seen and demoed. The use case is so cool and modern and I can't believe how easy this is to get started using. The feature richness and polish in this project is incredible, it feel like a mature product. Unbelievable that this was built by one person. This is better than the demos of chatbot builders I've seen from full-fledged companies. I'm going to learn Typescript so that I can contribute to this someday. Mind-blowing stuff...",
    },
    {
      name: "Theo Marechal",
      provider: "productHunt",
      avatarSrc: theoPictureSrc,
      role: "Nocode expert and content creator",
      content: (
        <>
          Amazing product! I&apos;m using Typebot for everything when it&apos;s
          about talking with customers.
          <br />
          <br />
          What&apos;s amazing with Typebot is that it makes a &quot;chat
          interface effect&quot; without the hassle of being behind my computer
          all day responding to customers. Highly recommend !
        </>
      ),
    },
    {
      name: "Abhay Kulkarni",
      provider: "productHunt",
      avatarSrc: abhayPictureSrc,
      role: "Founder at Webisharp",
      content:
        "Using this tool for the last 2 hours & built a full lead capture bot. Pretty good experience till now. @baptiste_arnaud All the best for future :)",
    },
  ],
  [
    {
      name: "Steve de Jong",
      provider: "email",
      avatarSrc: stevePictureSrc,
      role: "CEO at Stillio",
      content: (
        <>
          We built our own onboarding template last December for all signups for
          Stillio and it works fantastic and reliably.
          <br />
          <br />
          We send the collected data to a Make-com webhook and from there,
          post-process and send to Encharge (email drip campaigns) and Pipedrive
          (CRM).
          <br />
          We are now working on personalizing the email templates based on the
          answers (user industry and role) given in the typebot. We are big fan!
        </>
      ),
    },
    {
      name: "Goran Milic",
      role: "General Manager, Beefii",
      provider: "email",
      content: (
        <>
          I used Typebot at my company and was impressed with how it cut our
          customer service workload in half. I was able to create a fully
          functional chatbot in minutes. <br /> You can create a bot to answer
          frequently asked questions about your business or create a bot that
          helps promote your business on social media or any other platform.,
        </>
      ),
    },
    {
      name: "Kurnia Kwik",
      role: "Founder at DigitalPointer.ID",
      provider: "email",
      avatarSrc: kurniaPictureSrc,
      content: (
        <>
          I have several chatbot builders, but Typebot is the one I use the
          most. It is simple to construct and very intuitive. <br />
          Integration with third-party applications is simple, and you can
          create the most sophisticated bots with its simplicity.
        </>
      ),
    },
    {
      name: "Nicolai Grut",
      role: "CEO @ EcommerceNotebook.com",
      avatarSrc: nicolaiPictureSrc,
      provider: "email",
      content:
        "I am really loving using Typebot! So good. I have used all the top bots and yours is definitely the most user friendly, and yet still so powerful.",
    },
    {
      name: "Anna Filou",
      provider: "productHunt",
      avatarSrc: annaFilouPictureSrc,
      role: "Geek, Designer, Illustrator, Web Dev",
      content:
        "Seems like the product I've been waiting for Typeform to make! 😝",
    },
  ],
];

export const Testimonials = () => {
  return (
    <Flex as="section" justify="center">
      <VStack spacing={12} pt={"52"} px="4" maxW="1400px">
        <Heading textAlign={"center"} data-aos="fade">
          They&apos;ve tried, they never looked back. 💙
        </Heading>
        <SimpleGrid columns={[1, 2, 3]} spacing="6">
          {testimonials.map((testimonialGroup, index) => (
            <Stack key={index} spacing="6">
              {testimonialGroup.map((testimonial, index) => (
                <Testimonial key={index} {...testimonial} />
              ))}
            </Stack>
          ))}
        </SimpleGrid>
      </VStack>
    </Flex>
  );
};
