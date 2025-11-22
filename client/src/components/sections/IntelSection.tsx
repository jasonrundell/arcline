import { useMemo, useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { useIntel } from "@/hooks/use-intel";
import { sanitizeText } from "@/lib/sanitize";
import { CONTACT } from "@/constants";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/layout/Section";
import intelBg from "@/assets/intel-bg.webp";

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
  const buttonClasses =
    "px-4 py-2 font-mono text-[#00ff00] bg-transparent border border-transparent hover:border-[#00ff00]/50 hover:bg-[#00ff00]/10 disabled:hidden";

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
    <Section
      id="intel"
      paddingY="lg"
      gradientIntensity="light"
      backgroundImage={intelBg}
      backgroundOverlay
      overflowHidden
      containerClassName="relative z-10"
    >
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
      <div className="max-w-4xl mx-auto space-y-4 relative">
        {/* CRT Monitor Container */}
        <div className="bg-black/95 border-4 border-[#00ff00]/30 p-6 rounded-2xl shadow-[0_0_20px_rgba(0,255,0,0.3),inset_0_0_40px_rgba(0,255,0,0.1)] relative overflow-hidden">
          {/* Scanline effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(transparent_50%,rgba(0,255,0,0.5)_50%)] bg-[length:100%_4px] animate-scanlines"></div>

          {intelLoading && (
            <div className="text-center py-8">
              <p className="font-mono text-[#00ff00] text-sm">
                Loading intel reports...
              </p>
            </div>
          )}
          {intelError && (
            <div className="text-center py-8">
              <p className="font-mono text-[#00ff00] text-sm">
                Error loading intel reports. Please try again later.
              </p>
            </div>
          )}
          {formattedIntel.length > 0 ? (
            <>
              {paginatedIntel.map((report) => {
                return (
                  <div
                    key={report.id}
                    className="mb-6 pb-6 border-b border-[#00ff00]/20 last:border-b-0 last:mb-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-mono text-[#00ff00] font-bold tracking-wider">
                        Intel #{report.reportId}
                      </h4>
                      <span className="text-xs font-mono text-[#00ff00]/70">
                        {report.formattedDate}
                      </span>
                    </div>
                    <p className="font-mono text-[#00ff00] text-sm leading-relaxed mb-3">
                      {sanitizeText(report.content)}
                    </p>
                    <div className="flex gap-2">
                      {report.priority && (
                        <span className="px-3 py-1 font-mono text-[#00ff00] text-xs border border-[#00ff00]/50 bg-[#00ff00]/5">
                          {report.priority}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-6 mt-6 ">
                  <Button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={buttonClasses}
                  >
                    ◄ <span className="hidden sm:inline">PREV</span>
                  </Button>
                  <span className="w-full md:w-auto text-center px-4 py-2 font-mono text-[#00ff00]/70">
                    PAGE {currentPage} / {totalPages}
                  </span>
                  <Button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={buttonClasses}
                  >
                    <span className="hidden sm:inline">NEXT</span> ►
                  </Button>
                </div>
              )}
            </>
          ) : (
            !intelLoading &&
            !intelError && (
              <div className="text-center py-8">
                <p className="text-sm font-mono text-[#00ff00]/70 italic">
                  Submit intel by calling the hotline...
                </p>
              </div>
            )
          )}
        </div>
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
