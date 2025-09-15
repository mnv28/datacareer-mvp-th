import React from 'react';
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
interface Table {
  name: string;
  columns: Column[];
}

interface Column {
  name: string;
  type: string;
  constraint?: string;
}

interface SchemaDisplayProps {
  tables: Table[];
  erdImage?: string;
  schema?: string;
}

const SchemaDisplay: React.FC<SchemaDisplayProps> = ({ tables, erdImage, schema }) => {
  const sanitizedContent = DOMPurify.sanitize(schema);
  return (
    <div className="space-y-4">
      {erdImage && (
        <div className="mb-6">
                    <h3 className="text-lg font-medium text-datacareer-darkBlue mb-3">Database Schema</h3>

          {/* <h3 className="text-lg font-medium text-datacareer-darkBlue mb-3">Entity Relationship Diagram</h3> */}
      {schema && (
        // <div className="border rounded-lg overflow-hidden bg-white p-2">
              <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
        // </div>
      )}
        </div>
      )}
      
      <h3 className="text-lg font-medium text-datacareer-darkBlue mb-3">Entity Relationship Diagram</h3>
     
        <div className="border rounded-lg overflow-hidden bg-white p-2">
          <img src={erdImage} alt="Schema ERD" className="max-w-full h-auto" />
        </div>

      <div className="space-y-6">
        {tables.map((table) => (
          <div key={table.name} className="border rounded-lg overflow-hidden">
            <div className="bg-datacareer-darkBlue text-white px-4 py-2">
              <h4 className="text-sm font-medium">{table.name}</h4>
            </div>
            <div className="bg-white overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Column Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Constraints
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {table.columns.map((column) => (
                    <tr key={column.name}>
                      <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                        {column.name}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {column.type}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {column.constraint || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchemaDisplay;
