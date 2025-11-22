import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { ScrappyMessage } from "../types/database";

const ITEMS_PER_PAGE = 10;

export default function ScrappyMessagesTable() {
  const [messages, setMessages] = useState<ScrappyMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    // Reset to page 1 when data changes
    setCurrentPage(1);
  }, [messages.length]);

  async function fetchMessages() {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("scrappy_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (fetchError) {
        throw fetchError;
      }

      setMessages(data || []);
    } catch (err) {
      console.error("Error fetching scrappy messages:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch scrappy messages"
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString();
  }

  const totalPages = Math.ceil(messages.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedMessages = messages.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-muted-foreground">Loading scrappy messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-card p-4">
        <p className="text-destructive">Error: {error}</p>
        <button
          onClick={fetchMessages}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h2 className="text-xl font-semibold">Scrappy Messages</h2>
        <button
          onClick={fetchMessages}
          className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity"
        >
          Refresh
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Content
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Faction
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Verified
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Created At
              </th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No scrappy messages found
                </td>
              </tr>
            ) : (
              paginatedMessages.map((message) => (
                <tr
                  key={message.id}
                  className="border-b border-border hover:bg-secondary/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                    {message.id.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3 text-sm max-w-md">
                    <p className="line-clamp-3">{message.content}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {message.faction ? (
                      <span className="text-foreground">{message.faction}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        message.verified
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {message.verified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(message.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {messages.length > 0 && (
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, messages.length)} of{" "}
            {messages.length} messages
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
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
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

