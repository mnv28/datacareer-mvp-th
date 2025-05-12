import React, { useState, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
import MonacoEditor from '@monaco-editor/react';

interface SqlEditorProps {
  defaultQuery?: string;
  onSubmit?: (query: string, dbType: string) => void;
}

const SqlEditor: React.FC<SqlEditorProps> = ({ 
  defaultQuery = "SELECT * FROM employees\nWHERE department = 'Engineering'\nORDER BY hire_date DESC;",
  onSubmit 
}) => {
  const [dbType, setDbType] = useState<string>("mysql");
  const [query, setQuery] = useState<string>(defaultQuery);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Mock execution for demo purposes
  const executeQuery = () => {
    setIsExecuting(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      if (onSubmit) {
        onSubmit(query, dbType);
      }
      
      // Mock successful results if query looks valid
      if (query.toLowerCase().includes('select') && query.includes('FROM')) {
        const mockData = [
          { id: 1, name: 'John Doe', department: 'Engineering', hire_date: '2020-01-15' },
          { id: 2, name: 'Jane Smith', department: 'Engineering', hire_date: '2021-03-22' },
          { id: 3, name: 'Robert Johnson', department: 'Engineering', hire_date: '2019-11-08' }
        ];
        setResults(mockData);
        setError(null);
      } else {
        // Mock error
        setResults(null);
        setError('Syntax error in SQL query. Please check your query and try again.');
      }
      
      setIsExecuting(false);
    }, 1000);
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
              <SelectItem value="postgresql">PostgreSQL</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={executeQuery}
          disabled={isExecuting}
          className="bg-datacareer-blue hover:bg-datacareer-darkBlue"
        >
          {isExecuting ? 'Running...' : 'Submit'}
        </Button>
      </div>
      <div className="flex flex-col">
        <div ref={editorRef} className="h-64">
          <MonacoEditor
            height="100%"
            defaultLanguage={dbType === 'postgresql' ? 'pgsql' : 'sql'}
            language={dbType === 'postgresql' ? 'pgsql' : 'sql'}
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
          {error ? (
            <div className="p-4 bg-red-50 text-red-800 border-l-4 border-red-500">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          ) : results ? (
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-2">Query executed successfully. {results.length} rows returned.</p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(results[0]).map((key) => (
                        <th
                          key={key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((value, j) => (
                          <td
                            key={j}
                            className="px-6 py-2 text-sm text-gray-500"
                          >
                            {value as React.ReactNode}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
