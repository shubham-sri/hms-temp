import Image from 'next/image'
import { Inter } from 'next/font/google'
import React, { useEffect } from 'react'

import {useValidateLogin} from '../hooks'
import { useRouter } from 'next/router'

const inter = Inter({ subsets: ['latin'] })

export default function Patient() {

  const { isLoggedIn, loading } = useValidateLogin();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace('/');
    }
  }, [loading, isLoggedIn, router]);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="bg-white w-64 p-4 shadow-md hidden md:block"> {/* Side nav for desktop */}
        <h1 className="text-2xl mb-4 font-bold">Shanti Memorial</h1>

        <div className="mb-2">
          <ul>
          <li className="mb-2">
              <button 
                className="block w-full text-left px-4 py-2 rounded bg-gray-200 hover:bg-teal-500 transition duration-300"
                onClick={() => router.push('/home')}
              >
                Book Appointments
              </button>
            </li>
            <li className="mb-2">
              <button 
                className="block w-full text-left px-4 py-2 rounded bg-gray-200 hover:bg-teal-500 hover:text-white transition duration-300"
                onClick={() => router.push('/doctor')}
              >
                Doctor
              </button>
            </li>
            <li className="mb-2">
              <button 
                className="block w-full text-left px-4 py-2 rounded bg-gray-200 hover:bg-teal-500 hover:text-white transition duration-300"
                onClick={() => router.push('/department')}
              >
                Department
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex-1 p-4">
        {/* Your main dashboard content goes here */}
        <h1>Welcome to the Dashboard</h1>
      </div>
    </div>
  )
}
