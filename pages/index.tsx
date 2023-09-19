import Image from 'next/image'
import { Inter } from 'next/font/google'
import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import { useRouter } from 'next/router';
import 'react-toastify/dist/ReactToastify.css';
import { useValidateLogin } from '@/hooks';


const inter = Inter({ subsets: ['latin'] })

export default function Login() {
  const [formData, setFormData] = useState({ userId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  const { isLoggedIn, loading: validateLoading } = useValidateLogin();

  useEffect(() => {
    if (!validateLoading && isLoggedIn) {
      router.replace('/home');
    }
  }, [validateLoading, isLoggedIn, router]);


  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    if(!formData.userId || !formData.password) {
      toast.warn('Please fill all the fields!');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong!');
      }

      // Handle successful login here, e.g., storing a token, redirecting the user, etc.

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      // redirect to home page
      router.push('/home');
    }
  };

  useEffect(() => {
    if (error) {
      toast.error('Invalid credentials!');
    }
  }, [error]);

  console.log('validateLoading', validateLoading);


  if (validateLoading || isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
       <p className="text-2xl font-bold">Loading...</p>
      </div>
    )
  }


  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-2">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Login to your account</h2>
          </div>
          <form className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="userId" className="sr-only">
                  User ID
                </label>
                <input
                  id="userId"
                  name="userId"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="User ID"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? 'Loading...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </main>
  )
}
