import React, { useState, useEffect } from 'react';

export interface Appointment {
    id: number
    appointmentNo: number
    departmentId: number
    doctorId: number
    patientId: number
    date: string
    dateStr: string
    isPaymentNeeded: boolean
    isPaid: boolean
    lastAppointmentId: number
    lastAppointment: LastAppointment
    patient: Patient
    doctor: Doctor
    department: Department
    vital: Vital
  }
  
export interface Patient {
    id: number
    name: string
    age: number
    gender: string
    tags: string[]
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

export interface LastAppointment {
    id: number
    appointmentNo: number
    departmentId: number
    doctorId: number
    patientId: number
    date: string
    dateStr: string
    isPaymentNeeded: boolean
    isPaid: boolean
    lastAppointmentId: number
}
  

interface Props {
    appointments: Appointment[]
}

const AppointmentList: React.FC<Props> = ({appointments}) => {

  return (
        <div className="relative overflow-x-auto w-full">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 ">
                <thead className="text-xs text-gray-700 uppercase bg-white border-b-2 border-b-black">
                    <tr>
                        <th scope="col" className="px-4 py-2 w-1/12">
                            App. No.
                        </th>
                        <th scope="col" className="px-4 py-2 w-4/12">
                            Patient
                        </th>
                        <th scope="col" className="px-4 py-2 w-3/12">
                            Doctor
                        </th>
                        <th scope="col" className="px-4 py-2 w-1/12">
                            Paid
                        </th>
                        <th scope="col" className="px-4 py-2 w-2/12">
                            Last App. On
                        </th>
                        <th scope="col" className="px-4 py-2 w-1/12">
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {(appointments ?? []).map(appointment => {
                        return (<tr key={`${appointment.id}`} className="bg-white border-b text-gray-900">
                            <th scope="row" className="px-4 py-4 font-medium  whitespace-nowrap">
                                {appointment.appointmentNo}
                            </th>
                            <td className="px-4 py-4">
                                {appointment.patient.name} ({
                                    appointment.patient.mobileNumber.length > 0 
                                        ? appointment.patient.mobileNumber
                                        : '----------'
                                })
                            </td>
                            <td className="px-4 py-4">
                                {appointment.doctor.name}
                            </td>
                            <td className="px-4 py-4">
                                {appointment.isPaid ? 'Y' : 'N'}
                            </td>
                            <td className="px-4 py-4">
                                {appointment.lastAppointment?.dateStr ?? '--'}
                            </td>
                            <td>
                                <a href={`/appointment/${appointment.id}/edit`} className="text-blue-500 hover:text-blue-300 transition duration-300 mr-1">
                                    Edit
                                </a>
                                <a href={`/appointment/${appointment.id}`} className="text-green-500 hover:text-green-300 transition duration-300">
                                    Print
                                </a>
                            </td>
                        </tr>)
                    })}
                </tbody>
            </table>
        </div>

  );
};

export default AppointmentList;
