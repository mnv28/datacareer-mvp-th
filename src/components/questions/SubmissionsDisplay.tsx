import React from 'react';

interface Submission {
  id: string;
  timestamp: string;
  status: 'Correct' | 'Wrong' | 'Error';
  runtime: number;
  query: string;
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
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const SubmissionsDisplay: React.FC<SubmissionsDisplayProps> = ({ submissions }) => {
  const [selectedSubmission, setSelectedSubmission] = React.useState<Submission | null>(
    submissions.length > 0 ? submissions[0] : null
  );

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
                      {new Date(submission.timestamp).toLocaleString()}
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
            {selectedSubmission ? (
              <div className="p-4">
                <div className="flex flex-wrap justify-between mb-3">
                  <div className="mb-2 mr-4">
                    <div className="text-xs text-gray-500">Submitted at</div>
                    <div className="text-sm">{new Date(selectedSubmission.timestamp).toLocaleString()}</div>
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
                
                <div className="mt-6">
                  <div className="text-xs text-gray-500 mb-1 font-semibold">Expected Output</div>
                  <div className="bg-gray-50 border rounded-md p-3 overflow-x-auto">
                    <pre className="text-xs font-mono text-gray-800">
customer_id, customer_name, total_spent, order_count, avg_order_value
                    </pre>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="text-xs text-gray-500 mb-1 font-semibold">Your Output</div>
                  <div className="bg-gray-50 border rounded-md p-3 overflow-x-auto">
                    <pre className="text-xs font-mono text-gray-800">
-- Your output will be shown here after running the query --
                    </pre>
                  </div>
                </div>
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
