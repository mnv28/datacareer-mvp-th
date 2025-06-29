import React from "react";

interface QuestionTableProps {
  data: any[];
}

const QuestionTable: React.FC<QuestionTableProps> = ({ data }) => {
  if (!data || data.length === 0) return <div>No data available</div>;

  const headers = Object.keys(data[0]);

  return (
    <table className="min-w-full border">
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header} className="px-4 py-2 border-b font-bold text-left bg-gray-50">{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx}>
            {headers.map((header) => (
              <td key={header} className="px-4 py-2 border-b">{row[header]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default QuestionTable;