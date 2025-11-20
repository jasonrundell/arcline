import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import scrappyBg from "@/assets/scrappy-messages-bg.webp";
import scrappyImage from "@/assets/scrappy.webp";
import { useMessages } from "@/hooks/use-messages";
import { format } from "date-fns";

export const MessagesSection = () => {
  const {
    data: messages,
    isLoading: messagesLoading,
    error: messagesError,
  } = useMessages();

  const formattedMessages = useMemo(() => {
    if (!messages) return [];
    return messages.map((message, index) => {
      const messageDate = message.created_at
        ? new Date(message.created_at)
        : new Date();
      let formattedDate: string;
      if (isNaN(messageDate.getTime())) {
        // Use current date as fallback
        formattedDate = format(new Date(), "MM/dd/yyyy HH:mm");
      } else {
        formattedDate = format(messageDate, "MM/dd/yyyy HH:mm");
      }
      const messageNumber = String(index + 1).padStart(3, "0");
      return {
        ...message,
        formattedDate,
        messageNumber,
      };
    });
  }, [messages]);

  return (
    <section
      id="messages"
      className="py-20 px-6 relative overflow-hidden"
      style={{
        backgroundImage: `url(${scrappyBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-background/85 backdrop-blur-sm"></div>

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
            Messages for Scrappy
          </h3>
          <p className="text-muted-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            Scrappy prefers it when you leave a message for him.
          </p>
        </div>
        <div className="max-w-4xl mx-auto space-y-6">
          {messagesLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                Loading messages...
              </p>
            </div>
          )}
          {messagesError && (
            <div className="text-center py-8">
              <p className="text-destructive drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                Error loading messages. Please try again later.
              </p>
            </div>
          )}
          {formattedMessages.length > 0
            ? formattedMessages.map((message) => {
                return (
                  <Card
                    key={message.id}
                    className="bg-gradient-to-br from-secondary via-secondary to-secondary/90 border-2 border-primary/30 shadow-[0_6px_16px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-2px_6px_rgba(0,0,0,0.4)] relative before:absolute before:inset-0 before:rounded-lg before:bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)] group overflow-hidden"
                  >
                    <img
                      src={scrappyImage}
                      alt="Scrappy"
                      loading="lazy"
                      decoding="async"
                      className="absolute top-8 -right-8 w-1/2 h-1/2 object-contain opacity-0 group-hover:opacity-100 group-hover:animate-vibrate transition-opacity duration-300 pointer-events-none z-10"
                    />
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-mono text-primary drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]">
                          ► MESSAGE {message.messageNumber}
                        </CardTitle>
                        <span className="text-xs text-muted-foreground font-mono bg-background/40 px-2 py-1 rounded shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
                          {message.formattedDate}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground font-mono text-sm leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                        {message.content || ""}
                      </p>
                    </CardContent>
                  </Card>
                );
              })
            : !messagesLoading &&
              !messagesError && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground italic drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                    More messages will appear as they're received...
                  </p>
                </div>
              )}
        </div>
      </div>
    </section>
  );
};

