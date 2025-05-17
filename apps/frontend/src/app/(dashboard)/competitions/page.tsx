'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import { CompetitionList, CompetitionCardProps } from '@/components/competition';

export default function CompetitionsPage() {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState<CompetitionCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'my-school' | 'public'>('all');

  useEffect(() => {
    async function fetchCompetitions() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data } = await api.competitions.getAll();
        const competitionsRes = data.competitions || [];
        
        setCompetitions(competitionsRes);
      } catch (err: any) {
        setError(err.message || 'Failed to load competitions');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCompetitions();
  }, [user]);

  const filteredCompetitions = competitions.filter(comp => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'my-school') return comp.school.id === user?.school.id;
    if (activeFilter === 'public') return comp.visibility === 'public';
    return true;
  });

  const handleFilterChange = (filter: 'all' | 'my-school' | 'public') => {
    setActiveFilter(filter);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Competitions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse all competitions you can participate in
          </p>
        </div>
        {user?.role === 'admin' && (
          <Link
            href="/competitions/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            Create Competition
          </Link>
        )}
      </div>

      <CompetitionList
        competitions={filteredCompetitions}
        isLoading={isLoading}
        error={error}
        currentUserSchoolId={user?.school.id}
        filter={activeFilter}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}
