import { EndCta } from "@/components/Homepage/EndCta";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header/Header";
import { SocialMetaTags } from "@/components/common/SocialMetaTags";
import { Flex, Heading, List, ListItem, Stack, Text } from "@chakra-ui/react";
import React from "react";

const AboutPage = () => {
  return (
    <div className="flex flex-col items-center w-full overflow-x-hidden ">
      <Header />
      <SocialMetaTags currentUrl={`https://www.typebot.io/about`} />
      <Stack
        spacing={10}
        mx="auto"
        maxW="3xl"
        my="20"
        fontSize="17px"
        textAlign="justify"
      >
        <Flex w="full">
          <Heading as="h1">Why Typebot?</Heading>
        </Flex>
        <Text>
          I&apos;m Baptiste, 28 years old. I&apos;m a software product engineer.
          I am passionated about great user experiences and beautiful
          interfaces.
        </Text>
        <Text>
          This is why I&apos;ve started working on Typebot, 3 years ago. It is
          my attempt on a great chatbot builder.
        </Text>
        <Text>
          In France, people don&apos;t like chatbots. They always think about it
          as the guard before getting the chance to talk to a human. You ask a
          question to a robot and it tries to understand what you&apos;re saying
          and help, but it does not a great job at this. (now, it is maybe not
          that accurate since the rise of LLMs)
        </Text>
        <Text>But I think we undervalue the potential of chatbots.</Text>
        <Text>
          You chat with friends, colleagues and family on messaging platform
          daily. You are used and you like this chat experience. That&apos;s why
          businesses need to leverage this, it&apos;s a place where conversion
          is high.
        </Text>
        <Text>
          In an ideal world, a user should be able to chat with a human from a
          company and have an instant answer. The problem is that it is
          synchronous, time-consuming and it requires a huge customer support
          team working 24/7. It doesn&apos;t scale at all. Waiting for an answer
          from a human impacts the customer experience.
        </Text>
        <Text>
          Chatbots are a solution. You can chat with your customers, at scale.
        </Text>
        <Text>
          But, when built incorrectly, chatbots can be detrimental to your user
          experience. Most solutions out there focus on customer support. It can
          be so much more.
        </Text>
        <Text>A great chatbot should:</Text>
        <List listStyleType="initial">
          <ListItem>Provide a customised experience to the user</ListItem>
          <ListItem>
            Have a great user interface and beautiful animations
          </ListItem>
          <ListItem>Feel native to the business brand</ListItem>
          <ListItem>Provide what the user is looking for</ListItem>
        </List>
        <Text>
          A chatbot is not necessarily tied to customer support. It can also do:
        </Text>
        <List listStyleType="initial">
          <ListItem>Lead generation and qualification</ListItem>
          <ListItem>Quizzes</ListItem>
          <ListItem>Surveys</ListItem>
          <ListItem>User onboarding</ListItem>
          <ListItem>Product presentation</ListItem>
          <ListItem>Registrations (newsletter, waiting list)</ListItem>
        </List>
        <Text>
          To build that kind of chatbots, you need a tool that gives you enough
          freedom to closely tie it to your business logic. The build experience
          should be a reliable and fun experience. You also need a space where
          you can analyse your results so that you can incrementally improve
          your bots.
        </Text>
        <Text>This is what Typebot provides.</Text>
        <Text>
          I&apos;ve built this tool by focusing on user empowering. Typebot is
          extremely flexible and provides the building blocks to create great
          chat experiences. Often times, the more freedom you give to the user,
          the less intuitive the tool become. I try not to fall into that trap
          with Typebot by providing the best defaults for each option. I also
          try to help you learn master the tool with good templates and video
          tutorials.
        </Text>
      </Stack>
      <EndCta heading="Improve conversion and user engagement with typebots" />
      <Footer />
    </div>
  );
};

export default AboutPage;
