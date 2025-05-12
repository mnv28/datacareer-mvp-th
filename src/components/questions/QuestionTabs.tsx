import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QuestionTabsProps {
  question: React.ReactNode;
  schema: React.ReactNode;
  solutions: React.ReactNode;
  submissions: React.ReactNode;
}

const QuestionTabs: React.FC<QuestionTabsProps> = ({
  question,
  schema,
  solutions,
  submissions
}) => {
  return (
    <Tabs defaultValue="question" className="bg-white rounded-lg shadow-md">
      <div className="sticky top-0 bg-white rounded-t-lg border-b z-10">
        <TabsList className="w-full justify-start rounded-none p-0">
          <TabsTrigger 
            value="question" 
            className="py-3 px-5 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-datacareer-orange data-[state=active]:shadow-none"
          >
            Question
          </TabsTrigger>
          <TabsTrigger 
            value="schema" 
            className="py-3 px-5 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-datacareer-orange data-[state=active]:shadow-none"
          >
            Schema ERD
          </TabsTrigger>
          <TabsTrigger 
            value="solutions" 
            className="py-3 px-5 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-datacareer-orange data-[state=active]:shadow-none"
          >
            Solutions
          </TabsTrigger>
          <TabsTrigger 
            value="submissions" 
            className="py-3 px-5 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-datacareer-orange data-[state=active]:shadow-none"
          >
            Submissions
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="question" className="p-4 focus:outline-none">
        <div className="prose max-w-none">
          {question}
        </div>
      </TabsContent>
      
      <TabsContent value="schema" className="p-4 focus:outline-none">
        {schema}
      </TabsContent>
      
      <TabsContent value="solutions" className="p-4 focus:outline-none">
        {solutions}
      </TabsContent>
      
      <TabsContent value="submissions" className="p-4 focus:outline-none">
        {submissions}
      </TabsContent>
    </Tabs>
  );
};

export default QuestionTabs;
