'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import { CompetitionCard, CompetitionCardProps } from '@/components/competition';

interface CompetitionData {
  id: string;
  name: string;
  description: string;
  visibility: string;
  startDate?: string;
  endDate?: string;
  school: {
    id: string;
    name: string;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [competitions, setCompetitions] = useState<CompetitionData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data } = await api.participants.getByUser();
        setCompetitions(data.competitions);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back, {user?.firstName || 'User'}! You are logged in to {user?.school.name}.
        </p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
          {error}
        </div>
      )}

      <div className="gap-6 mb-8">
        <div className="overflow-hidden">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Participation</h2>
          {competitions.length === 0 ? (
            <p className="text-gray-500">You are not participating in any competition.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  {...(competition as CompetitionCardProps)}
                  currentUserSchoolId={user?.school.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
