import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import scrappyBg from "@/assets/scrappy-messages-bg.webp";
import scrappyImage from "@/assets/scrappy.webp";
import { useMessages } from "@/hooks/use-messages";
import { format } from "date-fns";
import { sanitizeText } from "@/lib/sanitize";
import { CONTACT } from "@/constants";
import { Section } from "@/components/layout/Section";

/**
 * ScrappySection Component
 *
 * Displays verified messages from Scrappy's message board. Fetches messages from
 * Supabase, formats dates, and displays them in cards with sanitized content.
 * Includes loading and error states.
 *
 * @component
 * @example
 * ```tsx
 * <ScrappySection />
 * ```
 */
export const ScrappySection = () => {
  const {
    data: messages,
    isLoading: messagesLoading,
    error: messagesError,
  } = useMessages();

  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 3;

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

  const totalPages = Math.ceil(formattedMessages.length / messagesPerPage);
  const startIndex = (currentPage - 1) * messagesPerPage;
  const endIndex = startIndex + messagesPerPage;
  const paginatedMessages = formattedMessages.slice(startIndex, endIndex);

  // Reset to page 1 when messages change and current page is out of bounds
  useEffect(() => {
    if (formattedMessages.length > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [formattedMessages.length, currentPage, totalPages]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <Section
      id="messages"
      paddingY="lg"
      backgroundImage={scrappyBg}
      backgroundOverlay
      overflowHidden
      containerClassName="relative z-10"
    >
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold mb-4 tracking-widest">
          Messages for Scrappy
        </h3>
        <p className="text-muted-foreground">
          Real messages from other raiders that have sent Scrappy messages on
          the hotline{" "}
          <a href={`tel:${CONTACT.PHONE}`} className="underline">
            {CONTACT.PHONE}
          </a>
          .
        </p>
      </div>
      <div className="max-w-4xl mx-auto space-y-6">
        {messagesLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        )}
        {messagesError && (
          <div className="text-center py-8">
            <p className="text-destructive">
              Error loading messages. Please try again later.
            </p>
          </div>
        )}
        {formattedMessages.length > 0 ? (
          <>
            {paginatedMessages.map((message) => {
              return (
                <Card
                  key={message.id}
                  className="bg-gradient-to-br from-secondary via-secondary to-secondary/90 border-2 border-primary/30 relative before:absolute before:inset-0 before:rounded-lg before:bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)] group overflow-hidden"
                >
                  <img
                    src={scrappyImage}
                    alt="Scrappy"
                    loading="lazy"
                    decoding="async"
                    className="absolute top-8 -right-8 w-1/2 h-1/2 object-contain opacity-0 group-hover:opacity-100 group-hover:animate-vibrate transition-opacity duration-300 pointer-events-none z-10"
                  />
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                      <CardTitle className="text-lg font-mono text-primary">
                        MESSAGE #{message.messageNumber}
                      </CardTitle>
                      <span className="text-xs text-muted-foreground font-mono bg-background/40 px-2 py-1 rounded">
                        {message.formattedDate}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground font-mono text-sm leading-relaxed">
                      {sanitizeText(message.content)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-6">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 font-mono text-sm bg-secondary border-2 border-primary/30 rounded hover:bg-secondary/80 hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  ◄ PREV
                </button>
                <span className="text-sm font-mono text-muted-foreground bg-background/40 px-3 py-1 rounded shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
                  PAGE {currentPage} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 font-mono text-sm bg-secondary border-2 border-primary/30 rounded hover:bg-secondary/80 hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  NEXT ►
                </button>
              </div>
            )}
          </>
        ) : (
          !messagesLoading &&
          !messagesError && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground italic">
                More messages will appear as they're received...
              </p>
            </div>
          )
        )}
      </div>
      <div className="mx-auto mt-12">
        <div className="flex flex-col text-center items-center justify-center gap-3 mb-2">
          <p className="text-3xl md:text-5xl font-bold text-primary hover:text-primary/80 z-10">
            CALL SCRAPPY NOW!!!
          </p>

          <a
            href={`tel:${CONTACT.PHONE}`}
            className="text-3xl md:text-5xl font-bold text-primary hover:text-primary/80 transition-all animate-pulse z-10"
          >
            {CONTACT.DISPLAY}
          </a>
        </div>
      </div>
    </Section>
  );
};
