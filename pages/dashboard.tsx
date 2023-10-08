import { Inter } from 'next/font/google'
import React, { useEffect, useState } from 'react'
import {useValidateLogin} from '@/hooks'
import { useRouter } from 'next/router';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

import moment from 'moment-timezone';

// 2. Register them
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const optionBar = {
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Total paid vs unpaid patient by date',
    },
  },
  elements: {
    line: {
      tension: 0,
      borderWidth: 2,
      borderColor: "rgba(47,97,68, 1)",
      fill: "start",
      backgroundColor: "rgba(47,97,68, 0.3)"
    },
    point: {
      radius: 0,
      hitRadius: 0,
    },
  },
  scales: {
    xAxis: {
      display: false,
    },
    yAxis: {
      display: false
    }
  }
};


const inter = Inter({ subsets: ['latin'] })

export interface Analytic {
  doctorWisePayments: DoctorWisePayment[]
  departmentTrafficWithDetails: DepartmentTrafficWithDetail[]
}

export interface DoctorWisePayment {
  _count: number
  doctorId: number
  isPaid: boolean
  doctor: Doctor
}

export interface Doctor {
  id: number
  name: string
  designation: string
  departmentId: number
}

export interface DepartmentTrafficWithDetail {
  date: string
  department: Department
  count: number
}

export interface Department {
  id: number
  name: string
}

export interface Dataset {
  label: string
  borderRadius: number
  data: any[]
  backgroundcolor?: string
  barThickness: number
  backgroundColor?: string
}

export default function Doctor() {

  const { isLoggedIn, loading } = useValidateLogin();
  const [loadingData, setLoadingData] = useState(false);
  const [data, setData] = useState<Analytic | undefined>(undefined)
  const router = useRouter();

  const [date, setDate] = useState(new Date())

  const [barChartData, setBarChartData] = useState<any>(undefined)

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace('/');
    }
  }, [loading, isLoggedIn, router]);

  useEffect(() => {
    if(loadingData){
      return;
    }
    const fetchData = async () => {
      try {
        setLoadingData(true)
        const formattedDate = moment(date).tz('Asia/Kolkata').format('DD/MM/YYYY');
        const response = await fetch(`/api/appointment/analytics?date=${formattedDate}`);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data: any = await response.json();
        setData(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingData(false)
      }
    };

    fetchData();
  }, [date]);

  useEffect(() => {
    if(!data) {
      // setBarChartData(undefined);
      return;
    }
    const lables: string[] = [];
    const docIds: any[] = []
    const dataset: Dataset[] = [
      {
        label: "Paid",
        borderRadius: 30,
        data: [],
        backgroundColor: "rgb(15 118 110)",
        barThickness: 10,
      },
      {
        label: "Unpaid",
        borderRadius: 20,
        data: [],
        backgroundColor: "rgb(185 28 28)",
        barThickness: 10
      }
    ]
    for (let d of data?.doctorWisePayments ?? []) {
      if(!lables.includes(d.doctor.name)){
        lables.push(d.doctor.name);
        docIds.push(d.doctor.id);
      }
    }

    for (let id of docIds) {
      const countPaid = (data?.doctorWisePayments ?? []).find((ana) => {
        const sameId = id === ana.doctor.id;
        const isPaid = ana.isPaid;
        return sameId && isPaid
      })?._count ?? 0;

      const countNotPaid = (data?.doctorWisePayments ?? []).find((ana) => {
        const sameId = id === ana.doctor.id;
        const isPaid = ana.isPaid;
        return sameId && !isPaid
      })?._count ?? 0;

      dataset[0].data.push(countPaid)
      dataset[1].data.push(countNotPaid)
    }

    setBarChartData({
      labels: lables,
      datasets: dataset,
    })
    

  }, [data])

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
                className="block w-full text-left px-4 py-2 rounded bg-gray-200 hover:bg-teal-500 hover:text-white transition duration-300"
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
                className="block w-full text-left px-4 py-2 rounded bg-teal-700 text-white hover:bg-teal-500 transition duration-300"
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

      <div className="flex-1 flex-col px-4 pt-8 w-full">
        <div className='flex flex-col w-full'>
          <div className='w-full flex justify-end pt-6'>
            <DatePicker
              selected={date} 
              onChange={(date) => setDate(date ?? new Date())} 
              className='border border-gray-300 p-2 rounded-md'
            />
          </div>
          <div>
            <p>Total Patient - {data?.doctorWisePayments.reduce((acc, d) => acc+(d?._count ?? 0), 0)}</p>
          </div>
          {!loadingData && barChartData ? <Bar datasetIdKey='jsamhkjdash' data={barChartData} height={75} options={optionBar} /> : <></>}
        </div>
      </div>
    </div>
  )
}
