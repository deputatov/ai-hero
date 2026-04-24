import ReactMarkdown, { type Components } from "react-markdown";
import type { Message } from "ai";
import { Loader2, SearchIcon } from "lucide-react";

export type MessagePart = NonNullable<Message["parts"]>[number];

interface ChatMessageProps {
  parts: MessagePart[];
  role: string;
  userName: string;
}

const components: Components = {
  // Override default elements with custom styling
  p: ({ children }) => <p className="mb-4 first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-4 list-disc pl-4">{children}</ul>,
  ol: ({ children }) => <ol className="mb-4 list-decimal pl-4">{children}</ol>,
  li: ({ children }) => <li className="mb-1">{children}</li>,
  code: ({ className, children, ...props }) => (
    <code className={`${className ?? ""}`} {...props}>
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-700 p-4">
      {children}
    </pre>
  ),
  a: ({ children, ...props }) => (
    <a
      className="text-blue-400 underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
};

const Markdown = ({ children }: { children: string }) => {
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
};

export const ChatMessage = ({ parts, role, userName }: ChatMessageProps) => {
  const isAI = role === "assistant";

  return (
    <div className="mb-6">
      <div
        className={`rounded-lg p-4 ${
          isAI ? "bg-gray-800 text-gray-300" : "bg-gray-900 text-gray-300"
        }`}
      >
        <p className="mb-2 text-sm font-semibold text-gray-400">
          {isAI ? "AI" : userName}
        </p>

        <div className="prose prose-invert max-w-none">
          {parts.map((part, index) => {
            if (part.type === "text") {
              return <Markdown key={index}>{part.text}</Markdown>;
            }

            if (part.type === "tool-invocation") {
              const { toolInvocation } = part;
              const { toolName, toolCallId, state } = toolInvocation;

              if (state === "call" || state === "partial-call") {
                return (
                  <div
                    key={toolCallId}
                    className="mb-4 flex items-center gap-2 rounded-lg bg-gray-750 p-3 text-sm text-gray-400"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Using {toolName}...</span>
                  </div>
                );
              }

              if (state === "result") {
                return (
                  <div
                    key={toolCallId}
                    className="mb-4 flex items-center gap-2 rounded-lg bg-gray-700 p-3 text-sm text-gray-300"
                  >
                    <SearchIcon className="h-4 w-4 text-blue-400" />
                    <span>
                      Found information using <strong>{toolName}</strong>
                    </span>
                  </div>
                );
              }
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
};
