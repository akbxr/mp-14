'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(4, { message: 'Password must be at least 4 characters long' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const [error, setError] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/auth/login',
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
        setError(err.response.data.message || 'Login failed');
      } else {
        console.error(err);
        setError('An error occurred during login');
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-background ">
      <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-500">
          Login
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          <Button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600"
          >
            Login
          </Button>
        </form>
        <div className="mt-4 text-center text-muted-foreground">
          Dont have an account?{' '}
          <Link href="/register" className="text-indigo-500 underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
