import React from 'react';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCompanies: string[];
  setSelectedCompanies: (companies: string[]) => void;
  selectedTopics: string[];
  setSelectedTopics: (topics: string[]) => void;
  selectedDomains: string[];
  setSelectedDomains: (domains: string[]) => void;
  selectedDifficulties: string[];
  setSelectedDifficulties: (difficulties: string[]) => void;
  selectedVariants: string[];
  setSelectedVariants: (variants: string[]) => void;
  onClearAll: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCompanies,
  setSelectedCompanies,
  selectedTopics,
  setSelectedTopics,
  selectedDomains,
  setSelectedDomains,
  selectedDifficulties,
  setSelectedDifficulties,
  selectedVariants,
  setSelectedVariants,
  onClearAll
}) => {
  // Mock data - replace with actual data from your backend
  const companies = ['Amazon', 'Google', 'Microsoft', 'Meta', 'Apple'];
  const topics = ['Data Analysis', 'Data Manipulation', 'Window Functions', 'Joins', 'Subqueries'];
  const domains = ['E-Commerce', 'Technology', 'Finance', 'Healthcare', 'Education'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const variants = ['SQL', 'Python', 'PostgreSQL', 'MySQL'];

  const handleMultiSelect = (
    value: string,
    selected: string[],
    setSelected: (values: string[]) => void
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter(item => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const handleSelectAll = (
    options: string[],
    selected: string[],
    setSelected: (values: string[]) => void
  ) => {
    if (selected.length === options.length) {
      setSelected([]);
    } else {
      setSelected(options);
    }
  };

  const FilterPopover = ({ 
    title, 
    options, 
    selected, 
    setSelected, 
    icon 
  }: { 
    title: string; 
    options: string[]; 
    selected: string[]; 
    setSelected: (values: string[]) => void;
    icon: React.ReactNode;
  }) => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-9 px-3 border-dashed"
          >
            {icon}
            <span>{title}</span>
            {selected.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selected.length}
              </Badge>
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSelectAll(options, selected, setSelected)}
                className="text-xs"
              >
                {selected.length === options.length ? 'Deselect All' : 'Select All'}
              </Button>
              {selected.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected([])}
                  className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  Clear
                </Button>
              )}
            </div>
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-2">
                {options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${title.toLowerCase()}-${option}`}
                      checked={selected.includes(option)}
                      onCheckedChange={() => handleMultiSelect(option, selected, setSelected)}
                    />
                    <label 
                      htmlFor={`${title.toLowerCase()}-${option}`} 
                      className="text-sm cursor-pointer hover:text-datacareer-blue transition-colors"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-4">
      <div className="p-4 border-b">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by question or company"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        </div>
        
      {/* Filter Summary */}
      {(selectedCompanies.length > 0 || selectedTopics.length > 0 || 
        selectedDomains.length > 0 || selectedDifficulties.length > 0 || 
        selectedVariants.length > 0) && (
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {selectedCompanies.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-white">
                Companies: {selectedCompanies.join(', ')}
                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setSelectedCompanies([])} />
              </Badge>
            )}
            {selectedTopics.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-white">
                Topics: {selectedTopics.join(', ')}
                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setSelectedTopics([])} />
              </Badge>
            )}
            {selectedDomains.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-white">
                Domains: {selectedDomains.join(', ')}
                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setSelectedDomains([])} />
              </Badge>
            )}
            {selectedDifficulties.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-white">
                Difficulty: {selectedDifficulties.join(', ')}
                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setSelectedDifficulties([])} />
              </Badge>
            )}
            {selectedVariants.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-white">
                Variants: {selectedVariants.join(', ')}
                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setSelectedVariants([])} />
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearAll}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      )}

      {/* Filter Options */}
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          <FilterPopover
            title="Companies"
            options={companies}
            selected={selectedCompanies}
            setSelected={setSelectedCompanies}
            icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 7h-7m7 10h-7m7-5h-7M4 7h7m-7 10h7m-7-5h7" />
            </svg>}
          />
          <FilterPopover
            title="Topics"
            options={topics}
            selected={selectedTopics}
            setSelected={setSelectedTopics}
            icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>}
          />
          <FilterPopover
            title="Domains"
            options={domains}
            selected={selectedDomains}
            setSelected={setSelectedDomains}
            icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>}
          />
          <FilterPopover
            title="Difficulty"
            options={difficulties}
            selected={selectedDifficulties}
            setSelected={setSelectedDifficulties}
            icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>}
          />
          <FilterPopover
            title="Variants"
            options={variants}
            selected={selectedVariants}
            setSelected={setSelectedVariants}
            icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
