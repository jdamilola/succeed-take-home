'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import { 
  FormField, 
  FormInput, 
  FormSelect, 
  FormSelectOption, 
  FormTextarea, 
  FormCheckbox 
} from '@/components/forms';
import { Alert, Button, LoadingSpinner } from '@/ui';

const competitionSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  rules: z.string().optional(),
  visibility: z.enum(['public', 'private', 'restricted']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  schoolAccess: z.array(z.string()).optional(),
});

type CompetitionFormData = z.infer<typeof competitionSchema>;

export default function CreateCompetitionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CompetitionFormData>({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
      name: '',
      description: '',
      rules: '',
      visibility: 'private',
      startDate: '',
      endDate: '',
      schoolAccess: [],
    },
  });

  const visibility = watch('visibility');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const visibilityOptions: FormSelectOption[] = [
    { value: 'private', label: 'Private (Your school only)' },
    { value: 'public', label: 'Public (All schools)' },
    { value: 'restricted', label: 'Restricted (Selected schools)' }
  ];

  // Only admins can create competitions
  if (user && user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-gray-500">You don't have permission to create competitions.</p>
        <Button
          variant="primary"
          className="mt-6"
          onClick={() => router.push('/competitions')}
        >
          Go to Competitions
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: CompetitionFormData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Format dates for the API
      const formattedData = {
        name: data.name,
        description: data.description,
        rules: data.rules,
        visibility: data.visibility,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        schoolId: user.school.id,
        allowedSchools: data.schoolAccess,
      };
      
      // Create the competition
      const { data: competitionData } = await api.competitions.create(formattedData);
      const competitionId = competitionData.competition.id;
      
      // Redirect to the competition detail page
      router.push(`/competitions/${competitionId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create competition');
      setIsSubmitting(false);
    }
  };

  const loadSchools = async () => {
    try {
      setIsLoadingSchools(true);
      const { data } = await api.schools.getAll();
      const schools = data.schools ?? [];
      // Filter out the current school
      const otherSchools = schools.filter((school: any) => school.id !== user?.school.id);
      setSchools(otherSchools);
    } catch (err) {
      console.error('Failed to load schools:', err);
    } finally {
      setIsLoadingSchools(false);
    }
  };

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Create New Competition
          </h2>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <FormField 
                id="name" 
                label="Competition Name" 
                error={errors.name?.message}
                required
              >
                <FormInput
                  id="name"
                  {...register('name')}
                />
              </FormField>
            </div>

            <div className="sm:col-span-6">
              <FormField 
                id="description" 
                label="Description" 
                error={errors.description?.message}
                required
              >
                <FormTextarea
                  id="description"
                  rows={4}
                  {...register('description')}
                />
              </FormField>
            </div>

            <div className="sm:col-span-6">
              <FormField 
                id="rules" 
                label="Rules (Optional)" 
              >
                <FormTextarea
                  id="rules"
                  rows={6}
                  {...register('rules')}
                />
              </FormField>
            </div>

            <div className="sm:col-span-3">
              <FormField 
                id="visibility" 
                label="Visibility" 
                required
              >
                <FormSelect
                  id="visibility"
                  options={visibilityOptions}
                  {...register('visibility')}
                  onChange={(e) => {
                    setValue('visibility', e.target.value as any);
                    if (e.target.value === 'restricted') {
                      loadSchools();
                    }
                  }}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {visibility === 'private' 
                    ? 'Only members of your school can see and join this competition.' 
                    : visibility === 'public' 
                    ? 'Anyone from any school can see and join this competition.'
                    : 'Only members of selected schools can see and join this competition.'}
                </p>
              </FormField>
            </div>

            <div className="sm:col-span-3">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <FormField 
                    id="startDate" 
                    label="Start Date (Optional)" 
                  >
                    <FormInput
                      id="startDate"
                      type="datetime-local"
                      {...register('startDate')}
                    />
                  </FormField>
                </div>
                
                <div className="flex-1">
                  <FormField 
                    id="endDate" 
                    label="End Date (Optional)" 
                  >
                    <FormInput
                      id="endDate"
                      type="datetime-local"
                      min={startDate}
                      {...register('endDate')}
                    />
                  </FormField>
                </div>
              </div>
              {startDate && endDate && new Date(startDate) > new Date(endDate) && (
                <p className="mt-1 text-sm text-red-600">
                  End date cannot be before start date
                </p>
              )}
            </div>

            {visibility === 'restricted' && (
              <div className="sm:col-span-6">
                <FormField 
                  id="schoolAccess" 
                  label="Schools With Access" 
                >
                  {isLoadingSchools ? (
                    <div className="flex justify-center py-4">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : schools.length === 0 ? (
                    <p className="text-sm text-gray-500">No other schools available</p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-2 p-2 border border-gray-300 rounded-md">
                      {schools.map((school) => (
                        <FormCheckbox
                          key={school.id}
                          id={`school-${school.id}`}
                          label={school.name}
                          value={school.id}
                          {...register('schoolAccess')}
                        />
                      ))}
                    </div>
                  )}
                </FormField>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              variant="outline"
              className="mr-3"
              onClick={() => router.push('/competitions')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              loadingText="Creating..."
            >
              Create Competition
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
