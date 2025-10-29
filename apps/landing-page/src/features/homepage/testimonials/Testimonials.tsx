import { TypebotLogo } from "@/components/TypebotLogo";
import abhayPictureSrc from "./assets/abhay.jpeg";
import annaFilouPictureSrc from "./assets/annaFilou.jpeg";
import invictuzPictureSrc from "./assets/invictuz.png";
import joshuaPictureSrc from "./assets/joshua.jpg";
import julienPictureSrc from "./assets/julien.jpeg";
import kurniaPictureSrc from "./assets/kurnia.jpeg";
import laszloPictureSrc from "./assets/laszlo.jpeg";
import lucasPictureSrc from "./assets/lucas.png";
import nicolaiPictureSrc from "./assets/nicolai.jpg";
import oscarPictureSrc from "./assets/oscar.jpeg";
import stevePictureSrc from "./assets/steve.jpg";
import theoPictureSrc from "./assets/theo.jpeg";

const testimonials = [
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
        We send the collected data to Encharge (email drip campaigns) and
        Pipedrive (CRM).
        <br />
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
        functional chatbot in minutes. <br />
        <br /> You can create a bot to answer frequently asked questions about
        your business or create a bot that helps promote your business on social
        media or any other platform.,
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
        I have several chatbot builders, but Typebot is the one I use the most.
        It is simple to construct and very intuitive. <br />
        Integration with third-party applications is simple, and you can create
        the most sophisticated bots with its simplicity.
      </>
    ),
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
    name: "Joshua Lim",
    role: "Growth Strategist @ Socialhackrs Media",
    avatarSrc: joshuaPictureSrc,
    provider: "email",
    content:
      "I upgraded my typeforms to typebots and saw a conversion rate increase from 14% to 43% on my marketing campaigns. I noticed the improvement on day one. That was a game-changer.",
  },
  {
    name: "Mario Barretta",
    role: "Customer Care Manager",
    provider: "email",
    content: (
      <>
        Thanks to typebot I can finally make site forms much more modern and I
        can collect information that I would have missed before. Also ,thanks to
        Baptiste, the service is always evolving and has excellent assistance
        not only in solving but also in listening to suggestions and putting it
        into action.
        <br />
        <br />
        Thank you thank you and thank you again .
      </>
    ),
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
        What&apos;s amazing with Typebot is that it makes a &quot;chat interface
        effect&quot; without the hassle of being behind my computer all day
        responding to customers. Highly recommend !
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
  {
    name: "_Invictuz",
    provider: "reddit",
    avatarSrc: invictuzPictureSrc,
    content:
      "This is the sickest open-source project I've ever seen and demoed. The use case is so cool and modern and I can't believe how easy this is to get started using. The feature richness and polish in this project is incredible, it feel like a mature product. Unbelievable that this was built by one person. This is better than the demos of chatbot builders I've seen from full-fledged companies. I'm going to learn Typescript so that I can contribute to this someday. Mind-blowing stuff...",
  },
  {
    name: "Abhay Kulkarni",
    provider: "productHunt",
    avatarSrc: abhayPictureSrc,
    role: "Founder at Webisharp",
    content:
      "Using this tool for the last 2 hours & built a full lead capture bot. Pretty good experience till now. @baptiste_arnaud All the best for future :)",
  },
  {
    name: "Anna Filou",
    provider: "productHunt",
    avatarSrc: annaFilouPictureSrc,
    role: "Geek, Designer, Illustrator, Web Dev",
    content:
      "Seems like the product I've been waiting for Typeform to make! 😝",
  },
];

export const Testimonials = () => {
  return (
    <div className="flex flex-col gap-8 max-w-3xl items-center w-full">
      <div className="flex flex-col gap-4 md:text-center">
        <h2>Oh my Bot!</h2>
        <p>The team likes it, customers enjoy it, and the brand stands out.</p>
      </div>
      <div className="flex flex-col rounded-2xl overflow-y-auto max-h-[50vh] md:max-h-[70vh] bg-white border relative isolate w-full">
        <div
          className="pointer-events-none top-0 h-10 w-full bg-linear-to-t from-background/10 to-background/90 sticky shrink-0 animate-in fade-in"
          style={{
            animationTimeline: "scroll()",
            animationRange: "0% 10%",
          }}
        />
        <div className="flex flex-col gap-6 items-center px-4">
          {testimonials.map((testimonial) => (
            <Testimonial key={testimonial.name} {...testimonial} />
          ))}
        </div>
        <div
          className="pointer-events-none bottom-0 h-10 w-full bg-linear-to-b from-background/10 to-background/90 sticky shrink-0 animate-out fade-out"
          style={{
            animationTimeline: "scroll()",
            animationRange: "90% 100%",
          }}
        />
      </div>
    </div>
  );
};

const Testimonial = ({
  name,
  content,
  role,
  avatarSrc,
}: (typeof testimonials)[number]) => {
  return (
    <div className="flex gap-2 max-w-lg">
      <div className="rounded-full size-10 shrink-0">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={name}
            className="object-cover rounded-full"
          />
        ) : (
          <div className="dark rounded-full size-full flex items-center justify-center p-3">
            <TypebotLogo />
          </div>
        )}
      </div>
      <div className="flex flex-col bg-secondary text-secondary-foreground border p-4 rounded-xl gap-4 rounded-tl-md">
        <p>{content}</p>
        <hr />
        <span className="text-sm">
          {name} - {role}
        </span>
      </div>
    </div>
  );
};
