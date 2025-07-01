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
import { apiInstance } from '@/api/axiosApi';
import { AxiosError } from 'axios'; // Import AxiosError for better type handling

// Define the expected structure of a submission response from the API
interface SubmissionResponse {
  message: string;
  submission: {
    id: number;
    code: string;
    dbType: string;
    score?: number;
    status: string; // e.g., 'passed', 'error', 'failed', 'pending'
    result?: any; // The structure of 'result' can vary or be null
    error: string | null;
    runTime: number;
    submittedAt: string;
    userId: number;
  };
}

interface Question {
  logo: string;
  id: number;
  title: string;
  companyId: number;
  topicId: number;
  dbType: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: string;
  questionContent: string;
  schemaContent: string;
  schemaImage: string | null;
  solution: string;
  company: {
    name: string;
  };
  topic: {
    name: string;
  };
  dynamicTableInfo: {
    schemaImageUrl: string;
    schemaContent: string;
  };
}

interface DisplaySubmission {
  id: string;
  timestamp: string;
  status: 'Correct' | 'Wrong' | 'Error' | 'mismatch';
  runtime: number;
  query: string;
  result?: any;
  error?: string | null;
}

// Interface for navigation question
interface NavigationQuestion {
  id: number;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const QuestionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [submissions, setSubmissions] = useState<DisplaySubmission[]>([]); // Ensure state is typed as DisplaySubmission[]
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("question");
  const [previousId, setPreviousId] = useState<number | null>(null);
  const [nextId, setNextId] = useState<number | null>(null);
  const [navigationLoading, setNavigationLoading] = useState<boolean>(false);
console.log("submissions SubmissionsDisplay = ",submissions);

  const fetchQuestionDetails = async () => {
    try {
      setLoading(true);
      const response = await apiInstance.get(`/api/question/${id}`);
      const data = response.data;

      // Transform the question data
      const transformedQuestion: Question = {
        ...data.question,
        logo: data.question.company.logo,
        difficulty: data.question.difficulty.charAt(0).toUpperCase() + data.question.difficulty.slice(1) as 'Beginner' | 'Intermediate' | 'Advanced'
      };

      // Transform the submissions data from the API response format to DisplaySubmission format
      const transformedSubmissions: DisplaySubmission[] = data.submissions
        .filter((sub) => sub !== null && sub !== undefined) // Filter out null/undefined entries
        .map((sub) => ({
          id: `sub-${sub.id}`,
          timestamp: sub.submittedAt,
          status: sub.status === 'passed' ? 'Correct' : sub.status === 'error' ? 'Error' : sub.status === 'failed' ? 'Wrong' : 'mismatch', // Map API status to display status
          runtime: sub.runTime,
          query: sub.code,
          result: sub.result,
          error: sub.error,
        }));

      setQuestion(transformedQuestion);
      setSubmissions(transformedSubmissions);
    } catch (err) { // Keeping any here for broader error handling, can refine if needed.
      setError(err.message || 'Failed to fetch question details.');
      console.error("Error fetching question details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all questions for navigation
  const fetchNavigationQuestions = async () => {
    try {
      setNavigationLoading(true);
      const response = await apiInstance.get('/api/question/filterbycompany', {
        params: {
          search: '',
          topic: '',
          companyId: '',
          domain: '',
          difficulty: '',
          variant: 'MySQL'
        }
      });

      const data = response.data;
      const allQuestions: NavigationQuestion[] = [];
      
      // Flatten all questions from all companies
      data.companies.forEach((company: any) => {
        company.questions.forEach((question: any) => {
          allQuestions.push({
            id: question.id,
            title: question.title,
            difficulty: question.difficulty // Add difficulty for sorting
          });
        });
      });

      // Sort by difficulty (Beginner < Intermediate < Advanced)
      const difficultyOrder = { Beginner: 0, Intermediate: 1, Advanced: 2 };
      allQuestions.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);

      // Find current question index
      const currentIndex = allQuestions.findIndex(q => q.id === parseInt(id!));
      
      if (currentIndex !== -1) {
        // Set previous and next IDs
        setPreviousId(currentIndex > 0 ? allQuestions[currentIndex - 1].id : null);
        setNextId(currentIndex < allQuestions.length - 1 ? allQuestions[currentIndex + 1].id : null);
      }
    } catch (err) {
      console.error("Error fetching navigation questions:", err);
      // If navigation fails, buttons will remain disabled
    } finally {
      setNavigationLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchQuestionDetails();
      fetchNavigationQuestions();
    }
  }, [id]);

  // This function is now called by SqlEditor after a successful submission API call
  const handleSubmit = (submissionData: SubmissionResponse) => {
    console.log("submissionData received in handleSubmit = ", submissionData);

    // Ensure submissionData and submissionData.submission are valid
    if (!submissionData || !submissionData.submission) {
      console.error("Invalid submission data received:", submissionData);
      // Optionally, handle this error in the UI
      return;
    }

    const apiSubmission = submissionData.submission; // Access the nested submission object

    // Map API status to display status and create DisplaySubmission object
    let displayStatus: 'Correct' | 'Wrong' | 'Error' | 'mismatch';
    if (apiSubmission.status === 'passed') displayStatus = 'Correct';
    else if (apiSubmission.status === 'error') displayStatus = 'Error';
    else if (apiSubmission.status === 'failed') displayStatus = 'Wrong';
    else displayStatus = 'mismatch'; // Default to mismatch if status is unexpected

    const newSubmission: DisplaySubmission = {
      id: `sub-${apiSubmission.id}`,
      timestamp: apiSubmission.submittedAt,
      status: displayStatus,
      runtime: apiSubmission.runTime,
      query: apiSubmission.code,
      // Ensure result and error are correctly mapped
      result: apiSubmission.result, 
      error: apiSubmission.error,
    };

    console.log("Adding newSubmission to state = ", newSubmission);
    setSubmissions(prev => [newSubmission, ...prev]);
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

  if (error || !question) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-red-500">Error loading question</h1>
          <p className="text-gray-600 mt-2">{error || "The question you're looking for doesn't exist or has been removed."}</p>
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
        logo={question.logo}
          title={question.title}
          company={question.company.name}
          topic={question.topic.name}
          difficulty={question.difficulty}
          previousId={previousId}
          nextId={nextId}
          isLoading={navigationLoading}
        />

        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[500px] rounded-lg border"
        >
          {/* Question Content Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full">
              <QuestionTabs
                question={question.questionContent}
                schema={<SchemaDisplay tables={[]} erdImage={question.dynamicTableInfo.schemaImageUrl} schema={question.dynamicTableInfo.schemaContent} />}
                solutions={<SolutionsDisplay solution={question.solution} />}
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
