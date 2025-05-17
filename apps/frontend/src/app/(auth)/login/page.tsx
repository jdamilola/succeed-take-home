'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import { Alert, Button } from '@/ui';
import { FormCheckbox, FormField, FormInput, FormSelect, FormSelectOption } from '@/components/forms';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  schoolDomain: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [schoolOptions, setSchoolOptions] = useState<FormSelectOption[]>([]);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      schoolDomain: '',
    },
  });

  useEffect(() => {
    const getSchools = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.schools.getAll();
        const transformedOptions: FormSelectOption[] = (data.schools ?? []).map((school: { id: string; name: string; domain: string }) => ({
          value: school.domain,
          label: school.name
        }));
        setSchoolOptions(transformedOptions);
      } catch (err) {
        console.error('Error fetching schools:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getSchools();
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);
    
    try {
      await login(data.email, data.password, data.schoolDomain);
      // Store rememberMe preference in localStorage if needed
      if (rememberMe) {
        localStorage.setItem('rememberEmail', data.email);
      } else {
        localStorage.removeItem('rememberEmail');
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show session expired message
  const sessionExpired = searchParams.get('session') === 'expired';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="#" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>
        
        {sessionExpired && (
          <Alert variant="warning" className="mt-4">
            Your session has expired. Please log in again.
          </Alert>
        )}
        
        {error && (
          <Alert variant="error" className="mt-4">
            {error}
          </Alert>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            <FormField 
              id="schoolDomain" 
              label="Select your school"
            >
              <FormSelect
                id="schoolDomain"
                placeholder="Select a school"
                options={schoolOptions}
                disabled={isLoading}
                {...register('schoolDomain')}
              />
            </FormField>

            <FormField 
              id="email" 
              label="Email address" 
              error={errors.email?.message}
              required
            >
              <FormInput
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
              />
            </FormField>

            <FormField 
              id="password" 
              label="Password" 
              error={errors.password?.message}
              required
            >
              <FormInput
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
              />
            </FormField>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FormCheckbox
                id="rememberMe"
                label="Remember me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              loadingText="Signing in..."
              fullWidth
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
