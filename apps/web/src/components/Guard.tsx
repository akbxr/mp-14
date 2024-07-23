"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const GuardPage = (WrappedComponent: any) => {
  return function WithAuth(props: any) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');

      if (!token || userRole !== 'ORGANIZER') {
        alert('Only organizers can access this page');
        router.push('/');
      } else {
        setIsAuthorized(true);
      }
    }, [router]);

    if (!isAuthorized) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default GuardPage;