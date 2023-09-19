// pages/appointment/[appointmentId].tsx

import A4Component from '@/components/A4Component';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';


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

function insertSpaces(name: any, maxLength: number) {
  if (name.length <= maxLength) return name;

  let result = '';
  let chunk = '';

  for (let i = 0; i < name.length; i++) {
    chunk += name[i];
    if (chunk.length === maxLength) {
      result += chunk + ' ';
      chunk = '';
    }
  }

  return result + chunk; // Return the concatenated result
}

const AppointmentDetailsPage: React.FC = () => {
  const router = useRouter();
  const [age, setAge] = useState(0);
  const { appointmentId } = router.query;

  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);

  const componentRef = useRef<any>();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => router.replace('/home')
  });

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

  const scale = 1

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
          </ul>
        </div>
      </div>

      <A4Component scale={scale}>
        <div
          style={{
              width: '100%',
              height: '100%',
              // background: 'url("/ab_bg_2.png")',
              // backgroundSize: 'cover',
              fontWeight: 'bold',
            }}
        >
          <div  
            ref={componentRef}
            style={{
              width: '100%',
              height: '100%',
              // background: 'url("/ab_bg_2.png")',
              // backgroundSize: 'cover',
              // color: 'red',
              fontWeight: 'bold',
            }}
          >
            <div className='flex' style={{paddingTop: '1.7in'}}>
              <div style={{paddingLeft: '2.2in'}}>
                <p style={{fontWeight: 300}}>Patient Id - <span style={{fontWeight: 700}}>{
                '0'.repeat(7-appointment.patient.id.toString().length)
                }{appointment.patient.id}</span></p>
              </div>
              <div style={{paddingLeft: '0.4in'}}>
                <p style={{fontWeight: 300}}>App. No. <span style={{fontWeight: 700}}>{
                '0'.repeat(3-appointment.appointmentNo.toString().length)
                }{appointment.appointmentNo}</span></p>
              </div>
              <div style={{paddingLeft: '1.7in'}}>
                <p>{appointment.dateStr}</p>
              </div>
            </div>
            <div className='flex' style={{paddingTop: '0.1in'}}>
              <div style={{
                paddingLeft: '2.6in',
              }}>
                <p>
                  {appointment.patient.name}
                  <span style={{visibility: 'hidden'}}>{'A'.repeat(28 - appointment.patient.name.length)}</span>
                </p>
              </div>
              <div style={{
                paddingLeft: '0.6in',
              }}>
                <p>
                  {age}
                  <span style={{visibility: 'hidden'}}>{'3'.repeat(5 - age.toString().length)}</span>
                </p>
              </div>
              <div style={{
                paddingLeft: `0.6in`,
              }}>
                <p>{appointment.patient.gender}</p>
              </div>
            </div>
            <div className='flex' style={{marginTop: '-0.1in'}}>
              <div style={{
                paddingLeft: '2.7in',
                color: appointment.vital.isDiabetic ? 'red' : 'black'
              }}>
                <p
                  style={{
                    fontSize: '40px',
                  }}
                >{
                  appointment.vital.isDiabetic 
                  ? <span>&#10003;</span>
                  : <span>&#10539;</span>
                }</p>
              </div>
              <div style={{
                paddingLeft: '0.6in',
                color: appointment.vital.isBP ? 'red' : 'black'
              }}>
                <p
                  style={{
                    fontSize: '40px',
                  }}
                >{
                  appointment.vital.isBP 
                  ? <span>&#10003;</span>
                  : <span>&#10539;</span>
                }</p>
              </div>
              <div style={{
                paddingLeft: '1.2in',
                color: appointment.vital.isPregnant ? 'red' : 'black'
              }}>
                <p
                  style={{
                    fontSize: '40px',
                  }}
                >{
                  appointment.vital.isPregnant 
                  ? <span>&#10003;</span>
                  : <span>&#10539;</span>
                }</p>
              </div>
              <div style={{
                paddingLeft: '1.3in',
                color: appointment.vital.isOtherDiseases ? 'red' : 'black'
              }}>
                <p
                  style={{
                    fontSize: '40px',
                  }}
                >{
                  appointment.vital.isOtherDiseases 
                  ? <span>&#10003;</span>
                  : <span>&#10539;</span>
                }</p>
              </div>
            </div>
            <div className='flex'>
              <div style={{
                paddingTop: '0in',
                paddingLeft: '4.8in',
              }}>
                <p className='text-md'>Doctor - {appointment.doctor.name?.slice(0, 25)} {appointment.doctor.name.length > 25 ? '...' :''}</p>
              </div>
            </div>
          </div>
        </div> 
      </A4Component>

      <div className='m-8 flex flex-col'>
        <button onClick={handlePrint} className='px-4 py-2 rounded bg-teal-700 hover:bg-teal-500 text-white'>Print</button>
        <button 
        onClick={() => router.replace('/home')}
        className='mt-4 px-4 py-2 rounded bg-teal-700 hover:bg-teal-500 text-white'>Back</button>
      </div>
    </div>
  );
};

export default AppointmentDetailsPage;
