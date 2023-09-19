import React, { useState, useEffect } from 'react';

interface Department {
  id: number;
  name: string;
}

interface Props {
    departments: Department[]
}

const DepartmentList: React.FC<Props> = ({departments}) => {

  return ( 
    <div className="relative overflow-x-auto w-full">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 ">
            <thead className="text-xs text-gray-700 uppercase bg-white border-b-2 border-b-black">
                <tr>
                    <th scope="col" className="px-6 py-3">
                        Product name
                    </th>
                    <th scope="col" className="px-6 py-3">
                        ID
                    </th>
                    
                </tr>
            </thead>
            <tbody>
                {departments.map(department => {
                    return (<tr key={`${department.id}`} className="bg-white border-b text-gray-900">
                        <th scope="row" className="px-6 py-4 font-medium  whitespace-nowrap">
                            {department.name}
                        </th>
                        <td className="px-6 py-4">
                            {department.id}
                        </td>
                    </tr>)
                })}
            </tbody>
        </table>
    </div>
  );
};

export default DepartmentList;
