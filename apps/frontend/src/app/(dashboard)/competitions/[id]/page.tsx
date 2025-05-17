'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import { CompetitionStatusBadge, ParticipantsList, Participant, VisibilityBadge } from '@/components/competition';
import { Alert, Button, LoadingSpinner } from '@/ui';

interface CompetitionData {
  id: string;
  name: string;
  description: string;
  rules?: string;
  visibility: 'public' | 'private' | 'restricted';
  startDate?: string;
  endDate?: string;
  school: {
    id: string;
    name: string;
  };
}

export default function CompetitionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompetitionDetails() {
      if (!user || !id) return;
      
      try {
        setIsLoading(true);
        const [competitionRes, participantsRes] = await Promise.all([
          api.competitions.getById(id as string),
          api.participants.getByCompetition(id as string)
        ]);
        setCompetition(competitionRes.data);
        
        const { participants } = participantsRes.data ?? [];
        
        // Transform participants to match the component interface
        const transformedParticipants = participants.map((p: any) => ({
          id: p.id,
          userId: p.user.id,
          competitionId: p.competition.id,
          fullName: p.user.firstName && p.user.lastName 
            ? `${p.user.firstName} ${p.user.lastName}` 
            : p.user.email.split('@')[0],
          email: p.user.email,
          schoolName: p.school.name
        }));
        
        setParticipants(transformedParticipants);
        
        // Check if current user has joined this competition
        const userHasJoined = participants.some(
          (participant: any) => participant.user.id === user.id
        );
        setHasJoined(userHasJoined);
      } catch (err: any) {
        setError(err.message || 'Failed to load competition details');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCompetitionDetails();
  }, [id, user]);

  async function refreshParticipants() {
    if (!user || !competition) return;

    // Refresh participants list
    const { data } = await api.participants.getByCompetition(competition.id);
      
    // Transform participants
    const transformedParticipants = data.participants.map((p: any) => ({
      id: p.id,
      userId: p.user.id,
      competitionId: p.competition.id,
      fullName: p.user.firstName && p.user.lastName 
        ? `${p.user.firstName} ${p.user.lastName}` 
        : p.user.email.split('@')[0],
      email: p.user.email,
      schoolName: p.school.name
    }));
    
    setParticipants(transformedParticipants);
  }

  async function handleJoinCompetition() {
    if (!user || !competition) return;
    
    try {
      setIsJoining(true);
      await api.participants.join(competition.id);
      setHasJoined(true);

      // Refresh participants list
      await refreshParticipants();
    } catch (err: any) {
      setError(err.message || 'Failed to join competition');
    } finally {
      setIsJoining(false);
    }
  }

  async function handleLeaveCompetition() {
    if (!user || !competition) return;
    
    try {
      setIsLeaving(true);
      await api.participants.leave(competition.id);
      setHasJoined(false);
      
      // Refresh participants list
      await refreshParticipants();
    } catch (err: any) {
      setError(err.message || 'Failed to leave competition');
    } finally {
      setIsLeaving(false);
    }
  }
  

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Competition not found</h2>
        <p className="mt-2 text-gray-500">The competition you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button
          variant="primary"
          className="mt-6"
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </div>
    );
  }

  const isActive = () => {
    const now = new Date();
    const startDate = competition.startDate ? new Date(competition.startDate) : null;
    const endDate = competition.endDate ? new Date(competition.endDate) : null;
    
    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;
    return true;
  };

  const canJoin = !hasJoined && isActive();
  
  return (
    <div>
      {error && <Alert variant="error">{error}</Alert>}

      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          leftIcon={
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          }
        >
          Back to competitions
        </Button>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{competition.name}</h2>
            <p className="mt-1 text-sm text-gray-500">
              Hosted by {competition.school.name}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <VisibilityBadge visibility={competition.visibility} />
            <CompetitionStatusBadge startDate={competition.startDate} endDate={competition.endDate} />
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Description</h3>
                  <p className="mt-2 text-sm text-gray-500 whitespace-pre-line">
                    {competition.description || 'No description provided.'}
                  </p>
                </div>
                {competition.rules && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Rules</h3>
                    <div className="mt-2 text-sm text-gray-500 prose whitespace-pre-line">
                      {competition.rules}
                    </div>
                  </div>
                )}
                {competition.startDate && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Timeline</h3>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>
                        <span className="font-medium">Start Date:</span>{' '}
                        {new Date(competition.startDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      {competition.endDate && (
                        <p className="mt-1">
                          <span className="font-medium">End Date:</span>{' '}
                          {new Date(competition.endDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {hasJoined && (
                <div className="mt-8">
                  <div className="rounded-md bg-blue-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1 md:flex md:justify-between">
                        <p className="text-sm text-blue-700">
                          You have joined this competition.
                        </p>
                        <p className="mt-3 text-sm md:mt-0 md:ml-6">
                          <Link
                            href={`/competitions/${competition.id}/submit`}
                            className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600"
                          >
                            Submit your entry <span aria-hidden="true">&rarr;</span>
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">Participants</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {participants.length} {participants.length === 1 ? 'person' : 'people'} joined
                </p>
              </div>

              {!hasJoined && (
                <div className="mb-6">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleJoinCompetition}
                    disabled={!canJoin}
                    isLoading={isJoining}
                    loadingText="Joining..."
                  >
                    {hasJoined
                      ? 'Joined'
                      : !isActive()
                      ? 'Competition not active'
                      : 'Join Competition'}
                  </Button>
                  {!isActive() && (
                    <p className="mt-2 text-xs text-gray-500 text-center">
                      {competition.startDate && new Date() < new Date(competition.startDate)
                        ? `This competition starts on ${new Date(competition.startDate).toLocaleDateString()}`
                        : `This competition ended on ${competition.endDate ? new Date(competition.endDate).toLocaleDateString() : 'an unknown date'}`}
                    </p>
                  )}
                </div>
              )}

              {hasJoined && (
                <div className="mb-6">
                  <Button
                    variant="destructive"
                    fullWidth
                    onClick={handleLeaveCompetition}
                    disabled={isLeaving}
                    isLoading={isLeaving}
                    loadingText="Leaving..."
                  >
                    Leave Competition
                  </Button>
                </div>
              )}

              <ParticipantsList
                participants={participants}
                isLoading={false}
                error={null}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
