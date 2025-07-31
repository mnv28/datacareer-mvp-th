import React, { useEffect, useState } from 'react';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDispatch, useSelector } from 'react-redux';
import { fetchCompanies } from '@/redux/slices/companySlice';
import { fetchTopics } from '@/redux/slices/topicSlice';
import { fetchDomains } from '@/redux/slices/domainSlice';
import { RootState } from '@/redux/store';
import { AppDispatch } from '@/redux/store';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCompanies: number[];
  setSelectedCompanies: (companies: number[]) => void;
  selectedTopics: number[];
  setSelectedTopics: (topics: number[]) => void;
  selectedDomains: number[];
  setSelectedDomains: (domains: number[]) => void;
  selectedDifficulties: string[];
  setSelectedDifficulties: (difficulties: string[]) => void;
  selectedVariants: string[];
  setSelectedVariants: (variants: string[]) => void;
  onClearAll: () => void;
  onApply: (filters: any) => void;
}

interface FilterOption {
  id: number;
  name: string;
}

interface FilterPopoverProps<T extends number | string> {
  title: string;
  options: FilterOption[] | string[];
  selected: T[];
  setSelected: (values: T[]) => void;
  icon: React.ReactNode;
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
  onClearAll,
  onApply
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { companies, isLoading: companiesLoading } = useSelector((state: RootState) => state.company);
  const { topics, isLoading: topicsLoading } = useSelector((state: RootState) => state.topic);
  const { domains, isLoading: domainsLoading } = useSelector((state: RootState) => state.domain);

  // Local state for filters
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [localCompanies, setLocalCompanies] = useState(selectedCompanies);
  const [localTopics, setLocalTopics] = useState(selectedTopics);
  const [localDomains, setLocalDomains] = useState(selectedDomains);
  const [localDifficulties, setLocalDifficulties] = useState(selectedDifficulties);
  const [localVariants, setLocalVariants] = useState(selectedVariants);

  // State to control dropdown open/close
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    companies: false,
    topics: false,
    domains: false,
    difficulty: false,
    variants: false
  });

  // Sync local state with parent when parent changes (optional)
  useEffect(() => {
    setLocalSearch(searchQuery);
    setLocalCompanies(selectedCompanies);
    setLocalTopics(selectedTopics);
    setLocalDomains(selectedDomains);
    setLocalDifficulties(selectedDifficulties);
    setLocalVariants(selectedVariants);
  }, [searchQuery, selectedCompanies, selectedTopics, selectedDomains, selectedDifficulties, selectedVariants]);

  useEffect(() => {
    dispatch(fetchCompanies());
    dispatch(fetchTopics());
    dispatch(fetchDomains());
  }, [dispatch]);

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const variants = ['MySQL'];

  const handleMultiSelect = <T extends number | string>(
    value: T,
    selected: T[],
    setSelected: (values: T[]) => void,
    dropdownKey: string
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter(item => item !== value));
    } else {
      setSelected([...selected, value]);
    }
    // Keep dropdown open after selection
    setOpenDropdowns(prev => ({ ...prev, [dropdownKey]: true }));
  };

  const handleSelectAll = <T extends number | string>(
    options: FilterOption[] | string[],
    selected: T[],
    setSelected: (values: T[]) => void,
    dropdownKey: string
  ) => {
    if (selected.length === options.length) {
      setSelected([]);
    } else {
      const values = options.map(option =>
        typeof option === 'string' ? option : option.id
      ) as T[];
      setSelected(values);
    }
    // Keep dropdown open after select all
    setOpenDropdowns(prev => ({ ...prev, [dropdownKey]: true }));
  };

  const handleClearSelection = <T extends number | string>(
    setSelected: (values: T[]) => void,
    dropdownKey: string
  ) => {
    setSelected([]);
    // Keep dropdown open after clear
    setOpenDropdowns(prev => ({ ...prev, [dropdownKey]: true }));
  };

  const FilterPopover = <T extends number | string>({
    title,
    options,
    selected,
    setSelected,
    icon
  }: FilterPopoverProps<T>) => {
    const dropdownKey = title.toLowerCase();
    const isOpen = openDropdowns[dropdownKey];

    return (
      <Popover open={isOpen} onOpenChange={(open) => setOpenDropdowns(prev => ({ ...prev, [dropdownKey]: open }))}>
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
            {isOpen ? <ChevronUp className="h-4 w-4 opacity-50" /> : <ChevronDown className="h-4 w-4 opacity-50" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSelectAll<T>(options, selected, setSelected, dropdownKey)}
                className="text-xs"
              >
                {selected.length === options.length ? 'Deselect All' : 'Select All'}
              </Button>
              {selected.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClearSelection<T>(setSelected, dropdownKey)}
                  className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  Clear
                </Button>
              )}
            </div>
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-2">
                {options.map((option) => {
                  const value = typeof option === 'string' ? option : option.id;
                  const label = typeof option === 'string' ? option : option.name;

                  return (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${title.toLowerCase()}-${value}`}
                        checked={selected.includes(value as T)}
                        onCheckedChange={() => handleMultiSelect<T>(value as T, selected, setSelected, dropdownKey)}
                      />
                      <label
                        htmlFor={`${title.toLowerCase()}-${value}`}
                        className="text-sm cursor-pointer hover:text-datacareer-blue transition-colors"
                      >
                        {label}
                      </label>
                    </div>
                  );
                })}
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
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              // Remove real-time update: setSearchQuery(e.target.value);
            }}
            className="pl-9 h-10"
          />
        </div>
      </div>

      {/* Filter Summary */}
      {(localCompanies.length > 0 || localTopics.length > 0 ||
        localDomains.length > 0 || localDifficulties.length > 0 ||
        localVariants.length > 0) && (
          <div className="p-4 border-b bg-gray-50">
            <div className="flex flex-wrap gap-2">
              {localCompanies.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-white">
                  Companies: {localCompanies.map(id => companies.find(c => c.id === id)?.name).filter(Boolean).join(', ')}
                  <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setLocalCompanies([])} />
                </Badge>
              )}
              {localTopics.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-white">
                  Topics: {localTopics.map(id => topics.find(t => t.id === id)?.name).filter(Boolean).join(', ')}
                  <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setLocalTopics([])} />
                </Badge>
              )}
              {localDomains.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-white">
                  Domains: {localDomains.map(id => domains.find(d => d.id === id)?.name).filter(Boolean).join(', ')}
                  <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setLocalDomains([])} />
                </Badge>
              )}
              {localDifficulties.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-white">
                  Difficulty: {localDifficulties.join(', ')}
                  <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setLocalDifficulties([])} />
                </Badge>
              )}
              {localVariants.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-white">
                  Variants: {localVariants.join(', ')}
                  <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setLocalVariants([])} />
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
            selected={localCompanies}
            setSelected={setLocalCompanies}
            icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 7h-7m7 10h-7m7-5h-7M4 7h7m-7 10h7m-7-5h7" />
            </svg>}
          />
          <FilterPopover
            title="Topics"
            options={topics}
            selected={localTopics}
            setSelected={setLocalTopics}
            icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>}
          />
          <FilterPopover
            title="Domains"
            options={domains}
            selected={localDomains}
            setSelected={setLocalDomains}
            icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>}
          />
          <FilterPopover
            title="Difficulty"
            options={difficulties}
            selected={localDifficulties}
            setSelected={setLocalDifficulties}
            icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>}
          />
          <FilterPopover
            title="Variants"
            options={variants}
            selected={localVariants}
            setSelected={setLocalVariants}
            icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>}
          />
          <button
            className="btn bg-[#dcfce7] text-[#166534] flex items-center gap-2 h-9 px-3 border rounded-sm border-dashed border-green-200"
            onClick={() => onApply({
              searchQuery: localSearch,
              selectedCompanies: localCompanies,
              selectedTopics: localTopics,
              selectedDomains: localDomains,
              selectedDifficulties: localDifficulties,
              selectedVariants: localVariants
            })}
          >
            Search
          </button>
        </div>
      </div>

    </div>
  );
};

export default FilterBar;
