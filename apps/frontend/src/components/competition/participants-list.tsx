import { Alert } from '../ui/alert';
import { LoadingSpinner } from '../ui/loading-spinner';

export interface Participant {
  id: string;
  userId: string;
  competitionId: string;
  fullName?: string;
  email?: string;
  schoolName?: string;
}

export interface ParticipantsListProps {
  participants: Participant[];
  isLoading: boolean;
  error: string | null;
  currentUserSchoolId?: string;
}

export function ParticipantsList({
  participants,
  isLoading,
  error,
  currentUserSchoolId,
}: ParticipantsListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  if (participants.length === 0) {
    return (
      <div className="py-4 text-center text-gray-500">
        No participants have joined yet.
      </div>
    );
  }

  return (
    <div className="mt-2">
      <ul className="divide-y divide-gray-200">
        {participants.map((participant) => (
          <li key={participant.id} className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {participant.fullName || 'Unnamed Participant'}
                </p>
                {participant.email && (
                  <p className="text-sm text-gray-500">{participant.email}</p>
                )}
              </div>
              {participant.schoolName && (
                <span className="text-xs inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800">
                  {participant.schoolName}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 