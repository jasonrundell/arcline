import { ExternalLink, Github, Linkedin, Calendar } from "lucide-react";
import profilePhoto from "@/assets/jason-rundell-avatar.webp";
import { Section } from "@/components/layout/Section";

/**
 * BioSection Component
 *
 * Displays information about the developer, Jason Rundell, and links to
 * his website, GitHub, and LinkedIn profiles. Also mentions this project
 * was built for the CodeTV Web Dev Challenge hackathon.
 *
 * @component
 * @example
 * ```tsx
 * <BioSection />
 * ```
 */
export const BioSection = () => {
  const linkClasses =
    "flex items-center gap-2 text-primary font-medium px-4 py-2";

  const externalLinkClasses =
    "text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1";

  return (
    <Section id="project" paddingY="md" hasGradient>
      <div className="max-w-4xl mx-auto">
        <div className="p-4 sm:p-8 md:p-12">
          <div className="text-center mb-8">
            <img
              src={profilePhoto}
              alt="Jason Rundell"
              className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto mb-4 border-4 border-border/50 shadow-[0_4px_12px_rgba(0,0,0,0.4)] object-cover"
            />
            <h3 className="text-3xl font-bold mb-4 tracking-wide">
              Built by Jason Rundell
            </h3>
            <p>
              Embark ID <code>CodeBlink#6122</code>
            </p>
          </div>

          <div className="space-y-4">
            <p>
              Hi! I&apos;m a full stack developer with a passion for building
              web applications. You can learn more about me and my work at{" "}
              <a
                href="https://jasonrundell.com"
                target="_blank"
                rel="noopener noreferrer"
                className={externalLinkClasses}
              >
                jasonrundell.com
                <ExternalLink className="w-4 h-4 inline" />
              </a>
              .
            </p>
            <p>
              This site is a product of a{" "}
              <a
                href="https://codetv.dev/blog/web-dev-challenge-hackathon-s2e11-code-powered-phone-hotline"
                target="_blank"
                rel="noopener noreferrer"
                className={externalLinkClasses}
              >
                contest from Twilio and CodeTV{" "}
                <ExternalLink className="w-4 h-4 inline" />
              </a>{" "}
              — a challenge to build an AI-powered voice hotline using{" "}
              <a
                href="https://www.twilio.com/docs/voice/conversationrelay"
                target="_blank"
                rel="noopener noreferrer"
                className={externalLinkClasses}
              >
                Twilio&apos;s ConversationRelay{" "}
                <ExternalLink className="w-4 h-4 inline" />
              </a>
              . There are two applications to it: the <strong>server</strong>{" "}
              and the <strong>web app</strong>.
            </p>
            <ul className="list-disc list-inside">
              <li className="ml-4">
                <strong>Server:</strong> the backend that handles the voice
                calls and the webhook.
              </li>
              <li className="ml-4">
                <strong>Web app:</strong> the frontend that allows users to
                learn about the hotline, it&apos;s features, read intel
                submitted by others, and read messages left for Scrappy.
              </li>
            </ul>
            <p>
              I was heavily inspired by the video game{" "}
              <a
                href="https://arcraiders.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={externalLinkClasses}
              >
                ARC Raiders by Embark Studios
              </a>
              . The game is a first-person shooter that takes place in the ARC
              Raiders universe.
            </p>
            <p>
              You can find the source code for both applications on my GitHub
              repository:{" "}
              <a
                href="https://github.com/jasonrundell/arcline"
                target="_blank"
                rel="noopener noreferrer"
                className={externalLinkClasses}
              >
                jasonrundell/arcline
                <ExternalLink className="w-4 h-4 inline" />
              </a>
              .
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-border/50">
              <a
                href="https://github.com/jasonrundell"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClasses}
              >
                <Github className="w-5 h-5" />
                GitHub
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/jasonrundell/"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClasses}
              >
                <Linkedin className="w-5 h-5" />
                LinkedIn
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://discord.com/users/229994679603560448"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClasses}
              >
                {/* You may want to import a Discord icon to use here */}
                <span className="inline-block w-5 h-5 mr-1">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M20.317 4.369A19.791 19.791 0 0 0 16.885 3.1a.075.075 0 0 0-.079.037c-.349.608-.739 1.401-1.011 2.025a18.216 18.216 0 0 0-5.606 0A12.2 12.2 0 0 0 9.188 3.136a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.684 4.369a.068.068 0 0 0-.031.027C1.194 8.178.245 11.884.588 15.537a.08.08 0 0 0 .031.055A19.962 19.962 0 0 0 7.208 20.03a.077.077 0 0 0 .084-.026c.607-.82 1.147-1.688 1.617-2.598a.076.076 0 0 0-.041-.104 13.433 13.433 0 0 1-1.924-.925.077.077 0 0 1-.008-.128c.13-.098.259-.2.382-.304a.075.075 0 0 1 .077-.01c4.014 1.827 8.354 1.827 12.327 0a.075.075 0 0 1 .078.009c.123.104.252.206.383.304a.077.077 0 0 1-.007.128c-.615.357-1.255.694-1.924.925a.076.076 0 0 0-.04.105c.47.909 1.01 1.776 1.616 2.597a.076.076 0 0 0 .084.027 19.915 19.915 0 0 0 6.59-4.438.082.082 0 0 0 .032-.054c.481-4.913-.805-8.585-3.316-11.142a.061.061 0 0 0-.032-.024ZM8.02 15.331c-1.183 0-2.153-1.085-2.153-2.419 0-1.333.956-2.418 2.153-2.418 1.213 0 2.167 1.1 2.153 2.418 0 1.334-.956 2.419-2.153 2.419Zm7.974 0c-1.183 0-2.153-1.085-2.153-2.419 0-1.333.955-2.418 2.153-2.418 1.214 0 2.167 1.1 2.153 2.418 0 1.334-.939 2.419-2.153 2.419Z" />
                  </svg>
                </span>
                Discord
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://calendly.com/jason-rundell/60-minute-meeting"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClasses}
              >
                <Calendar className="w-5 h-5" />
                Book time with me
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};
