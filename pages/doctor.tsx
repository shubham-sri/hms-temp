import { Inter } from 'next/font/google'
import React, { useEffect, useState } from 'react'

import {useValidateLogin} from '../hooks'
import { useRouter } from 'next/router'
import AddDoctorForm from '@/components/AddDoctorForm'
import DoctorList from '@/components/DoctorList'

const inter = Inter({ subsets: ['latin'] })

export default function Doctor() {

  const { isLoggedIn, loading } = useValidateLogin();
  const [loadingDoctor, setLoadingDoctor] = useState(false);
  const [doctors, setDoctors] = useState([])
  const router = useRouter();

  const addDoctor = async (name: string, designation: string, department: number) => {
    setLoadingDoctor(true);
    const res = await fetch('/api/doctor', {
      method: 'POST',
      body: JSON.stringify({
        name,
        designation,
        department
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    setLoadingDoctor(false);
    console.log(data);
  }

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace('/');
    }
  }, [loading, isLoggedIn, router]);

  useEffect(() => {
    if(loadingDoctor){
      return;
    }
    const fetchData = async () => {
      try {
        const response = await fetch('/api/doctor');

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data: any = await response.json();
        console.log(data);
        setDoctors(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [loadingDoctor]);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="bg-white w-64 p-4 shadow-md hidden md:block"> {/* Side nav for desktop */}
        <h1 className="text-2xl mb-4 font-bold">Shanti Memorial</h1>

        <div className="mb-2">
          <ul>
          <li className="mb-2">
              <button 
                className="block w-full text-left px-4 py-2 rounded bg-gray-200 hover:bg-teal-500 hover:text-white transition duration-300"
                onClick={() => router.push('/home')}
              >
                Book Appointments
              </button>
            </li>
            <li className="mb-2">
              <button 
                className="block w-full text-left px-4 py-2 rounded bg-teal-700 hover:bg-teal-500 text-white transition duration-300"
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

      <div className="flex-1 px-4 pt-8 w-full">
        <AddDoctorForm 
          onAddDoctor={addDoctor}
          loading={loadingDoctor}
        />
        <div
          className='mt-10'
        >
          {loadingDoctor ? <p>Getting...</p>  : <DoctorList doctors={doctors}/>}
        </div>
      </div>
    </div>
  )
}
