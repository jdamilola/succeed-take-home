import Link from 'next/link';
import { CompetitionStatusBadge } from './competition-status-badge';
import { VisibilityBadge } from './visibility-badge';
import { Badge } from '../ui/badge';

interface School {
  id: string;
  name: string;
}

export interface CompetitionCardProps {
  id: string;
  name: string;
  description: string;
  visibility: 'public' | 'private' | 'restricted';
  startDate?: string;
  endDate?: string;
  school: School;
  currentUserSchoolId?: string;
}

export function CompetitionCard({
  id,
  name,
  description,
  visibility,
  startDate,
  endDate,
  school,
  currentUserSchoolId,
}: CompetitionCardProps) {
  const isFromDifferentSchool = school.id !== currentUserSchoolId;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            <Link
              href={`/competitions/${id}`}
              className="hover:text-primary-600 focus:outline-none focus:underline"
            >
              {name}
            </Link>
          </h3>
          <CompetitionStatusBadge startDate={startDate} endDate={endDate} />
        </div>
        
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
          {description || 'No description available.'}
        </p>
        
        <div className="mt-4 flex items-center text-xs text-gray-500 space-x-2">
          <VisibilityBadge visibility={visibility} />
          
          {isFromDifferentSchool && (
            <Badge variant="default">
              {school.name}
            </Badge>
          )}
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {startDate && (
              <span>
                {new Date(startDate).toLocaleDateString()}
                {endDate && ' - ' + new Date(endDate).toLocaleDateString()}
              </span>
            )}
          </div>
          <Link
            href={`/competitions/${id}`}
            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  );
} 