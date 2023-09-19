import Image from 'next/image'
import { Inter } from 'next/font/google'
import React, { useEffect, useState } from 'react'
import EditAppointmentsCom from '@/components/EditAppointments'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/router';
import "react-datepicker/dist/react-datepicker.css";

import {useValidateLogin} from '@/hooks';
import { ClipLoader } from 'react-spinners';

const inter = Inter({ subsets: ['latin'] })

export interface Patient {
  id: number
  name: string
  age: number
  gender: string
  tags: any[]
  address: string
  createdAt: string
}

export interface Doctor {
  id: number
  name: string
  designation: string
  departmentId: number
}

export interface Department {
  id: number
  name: string
}

export interface Vital {
  id: number
  isDiabetic: boolean
  isBP: boolean
  isPregnant: boolean
  isOtherDiseases: boolean
  appointmentId: number
  createdAt: string
}


interface AppointmentDetails {
  id: number
  appointmentNo: number
  departmentId: number
  doctorId: number
  patientId: number
  date: string
  dateStr: string
  patient: Patient
  doctor: Doctor
  department: Department
  vital: Vital
}

export default function EditAppointments() {

  const { isLoggedIn, loading } = useValidateLogin();
  const [loadingAppointment, setLoadingAppointment] = useState(false);
  const router = useRouter();
  const { appointmentId } = router.query;

  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);

  const onCancelEdit = () => {
    router.push('/home');
  }

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace('/');
    }
  }, [loading, isLoggedIn, router]);

  useEffect(() => {
    if (appointmentId) {
      // Fetch the appointment details. Here I'm just using a placeholder URL.
      // Replace this with your actual API endpoint.
      fetch(`/api/appointment/${appointmentId}`)
        .then(response => response.json())
        .then(data => setAppointment(data))
        .catch(error => console.error("Failed to fetch appointment:", error));
    }
  }, [appointmentId]);




  const updateAppointment = async (payload: any) => {
    setLoadingAppointment(true);
    try {
      const response = await fetch(`/api/appointment/${appointment?.id}/edit`, {
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

      router.push(`/appointment/${data.id}`);

    } catch (error) {
      console.error("There was an error adding the department:", error);
      toast.error('Something went wrong...')
    } finally {
      setLoadingAppointment(false)
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
                className="block w-full text-left px-4 py-2 rounded bg-teal-700 hover:bg-teal-500 text-white transition duration-300"
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
        {
          appointment && !loadingAppointment 
            ? (
              <EditAppointmentsCom 
                onUpdateAppointment={updateAppointment}
                onCancel={onCancelEdit}
                loading={loadingAppointment}
                data={appointment as any}
              />
              ) 
            : (
              <div className="flex justify-center items-center h-full">
                Loading...
              </div>
            )
        }
      </div>
      <ToastContainer position='bottom-right' autoClose={1000}/>
    </div>
  )
}
