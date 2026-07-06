"use client";

import { useRef, useState } from "react";
import { Bot, Mic, Send, User } from "lucide-react";
import { toast } from "sonner";

import { AiPanel } from "@/components/ai-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

/**
 * Canned intent matching for the demo. In production this is an OpenAI GPT
 * call via a Supabase Edge Function with order/customer context injected.
 */
function answerFor(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("refill") && (q.includes("how much") || q.includes("price") || q.includes("magkano"))) {
    return "A 5-gallon refill is ₱30 for Purified, ₱40 for Mineral, ₱45 for Distilled, and ₱50 for Alkaline. Delivery is free for orders ₱150 and up!";
  }
  if (q.includes("where") && q.includes("order")) {
    return "Your order ORD-4240 is out for delivery with Rey — it will arrive in about 24 minutes. You can watch the live location in the tracking link we sent you.";
  }
  if (q.includes("tomorrow") || q.includes("deliver")) {
    return "Sure! I can schedule a delivery for tomorrow. Your usual is 3× Purified 5-Gallon — should I book that for the morning round (8–11 AM) or the afternoon round (1–5 PM)?";
  }
  if (q.includes("alkaline")) {
    return "Alkaline water is ₱50 per 5-gallon refill. It's our fastest-growing product this summer — would you like to try a weekly subscription and save 8%?";
  }
  if (q.includes("hours") || q.includes("open")) {
    return "We're open Monday to Saturday 7 AM–7 PM and Sunday 8 AM–5 PM. Deliveries run in morning and afternoon rounds.";
  }
  return "I can help with prices, delivery schedules, order tracking, and subscriptions. Try asking \"How much is a refill?\" or \"Where is my order?\"";
}

const customerSamples = ["How much is a refill?", "Where is my order?", "I need delivery tomorrow."];

const voiceOrderDemo = {
  spoken: "I need two gallons tomorrow morning.",
  parsed: {
    intent: "create_order",
    product: "Purified 5 Gallon",
    quantity: 2,
    schedule: "Tomorrow, 8–11 AM round",
    customer: "Recognized from phone number: Jason Reyes",
  },
};

const staffCommands = [
  { say: "Show today's deliveries", does: "Opens the delivery list filtered to today's 14 stops." },
  { say: "Record payment", does: "Starts a payment entry — amount and order confirmed by voice." },
  { say: "How many 5-gallon containers left?", does: "Answers: \"200 filled containers, about 13 days of stock.\"" },
  { say: "Mark ORD-4243 delivered", does: "Updates the order, notifies the customer, logs GPS position." },
];

export function AssistantPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: "Hi! I'm the AquaFlow assistant. Ask me about prices, orders, or deliveries." },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  function send(text: string) {
    const question = text.trim();
    if (!question) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, { role: "bot", text: answerFor(question) }]);
      scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
    }, 450);
    setTimeout(() => scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" }), 50);
  }

  return (
    <Tabs defaultValue="chatbot">
      <TabsList>
        <TabsTrigger value="chatbot">Customer Chatbot</TabsTrigger>
        <TabsTrigger value="voice">Voice Ordering</TabsTrigger>
        <TabsTrigger value="staff">Staff Voice Assistant</TabsTrigger>
      </TabsList>

      <TabsContent value="chatbot" className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="flex flex-col lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="size-4 text-primary" /> Support Chat
            </CardTitle>
            <CardDescription>Answers instantly, 24/7 — hands off to a human when unsure</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-3">
            <div ref={scrollRef} className="h-80 space-y-3 overflow-y-auto rounded-lg border bg-muted/40 p-3">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex gap-2", m.role === "user" && "flex-row-reverse")}>
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full",
                      m.role === "bot" ? "bg-primary text-primary-foreground" : "bg-secondary"
                    )}
                  >
                    {m.role === "bot" ? <Bot className="size-3.5" /> : <User className="size-3.5" />}
                  </div>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                      m.role === "bot" ? "bg-card border" : "bg-primary text-primary-foreground"
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about prices, orders, deliveries…"
              />
              <Button type="submit" size="icon">
                <Send className="size-4" />
              </Button>
            </form>
            <div className="flex flex-wrap gap-2">
              {customerSamples.map((s) => (
                <Button key={s} variant="outline" size="sm" onClick={() => send(s)}>
                  {s}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div>
          <AiPanel title="Production setup">
            This demo uses canned intents. Wired for production, the chatbot is an OpenAI GPT call
            inside a Supabase Edge Function with the customer&apos;s orders, subscription, and the
            live price list injected as context — then exposed to Facebook Messenger and WhatsApp
            through n8n.
          </AiPanel>
        </div>
      </TabsContent>

      <TabsContent value="voice" className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="size-4 text-primary" /> Voice Order Demo
            </CardTitle>
            <CardDescription>Speech-to-text → intent parsing → order draft</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border bg-muted/40 p-4">
              <p className="text-xs font-medium uppercase text-muted-foreground">Customer says</p>
              <p className="mt-1 text-lg font-medium">&ldquo;{voiceOrderDemo.spoken}&rdquo;</p>
            </div>
            <div className="space-y-2 rounded-xl border p-4 text-sm">
              <p className="text-xs font-medium uppercase text-muted-foreground">AI extracts</p>
              <div className="flex justify-between"><span className="text-muted-foreground">Intent</span><Badge variant="secondary">{voiceOrderDemo.parsed.intent}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Product</span><span>{voiceOrderDemo.parsed.product}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span>{voiceOrderDemo.parsed.quantity}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Schedule</span><span>{voiceOrderDemo.parsed.schedule}</span></div>
              <p className="pt-1 text-xs text-muted-foreground">{voiceOrderDemo.parsed.customer}</p>
            </div>
            <Button
              className="w-full"
              onClick={() => toast.success("Order created: 2× Purified 5 Gallon, tomorrow 8–11 AM, Cash on Delivery.")}
            >
              Confirm &amp; Create Order
            </Button>
          </CardContent>
        </Card>
        <div>
          <AiPanel title="How it works">
            Voice notes from calls, Messenger, or WhatsApp are transcribed (Whisper), then a GPT
            function-call extracts product, quantity, and schedule. Ambiguity — like &ldquo;two
            gallons&rdquo; without a water type — falls back to the customer&apos;s favorite
            product, and the confirmation message spells out the assumption before the order is placed.
          </AiPanel>
        </div>
      </TabsContent>

      <TabsContent value="staff" className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Voice Commands for Staff</CardTitle>
            <CardDescription>Hands-free operation for drivers and cashiers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {staffCommands.map((c) => (
              <div key={c.say} className="rounded-lg border p-3">
                <p className="text-sm font-medium">&ldquo;{c.say}&rdquo;</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{c.does}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <div>
          <AiPanel title="Why voice for staff">
            Drivers are on the road and cashiers have wet hands half the day. Voice commands map to
            the same actions as the UI (record payment, mark delivered, check stock) with a spoken
            confirmation before anything is written to the database.
          </AiPanel>
        </div>
      </TabsContent>
    </Tabs>
  );
}
