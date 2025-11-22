import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Log } from "../types/database";

interface GroupedLogs {
  [sessionId: string]: Log[];
}

const SESSIONS_PER_PAGE = 10;

export default function LogsTable() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (fetchError) {
        throw fetchError;
      }

      setLogs(data || []);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString();
  }

  function getLevelColor(level: string) {
    switch (level) {
      case "error":
        return "text-red-400";
      case "warn":
        return "text-yellow-400";
      case "info":
        return "text-blue-400";
      case "debug":
        return "text-gray-400";
      default:
        return "text-foreground";
    }
  }

  function groupLogsBySession(logs: Log[]): GroupedLogs {
    return logs.reduce((groups, log) => {
      const sessionId = log.session_id;
      if (!groups[sessionId]) {
        groups[sessionId] = [];
      }
      groups[sessionId].push(log);
      return groups;
    }, {} as GroupedLogs);
  }

  function toggleSession(sessionId: string) {
    setExpandedSessions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  }

  function expandAllSessions(groupedLogs: GroupedLogs) {
    setExpandedSessions(new Set(Object.keys(groupedLogs)));
  }

  function collapseAllSessions() {
    setExpandedSessions(new Set());
  }

  const UNRECOGNIZED_MESSAGE =
    "Didn't catch that, Raider. Speak clearly. Say 'extraction' for an extraction point, 'loot' for resource locations, 'scrappy' for material updates, 'submit intel' to share intel, or 'listen to intel' for the latest news.";

  function getUnrecognizedCount(logs: Log[]): number {
    return logs.filter(
      (log) =>
        log.message === "Server - received response from router:" &&
        log.metadata &&
        typeof log.metadata.firstActionSay === "string" &&
        log.metadata.firstActionSay === UNRECOGNIZED_MESSAGE
    ).length;
  }

  interface PromptWithCount {
    prompt: string;
    count: number;
  }

  function getReceivedPrompts(logs: Log[]): PromptWithCount[] {
    const promptMap = new Map<string, number>();

    logs
      .filter((log) => log.message.startsWith("Received prompt:"))
      .forEach((log) => {
        const prompt = log.message.replace(/^Received prompt:\s*/, "").trim();
        if (prompt.length > 0) {
          promptMap.set(prompt, (promptMap.get(prompt) || 0) + 1);
        }
      });

    return Array.from(promptMap.entries())
      .map(([prompt, count]) => ({ prompt, count }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
  }

  function getSessionSummary(logs: Log[]) {
    const errorCount = logs.filter((l) => l.level === "error").length;
    const warnCount = logs.filter((l) => l.level === "warn").length;
    const unrecognizedCount = getUnrecognizedCount(logs);
    const receivedPrompts = getReceivedPrompts(logs);
    const dates = logs.map((l) => new Date(l.created_at));
    const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
    const latest = new Date(Math.max(...dates.map((d) => d.getTime())));
    return {
      errorCount,
      warnCount,
      unrecognizedCount,
      receivedPrompts,
      earliest,
      latest,
      total: logs.length,
    };
  }

  useEffect(() => {
    // Reset to page 1 when data changes
    setCurrentPage(1);
  }, [logs.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-muted-foreground">Loading logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-card p-4">
        <p className="text-destructive">Error: {error}</p>
        <button
          onClick={fetchLogs}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }

  const groupedLogs = groupLogsBySession(logs);
  const allSessionIds = Object.keys(groupedLogs).sort((a, b) => {
    // Sort by most recent log in each session
    const aLatest = Math.max(
      ...groupedLogs[a].map((l) => new Date(l.created_at).getTime())
    );
    const bLatest = Math.max(
      ...groupedLogs[b].map((l) => new Date(l.created_at).getTime())
    );
    return bLatest - aLatest;
  });

  const totalPages = Math.ceil(allSessionIds.length / SESSIONS_PER_PAGE);
  const startIndex = (currentPage - 1) * SESSIONS_PER_PAGE;
  const endIndex = startIndex + SESSIONS_PER_PAGE;
  const sessionIds = allSessionIds.slice(startIndex, endIndex);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Logs</h2>
          {allSessionIds.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {allSessionIds.length} session
              {allSessionIds.length !== 1 ? "s" : ""} • {logs.length} log
              {logs.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {allSessionIds.length > 0 && (
            <>
              <button
                onClick={() => expandAllSessions(groupedLogs)}
                className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                Expand All
              </button>
              <button
                onClick={collapseAllSessions}
                className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                Collapse All
              </button>
            </>
          )}
          <button
            onClick={fetchLogs}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            Refresh
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        {logs.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground">
            No logs found
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sessionIds.map((sessionId) => {
              const sessionLogs = groupedLogs[sessionId];
              const isExpanded = expandedSessions.has(sessionId);
              const summary = getSessionSummary(sessionLogs);
              const sortedLogs = [...sessionLogs].sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime()
              );

              return (
                <div
                  key={sessionId}
                  className="border-b border-border last:border-b-0"
                >
                  <button
                    onClick={() => toggleSession(sessionId)}
                    className="w-full px-4 py-3 bg-secondary/30 hover:bg-secondary/50 transition-colors text-left flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <span className="text-lg font-mono text-primary">
                        {isExpanded ? "▼" : "▶"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm text-foreground truncate">
                          {sessionId}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>
                            {summary.total} log{summary.total !== 1 ? "s" : ""}
                          </span>
                          {summary.errorCount > 0 && (
                            <span className="text-red-400">
                              {summary.errorCount} error
                              {summary.errorCount !== 1 ? "s" : ""}
                            </span>
                          )}
                          {summary.warnCount > 0 && (
                            <span className="text-yellow-400">
                              {summary.warnCount} warn
                              {summary.warnCount !== 1 ? "ing" : "ing"}
                            </span>
                          )}
                          {summary.unrecognizedCount > 0 && (
                            <span className="text-orange-400 font-medium">
                              {summary.unrecognizedCount} unrecognized input
                              {summary.unrecognizedCount !== 1 ? "s" : ""}
                            </span>
                          )}
                          <span>
                            {formatDate(summary.earliest.toISOString())} -{" "}
                            {formatDate(summary.latest.toISOString())}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      {summary.unrecognizedCount > 0 && (
                        <div className="mt-4 mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-md">
                          <div className="text-sm font-semibold text-orange-400 mb-2">
                            Unrecognized Responses: {summary.unrecognizedCount}
                          </div>
                        </div>
                      )}
                      {summary.receivedPrompts.length > 0 && (
                        <div className="mt-4 mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-md">
                          <div className="text-sm font-semibold text-blue-400 mb-2">
                            User Inputs (
                            {summary.receivedPrompts.reduce(
                              (sum, p) => sum + p.count,
                              0
                            )}
                            )
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {summary.receivedPrompts.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-mono flex items-center gap-1"
                              >
                                <span>"{item.prompt}"</span>
                                {item.count > 1 && (
                                  <span className="bg-blue-600/40 px-1 rounded text-[10px] font-semibold">
                                    {item.count}
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <table className="w-full mt-2">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                              Level
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                              Message
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                              Metadata
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                              Created At
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedLogs.map((log) => {
                            const isUnrecognizedLog =
                              log.message ===
                                "Server - received response from router:" &&
                              log.metadata &&
                              typeof log.metadata.firstActionSay === "string" &&
                              log.metadata.firstActionSay ===
                                UNRECOGNIZED_MESSAGE;

                            return (
                              <tr
                                key={log.id}
                                className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${
                                  isUnrecognizedLog ? "bg-orange-500/5" : ""
                                }`}
                              >
                                <td className="px-4 py-2">
                                  <span
                                    className={`text-xs font-medium ${getLevelColor(
                                      log.level
                                    )}`}
                                  >
                                    {log.level.toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-xs max-w-md">
                                  <div className="truncate" title={log.message}>
                                    {log.message.startsWith(
                                      "Received prompt:"
                                    ) ? (
                                      <>
                                        <span>Received prompt: </span>
                                        <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px] font-mono">
                                          {log.message.replace(
                                            /^Received prompt:\s*/,
                                            ""
                                          )}
                                        </span>
                                      </>
                                    ) : (
                                      log.message
                                    )}
                                    {isUnrecognizedLog && (
                                      <span className="ml-2 px-1.5 py-0.5 bg-orange-500/20 text-orange-300 rounded text-[10px] font-medium">
                                        Unrecognized
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-2 text-xs">
                                  {log.metadata ? (
                                    <details className="cursor-pointer">
                                      <summary className="text-muted-foreground hover:text-foreground text-xs">
                                        View
                                      </summary>
                                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-w-xs">
                                        {JSON.stringify(log.metadata, null, 2)}
                                      </pre>
                                    </details>
                                  ) : (
                                    <span className="text-muted-foreground">
                                      —
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-xs text-muted-foreground">
                                  {formatDate(log.created_at)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {logs.length > 0 && (
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, allSessionIds.length)}{" "}
            of {allSessionIds.length} session
            {allSessionIds.length !== 1 ? "s" : ""} • {logs.length} total log
            {logs.length !== 1 ? "s" : ""}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
