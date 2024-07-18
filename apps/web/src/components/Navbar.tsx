'use client';
import { useState } from 'react';
import Link from 'next/link';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className=" text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-xl text-indigo-500 font-bold">
                EventNow
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 hover:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  href="/team"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 hover:text-white"
                >
                  Team
                </Link>
                <Link
                  href="/projects"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 hover:text-white"
                >
                  Projects
                </Link>
                <Link
                  href="/calendar"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 hover:text-white"
                >
                  Calendar
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 text-gray-800">
              <Link
                href="/login"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 hover:text-white"
              >
                Register
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400  hover:bg-indigo-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500 hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/team"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500 hover:text-white"
            >
              Team
            </Link>
            <Link
              href="/projects"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500 hover:text-white"
            >
              Projects
            </Link>
            <Link
              href="/calendar"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500 hover:text-white"
            >
              Calendar
            </Link>
            <Link
              href="/signin"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500 hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500 hover:text-white"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
