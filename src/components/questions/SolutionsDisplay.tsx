
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Solution {
  id: number;
  author: string;
  description: string;
  code: string;
  db: 'MySQL' | 'PostgreSQL';
  votes: number;
}

interface SolutionsDisplayProps {
  solutions: Solution[];
}

const SolutionsDisplay: React.FC<SolutionsDisplayProps> = ({ solutions }) => {
  const [activeTab, setActiveTab] = React.useState<string>("solution-1");
  
  const mySqlSolutions = solutions.filter((s) => s.db === 'MySQL');
  const postgresSolutions = solutions.filter((s) => s.db === 'PostgreSQL');
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-datacareer-darkBlue mb-3">Community Solutions</h3>
      
      <Tabs defaultValue="mysql" className="w-full">
        <TabsList className="grid grid-cols-2 w-64">
          <TabsTrigger value="mysql">MySQL</TabsTrigger>
          <TabsTrigger value="postgresql">PostgreSQL</TabsTrigger>
        </TabsList>
        <TabsContent value="mysql" className="mt-4">
          {mySqlSolutions.length > 0 ? (
            <div className="space-y-4">
              {mySqlSolutions.map((solution) => (
                <div key={solution.id} className="border rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-datacareer-blue rounded-full flex items-center justify-center text-white text-sm">
                          {solution.author.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-datacareer-darkBlue">{solution.author}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 mr-1">Votes:</span>
                        <span className="font-medium">{solution.votes}</span>
                      </div>
                    </div>
                    
                    <p className="mt-3 text-gray-600 text-sm">{solution.description}</p>
                    
                    <div className="mt-3 bg-gray-50 border rounded-md p-3 overflow-x-auto">
                      <pre className="text-sm font-mono text-gray-800">{solution.code}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              No MySQL solutions available yet.
            </div>
          )}
        </TabsContent>
        <TabsContent value="postgresql" className="mt-4">
          {postgresSolutions.length > 0 ? (
            <div className="space-y-4">
              {postgresSolutions.map((solution) => (
                <div key={solution.id} className="border rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-datacareer-blue rounded-full flex items-center justify-center text-white text-sm">
                          {solution.author.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-datacareer-darkBlue">{solution.author}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 mr-1">Votes:</span>
                        <span className="font-medium">{solution.votes}</span>
                      </div>
                    </div>
                    
                    <p className="mt-3 text-gray-600 text-sm">{solution.description}</p>
                    
                    <div className="mt-3 bg-gray-50 border rounded-md p-3 overflow-x-auto">
                      <pre className="text-sm font-mono text-gray-800">{solution.code}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              No PostgreSQL solutions available yet.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SolutionsDisplay;
