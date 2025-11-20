import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIntel } from "@/hooks/use-intel";
import { formatDistanceToNow } from "date-fns";
import { sanitizeText } from "@/lib/sanitize";
import { CONTACT } from "@/constants";
import { Section } from "@/components/layout/Section";

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

  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 3;

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

  const totalPages = Math.ceil(formattedIntel.length / reportsPerPage);
  const startIndex = (currentPage - 1) * reportsPerPage;
  const endIndex = startIndex + reportsPerPage;
  const paginatedIntel = formattedIntel.slice(startIndex, endIndex);

  // Reset to page 1 when intel changes and current page is out of bounds
  useEffect(() => {
    if (formattedIntel.length > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [formattedIntel.length, currentPage, totalPages]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <Section id="intel" paddingY="lg" hasGradient gradientIntensity="light">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold mb-4 tracking-widest">
          Intel Submissions
        </h3>
        <p className="text-muted-foreground">
          Anonymous intelligence reports from real raiders that have called the
          hotline{" "}
          <a href={`tel:${CONTACT.PHONE}`} className="underline">
            {CONTACT.PHONE}
          </a>
        </p>
      </div>
      <div className="max-w-4xl mx-auto space-y-6">
        {intelLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading intel reports...</p>
          </div>
        )}
        {intelError && (
          <div className="text-center py-8">
            <p className="text-destructive">
              Error loading intel reports. Please try again later.
            </p>
          </div>
        )}
        {formattedIntel.length > 0 ? (
          <>
            {paginatedIntel.map((report) => {
              return (
                <Card
                  key={report.id}
                  className="bg-foreground from-card to-secondary border-2 border-border"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-mono text-secondary">
                        Report #{report.reportId}
                      </CardTitle>
                      <span className="text-xs font-mono text-secondary">
                        {report.formattedDate}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="font-mono text-secondary">
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
          !intelLoading &&
          !intelError && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground italic">
                Submit intel by calling the hotline...
              </p>
            </div>
          )
        )}
      </div>
      <div className="mx-auto mt-12">
        <div className="flex flex-col text-center items-center justify-center gap-3 mb-2">
          <p className="text-3xl md:text-5xl font-bold text-primary hover:text-primary/80 z-10">
            SPERANZA NEEDS YOUR INTEL
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
