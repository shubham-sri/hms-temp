import React, { useState, useEffect } from 'react';

interface Department {
  id: number;
  name: string;
}

interface Props {
  onAddDoctor?: (name: string, designation: string, department: number) => void;
  loading?: boolean;
}


const AddDoctorForm: React.FC<Props> = ({
  onAddDoctor,
  loading = false,
}) => {
  const [name, setName] = useState<string>('');
  const [designation, setDesignation] = useState<string>('');
  const [department, setDepartment] = useState<string | undefined >(undefined);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Fetch departments for the dropdown
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/department');
        const data: Department[] = await response.json();
        setDepartments(data);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };

    fetchDepartments();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle submission logic here, like making an API call to add the doctor.
    console.log({ name, designation, department });
    if (onAddDoctor && department) {
      onAddDoctor(name, designation, parseInt(department));
    }
    setName('');
    setDesignation('');
    setDepartment(undefined);
  };

  return (
    <form onSubmit={handleSubmit} className='w-full bg-white p-3'>
      <div className="space-x-8 w-full flex">
        <div className='flex-1'>
          <input 
            type="text" 
            id="name" 
            placeholder="Doctor Name"
            value={name} 
            onChange={(e: any) => setName(e.target.value)} 
            className="mt-1 py-3 px-2 w-full border rounded-md"
          />
        </div>
        <div className='flex-1'>
          <input 
            type="text" 
            id="designation" 
            placeholder="Designation"
            value={designation} 
            onChange={(e:any) => setDesignation(e.target.value)} 
            className="mt-1 py-3 px-2 w-full border rounded-md"
          />
        </div>
        <div className='flex-1'>
          <select 
            id="department" 
            value={department} 
            onChange={(e: any) => setDepartment(e.target.value)} 
            className="mt-1 py-3 px-2 w-full border rounded-md"
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
      </div>
      <button 
        type="submit" 
        className="px-4 py-2 mt-3 w-full bg-teal-700 text-white rounded hover:bg-teal-600"
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Add Doctor'}
      </button>
    </form>
  );
};

export default AddDoctorForm;
