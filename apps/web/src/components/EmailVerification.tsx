'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const EmailVerification = ({ token }: { token: string }) => {
  const [status, setStatus] = useState('Verifying...');
  const router = useRouter();
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (verificationAttempted.current) return;
      verificationAttempted.current = true;

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/verify/${token}`,
          {
            timeout: 5000, // 5 seconds timeout
          },
        );

        if (response.status === 200) {
          setStatus('Email verified successfully. Redirecting to login...');
          setTimeout(() => router.push('/login'), 3000);
        } else {
          throw new Error('Verification failed');
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Axios error:', error.response?.data);
        } else {
          console.error('Unexpected error:', error);
        }
        setStatus('Verification failed. Please try again or contact support.');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
};

export default EmailVerification;
