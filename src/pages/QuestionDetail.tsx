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
const mockCompanies = [
  {
    id: 1,
    name: 'Amazon',
    domain: 'E-Commerce',
    questions: [
      {
        id: 101,
        title: 'Customer Order Analysis',
        type: 'SQL' as const,
        difficulty: 'Intermediate' as const,
        status: 'Solved' as const,
        topic: 'Data Analysis',
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
        `
      },
      {
        id: 102,
        title: 'Product Category Metrics',
        type: 'PostgreSQL' as const,
        difficulty: 'Advanced' as const,
        status: 'Unattempted' as const,
        topic: 'Window Functions',
        description: `
          <h2>Problem Statement</h2>
          <p>Analyze product category performance metrics using window functions to identify trends and patterns in sales data.</p>
          
          <h3>Input Tables</h3>
          <ol>
            <li>
              <strong>products</strong> table:
              <ul>
                <li>product_id (INT): Unique identifier for each product</li>
                <li>name (VARCHAR): Product name</li>
                <li>category_id (INT): Foreign key to categories table</li>
                <li>price (DECIMAL): Product price</li>
              </ul>
            </li>
            <li>
              <strong>categories</strong> table:
              <ul>
                <li>category_id (INT): Unique identifier for each category</li>
                <li>name (VARCHAR): Category name</li>
                <li>parent_id (INT): Self-referential foreign key for hierarchical categories</li>
              </ul>
            </li>
            <li>
              <strong>sales</strong> table:
              <ul>
                <li>sale_id (INT): Unique identifier for each sale</li>
                <li>product_id (INT): Foreign key to products table</li>
                <li>sale_date (DATE): Date of the sale</li>
                <li>quantity (INT): Number of units sold</li>
                <li>revenue (DECIMAL): Total revenue for the sale</li>
              </ul>
            </li>
          </ol>
          
          <h3>Expected Output</h3>
          <p>Write a query that:</p>
          <ul>
            <li>Calculates the running total of sales for each category</li>
            <li>Shows the percentage contribution of each category to total sales</li>
            <li>Identifies the top 3 products in each category by revenue</li>
            <li>Includes month-over-month growth rate for each category</li>
          </ul>
        `
      },
      {
        id: 103,
        title: 'Delivery Time Optimization',
        type: 'SQL' as const,
        difficulty: 'Beginner' as const,
        status: 'Wrong' as const,
        topic: 'Joins',
        description: `
          <h2>Problem Statement</h2>
          <p>Optimize delivery times by analyzing shipping data and identifying bottlenecks in the delivery process.</p>
          
          <h3>Input Tables</h3>
          <ol>
            <li>
              <strong>orders</strong> table:
              <ul>
                <li>order_id (INT): Unique identifier for each order</li>
                <li>customer_id (INT): Foreign key to customers table</li>
                <li>order_date (TIMESTAMP): Date and time the order was placed</li>
                <li>shipping_address (VARCHAR): Delivery address</li>
              </ul>
            </li>
            <li>
              <strong>deliveries</strong> table:
              <ul>
                <li>delivery_id (INT): Unique identifier for each delivery</li>
                <li>order_id (INT): Foreign key to orders table</li>
                <li>pickup_time (TIMESTAMP): When the package was picked up</li>
                <li>delivery_time (TIMESTAMP): When the package was delivered</li>
                <li>status (VARCHAR): Current delivery status</li>
              </ul>
            </li>
            <li>
              <strong>warehouses</strong> table:
              <ul>
                <li>warehouse_id (INT): Unique identifier for each warehouse</li>
                <li>location (VARCHAR): Warehouse location</li>
                <li>capacity (INT): Maximum storage capacity</li>
              </ul>
            </li>
          </ol>
          
          <h3>Expected Output</h3>
          <p>Write a query that:</p>
          <ul>
            <li>Calculates average delivery time for each warehouse</li>
            <li>Identifies orders with delivery times exceeding 48 hours</li>
            <li>Shows the distribution of delivery times by region</li>
            <li>Lists the top 5 slowest delivery routes</li>
          </ul>
        `
      }
    ]
  },
  {
    id: 2,
    name: 'Google',
    domain: 'Technology',
    questions: [
      {
        id: 201,
        title: 'Search Query Analysis',
        type: 'SQL' as const,
        difficulty: 'Advanced' as const,
        status: 'Unattempted' as const,
        topic: 'Window Functions',
        description: `
          <h2>Problem Statement</h2>
          <p>Analyze search query patterns and user behavior to improve search relevance and user experience.</p>
          
          <h3>Input Tables</h3>
          <ol>
            <li>
              <strong>search_queries</strong> table:
              <ul>
                <li>query_id (INT): Unique identifier for each search query</li>
                <li>user_id (INT): Foreign key to users table</li>
                <li>query_text (VARCHAR): The actual search query</li>
                <li>timestamp (TIMESTAMP): When the search was performed</li>
                <li>session_id (VARCHAR): Unique identifier for the search session</li>
              </ul>
            </li>
            <li>
              <strong>search_results</strong> table:
              <ul>
                <li>result_id (INT): Unique identifier for each result</li>
                <li>query_id (INT): Foreign key to search_queries table</li>
                <li>result_url (VARCHAR): URL of the search result</li>
                <li>position (INT): Position in search results</li>
                <li>clicked (BOOLEAN): Whether the result was clicked</li>
              </ul>
            </li>
            <li>
              <strong>users</strong> table:
              <ul>
                <li>user_id (INT): Unique identifier for each user</li>
                <li>location (VARCHAR): User's location</li>
                <li>device_type (VARCHAR): Type of device used</li>
              </ul>
            </li>
          </ol>
          
          <h3>Expected Output</h3>
          <p>Write a query that:</p>
          <ul>
            <li>Identifies the most common search patterns</li>
            <li>Calculates the click-through rate for each result position</li>
            <li>Shows the distribution of search queries by time of day</li>
            <li>Identifies users who perform the most searches</li>
          </ul>
        `
      },
      {
        id: 202,
        title: 'User Session Analysis',
        type: 'SQL' as const,
        difficulty: 'Intermediate' as const,
        status: 'Solved' as const,
        topic: 'Data Analysis',
        description: `
          <h2>Problem Statement</h2>
          <p>Analyze user session data to understand engagement patterns and optimize user experience.</p>
          
          <h3>Input Tables</h3>
          <ol>
            <li>
              <strong>sessions</strong> table:
              <ul>
                <li>session_id (INT): Unique identifier for each session</li>
                <li>user_id (INT): Foreign key to users table</li>
                <li>start_time (TIMESTAMP): When the session started</li>
                <li>end_time (TIMESTAMP): When the session ended</li>
                <li>device_type (VARCHAR): Type of device used</li>
              </ul>
            </li>
            <li>
              <strong>page_views</strong> table:
              <ul>
                <li>view_id (INT): Unique identifier for each page view</li>
                <li>session_id (INT): Foreign key to sessions table</li>
                <li>page_url (VARCHAR): URL of the viewed page</li>
                <li>view_time (TIMESTAMP): When the page was viewed</li>
                <li>time_spent (INT): Time spent on page in seconds</li>
              </ul>
            </li>
            <li>
              <strong>user_actions</strong> table:
              <ul>
                <li>action_id (INT): Unique identifier for each action</li>
                <li>session_id (INT): Foreign key to sessions table</li>
                <li>action_type (VARCHAR): Type of action performed</li>
                <li>action_time (TIMESTAMP): When the action was performed</li>
              </ul>
            </li>
          </ol>
          
          <h3>Expected Output</h3>
          <p>Write a query that:</p>
          <ul>
            <li>Calculates average session duration by device type</li>
            <li>Identifies the most common user paths through the site</li>
            <li>Shows the distribution of time spent on different pages</li>
            <li>Lists the top 5 most engaging pages</li>
          </ul>
        `
      }
    ]
  },
  {
    id: 3,
    name: 'Microsoft',
    domain: 'Technology',
    questions: [
      {
        id: 301,
        title: 'Azure Usage Metrics',
        type: 'PostgreSQL' as const,
        difficulty: 'Intermediate' as const,
        status: 'Unattempted' as const,
        topic: 'Data Analysis',
        description: `
          <h2>Problem Statement</h2>
          <p>Analyze Azure cloud service usage metrics to optimize resource allocation and identify cost-saving opportunities.</p>
          
          <h3>Input Tables</h3>
          <ol>
            <li>
              <strong>azure_services</strong> table:
              <ul>
                <li>service_id (INT): Unique identifier for each service</li>
                <li>service_name (VARCHAR): Name of the Azure service</li>
                <li>service_type (VARCHAR): Type of service (Compute, Storage, Network, etc.)</li>
                <li>region (VARCHAR): Azure region where the service is deployed</li>
              </ul>
            </li>
            <li>
              <strong>usage_metrics</strong> table:
              <ul>
                <li>metric_id (INT): Unique identifier for each metric</li>
                <li>service_id (INT): Foreign key to azure_services table</li>
                <li>timestamp (TIMESTAMP): When the metric was recorded</li>
                <li>cpu_usage (DECIMAL): CPU utilization percentage</li>
                <li>memory_usage (DECIMAL): Memory utilization percentage</li>
                <li>storage_usage (DECIMAL): Storage utilization percentage</li>
                <li>cost (DECIMAL): Cost in USD</li>
              </ul>
            </li>
            <li>
              <strong>subscriptions</strong> table:
              <ul>
                <li>subscription_id (INT): Unique identifier for each subscription</li>
                <li>customer_id (INT): Foreign key to customers table</li>
                <li>plan_type (VARCHAR): Subscription plan type</li>
                <li>start_date (DATE): Subscription start date</li>
                <li>end_date (DATE): Subscription end date</li>
              </ul>
            </li>
          </ol>
          
          <h3>Expected Output</h3>
          <p>Write a query that:</p>
          <ul>
            <li>Calculates average resource utilization by service type</li>
            <li>Identifies services with consistently high or low usage</li>
            <li>Shows cost trends over time for each service</li>
            <li>Lists the top 5 most expensive services by region</li>
          </ul>
        `
      },
      {
        id: 302,
        title: 'Office License Tracking',
        type: 'SQL' as const,
        difficulty: 'Beginner' as const,
        status: 'Solved' as const,
        topic: 'Joins',
        description: `
          <h2>Problem Statement</h2>
          <p>Track and analyze Office 365 license usage across departments to optimize license allocation and costs.</p>
          
          <h3>Input Tables</h3>
          <ol>
            <li>
              <strong>licenses</strong> table:
              <ul>
                <li>license_id (INT): Unique identifier for each license</li>
                <li>license_type (VARCHAR): Type of Office 365 license</li>
                <li>purchase_date (DATE): When the license was purchased</li>
                <li>expiry_date (DATE): When the license expires</li>
                <li>cost (DECIMAL): License cost in USD</li>
              </ul>
            </li>
            <li>
              <strong>users</strong> table:
              <ul>
                <li>user_id (INT): Unique identifier for each user</li>
                <li>department (VARCHAR): User's department</li>
                <li>role (VARCHAR): User's role in the organization</li>
                <li>join_date (DATE): When the user joined</li>
              </ul>
            </li>
            <li>
              <strong>license_assignments</strong> table:
              <ul>
                <li>assignment_id (INT): Unique identifier for each assignment</li>
                <li>license_id (INT): Foreign key to licenses table</li>
                <li>user_id (INT): Foreign key to users table</li>
                <li>assigned_date (DATE): When the license was assigned</li>
                <li>status (VARCHAR): Assignment status (Active, Suspended, etc.)</li>
              </ul>
            </li>
          </ol>
          
          <h3>Expected Output</h3>
          <p>Write a query that:</p>
          <ul>
            <li>Shows license utilization by department</li>
            <li>Identifies unassigned licenses</li>
            <li>Calculates license costs by department</li>
            <li>Lists users with multiple license assignments</li>
          </ul>
        `
      },
      {
        id: 303,
        title: 'Game Pass Subscriber Analysis',
        type: 'SQL' as const,
        difficulty: 'Beginner' as const,
        status: 'Solved' as const,
        topic: 'Data Manipulation',
        description: `
          <h2>Problem Statement</h2>
          <p>Analyze Xbox Game Pass subscriber behavior to improve retention and engagement.</p>
          
          <h3>Input Tables</h3>
          <ol>
            <li>
              <strong>subscribers</strong> table:
              <ul>
                <li>subscriber_id (INT): Unique identifier for each subscriber</li>
                <li>subscription_type (VARCHAR): Type of Game Pass subscription</li>
                <li>join_date (DATE): When they subscribed</li>
                <li>country (VARCHAR): Subscriber's country</li>
                <li>platform (VARCHAR): Gaming platform used</li>
              </ul>
            </li>
            <li>
              <strong>game_play</strong> table:
              <ul>
                <li>play_id (INT): Unique identifier for each play session</li>
                <li>subscriber_id (INT): Foreign key to subscribers table</li>
                <li>game_id (INT): Foreign key to games table</li>
                <li>start_time (TIMESTAMP): When the session started</li>
                <li>duration (INT): Session duration in minutes</li>
                <li>achievements (INT): Number of achievements earned</li>
              </ul>
            </li>
            <li>
              <strong>games</strong> table:
              <ul>
                <li>game_id (INT): Unique identifier for each game</li>
                <li>title (VARCHAR): Game title</li>
                <li>genre (VARCHAR): Game genre</li>
                <li>release_date (DATE): When the game was released</li>
              </ul>
            </li>
          </ol>
          
          <h3>Expected Output</h3>
          <p>Write a query that:</p>
          <ul>
            <li>Calculates average play time per game by genre</li>
            <li>Shows subscriber retention rates by subscription type</li>
            <li>Identifies the most popular games by region</li>
            <li>Lists subscribers with the highest engagement</li>
          </ul>
        `
      }
    ]
  },
  {
    id: 4,
    name: 'Meta',
    domain: 'Social Media',
    questions: [
      {
        id: 401,
        title: 'Friend Recommendation Algorithm',
        type: 'SQL' as const,
        difficulty: 'Advanced' as const,
        status: 'Wrong' as const,
        topic: 'Graph Analysis',
        description: `
          <h2>Problem Statement</h2>
          <p>Develop a friend recommendation system based on user connections and common interests.</p>
          
          <h3>Input Tables</h3>
          <ol>
            <li>
              <strong>users</strong> table:
              <ul>
                <li>user_id (INT): Unique identifier for each user</li>
                <li>name (VARCHAR): User's name</li>
                <li>location (VARCHAR): User's location</li>
                <li>join_date (DATE): When the user joined</li>
              </ul>
            </li>
            <li>
              <strong>friendships</strong> table:
              <ul>
                <li>friendship_id (INT): Unique identifier for each friendship</li>
                <li>user_id_1 (INT): First user in the friendship</li>
                <li>user_id_2 (INT): Second user in the friendship</li>
                <li>created_at (TIMESTAMP): When the friendship was created</li>
                <li>status (VARCHAR): Friendship status (Active, Blocked, etc.)</li>
              </ul>
            </li>
            <li>
              <strong>interests</strong> table:
              <ul>
                <li>interest_id (INT): Unique identifier for each interest</li>
                <li>user_id (INT): Foreign key to users table</li>
                <li>interest_type (VARCHAR): Type of interest</li>
                <li>interest_value (VARCHAR): Specific interest value</li>
              </ul>
            </li>
          </ol>
          
          <h3>Expected Output</h3>
          <p>Write a query that:</p>
          <ul>
            <li>Identifies potential friends based on mutual connections</li>
            <li>Calculates similarity scores based on common interests</li>
            <li>Shows the strength of connections between users</li>
            <li>Lists the top 5 friend recommendations for each user</li>
          </ul>
        `
      },
      {
        id: 402,
        title: 'User Engagement Metrics',
        type: 'PostgreSQL' as const,
        difficulty: 'Intermediate' as const,
        status: 'Solved' as const,
        topic: 'Data Analysis',
        description: `
          <h2>Problem Statement</h2>
          <p>Analyze user engagement patterns to improve content delivery and user experience.</p>
          
          <h3>Input Tables</h3>
          <ol>
            <li>
              <strong>posts</strong> table:
              <ul>
                <li>post_id (INT): Unique identifier for each post</li>
                <li>user_id (INT): Foreign key to users table</li>
                <li>content_type (VARCHAR): Type of content (Text, Image, Video)</li>
                <li>created_at (TIMESTAMP): When the post was created</li>
                <li>reach (INT): Number of users who saw the post</li>
              </ul>
            </li>
            <li>
              <strong>interactions</strong> table:
              <ul>
                <li>interaction_id (INT): Unique identifier for each interaction</li>
                <li>post_id (INT): Foreign key to posts table</li>
                <li>user_id (INT): Foreign key to users table</li>
                <li>interaction_type (VARCHAR): Type of interaction (Like, Comment, Share)</li>
                <li>created_at (TIMESTAMP): When the interaction occurred</li>
              </ul>
            </li>
            <li>
              <strong>user_sessions</strong> table:
              <ul>
                <li>session_id (INT): Unique identifier for each session</li>
                <li>user_id (INT): Foreign key to users table</li>
                <li>start_time (TIMESTAMP): When the session started</li>
                <li>end_time (TIMESTAMP): When the session ended</li>
                <li>device_type (VARCHAR): Type of device used</li>
              </ul>
            </li>
          </ol>
          
          <h3>Expected Output</h3>
          <p>Write a query that:</p>
          <ul>
            <li>Calculates engagement rates by content type</li>
            <li>Shows user activity patterns by time of day</li>
            <li>Identifies the most engaging content categories</li>
            <li>Lists users with the highest engagement scores</li>
          </ul>
        `
      },
      {
        id: 403,
        title: 'Ad Campaign Performance',
        type: 'SQL' as const,
        difficulty: 'Intermediate' as const,
        status: 'Unattempted' as const,
        topic: 'Data Analysis',
        description: `
          <h2>Problem Statement</h2>
          <p>Analyze advertising campaign performance to optimize ad spend and targeting.</p>
          
          <h3>Input Tables</h3>
          <ol>
            <li>
              <strong>campaigns</strong> table:
              <ul>
                <li>campaign_id (INT): Unique identifier for each campaign</li>
                <li>name (VARCHAR): Campaign name</li>
                <li>start_date (DATE): Campaign start date</li>
                <li>end_date (DATE): Campaign end date</li>
                <li>budget (DECIMAL): Campaign budget in USD</li>
              </ul>
            </li>
            <li>
              <strong>ads</strong> table:
              <ul>
                <li>ad_id (INT): Unique identifier for each ad</li>
                <li>campaign_id (INT): Foreign key to campaigns table</li>
                <li>ad_type (VARCHAR): Type of ad (Image, Video, Carousel)</li>
                <li>target_audience (VARCHAR): Target audience segment</li>
                <li>placement (VARCHAR): Where the ad appears</li>
              </ul>
            </li>
            <li>
              <strong>ad_metrics</strong> table:
              <ul>
                <li>metric_id (INT): Unique identifier for each metric</li>
                <li>ad_id (INT): Foreign key to ads table</li>
                <li>date (DATE): Date of the metrics</li>
                <li>impressions (INT): Number of times the ad was shown</li>
                <li>clicks (INT): Number of clicks on the ad</li>
                <li>conversions (INT): Number of conversions</li>
                <li>spend (DECIMAL): Amount spent in USD</li>
              </ul>
            </li>
          </ol>
          
          <h3>Expected Output</h3>
          <p>Write a query that:</p>
          <ul>
            <li>Calculates ROI for each campaign</li>
            <li>Shows performance metrics by ad type and placement</li>
            <li>Identifies the most effective target audiences</li>
            <li>Lists campaigns with the highest conversion rates</li>
          </ul>
        `
      },
      {
        id: 404,
        title: 'Content Moderation Efficiency',
        type: 'SQL' as const,
        difficulty: 'Beginner' as const,
        status: 'Solved' as const,
        topic: 'Data Manipulation',
        description: `
          <h2>Problem Statement</h2>
          <p>Analyze content moderation patterns to improve efficiency and accuracy.</p>
          
          <h3>Input Tables</h3>
          <ol>
            <li>
              <strong>content</strong> table:
              <ul>
                <li>content_id (INT): Unique identifier for each content</li>
                <li>user_id (INT): Foreign key to users table</li>
                <li>content_type (VARCHAR): Type of content</li>
                <li>created_at (TIMESTAMP): When the content was created</li>
                <li>status (VARCHAR): Content status (Pending, Approved, Rejected)</li>
              </ul>
            </li>
            <li>
              <strong>moderation_actions</strong> table:
              <ul>
                <li>action_id (INT): Unique identifier for each action</li>
                <li>content_id (INT): Foreign key to content table</li>
                <li>moderator_id (INT): Foreign key to moderators table</li>
                <li>action_type (VARCHAR): Type of action taken</li>
                <li>action_time (TIMESTAMP): When the action was taken</li>
                <li>reason (VARCHAR): Reason for the action</li>
              </ul>
            </li>
            <li>
              <strong>moderators</strong> table:
              <ul>
                <li>moderator_id (INT): Unique identifier for each moderator</li>
                <li>name (VARCHAR): Moderator's name</li>
                <li>team (VARCHAR): Moderator's team</li>
                <li>join_date (DATE): When they joined the team</li>
              </ul>
            </li>
          </ol>
          
          <h3>Expected Output</h3>
          <p>Write a query that:</p>
          <ul>
            <li>Calculates moderation response times</li>
            <li>Shows content approval/rejection rates by type</li>
            <li>Identifies common moderation patterns</li>
            <li>Lists the most efficient moderators by team</li>
          </ul>
        `
      }
    ]
  }
];

// Helper function to find a question and its neighbors
const findQuestionAndNeighbors = (questionId: number) => {
  let currentQuestion = null;
  let previousId = null;
  let nextId = null;
  
  // Flatten all questions into a single array
  const allQuestions = mockCompanies.flatMap(company => 
    company.questions.map(q => ({
      ...q,
      company: company.name
    }))
  );
  
  // Sort questions by ID
  allQuestions.sort((a, b) => a.id - b.id);
  
  // Find the current question and its neighbors
  const currentIndex = allQuestions.findIndex(q => q.id === questionId);
  
  if (currentIndex !== -1) {
    currentQuestion = allQuestions[currentIndex];
    previousId = currentIndex > 0 ? allQuestions[currentIndex - 1].id : null;
    nextId = currentIndex < allQuestions.length - 1 ? allQuestions[currentIndex + 1].id : null;
  }
  
  return { currentQuestion, previousId, nextId };
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
  const [previousId, setPreviousId] = useState<number | null>(null);
  const [nextId, setNextId] = useState<number | null>(null);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      const questionId = parseInt(id || '0');
      const { currentQuestion, previousId, nextId } = findQuestionAndNeighbors(questionId);
      
      if (currentQuestion) {
        setQuestion(currentQuestion);
        setPreviousId(previousId);
        setNextId(nextId);
      }
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
          previousId={previousId}
          nextId={nextId}
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
