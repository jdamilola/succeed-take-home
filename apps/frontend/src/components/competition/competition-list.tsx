import { useState } from 'react';
import { CompetitionCard, CompetitionCardProps } from './competition-card';
import { Alert } from '../ui/alert';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Button } from '../ui/button';

export interface CompetitionListProps {
  competitions: CompetitionCardProps[];
  isLoading: boolean;
  error: string | null;
  currentUserSchoolId?: string;
  filter: 'all' | 'my-school' | 'public';
  onFilterChange: (filter: 'all' | 'my-school' | 'public') => void;
}

export function CompetitionList({
  competitions,
  isLoading,
  error,
  currentUserSchoolId,
  filter,
  onFilterChange,
}: CompetitionListProps) {
  return (
    <div className="space-y-6">
      <div className="flex space-x-2 pb-4 border-b">
        <Button
          variant={filter === 'all' ? 'primary' : 'ghost'} 
          size="sm"
          onClick={() => onFilterChange('all')}
        >
          All Competitions
        </Button>
        {currentUserSchoolId && (
          <Button
            variant={filter === 'my-school' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onFilterChange('my-school')}
          >
            My School
          </Button>
        )}
        <Button
          variant={filter === 'public' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange('public')}
        >
          Public Only
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner size="large" />
        </div>
      ) : error ? (
        <Alert variant="error">
          {error}
        </Alert>
      ) : competitions.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No competitions found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((competition) => (
            <CompetitionCard
              key={competition.id}
              {...competition}
              currentUserSchoolId={currentUserSchoolId}
            />
          ))}
        </div>
      )}
    </div>
  );
} 