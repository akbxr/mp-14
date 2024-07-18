'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const registrationSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(4, { message: 'Password must be at least 4 characters long' }),
  role: z.enum(['ORGANIZER', 'CUSTOMER'], {
    required_error: 'Please select a role',
  }),
  referralCode: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function RegistrationForm() {
  const [error, setError] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: undefined,
      referralCode: '',
    },
  });

  const role = watch('role');

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/auth/register',
        data,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      const responseData = response.data;
      localStorage.setItem('token', responseData.token);
      localStorage.setItem('userRole', responseData.user.role);

      if (responseData.user.role === 'ORGANIZER') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Registration failed');
      } else {
        console.error(err);
        setError('An error occurred during registration');
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-600">
          Register
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter a password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <Label id="role" htmlFor="role">
              Role
            </Label>
            <Select
              onValueChange={(value) =>
                setValue('role', value as 'ORGANIZER' | 'CUSTOMER')
              }
              value={role}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ORGANIZER">Organizer</SelectItem>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="referral">Referral Code (optional)</Label>
            <Input
              id="referral"
              placeholder="Enter referral code"
              {...register('referralCode')}
            />
          </div>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          <Button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600"
          >
            Register
          </Button>
        </form>
        <div className="mt-4 text-center text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-500 underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
