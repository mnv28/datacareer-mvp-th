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

// Mock data
const mockQuestionDetails = {
  id: 101,
  title: "Customer Order Analysis",
  company: "Amazon",
  topic: "Data Analysis",
  difficulty: "Intermediate" as const,
  description: `
    <h2>Problem Statement</h2>
    <p>Amazon has a large customer database and wants to analyze their customer order patterns. 
    Write a SQL query to find the top 5 customers who spent the most in 2022, along with their total order count and average order value.</p>
    
    <h3>Input Tables</h3>
    <ol>
      <li>
        <strong>customers</strong> table:
        <ul>
          <li>customer_id (INT): Unique identifier for each customer</li>
          <li>name (VARCHAR): Customer name</li>
          <li>email (VARCHAR): Customer email</li>
          <li>join_date (DATE): Date the customer joined</li>
        </ul>
      </li>
      <li>
        <strong>orders</strong> table:
        <ul>
          <li>order_id (INT): Unique identifier for each order</li>
          <li>customer_id (INT): Foreign key to customers table</li>
          <li>order_date (DATE): Date the order was placed</li>
          <li>total_amount (DECIMAL): Total order amount</li>
        </ul>
      </li>
    </ol>
    
    <h3>Expected Output</h3>
    <p>Your query should return the following columns:</p>
    <ul>
      <li>customer_id</li>
      <li>customer_name</li>
      <li>total_spent (the sum of total_amount for all orders in 2022)</li>
      <li>order_count (the number of orders in 2022)</li>
      <li>avg_order_value (the average order amount)</li>
    </ul>
    
    <p>Results should be ordered by total_spent in descending order, and only the top 5 customers should be returned.</p>
  `,
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

const mockSolutions = [
  {
    id: 1,
    author: "SQLMaster42",
    description: "This solution uses a simple JOIN and GROUP BY to calculate the required metrics.",
    code: `SELECT c.customer_id, c.name as customer_name, 
  SUM(o.total_amount) as total_spent,
  COUNT(o.order_id) as order_count,
  AVG(o.total_amount) as avg_order_value
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE YEAR(o.order_date) = 2022
GROUP BY c.customer_id, c.name
ORDER BY total_spent DESC
LIMIT 5;`,
    db: "MySQL" as const,
    votes: 25
  },
  {
    id: 2,
    author: "DataWizard",
    description: "An optimized solution that performs well on large datasets by using window functions.",
    code: `WITH customer_metrics AS (
  SELECT c.customer_id, c.name as customer_name,
    SUM(o.total_amount) as total_spent,
    COUNT(o.order_id) as order_count,
    AVG(o.total_amount) as avg_order_value
  FROM customers c
  JOIN orders o ON c.customer_id = o.customer_id
  WHERE o.order_date BETWEEN '2022-01-01' AND '2022-12-31'
  GROUP BY c.customer_id, c.name
)
SELECT * FROM customer_metrics
ORDER BY total_spent DESC
LIMIT 5;`,
    db: "MySQL" as const,
    votes: 18
  },
  {
    id: 3,
    author: "PGAdmin",
    description: "PostgreSQL solution using date_part function instead of YEAR.",
    code: `SELECT c.customer_id, c.name as customer_name, 
  SUM(o.total_amount) as total_spent,
  COUNT(o.order_id) as order_count,
  AVG(o.total_amount) as avg_order_value
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE date_part('year', o.order_date) = 2022
GROUP BY c.customer_id, c.name
ORDER BY total_spent DESC
LIMIT 5;`,
    db: "PostgreSQL" as const,
    votes: 12
  }
];

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

const QuestionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setQuestion(mockQuestionDetails);
      setLoading(false);
    }, 300);
  }, [id]);

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
          previousId={question.previousId}
          nextId={question.nextId}
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
                schema={<SchemaDisplay tables={mockTables} />}
                solutions={<SolutionsDisplay solutions={mockSolutions} />}
                submissions={<SubmissionsDisplay submissions={mockSubmissions} />}
              />
            </div>
          </ResizablePanel>
          
          {/* Resizable handle with visible grip */}
          <ResizableHandle withHandle />
          
          {/* SQL Editor Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full">
              <SqlEditor />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </MainLayout>
  );
};

export default QuestionDetail;
