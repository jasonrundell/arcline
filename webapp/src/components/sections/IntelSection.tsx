import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIntel } from "@/hooks/use-intel";
import { formatDistanceToNow } from "date-fns";
import { sanitizeText } from "@/lib/sanitize";
import { CONTACT } from "@/constants";

/**
 * IntelSection Component
 *
 * Displays verified Intel reports from the "Raider Report" faction. Fetches
 * intel from Supabase, formats relative dates, and displays them in cards
 * with sanitized content. Shows priority badges and verification status.
 *
 * @component
 * @example
 * ```tsx
 * <IntelSection />
 * ```
 */
export const IntelSection = () => {
  const {
    data: intel,
    isLoading: intelLoading,
    error: intelError,
  } = useIntel();

  const formattedIntel = useMemo(() => {
    if (!intel) return [];
    return intel.map((report) => {
      const reportDate = new Date(report.created_at);
      const formattedDate = formatDistanceToNow(reportDate, {
        addSuffix: true,
      });
      const reportId = report.id.slice(0, 8).toUpperCase();
      return {
        ...report,
        formattedDate,
        reportId,
      };
    });
  }, [intel]);

  return (
    <section id="intel" className="py-20 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/20 to-transparent"></div>
      <div className="container mx-auto relative">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
            Intel Submissions
          </h3>
          <p className="text-muted-foreground drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
            Anonymous intelligence reports from real raiders that have called
            the hotline{" "}
            <a href={`tel:${CONTACT.PHONE}`} className="underline">
              {CONTACT.PHONE}
            </a>
          </p>
        </div>
        <div className="max-w-4xl mx-auto space-y-6">
          {intelLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                Loading intel reports...
              </p>
            </div>
          )}
          {intelError && (
            <div className="text-center py-8">
              <p className="text-destructive drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                Error loading intel reports. Please try again later.
              </p>
            </div>
          )}
          {formattedIntel.length > 0
            ? formattedIntel.map((report) => {
                return (
                  <Card
                    key={report.id}
                    className="bg-gradient-to-br from-card to-secondary border-2 border-border"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                          Report #{report.reportId}
                        </CardTitle>
                        <span className="text-xs text-muted-foreground bg-background/30 px-2 py-1 rounded shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
                          {report.formattedDate}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-3 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                        {sanitizeText(report.content)}
                      </p>
                      <div className="flex gap-2">
                        {report.priority && (
                          <span className="px-3 py-1 bg-gradient-to-b from-primary/20 to-primary/10 text-primary text-xs rounded-full border border-primary/40 shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]">
                            {report.priority}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            : !intelLoading &&
              !intelError && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground italic drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                    Submit intel by calling the hotline...
                  </p>
                </div>
              )}
        </div>
      </div>
    </section>
  );
};
