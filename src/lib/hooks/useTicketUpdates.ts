"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Client-side Supabase instance for realtime subscriptions
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TicketUpdate {
  id: number;
  title: string;
  status: string;
  priority: string;
  category: string | null;
  aiAnalysis: Record<string, unknown> | null;
  updatedAt: string;
}

/**
 * Real-time hook that listens for changes to a specific ticket.
 * Automatically updates the UI state when the ticket is modified in Supabase.
 *
 * Usage:
 *   const { ticket, isLoading } = useTicketUpdates("42");
 */
export function useTicketUpdates(ticketId: string) {
  const [ticket, setTicket] = useState<TicketUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch the initial ticket data
    const fetchTicket = async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", parseInt(ticketId))
        .single();

      if (!error && data) {
        setTicket(data as TicketUpdate);
      }
      setIsLoading(false);
    };

    fetchTicket();

    // 2. Subscribe to real-time changes on this specific ticket
    const channel = supabase
      .channel(`ticket-${ticketId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tickets",
          filter: `id=eq.${ticketId}`,
        },
        (payload) => {
          setTicket(payload.new as TicketUpdate);
        }
      )
      .subscribe();

    // 3. Cleanup: unsubscribe when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  return { ticket, isLoading };
}
