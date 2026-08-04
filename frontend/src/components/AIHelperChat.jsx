import { useState } from "react";
import { FaComments, FaPaperPlane, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";
import { useBill } from "../context/BillContext";

const NAVIGATION = [
  { match: /upload|scan|photo|pdf/i, route: "/bills/upload", label: "Upload Bill" },
  { match: /budget|slab|limit|save/i, route: "/budget", label: "Budget & Slab Guard" },
  { match: /appliance|ac|geyser/i, route: "/profile/appliance-profile", label: "Appliance Profile" },
  { match: /history|old bill/i, route: "/bills/history", label: "Bill History" },
];

function AIHelperChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    latestBill,
    previousBill,
    trendPercent,
    energyScore,
    estimatedBillRange,
    aiExplanation,
    weatherTemp,
    weatherHumidity,
    carbonKg,
    applianceBreakdown,
    dataTier,
    tierInfo,
  } = useBill();
  const navigate = useNavigate();
  const [messages, setMessages] = useState(() => [{ role: "assistant", text: "Hi! I can explain your bill, estimate range, slab guard, and guide you to the right page." }]);

  async function send() {
    const question = input.trim();
    if (!question || loading) return;
    setMessages((items) => [...items, { role: "user", text: question }]);
    setInput("");

    const destination = NAVIGATION.find((item) => item.match.test(question));
    if (destination) {
      setMessages((items) => [...items, { role: "assistant", text: `Open ${destination.label}?`, route: destination.route, label: destination.label }]);
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/api/assistant", {
        question,
        context: {
          latestBill: latestBill
            ? { bill: latestBill.bill, units: latestBill.units, month: latestBill.month, status: latestBill.status }
            : null,
          previousBill: previousBill
            ? { bill: previousBill.bill, units: previousBill.units, month: previousBill.month }
            : null,
          trendPercent,
          energyScore,
          estimatedBillRange,
          aiExplanation,
          weatherTemp,
          weatherHumidity,
          carbonKg,
          applianceBreakdown,
          dataTier,
          tierLabel: tierInfo?.label ?? null,
        },
      });
      setMessages((items) => [...items, { role: "assistant", text: response.data.answer }]);
    } catch {
      setMessages((items) => [...items, { role: "assistant", text: "I couldn't reach the guide right now. Ask about uploads, budget, slabs, or bill history." }]);
    } finally {
      setLoading(false);
    }
  }

  return <div className="fixed bottom-4 right-4 z-50">
    {open && <div className="mb-3 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"><div className="flex items-center justify-between bg-navy px-4 py-3 text-white"><strong>PowerPulse Guide</strong><button onClick={() => setOpen(false)}><FaTimes /></button></div><div className="h-80 space-y-3 overflow-y-auto p-4 text-sm">{messages.map((message, index) => <div key={index} className={message.role === "user" ? "ml-8 rounded-xl bg-indigo-600 p-3 text-white" : "mr-4 rounded-xl bg-mist p-3 text-ink"}><p>{message.text}</p>{message.route && <button onClick={() => { navigate(message.route); setOpen(false); }} className="mt-2 font-semibold text-indigo-700 underline">{message.label}</button>}</div>)}{loading && <div className="rounded-xl bg-mist p-3">Thinking…</div>}</div><div className="flex gap-2 border-t p-3"><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask about your bill or how to use PowerPulse…" className="min-w-0 flex-1 rounded-lg border px-3 py-2" /><button onClick={send} className="rounded-lg bg-amber px-3 text-navy"><FaPaperPlane /></button></div></div>}
    <button onClick={() => setOpen((value) => !value)} className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-xl text-white shadow-lg"><FaComments /></button>
  </div>;
}
export default AIHelperChat;