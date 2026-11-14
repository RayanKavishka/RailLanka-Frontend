import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AiLogo from "../../components/ui/AiLogo";
import { askAI } from "../../services/aiAgentService";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
  failed?: boolean;
  retryText?: string;
}

const MAX_LENGTH = 500;

const SUGGESTIONS = [
  "Show journeys from Colombo Fort to Kandy today",
  "What is the timetable for the Colombo to Galle route?",
  "Show my latest tickets",
  "Is my QR code still valid?",
  "What is the status of my payments?",
  "Which stations are currently active?",
];

const WELCOME_TEXT =
  "Hello! 👋 I'm your railway assistant. Ask me about stations, routes, timetables, journeys, or your own tickets, payments and QR codes.";

const timeNow = () =>
  new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const makeWelcome = (): ChatMessage => ({
  id: "welcome",
  role: "assistant",
  content: WELCOME_TEXT,
  time: timeNow(),
});

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7FD6DC]";

const Icon = ({
  children,
  size = 20,
  className,
}: {
  children: ReactNode;
  size?: number;
  className?: string;
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

const ArrowLeftIcon = ({ size }: { size?: number }) => (
  <Icon size={size}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </Icon>
);

const SendIcon = ({ size }: { size?: number }) => (
  <Icon size={size}>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </Icon>
);

const TrashIcon = ({ size }: { size?: number }) => (
  <Icon size={size}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Icon>
);

const RefreshIcon = ({ size }: { size?: number }) => (
  <Icon size={size}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </Icon>
);

const renderInline = (text: string): ReactNode[] =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.length > 4 && part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-bold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );

const BULLET = /^\s*[-*•]\s+/;

const FormattedText = ({ text }: { text: string }) => (
  <div className="space-y-1.5 break-words">
    {text.split("\n").map((line, i) => {
      if (!line.trim()) return <div key={i} className="h-1" />;

      if (BULLET.test(line)) {
        return (
          <div key={i} className="flex gap-2">
            <span aria-hidden="true">•</span>
            <span className="min-w-0">{renderInline(line.replace(BULLET, ""))}</span>
          </div>
        );
      }

      return <p key={i}>{renderInline(line)}</p>;
    })}
  </div>
);

const MessageBubble = ({
  message,
  onRetry,
}: {
  message: ChatMessage;
  onRetry: (message: ChatMessage) => void;
}) => {
  const isUser = message.role === "user";

  const bubbleStyle = isUser
    ? "rounded-br-md bg-[#006D77] text-white"
    : message.failed
      ? "rounded-bl-md border border-[#F5C2C2] bg-[#FFF5F5] text-[#9B1C1C]"
      : "rounded-bl-md border border-[#E2E7EF] bg-white text-[#0D1B2A]";

  return (
    <div className={`flex items-end gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && <AiLogo size={32} className="mb-6 shrink-0" />}

      <div
        className={`flex min-w-0 max-w-[85%] flex-col sm:max-w-[78%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 text-[15px] leading-6 shadow-sm ${bubbleStyle}`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <FormattedText text={message.content} />
          )}
        </div>

        <div className="mt-1 flex items-center gap-3 px-1 text-[11px] text-[#8A98AA]">
          <span>{message.time}</span>
          {message.failed && message.retryText && (
            <button
              type="button"
              onClick={() => onRetry(message)}
              className={`inline-flex cursor-pointer items-center gap-1 font-semibold text-[#006D77] hover:underline ${FOCUS}`}
            >
              <RefreshIcon size={12} />
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex items-end gap-2.5" role="status" aria-label="Assistant is typing">
    <AiLogo size={32} className="shrink-0" />
    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[#E2E7EF] bg-white px-4 py-4 shadow-sm">
      <span className="h-2 w-2 animate-bounce rounded-full bg-[#006D77] motion-reduce:animate-none" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-[#006D77] [animation-delay:150ms] motion-reduce:animate-none" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-[#006D77] [animation-delay:300ms] motion-reduce:animate-none" />
    </div>
  </div>
);

const AiChatPage = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [messages, setMessages] = useState<ChatMessage[]>([makeWelcome()]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialSent = useRef(false);

  const ask = useCallback(async (text: string) => {
    setLoading(true);

    try {
      const reply = await askAI(text);

      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          content: reply || "Sorry, I couldn't find an answer. Please try again.",
          time: timeNow(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          content:
            "Sorry, I couldn't reach the assistant. Please check your connection and try again.",
          time: timeNow(),
          failed: true,
          retryText: text,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim().slice(0, MAX_LENGTH);
      if (!text || loading) return;

      setMessages((prev) => [
        ...prev,
        { id: newId(), role: "user", content: text, time: timeNow() },
      ]);
      setInput("");
      void ask(text);
    },
    [ask, loading],
  );

  const retry = (message: ChatMessage) => {
    if (!message.retryText || loading) return;

    setMessages((prev) => prev.filter((m) => m.id !== message.id));
    void ask(message.retryText);
  };

  const clearChat = () => {
    if (loading) return;
    setMessages([makeWelcome()]);
    setInput("");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    send(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  };

  useEffect(() => {
    const q = params.get("q");

    if (q && !initialSent.current) {
      initialSent.current = true;
      setParams({}, { replace: true });
      send(q);
    }
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "end",
    });
  }, [messages, loading]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input]);

  const showSuggestions = messages.length === 1 && !loading;
  const canSend = input.trim().length > 0 && !loading;

  return (
    <div className="flex h-[100dvh] w-full bg-[#F4F6FA] text-[#0D1B2A] antialiased [font-family:'Plus_Jakarta_Sans',Inter,system-ui,-apple-system,'Segoe_UI',Roboto,sans-serif] md:p-6 lg:gap-6 xl:p-8">
      <aside className="hidden w-[340px] shrink-0 flex-col overflow-y-auto rounded-[28px] bg-[linear-gradient(180deg,#0D1B2A_0%,#13264F_60%,#0B132B_100%)] p-7 text-white lg:flex xl:w-[380px]">
        <AiLogo size={64} />

        <h1 className="mt-6 text-[28px] font-extrabold leading-9 tracking-[-0.02em]">
          RailLanka <span className="text-[#7FD6DC]">AI</span>
        </h1>
        <p className="mt-3 text-[15px] leading-6 text-white/70">
          Your personal railway assistant. Ask in plain language and get answers
          from live system data.
        </p>

        <p className="mt-8 text-xs font-bold uppercase tracking-[0.14em] text-[#7FD6DC]">
          Try asking
        </p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {SUGGESTIONS.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => send(s)}
                disabled={loading}
                className={`w-full cursor-pointer rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-left text-sm leading-5 text-white/90 transition hover:border-[#7FD6DC]/60 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.05] p-4 pt-4 text-[13px] leading-5 text-white/70">
          <p className="font-semibold text-white">Good to know</p>
          <p className="mt-1.5">
            I only answer questions about this railway system and your own
            account data. I can't share information about staff or unrelated
            topics.
          </p>
        </div>
      </aside>

      <main className="mx-auto flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-white md:max-w-3xl md:rounded-[28px] md:shadow-[0_16px_50px_rgba(13,27,42,0.12)] lg:max-w-none">
        <header className="flex items-center gap-3 border-b border-[#E2E7EF] bg-white px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-4 md:pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className={`grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full text-[#0D1B2A] transition-colors hover:bg-[#F4F6FA] ${FOCUS}`}
          >
            <ArrowLeftIcon size={20} />
          </button>

          <AiLogo size={42} className="shrink-0 lg:hidden" />

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-extrabold leading-5 sm:text-lg sm:leading-6">
              RailLanka AI
            </h2>
            <p className="flex items-center gap-1.5 text-xs leading-4 text-[#5B6B7E]">
              <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
              Online · Railway assistant
            </p>
          </div>

          <button
            type="button"
            onClick={clearChat}
            disabled={loading || messages.length === 1}
            aria-label="Clear conversation"
            title="Clear conversation"
            className={`grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full text-[#5B6B7E] transition-colors hover:bg-[#F4F6FA] hover:text-[#0D1B2A] disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`}
          >
            <TrashIcon size={19} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#F8FAFC] px-3 py-5 sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} onRetry={retry} />
            ))}

            {showSuggestions && (
              <div className="flex flex-wrap gap-2 pl-[42px] lg:hidden">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className={`cursor-pointer rounded-full border border-[#CFE3E5] bg-white px-3.5 py-2 text-left text-[13px] font-medium leading-4 text-[#006D77] transition hover:border-[#006D77] hover:bg-[#006D77]/5 ${FOCUS}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {loading && <TypingIndicator />}

            <div ref={endRef} />
          </div>
        </div>

        <div className="border-t border-[#E2E7EF] bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 lg:px-10">
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-3xl items-end gap-2.5"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              maxLength={MAX_LENGTH}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about journeys, stations or your tickets..."
              aria-label="Message"
              className="max-h-[140px] min-h-[48px] w-full flex-1 resize-none rounded-2xl border border-[#E2E7EF] bg-[#F4F6FA] px-4 py-3 text-[15px] leading-6 text-[#0D1B2A] outline-none transition placeholder:text-[#9AA7B8] focus:border-[#006D77] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,109,119,0.18)]"
            />

            <button
              type="submit"
              disabled={!canSend}
              aria-label="Send message"
              className={`grid h-12 w-12 shrink-0 cursor-pointer place-items-center rounded-full bg-[#006D77] text-white shadow-[0_8px_20px_rgba(0,109,119,0.3)] transition duration-150 hover:-translate-y-px disabled:cursor-not-allowed disabled:bg-[#B7C4D2] disabled:shadow-none disabled:hover:translate-y-0 motion-reduce:transition-none ${FOCUS}`}
            >
              <SendIcon size={20} />
            </button>
          </form>

          <p className="mx-auto mt-2 flex max-w-3xl items-center justify-between gap-3 text-[11px] leading-4 text-[#8A98AA]">
            <span>AI can make mistakes. Check important details.</span>
            <span className="shrink-0 tabular-nums">
              {input.length}/{MAX_LENGTH}
            </span>
          </p>
        </div>
      </main>
    </div>
  );
};



export default AiChatPage;