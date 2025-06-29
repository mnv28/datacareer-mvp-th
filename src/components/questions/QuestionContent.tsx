import React, { useEffect, useRef } from "react";

const TAILWIND_TABLE_CLASSES = "min-w-full border border-gray-200";
const TAILWIND_TH_CLASSES = "px-4 py-2 border font-bold text-left bg-gray-50";
const TAILWIND_TD_CLASSES = "px-4 py-2 border";

const QuestionContent: React.FC<{ content: any }> = ({ content }) => {
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      typeof content === "string" &&
      content.trim().startsWith("<table") &&
      tableRef.current
    ) {
      // Find the table and add Tailwind classes
      const table = tableRef.current.querySelector("table");
      if (table) table.className = TAILWIND_TABLE_CLASSES;

      table?.querySelectorAll("th").forEach((th) => {
        th.className = TAILWIND_TH_CLASSES;
      });
      table?.querySelectorAll("td").forEach((td) => {
        td.className = TAILWIND_TD_CLASSES;
      });
    }
  }, [content]);

  // Only render as HTML if it's a table, otherwise show as plain text
  if (typeof content === "string" && content.trim().startsWith("<table")) {
    return (
      <div ref={tableRef} className="overflow-x-auto">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  }

  // For everything else, show as plain text (strip HTML tags)
  return <div>{typeof content === "string" ? content.replace(/<[^>]+>/g, "") : content}</div>;
};

export default QuestionContent;