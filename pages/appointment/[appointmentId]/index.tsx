// pages/appointment/[appointmentId].tsx

import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import moment from 'moment-timezone';
import {useValidateLogin} from '@/hooks';


export interface Patient {
  id: number
  name: string
  age: number
  gender: string
  tags: any[]
  address: string
  createdAt: string
  mobileNumber: string
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

function calculateYearDifference(startDateStr: string, endDateStr: string) {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  let yearDifference = endDate.getFullYear() - startDate.getFullYear();

  // Adjust year difference if the end date hasn't yet reached the month/day of the start date in its year
  if (endDate.getMonth() < startDate.getMonth() ||
      (endDate.getMonth() === startDate.getMonth() && endDate.getDate() < startDate.getDate())) {
    yearDifference--;
  }

  return yearDifference;
}

const AppointmentDetailsPage: React.FC = () => {
  const router = useRouter();
  const [age, setAge] = useState(0);
  const { isLoggedIn, loading } = useValidateLogin();
  const { appointmentId } = router.query;

  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);

  const componentRef = useRef<any>();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => router.replace('/home')
  });

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

  const scale = 0.63

  useEffect(() => {
    const newAge = appointment?.patient.age ?? 0
    const startDate = appointment?.patient.createdAt ?? '';
    const endDate = (new Date()).toString();
    const yearsBwCreateAndNow = calculateYearDifference(startDate, endDate);

    setAge(newAge + yearsBwCreateAndNow)
  }, [appointment])

  if (!appointment) return <div>Loading...</div>;

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
                className="block w-full text-left px-4 py-2 rounded bg-gray-200 hover:bg-teal-500 transition duration-300"
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

      <div>
        <div
          className='flex p-2'
          style={{ width: '100%', height: '100vh' }}
          ref={componentRef}
        >
          <div className='flex flex-col w-full h-full'>
            {/* top bar details */}
            <div className='w-full border-b-2 border-black px-2 py-4 flex content-center justify-center'>
              <div 
                className='rounded-full flex flex-col justify-center items-center relative border-4 border-red-700'
                style={{}}
              >
                <img src='/logo.png' alt='logo' className='w-24 h-24' />
                <p className='absolute mt-24' style={{fontSize: '7px'}}>Registered</p>
              </div>
              <div className='px-4'>
                <p className='text-8xl font-extrabold'>शान्ती मेमोरियल हॉस्पिटल</p>
                <p className='w-full text-right text-2xl font-semibold'>7398240831, 9838480432</p>
              </div>
            </div>
            {/* patient and appointment details */}
            <div className='px-4 w-full flex text-2xl pl-6 py-4 border-b-2 border-black'>
              <div className='flex-1 flex'>
                <div className='space-y-2 w-1/4 pr-2 border-r-2 border-black'>
                  <div className='w-full flex'><div className='w-32'>Date -</div><span className='font-semibold'>{appointment.dateStr}</span></div>
                  <div className='w-full flex'><div className='w-32'>Time -</div><span className='font-semibold'>{
                      moment(appointment.date).tz('Asia/Kolkata').format('hh:mm A')
                    }</span></div>
                  <div className='w-full flex'><div className='w-32'>App. No. -</div><span className='font-semibold'>{
                    '0'.repeat(3 - appointment.appointmentNo.toString().length)+appointment.appointmentNo
                  }</span></div>
                  <div className='w-full flex'><div className='w-32'>Patient Id -</div><span className='font-semibold'>{
                    '0'.repeat(7 - appointment.patient.id.toString().length)+appointment.patient.id
                  }</span></div>
                </div>
                <div className='space-y-2  w-3/4 pl-3 border-r-2 border-black'>
                  <div className='flex'>
                    <div>Name -&nbsp;&nbsp;&nbsp;&nbsp;</div>
                    <div className='font-semibold'>{appointment.patient.name}</div>
                  </div>
                  <div className='flex flex-1'>
                    <div className='flex flex-1'>
                      <div>Age -&nbsp;&nbsp;&nbsp;&nbsp;</div>
                      <div className='font-semibold'>{age}</div>
                      <div className='flex flex-1 justify-center'>/</div>
                    </div>
                    <div className='flex flex-1'>
                      <div>Gender -&nbsp;&nbsp;&nbsp;&nbsp;</div>
                      <div className='font-semibold'>{appointment.patient.gender}</div>
                    </div>
                  </div>
                  <div className='flex flex-1'>
                    <div className='flex'>
                      <div>Mob No -&nbsp;&nbsp;&nbsp;&nbsp;</div>
                      <div className='font-semibold'>{
                        appointment.patient.mobileNumber?.length !== 10 
                          ? '**********' 
                          : appointment.patient.mobileNumber
                      }</div>
                      <div>&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;</div>
                    </div>
                    <div className='flex flex-1'>
                      <div>Address -&nbsp;&nbsp;&nbsp;&nbsp;</div>
                      <div className='font-semibold'>
                        {appointment.patient.address}
                      </div>
                    </div>
                  </div>
                  <div className='flex'>
                    <div>Doctor -&nbsp;&nbsp;&nbsp;&nbsp;</div>
                    <div className='font-semibold'>{appointment.doctor.name} ({appointment.doctor.designation})</div>
                  </div>
                </div>
              </div>
              <div className='flex flex-col py-2 w-52 space-y-1 pl-2'>
                <div className='flex'><span className='flex-1 w-56'>Daibetic -</span>
                  {
                    appointment.vital.isDiabetic
                    ? <span className='w-8 flex justify-center font-bold text-2xl border rounded-full border-black'>&#10003;</span>
                    : <span className='w-8 flex justify-center font-bold text-2xl border rounded-full border-black'>&#10540;</span>
                  }
                </div>
                <div className='flex'><span className='flex-1'>B.P. -</span>
                  {
                    appointment.vital.isBP
                    ? <span className='w-8 flex justify-center font-bold text-2xl border rounded-full border-black'>&#10003;</span>
                    : <span className='w-8 flex justify-center font-bold text-2xl border rounded-full border-black'>&#10540;</span>
                  }
                </div>
                <div className='flex'><span className='flex-1'>Pregnancy -</span>
                  {
                    appointment.vital.isPregnant
                    ? <span className='w-8 flex justify-center font-bold text-2xl border rounded-full border-black'>&#10003;</span>
                    : <span className='w-8 flex justify-center font-bold text-2xl border rounded-full border-black'>&#10540;</span>
                  }
                </div>
                <div className='flex'><span className='flex-1'>Other Disease -</span>
                  {
                    appointment.vital.isOtherDiseases
                    ? <span className='w-8 flex justify-center font-bold text-2xl border rounded-full border-black'>&#10003;</span>
                    : <span className='w-8 flex justify-center font-bold text-2xl border rounded-full border-black'>&#10540;</span>
                  }
                </div>
              </div>
            </div>
            {/* center area for prescription */}
            <div className='flex h-full w-full'>
            {
                appointment.department.name === 'Dental' 
                ? (
                  <>
                    <div className='border-r-2 border-black px-2' style={{width:'30%'}}>
                      <div
                        className='w-full py-6 pl-4'
                      >
                        <p className='text-xl pb-4 font-bold'>I.O.P.A - X-Ray</p>
                        <div className='h-56 flex flex-wrap' style={{width: '95%'}}>
                          <div className='w-1/2 flex items-end border-r-2 border-b-2 border-black relative'>
                            <span className='absolute text-2xl' style={{top: 0}}>R</span>
                            8<span>&nbsp;&nbsp;</span>
                            7<span>&nbsp;&nbsp;</span>
                            6<span>&nbsp;&nbsp;</span>
                            5<span>&nbsp;&nbsp;</span>
                            4<span>&nbsp;&nbsp;</span>
                            3<span>&nbsp;&nbsp;</span>
                            2<span>&nbsp;&nbsp;</span>
                            1
                          </div>
                          <div className='w-1/2 flex items-end pl-2 border-b-2 border-black relative'>
                            <span className='absolute text-2xl' style={{top:0, right: -1}}>L</span>
                            1<span>&nbsp;&nbsp;</span>
                            2<span>&nbsp;&nbsp;</span>
                            3<span>&nbsp;&nbsp;</span>
                            4<span>&nbsp;&nbsp;</span>
                            5<span>&nbsp;&nbsp;</span>
                            6<span>&nbsp;&nbsp;</span>
                            7<span>&nbsp;&nbsp;</span>
                            8
                          </div>
                          <div className='w-1/2 flex border-r-2 border-black'>
                            8<span>&nbsp;&nbsp;</span>
                            7<span>&nbsp;&nbsp;</span>
                            6<span>&nbsp;&nbsp;</span>
                            5<span>&nbsp;&nbsp;</span>
                            4<span>&nbsp;&nbsp;</span>
                            3<span>&nbsp;&nbsp;</span>
                            2<span>&nbsp;&nbsp;</span>
                            1
                          </div>
                          <div className='w-1/2 flex pl-2 border-black'>
                            1<span>&nbsp;&nbsp;</span>
                            2<span>&nbsp;&nbsp;</span>
                            3<span>&nbsp;&nbsp;</span>
                            4<span>&nbsp;&nbsp;</span>
                            5<span>&nbsp;&nbsp;</span>
                            6<span>&nbsp;&nbsp;</span>
                            7<span>&nbsp;&nbsp;</span>
                            8
                          </div>
                        </div>
                      </div>
                      <div
                        className='w-full py-4 pl-4'
                      >
                        <p className='text-xl pb-4 font-bold'>Blood Test - </p>
                        <div className='text-xl w-11/12 h-56 flex-col text-md'>
                          <p>1. CBC</p>
                          <p>2. BT, CT</p>
                          <p>3. Hb</p>
                          <p>4. Fasting Blood Sugar</p>
                          <p>5. PP Blood Sugar</p>
                          <p>6. Random Blood Sugar</p>
                          <p>7. LFT</p>
                          <p>8. KFT</p>
                          <p>9. Dental OT</p>
                        </div>
                      </div>
                    </div>
                  </>
                )
                : <></>
              }
              <div className={
                `${appointment.department.name === 'Dental' ? 'w-3/4' : 'w-full'} p-6`
              }>
                <div className='text-5xl p-2'>℞</div>
              </div>
            </div>
            {/* bottom area for details */}
            <div className='flex border-t-2 py-4 border-black justify-between px-6 font-semibold'>
              <div>
                <div className='text-2xl'>पर्चा केवल 7 दिन के लिए मान्य</div>
                <div className='text-2xl'>शनिवार बन्दी (दंत विभाग)</div>
              </div>
              <div>
                <div  className='text-2xl'>निकट - नगर बाजार, स्टेट बैंक के सामने, बरदहिया (मछली मण्डी), जिला - बस्ती</div>
                <div className='text-2xl'>Not valid for Medical Legal Purpose</div>
              </div>
            </div>
          </div>
        </div> 
      </div>

      <div className='m-8 flex flex-col'>
        <button onClick={handlePrint} className='px-4 py-2 rounded bg-teal-700 hover:bg-teal-500 text-white'>Print</button>
        <button 
          onClick={() => router.replace('/home')}
          className='mt-4 px-4 py-2 rounded bg-red-700 hover:bg-red-300 text-white'>Back</button>
      </div>
    </div>
  );
};

export default AppointmentDetailsPage;
