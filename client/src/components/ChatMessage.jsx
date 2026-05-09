// ==============================================
// SARA — Chat Message Component
// Renders markdown (tables, bold, lists, etc.)
// ==============================================

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

function MdTable({ children }) {
  return (
    <div className="my-2 rounded-lg border-2 border-emerald-200 overflow-hidden">
      <table className="w-full text-[11px] border-collapse">{children}</table>
    </div>
  );
}

const mdComponents = {
  table: MdTable,
  thead: ({ children }) => <thead className="bg-emerald-100 text-emerald-900">{children}</thead>,
  th: ({ children }) => (
    <th className="px-2 py-1.5 text-start font-bold border border-emerald-200 text-[10px] uppercase tracking-wide">{children}</th>
  ),
  td: ({ children }) => (
    <td style={{borderBottom:"2px solid #9ca3af", padding:"6px 8px"}}>{children}</td>
  ),
  tr: ({ children }) => <tr className="even:bg-gray-50/80">{children}</tr>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 my-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 my-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
  hr: () => <hr className="my-2 border-gray-200" />,
};

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`msg-animate flex ${isUser ? "justify-start" : "justify-end"} mb-4`}>
      <div
        className={`${isUser ? "max-w-[85%]" : "max-w-[95%]"} px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-sara-600 text-white rounded-br-md"
            : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-md"
        }`}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{message.content}</span>
        ) : (
          <Markdown remarkPlugins={[remarkGfm]} components={mdComponents}>{message.content}</Markdown>
        )}
      </div>
    </div>
  );
}
