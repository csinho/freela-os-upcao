import { createFileRoute } from "@tanstack/react-router";
import { handleWooviWebhook } from "@/lib/api/request-handlers";

export const Route = createFileRoute("/api/webhooks/woovi")({
  server: {
    handlers: {
      POST: async ({ request }) => handleWooviWebhook(request),
    },
  },
});
