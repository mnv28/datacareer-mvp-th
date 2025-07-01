// File: @/components/questions/QuestionContentTable.tsx

import React, { useEffect, useRef } from "react";

const TAILWIND_TABLE_CLASSES = "min-w-full border border-gray-200";
const TAILWIND_TH_CLASSES = "px-4 py-2 border font-bold text-left bg-gray-50";
const TAILWIND_TD_CLASSES = "px-4 py-2 border";

interface TableRow {
  [key: string]: string | number | null;
}

interface Props {
  content: string;
}

const QuestionContentTable: React.FC<Props> = ({ content }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof content === "string" && contentRef.current) {
      // Style all tables inside the content
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

  let parsed: TableRow[] = [];

  try {
    parsed = JSON.parse(content);
    if (!Array.isArray(parsed) || parsed.length === 0 || typeof parsed[0] !== 'object') {
      throw new Error('Invalid table data');
    }
  } catch (err) {
    // If parsing fails or content is not structured, display as plain text
    return <div className="text-gray-700 whitespace-pre-wrap">{content}</div>;
  }

  const headers = Object.keys(parsed[0]);

  // Render all HTML as HTML, preserving formatting for tables, lists, etc.
  if (typeof content === "string" && (content.trim().startsWith("<") || content.includes("<"))) {
    return (
      <div ref={contentRef} className="overflow-x-auto prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full border border-gray-300 border-collapse text-sm text-left">
        <thead className="bg-gray-100">
          <tr className='border-2 border-gray-300'>
            {headers.map((header) => (
              <th key={header} className="p-2 border border-gray-300 font-medium text-gray-700">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {parsed.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 border border-gray-300">
              {headers.map((header) => (
                <td key={header} className="p-2 border border-gray-300 font-medium text-gray-700">
                  {row[header] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuestionContentTable;
