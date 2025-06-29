// File: @/components/questions/QuestionContentTable.tsx

import React from 'react';

interface TableRow {
  [key: string]: string | number | null;
}

interface Props {
  content: string;
}

const QuestionContentTable: React.FC<Props> = ({ content }) => {
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
