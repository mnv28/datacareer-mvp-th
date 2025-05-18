import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import QuestionHeader from '@/components/questions/QuestionHeader';
import QuestionTabs from '@/components/questions/QuestionTabs';
import SqlEditor from '@/components/questions/SqlEditor';
import SchemaDisplay from '@/components/questions/SchemaDisplay';
import SolutionsDisplay from '@/components/questions/SolutionsDisplay';
import SubmissionsDisplay from '@/components/questions/SubmissionsDisplay';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { mockCompanies } from './Index';

interface Question {
  id: number;
  title: string;
  type: 'SQL' | 'PostgreSQL';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'Solved' | 'Wrong' | 'Unattempted';
  topic: string;
  company: string;
  description: string;
}

const customersTable = [
  {
    name: "customers",
    columns: [
      { name: "customer_id", type: "INT", constraint: "Unique identifier for each customer" },
      { name: "name", type: "VARCHAR", constraint: "Customer name" },
      { name: "email", type: "VARCHAR", constraint: "Customer email" },
      { name: "join_date", type: "DATE", constraint: "Date the customer joined" },
    ],
  }
];

const ordersTable = [
  {
    name: "orders",
    columns: [
      { name: "order_id", type: "INT", constraint: "Unique identifier for each order" },
      { name: "customer_id", type: "INT", constraint: "Foreign key to customers table" },
      { name: "order_date", type: "DATE", constraint: "Date the order was placed" },
      { name: "total_amount", type: "DECIMAL", constraint: "Total order amount" },
    ],
  }
];

const mockQuestionDetails = {
  id: 101,
  title: "Customer Order Analysis",
  company: "Amazon",
  topic: "Data Analysis",
  difficulty: "Intermediate" as const,
  description: `<h2>Problem Statement</h2>
<p>Amazon has a large customer database and wants to analyze their customer order patterns.
Write a SQL query to find the top 5 customers who spent the most in 2022, along with their total order count and average order value.</p>
<h3>Input Tables</h3>
<div class="font-bold">customers table</div>
<div class="font-bold mt-4">orders table</div>
<h3>Expected Output</h3>
<p>Your query should return the following columns:</p>
<ul>
  <li>customer_id</li>
  <li>customer_name</li>
  <li>total_spent (the sum of total_amount for all orders in 2022)</li>
  <li>order_count (the number of orders in 2022)</li>
  <li>avg_order_value (the average order amount)</li>
</ul>
<p>Results should be ordered by total_spent in descending order, and only the top 5 customers should be returned.</p>`,
  previousId: null,
  nextId: 102,
};

const mockTables = [
  {
    name: "customers",
    columns: [
      { name: "customer_id", type: "INT", constraint: "PRIMARY KEY" },
      { name: "name", type: "VARCHAR(100)", constraint: "NOT NULL" },
      { name: "email", type: "VARCHAR(100)", constraint: "NOT NULL" },
      { name: "join_date", type: "DATE", constraint: "NOT NULL" },
    ],
  },
  {
    name: "orders",
    columns: [
      { name: "order_id", type: "INT", constraint: "PRIMARY KEY" },
      { name: "customer_id", type: "INT", constraint: "FOREIGN KEY (customers)" },
      { name: "order_date", type: "DATE", constraint: "NOT NULL" },
      { name: "total_amount", type: "DECIMAL(10,2)", constraint: "NOT NULL" },
    ],
  }
];

const mockSolutions = `
**Redeemed point distribution**

1. **Check the Data:**  
   Ensure the dataset contains redemption types and the number of points redeemed.
2. **Group by Redemption Type:**  
   Organise the data based on different redemption categories (donation, fuel discount, Qantas points, shopping discount).
3. **Sum the Points:**  
   Calculate the total number of points redeemed for each redemption type.
4. **Handle Missing Data:**  
   Ensure all redemption types are included, even if some have zero points.
5. **Sort if Needed:**  
   Arrange the results in a meaningful order, such as by highest to lowest points redeemed.
`;

const mockSubmissions = [
  {
    id: "sub-001",
    timestamp: "2023-05-12T14:32:45",
    status: "Correct" as const,
    runtime: 125,
    query: `SELECT c.customer_id, c.name as customer_name, 
SUM(o.total_amount) as total_spent,
COUNT(o.order_id) as order_count,
AVG(o.total_amount) as avg_order_value
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE YEAR(o.order_date) = 2022
GROUP BY c.customer_id, c.name
ORDER BY total_spent DESC
LIMIT 5;`,
  },
  {
    id: "sub-002",
    timestamp: "2023-05-12T14:25:12",
    status: "Wrong" as const,
    runtime: 118,
    query: `SELECT c.customer_id, c.name as customer_name, 
SUM(o.total_amount) as total_spent,
COUNT(o.order_id) as order_count,
AVG(o.total_amount) as avg_order_value
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE YEAR(o.order_date) = 2022
GROUP BY c.customer_id
ORDER BY total_spent DESC
LIMIT 5;`,
  },
  {
    id: "sub-003",
    timestamp: "2023-05-12T14:20:08",
    status: "Error" as const,
    runtime: 75,
    query: `SELECT c.customer_id, c.name as customer_name, 
SUM(o.total_amount) as total_spent,
COUNT(o.order_id) as order_count,
AVG(o.total_amount) as avg_order_value
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE YEAR(o.order_date) = 2022
GROUP BY c.customer_id
ORDER BY total_spent DESC
LIMI 5;`,
  }
];

// Function to find next and previous question IDs
const findAdjacentQuestionIds = (currentId: number): { previousId: number | null; nextId: number | null } => {
  // Flatten all questions from all companies
  const allQuestions: Question[] = mockCompanies.flatMap(company => 
    company.questions.map(q => ({
      ...q,
      company: company.name,
      description: mockQuestionDetails.description // Using mock description for now
    }))
  );
  
  // Sort questions by ID
  const sortedQuestions = [...allQuestions].sort((a, b) => a.id - b.id);
  
  // Find the index of the current question
  const currentIndex = sortedQuestions.findIndex(q => q.id === currentId);
  
  if (currentIndex === -1) {
    return { previousId: null, nextId: null };
  }
  
  return {
    previousId: currentIndex > 0 ? sortedQuestions[currentIndex - 1].id : null,
    nextId: currentIndex < sortedQuestions.length - 1 ? sortedQuestions[currentIndex + 1].id : null
  };
};

// Function to find question details by ID
const findQuestionDetails = (questionId: number): Question | null => {
  for (const company of mockCompanies) {
    const question = company.questions.find(q => q.id === questionId);
    if (question) {
      return {
        ...question,
        company: company.name,
        description: mockQuestionDetails.description, // Using JSX description
      };
    }
  }
  return null;
};

const QuestionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [adjacentIds, setAdjacentIds] = useState<{ previousId: number | null; nextId: number | null }>({ previousId: null, nextId: null });
  const [activeTab, setActiveTab] = useState<string>("question");
  const [submissions, setSubmissions] = useState(mockSubmissions);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      const questionId = parseInt(id || '0');
      const questionData = findQuestionDetails(questionId);
      setQuestion(questionData);
      setAdjacentIds(findAdjacentQuestionIds(questionId));
      setLoading(false);
    }, 300);
  }, [id]);

  const handleSubmit = (query: string, dbType: string) => {
    // Create a new submission
    const newSubmission = {
      id: `sub-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'Correct' as const, // This would be determined by the backend
      runtime: Math.floor(Math.random() * 200) + 50, // Mock runtime
      query: query
    };

    // Add the new submission to the list
    setSubmissions(prev => [newSubmission, ...prev]);

    // Switch to submissions tab
    setActiveTab("submissions");
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!question) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-red-500">Question not found</h1>
          <p className="text-gray-600 mt-2">The question you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="mt-4 inline-block bg-datacareer-blue text-white px-4 py-2 rounded-lg hover:bg-datacareer-darkBlue transition-colors">
            Return to Questions
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <QuestionHeader
          title={question.title}
          company={question.company}
          topic={question.topic}
          difficulty={question.difficulty}
          previousId={adjacentIds.previousId}
          nextId={adjacentIds.nextId}
        />
        
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[500px] rounded-lg border"
        >
          {/* Question Content Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full">
              <QuestionTabs
                question={question.description}
                schema={<SchemaDisplay tables={mockTables} erdImage="/images/customer-orders-erd.png" />}
                solutions={<SolutionsDisplay solution={mockSolutions} />}
                submissions={<SubmissionsDisplay submissions={submissions} />}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          </ResizablePanel>
          
          {/* Resizable handle with visible grip */}
          <ResizableHandle withHandle />
          
          {/* SQL Editor Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full">
              <SqlEditor onSubmit={handleSubmit} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </MainLayout>
  );
};

export default QuestionDetail;
