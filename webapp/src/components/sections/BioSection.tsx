import { ExternalLink, Github, Linkedin, Calendar } from "lucide-react";
import profilePhoto from "@/assets/jason-rundell-avatar.webp";

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
  return (
    <section className="py-16 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent"></div>
      <div className="container mx-auto relative">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-b from-card to-secondary rounded-2xl border-2 border-border/50 p-8 md:p-12">
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
                Embark ID <pre>CodeBlink#6122</pre>
              </p>
            </div>

            <div className="space-y-6 text-muted-foreground">
              <p className="text-lg leading-relaxed">
                This project was built for the{" "}
                <a
                  href="https://codetv.dev/blog/web-dev-challenge-hackathon-s2e11-code-powered-phone-hotline"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  CodeTV Web Dev Challenge Hackathon S2.E11
                  <ExternalLink className="w-4 h-4 inline" />
                </a>{" "}
                — a challenge to build an AI-powered voice hotline using
                Twilio's ConversationRelay.
              </p>

              <p className="text-lg leading-relaxed">
                I'm a full stack developer with a passion for building web
                applications. You can learn more about me and my work at{" "}
                <a
                  href="https://jasonrundell.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  jasonrundell.com
                  <ExternalLink className="w-4 h-4 inline" />
                </a>
                .
              </p>

              <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-border/50">
                <a
                  href="https://github.com/jasonrundell"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors px-4 py-2 rounded-full border-2 border-transparent hover:border-secondary"
                >
                  <Github className="w-5 h-5" />
                  GitHub
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href="https://www.linkedin.com/in/jasonrundell/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors px-4 py-2 rounded-full border-2 border-transparent hover:border-secondary"
                >
                  <Linkedin className="w-5 h-5" />
                  LinkedIn
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href="https://calendly.com/jason-rundell/60-minute-meeting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors px-4 py-2 rounded-full border-2 border-transparent hover:border-secondary"
                >
                  <Calendar className="w-5 h-5" />
                  Book time with me
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
