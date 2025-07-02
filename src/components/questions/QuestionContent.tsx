import React, { useEffect, useRef } from "react";
import "./QuestionContent.css";

const TAILWIND_TABLE_CLASSES = "min-w-full border border-gray-200";
const TAILWIND_TH_CLASSES = "px-4 py-2 border font-bold text-left bg-gray-50";
const TAILWIND_TD_CLASSES = "px-4 py-2 border";

function fixListParagraphs(html: string) {
  // Remove <p> inside <li>...</p>
  return html.replace(/<li>\s*<p>(.*?)<\/p>\s*<\/li>/g, '<li>$1</li>');
}

const QuestionContent: React.FC<{ content: string }> = ({ content }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const tables = contentRef.current.querySelectorAll("table");
      tables.forEach((table) => {
        table.className = TAILWIND_TABLE_CLASSES;
        table.querySelectorAll("th").forEach((th) => {
          th.className = TAILWIND_TH_CLASSES;
        });
        table.querySelectorAll("td").forEach((td) => {
          td.className = TAILWIND_TD_CLASSES;
        });
      });
    }
  }, [content]);

  return (
    <div ref={contentRef} className="overflow-x-auto prose max-w-none question-content">
      <div dangerouslySetInnerHTML={{ __html: fixListParagraphs(content) }} />
    </div>
  );
};

export default QuestionContent;