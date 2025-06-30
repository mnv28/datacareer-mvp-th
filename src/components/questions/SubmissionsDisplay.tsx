import React, { useEffect } from 'react';
import Toast from '@/components/ui/toast';

interface Submission {
  id: string;
  timestamp: string;
  status: 'Correct' | 'Wrong' | 'Error' |  'mismatch';
  runtime: number;
  query: string;
  result?: any;
  error?: string | null;
}

interface SubmissionsDisplayProps {
  submissions: Submission[];
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'Correct':
      return 'bg-green-100 text-green-800';
    case 'Wrong':
      return 'bg-red-100 text-red-800';
    case 'Error':
      return 'bg-orange-100 text-orange-800';
    case 'mismatch':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const SubmissionsDisplay: React.FC<SubmissionsDisplayProps> = ({ submissions }) => {
  console.log("submissions = ",submissions);
  
  const [selectedSubmission, setSelectedSubmission] = React.useState<Submission | null>(
    submissions.length > 0 ? submissions[0] : null
  );
  console.log("selectedSubmission = ",selectedSubmission);
  
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastType, setToastType] = React.useState<'success' | 'error'>('success');

  useEffect(() => {
    if (submissions.length > 0) {
      // Always update the selectedSubmission with the latest one (first in array)
      setSelectedSubmission(submissions[0]);
    } else {
      setSelectedSubmission(null);
    }
  }, [submissions]);
  

  // Existing useEffect for toast messages, triggered by selectedSubmission changes
  useEffect(() => {
    if (selectedSubmission) {
      setShowToast(true);
      // Use the status from the selected submission for toast message logic
      if (selectedSubmission.status === 'Correct') {
        setToastType('success');
        setToastMessage('Your query matches the expected output!');
      } else if (selectedSubmission.status === 'mismatch') {
        setToastType('error');
        setToastMessage("Your query's output doesn't match with the solution's output!");
      } else if (selectedSubmission.status === 'Error') {
        setToastType('error');
        setToastMessage('There was an error executing your query.');
      } else if (selectedSubmission.status === 'Wrong') {
         setToastType('error');
         setToastMessage('Your query returned incorrect results.');
      }

      // Auto-hide toast after 5 seconds
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);

      return () => clearTimeout(timer);
    } else {
       // If no submission is selected, hide the toast
       setShowToast(false);
    }
  }, [selectedSubmission]); // Depend on selectedSubmission

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-datacareer-darkBlue mb-3">Your Submissions</h3>

      {submissions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 border rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 p-3 border-b">
              <h4 className="text-sm font-medium text-gray-700">Submission History</h4>
            </div>
            <div className="divide-y max-h-80 overflow-y-auto">
              {submissions.map((submission) => (
               
                
                <div
                  key={submission.id}
                  onClick={() => setSelectedSubmission(submission)}
                  className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedSubmission?.id === submission.id ? 'bg-blue-50' : ''
                  }`}
                >
                 
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {submission.timestamp ? new Date(submission.timestamp).toLocaleString() : 'Invalid Date'}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(submission.status)}`}>
                      {submission.status}
                    </div>
                  </div>
                  <div className="text-xs mt-1 text-gray-700">
                    Runtime: {submission.runtime}ms
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 border rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 p-3 border-b">
              <h4 className="text-sm font-medium text-gray-700">Submission Details</h4>
            </div>
           {submissions.length > 0 && selectedSubmission ? (
              <div className="p-4">
                {showToast && selectedSubmission.status !== 'Correct' && selectedSubmission.status !== 'mismatch' && (
                  <div className="mb-4">
                    <Toast
                      message={toastMessage}
                      type={toastType}
                      onClose={() => setShowToast(false)}
                    />
                  </div>
                )}
                <div className="flex flex-wrap justify-between mb-3">
                  <div className="mb-2 mr-4">
                    <div className="text-xs text-gray-500">Submitted at</div>
                    <div className="text-sm">{selectedSubmission.timestamp ? new Date(selectedSubmission.timestamp).toLocaleString() : 'Invalid Date'}</div>
                  </div>
                  <div className="mb-2 mr-4">
                    <div className="text-xs text-gray-500">Status</div>
                    <div className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(selectedSubmission.status)}`}>
                      {selectedSubmission.status}
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-xs text-gray-500">Runtime</div>
                    <div className="text-sm">{selectedSubmission.runtime} ms</div>
                  </div>
                </div>

                {/* Always show the Query Output (the SQL query) */}
                <div className="mt-4">
                  <div className="text-xs text-gray-500 mb-1 font-semibold">Query Output</div>
                  <div className="bg-gray-50 border rounded-md p-3 overflow-x-auto text-gray-800 text-sm">
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                      {selectedSubmission.query}
                    </pre>
                  </div>
                </div>

                {/* If there is a result, show the result table */}
                {selectedSubmission.result && Array.isArray(selectedSubmission.result) && selectedSubmission.result.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs text-gray-500 mb-1 font-semibold">Query Result</div>
                    <div className="bg-gray-50 border rounded-md p-3 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            {Object.keys(selectedSubmission.result[0] || {}).map(key => (
                              <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedSubmission.result.map((row: any, rowIndex: number) => (
                            <tr key={rowIndex}>
                              {Object.values(row).map((value: any, colIndex: number) => (
                                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                  {value !== null && value !== undefined ? String(value) : 'NULL'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* If there is an error, show the error details below the query */}
                {(selectedSubmission.error || selectedSubmission.status === 'mismatch') && (
                  <div className="mt-4">
                    <div className="text-xs text-gray-500 mb-1 font-semibold">Error Details</div>
                    <pre className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative whitespace-pre-wrap break-all">
                      {selectedSubmission.status === 'mismatch' 
                        ? "Incorrect Submission: Your query's output doesn't match with the solution's output!"
                        : typeof selectedSubmission.error === 'string'
                          ? `Incorrect Submission: ${selectedSubmission.error}`
                          : `Incorrect Submission: ${JSON.stringify(selectedSubmission.error, null, 2)}`}
                    </pre>
                  </div>
                )}

              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                Select a submission to view details
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-4 text-center text-gray-500">
          You haven't submitted any solutions yet.
        </div>
      )}
    </div>
  );
};

export default SubmissionsDisplay;
