import { createFileRoute } from "@tanstack/react-router";
import { handleBillingCron } from "@/lib/api/request-handlers";

export const Route = createFileRoute("/api/cron/billing")({
  server: {
    handlers: {
      GET: async ({ request }) => handleBillingCron(request),
    },
  },
});
