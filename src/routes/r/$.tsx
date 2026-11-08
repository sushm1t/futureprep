import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BusyIndicator } from "@/jobstudio/components/BusyIndicator";
import { getSavedTracerLinks, recordTracerClick } from "@/jobstudio/utils/tracerLinks";

const handleServerRedirect = async ({ request }: { request: Request }) => {
  const { handleApi } = await import("@/server/jobstudio-api");
  return handleApi(request);
};

export const Route = createFileRoute("/r/$")({
  server: { handlers: { GET: handleServerRedirect } },
  component: TracerRedirectComponent,
});

function TracerRedirectComponent() {
  const params = Route.useParams();
  const token = (params as any)["_splat"] || "";
  const [status, setStatus] = useState("Forwarding to verified destination...");

  useEffect(() => {
    if (!token) {
      window.location.replace("/");
      return;
    }

    const cleanToken = token.replace(/^\/+/, "").trim();

    // 1. Try resolving from client-side tracer link store
    const links = getSavedTracerLinks();
    const match = links.find((l) => l.token === cleanToken || l.token === token);

    if (match && match.targetUrl) {
      recordTracerClick(match.token, {
        referrer: document.referrer || "Direct PDF Document",
        network: "Recruiter Network",
      });
      window.location.replace(match.targetUrl);
      return;
    }

    // 2. Fallback: check server tracer store
    fetch(`/api/tracer/redirect?token=${encodeURIComponent(cleanToken)}`)
      .then((res) => {
        if (res.redirected && res.url && !res.url.endsWith("/")) {
          window.location.replace(res.url);
        } else {
          window.location.replace("/");
        }
      })
      .catch(() => {
        window.location.replace("/");
      });
  }, [token]);

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground">
      <BusyIndicator label={status} />
      <p className="text-xs text-muted-foreground mt-4 font-mono">
        Connecting to candidate profile via secure recruiter radar...
      </p>
    </main>
  );
}
