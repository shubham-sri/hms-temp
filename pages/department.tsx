import { Inter } from 'next/font/google'
import React, { useEffect, useState } from 'react'

import {useValidateLogin} from '../hooks'
import { useRouter } from 'next/router'
import AddDepartmentForm from '@/components/AddDepartmentForm'
import DepartmentList from '@/components/DepartmentList'

const inter = Inter({ subsets: ['latin'] })

export default function Department() {

  const { isLoggedIn, loading } = useValidateLogin();
  const [loadingDepartment, setLoadingDepartment] = useState(false);
  const [departments, setDepartments] = useState([])
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace('/');
    }
  }, [loading, isLoggedIn, router]);

  useEffect(() => {
    if(loadingDepartment){
      return;
    }
    const fetchData = async () => {
      try {
        const response = await fetch('/api/department');

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data: any = await response.json();
        console.log(data);
        setDepartments(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [loadingDepartment]);

  const addDepartment = async (name: string) => {
    setLoadingDepartment(true);
    const payload = {
      name: name
    };

    try {
      const response = await fetch('/api/department', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      // Handle the response data as needed.
      console.log("Server Response:", data);

    } catch (error) {
      console.error("There was an error adding the department:", error);
    } finally {
      setLoadingDepartment(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="bg-white w-64 p-4 shadow-md hidden md:block"> {/* Side nav for desktop */}
        <h1 className="text-2xl mb-4 font-bold">Shanti Memorial</h1>

        <div className="mb-2">
          <ul>
          <li className="mb-2">
              <button 
                className="block w-full text-left px-4 py-2 rounded bg-gray-200 hover:bg-teal-300 transition duration-300"
                onClick={() => router.push('/home')}
              >
                Book Appointments
              </button>
            </li>
            <li className="mb-2">
              <button 
                className="block w-full text-left px-4 py-2 rounded bg-gray-200 hover:bg-teal-300 hover:text-white transition duration-300"
                onClick={() => router.push('/doctor')}
              >
                Doctor
              </button>
            </li>
            <li className="mb-2">
              <button 
                className="block w-full text-left px-4 py-2 rounded bg-teal-700 hover:bg-teal-300 text-white transition duration-300"
                onClick={() => router.push('/department')}
              >
                Department
              </button>
            </li>
            <li className=" mt-10">
              <button 
                className="block w-full text-left px-4 py-2 rounded bg-red-700 hover:bg-red-400 text-white transition duration-300"
                onClick={async () => {
                  await fetch(
                    '/api/logout', 
                    {
                      method: 'POST',
                    }
                  )
                  router.replace('/')
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex-1 px-4 pt-8">
        <AddDepartmentForm 
          onAddDepartment={addDepartment}
          loading={loadingDepartment}
        />
        <div
          className='mt-10'
        >
          {loadingDepartment ? <p>Getting...</p>  : <DepartmentList departments={departments}/>}
        </div>
      </div>
    </div>
  )
}
