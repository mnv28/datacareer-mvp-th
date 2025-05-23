import React, { useState, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import MonacoEditor from '@monaco-editor/react';
import { apiInstance } from '@/api/axiosApi';
import { useParams } from 'react-router-dom';
import { AxiosError } from 'axios'; // Import AxiosError for better type handling

// Define the expected structure of a query result row
interface QueryResultRow {
  [key: string]: string | number | null;
}

// Define the expected structure of a submission response from the API
interface SubmissionResponse {
  id: number;
  code: string;
  dbType: string;
  score: number;
  status: string; // e.g., 'passed', 'error', 'failed'
  result: string; // Keeping as 'any' for now as the structure can vary. If a consistent schema is available, define a type for it.
  error: string | null;
  runTime: number;
  submittedAt: string;
  userId: number;
}

// Define the expected structure of a run query response from the API
interface RunQueryResponse {
  status: string;
  data: QueryResultRow[] | null; // 'data' contains the array of results on success
  error: string | null; // 'error' is a top-level property on failure
  submittedAt: string;
  runTime: number;
  userId: number;
}

interface SqlEditorProps {
  defaultQuery?: string;
  onSubmit?: (submissionData: SubmissionResponse) => void; // Pass the full submission data
}

const SqlEditor: React.FC<SqlEditorProps> = ({
  defaultQuery = "SELECT * FROM employees\nWHERE department = 'Engineering'\nORDER BY hire_date DESC;",
  onSubmit
}) => {
  const { id } = useParams<{ id: string }>();
  const [dbType, setDbType] = useState<string>("mysql");
  const [query, setQuery] = useState<string>(defaultQuery);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [results, setResults] = useState<QueryResultRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const runQuery = async () => {
    setIsExecuting(true);
    setError(null);
    setResults(null); // Clear previous results on new run
    
    try {
      // Use the RunQueryResponse interface for typing
      const response = await apiInstance.post<RunQueryResponse>('/api/submission/query/run', {
        questionId: parseInt(id || '0'),
        code: query
      });

      // Check the 'error' property in the response data
      if (response.data && response.data.error) {
        setError(response.data.error);
        setResults(null); // Ensure results are null if there's an error
      } else if (response.data && response.data.data !== undefined) {
        // On success, 'data' should contain the results array (can be empty)
        setResults(response.data.data);
        setError(null); // Clear any previous errors on success
      } else {
         setError('Unexpected response format from Run Query API');
         setResults(null);
      }
    } catch (err) {
      const axiosError = err as AxiosError; // Type assertion for network errors
      // Handle network or other request errors that prevent a valid API response
      setError(axiosError.message || 'An error occurred while running the query');
      setResults(null);
    } finally {
      setIsExecuting(false);
    }
  };

  const submitQuery = async () => {
    if (!onSubmit) return; // Ensure onSubmit prop is provided
    
    setIsExecuting(true);
    setError(null); // Clear previous errors on new submission attempt
    
    try {
      // Use the correct submit endpoint and type the response
      const response = await apiInstance.post<SubmissionResponse>('/api/submission/querys/submit', {
        questionId: parseInt(id || '0'),
        code: query,
        dbType: dbType.toUpperCase()
      });

      // Check for API-level errors in the submission response data
      if (response.data && response.data.error) {
         setError(response.data.error);
      } else if (response.data) {
        // Call the parent's onSubmit handler with the successful submission data
        // The parent (QuestionDetail) is responsible for updating the submissions list
        onSubmit(response.data);
        setError(null); // Clear any previous submission errors from the form
      } else {
         setError('Unexpected response format from Submit API');
      }

    } catch (err) {
      // Handle network or other request errors
      const axiosError = err as AxiosError;
      setError(axiosError.message || 'An error occurred while submitting the solution');
    } finally {
      setIsExecuting(false);
    }
  };
  
  // Resizer functionality
  React.useEffect(() => {
    const resizer = resizerRef.current;
    const editor = editorRef.current;
    const results = resultsRef.current;
    
    if (!resizer || !editor || !results) return;
    
    let y = 0;
    let editorHeight = 0;
    
    const onMouseDown = (e: MouseEvent) => {
      y = e.clientY;
      editorHeight = editor.offsetHeight;
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };
    
    const onMouseMove = (e: MouseEvent) => {
      const dy = e.clientY - y;
      const newHeight = editorHeight + dy;
      
      if (newHeight > 100 && newHeight < window.innerHeight - 200) {
        editor.style.height = `${newHeight}px`;
      }
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    resizer.addEventListener('mousedown', onMouseDown);
    
    return () => {
      resizer.removeEventListener('mousedown', onMouseDown);
    };
  }, []);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="border-b p-3 bg-gray-50 flex items-center justify-between">
        <div className="w-48">
          <Select value={dbType} onValueChange={setDbType}>
            <SelectTrigger className="h-9 bg-white">
              <SelectValue placeholder="Select Database" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mysql">MySQL</SelectItem>
              <SelectItem value="postgresql" disabled>PostgreSQL (Coming Soon)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={runQuery}
            disabled={isExecuting}
            variant="outline"
            className="border-datacareer-blue text-datacareer-blue hover:bg-datacareer-blue hover:text-white"
          >
            {isExecuting ? 'Running...' : 'Run Query'}
          </Button>
          <Button 
            onClick={submitQuery}
            disabled={isExecuting}
            className="bg-datacareer-blue hover:bg-datacareer-darkBlue"
          >
            Submit
          </Button>
        </div>
      </div>
      <div className="flex flex-col">
        <div ref={editorRef} className="h-64">
          <MonacoEditor
            height="100%"
            defaultLanguage="sql"
            language="sql"
            value={query}
            onChange={value => setQuery(value || '')}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              theme: 'vs',
              automaticLayout: true,
            }}
          />
        </div>
        <div 
          ref={resizerRef}
          className="h-2 bg-gray-100 border-y border-gray-200 cursor-row-resize flex items-center justify-center"
        >
          <div className="w-8 h-1 bg-gray-300 rounded"></div>
        </div>
        <div ref={resultsRef} className="h-64 overflow-auto">
          {isExecuting && !results && !error && (
             <div className="p-4 text-center text-gray-500">Executing query...</div>
          )}
          {error ? (
            <div className="p-4 bg-red-50 text-red-800 border-l-4 border-red-500">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          ) : results && results.length > 0 ? (
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-2">Query executed successfully. {results.length} rows returned.</p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(results[0] || {}).map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((cell: string | number | null, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {cell !== null ? cell.toString() : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : results && results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Query executed successfully. No rows returned.</div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Run a query to see results
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SqlEditor;
