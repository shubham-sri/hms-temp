import React, { useState, FormEvent } from 'react';

interface Props {
  onAddDepartment?: (name: string) => void;
  loading?: boolean;
}

const AddDepartmentForm: React.FC<Props> = ({ onAddDepartment, loading }) => {
  const [departmentName, setDepartmentName] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (departmentName.trim() && onAddDepartment) {
      onAddDepartment(departmentName);
      setDepartmentName(''); // Reset the input after successful submission
    }
  };

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="flex items-center border-b-2 border-blue-500 py-2">
        <input
          className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
          type="text"
          placeholder="Department Name"
          aria-label="Department Name"
          value={departmentName}
          onChange={(e) => setDepartmentName(e.target.value)}
        />
        <button 
            className="flex-shrink-0 bg-teal-700 hover:bg-teal-700 border-blue-500 hover:border-blue-700 text-sm border-4 text-white py-1 px-2 rounded" 
            type="submit"
            disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Department'}
        </button>
      </div>
    </form>
  );
};

export default AddDepartmentForm;
