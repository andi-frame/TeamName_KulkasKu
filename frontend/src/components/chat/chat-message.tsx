"use client";

export default function ChatMessage({
  role,
  content, 
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const isUser = role === "user";

  return (
    <div
      className={[
        "mb-3 md:mb-4 flex w-full",
        isUser ? "justify-end" : "justify-start",
      ].join(" ")}
    >
      <div
        className={[
          "max-w-[85%] md:max-w-[70%] rounded-lg border shadow-sm px-3 py-2 text-sm leading-relaxed",
          isUser
            ? "bg-blue-50 border-blue-200 text-gray-900"
            : "bg-white border-gray-200 text-gray-800",
        ].join(" ")}
      >
        {content}
      </div>
    </div>
  );
}
