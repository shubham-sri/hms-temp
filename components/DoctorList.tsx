import React, { useState, useEffect } from 'react';

interface Doctor {
  id: number;
  name: string;
  designation: string;
  department: {
    id: number;
    name: string;
  }
}

interface Props {
    doctors: Doctor[]
}

const DepartmentList: React.FC<Props> = ({doctors}) => {

  return (
    
<div className="relative overflow-x-auto w-full">
    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 ">
        <thead className="text-xs text-gray-700 uppercase bg-white border-b-2 border-b-black">
            <tr>
                <th scope="col" className="px-6 py-3">
                    ID
                </th>
                <th scope="col" className="px-6 py-3">
                    Product name
                </th>
                <th scope="col" className="px-6 py-3">
                    Designation
                </th>
                <th scope="col" className="px-6 py-3">
                    Department
                </th>
            </tr>
        </thead>
        <tbody>
            {doctors.map(doctor => {
                return (<tr key={`${doctor.id}`} className="bg-white border-b text-gray-900">
                    <td className="px-6 py-4">
                        {doctor.id}
                    </td>
                    <th scope="row" className="px-6 py-4 font-medium  whitespace-nowrap">
                        {doctor.name}
                    </th>
                    <th scope="row" className="px-6 py-4 font-medium  whitespace-nowrap">
                        {doctor.designation}
                    </th>
                    <th scope="row" className="px-6 py-4 font-medium  whitespace-nowrap">
                        {doctor.department.name}
                    </th>
                </tr>)
            })}
        </tbody>
    </table>
</div>

  );
};

export default DepartmentList;
