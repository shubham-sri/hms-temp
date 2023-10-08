import Image from 'next/image'
import { Inter } from 'next/font/google'
import React, { useEffect, useState } from 'react'
import AddAppointments from '@/components/AddAppointments'
import AppointmetsList from '@/components/AppointmetsList'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/router';
import moment from 'moment-timezone';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {useValidateLogin} from '@/hooks'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const { isLoggedIn, loading } = useValidateLogin();
  const [loadingAppointment, setLoadingAppointment] = useState(false);
  const [date, setDate] = useState(new Date());
  const [isLoadingApp, setIsLoadingApp] = useState(false);
  const [appointments, setAppointments] = useState<any>([])
  const router = useRouter();



  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace('/');
    }
  }, [loading, isLoggedIn, router]);

  useEffect(()=>{
    const fetchData = async () => {
      try {
        setIsLoadingApp(true);
        const dateStr = moment(date)
          .tz('Asia/Kolkata')
          .format('DD/MM/YYYY')
        const response = await fetch(`/api/appointment?date=${dateStr}`);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data: any = await response.json();
        setAppointments(data);
      } catch (err) {
        console.log(err);
        setAppointments([]);
      } finally{

        setIsLoadingApp(false);
      }
    };

    fetchData();
  },[date])


  const addAppointment = async (payload: any) => {
    setLoadingAppointment(true);

    try {
      const response = await fetch('/api/appointment', {
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


  const [isOnline, setIsOnline] = useState(false);
  		
  useEffect(() => {
    async function onlineHandler() {
      setIsOnline(true);
      await fetch('/api/internet?online=true', {method: 'GET'});
    }

    async function offlineHandler() {
      setIsOnline(false);
    }

    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);

    if(navigator.onLine){
      onlineHandler();
    }


    return () => {
        window.removeEventListener("online", onlineHandler);
        window.removeEventListener("offline", offlineHandler);
    };
  }, []);

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
            <li className="mb-2">
              <button 
                className="block w-full text-left px-4 py-2 rounded bg-gray-200 hover:bg-teal-500 transition duration-300"
                onClick={() => router.push('/dashboard')}
              >
                Dashboard
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

            <li className=" mt-20">
              <div 
                className={
                  `block w-full text-left px-4 py-2 
                  rounded text-white 
                  transition duration-300
                  ${isOnline ? 'bg-green-500' : 'bg-red-500'}`
                }>
                {isOnline ? 'Online' : 'Offline'}
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex-1 px-4 pt-8 w-full">
        <AddAppointments 
          onAddAppointment={addAppointment}
          loading={loadingAppointment}
        />
        <div className='w-full flex justify-end pt-6'>
          <DatePicker
            selected={date} 
            onChange={(date) => setDate(date ?? new Date())} 
            className='border border-gray-300 p-2 rounded-md'
          />
        </div>
        <div className='mt-2 h-72 overflow-scroll'>
          {isLoadingApp ? <p>Getting...</p>  : <AppointmetsList appointments={appointments}/>}
        </div>
      </div>
      <ToastContainer position='bottom-right' autoClose={2000} limit={3}/>
    </div>
  )
}
