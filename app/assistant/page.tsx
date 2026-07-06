import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { AssistantPanel } from "./assistant-panel";

export const metadata: Metadata = { title: "AI Assistant" };

export default function AssistantPage() {
  return (
    <>
      <PageHeader
        title="AI Assistant"
        description="Customer support chatbot, voice ordering, and staff voice commands"
      />
      <main className="p-4 md:p-6">
        <AssistantPanel />
      </main>
    </>
  );
}
