import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const TagsValues = [
  'GOV',
  'DM',
  'ADM',
  'SDM',
  'SP',
  'PR',
  'POL',
  'PLI',
  'OTH',
]

interface Department {
  id: number;
  name: string;
}

interface Props {
  onUpdateAppointment?: (
    data: {
      appointmentId?: number,
      patientId?: number,
      patientDetails: {
        name: string;
        age: number;
        gender: 'M'|'F';
        tags: string[];
        address: string;
        mobNo: string;
      },
      vitals: {
        vitalId?: number;
        isDaibetic: boolean;
        isBP: boolean;
        isPregnant: boolean;
        isOtherDisease: boolean;
      },
      departmentId: number,
      doctorId: number,
      isPaid: boolean,
    }
  ) => void;
  onCancel?: () => void;
  loading?: boolean;
  data: AppointmentDetails;
}

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
  isPaid: boolean
  date: string
  dateStr: string
  patient: Patient
  doctor: Doctor
  department: Department
  vital: Vital
}


const EditAppointments: React.FC<Props> = ({
  onUpdateAppointment,
  onCancel,
  loading = false,
  data: appointmentData,
}) => {
  const [id, setId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<'M'|'F'|undefined>(undefined);
  const [isDaibetic, setIsDaibetic] = useState<boolean>(false);
  const [paymentDone, setPaymentDone] = useState<boolean>(true);
  const [isBloodPressure, setIsBloodPressure] = useState<boolean>(false);
  const [isPregnant, setIsPregnant] = useState<boolean>(false);
  const [isOtherDisease, setIsOtherDisease] = useState<boolean>(false);
  const [tag, setTag] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [mobNo, setMobNo] = useState<string>('');
  const [department, setDepartment] = useState<string | undefined >(undefined);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctor, setDoctor] = useState<string | undefined >(undefined);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [fetchedPatient, setFetchedPatient] = useState<any | undefined>(undefined);
  const [fetchingPatient, setFetchingPatient] = useState<boolean>(false);

  useEffect(() => {
    if(id.length < 7) {
      setFetchedPatient(undefined);
      setFetchingPatient(false);
      setName('');
      setAge('');
      setGender(undefined);
      setAddress('');
      return;
    }
    const fetchPatient = async () => {
      try {
        setFetchingPatient(true);
        const response = await fetch(`/api/patient/${parseInt(id)}`);
        const data: any = await response.json();
        if (!response.ok) {
          setFetchedPatient(undefined);
          setFetchingPatient(false);
          setName('');
          setAge('');
          setGender(undefined);
          setAddress('');
          toast.error(data?.error ?? 'Something went wrong.')
          return;
        }
        setFetchedPatient(data);
        setName(data.name);
        const createdAt = new Date(data.createdAt);
        const yearBwCreatedAndNow = new Date().getFullYear() - createdAt.getFullYear();
        const newAge = yearBwCreatedAndNow + data.age;
        setAge(newAge);
        setGender(data.gender);
        setAddress(data.address);
        setTag(data.tags[0]);
        setMobNo(data.mobNo);
      } catch (err: any) {
        console.error('Error fetching patient:', err);
        setName('');
        setAge('');
        setGender(undefined);
        setAddress('');
        setFetchingPatient(false);
        toast.error(err?.data?.message ?? 'Something went wrong.')
      }
    };

    fetchPatient();
  }, [id]);
  
  // Fetch departments for the dropdown
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/department');
        if (!response.ok) {
          return;
        }
        const data: Department[] = await response.json();
        setDepartments(data);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch doctors for the dropdown
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('/api/doctor');
        if (!response.ok) {
          return;
        }
        const data: any[] = await response.json();
        setDoctors(data);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setFetchingPatient(false);
      }
    };

    fetchDoctors();
  }, []);


  useEffect(() => {
    setId(`${'0'.repeat(7-appointmentData.patientId.toString().length)}${appointmentData.patientId.toString()}`);
    setPaymentDone(appointmentData.isPaid);
    setDepartment(appointmentData.department.id.toString());
    setDoctor(appointmentData.doctor.id.toString());
    setIsDaibetic(appointmentData.vital.isDiabetic);
    setIsBloodPressure(appointmentData.vital.isBP);
    setIsPregnant(appointmentData.vital.isPregnant);
    setIsOtherDisease(appointmentData.vital.isOtherDiseases);
    setGender(appointmentData.patient.gender as 'M'|'F');
    setTag(appointmentData.patient.tags[0]);
    setAddress(appointmentData.patient.address);
    setMobNo(appointmentData.patient.mobileNumber);

  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle submission logic here, like making an API call to add the doctor.
    if(id.length > 0 && !fetchedPatient) {
      setId('');
      return;
    }
    if (onUpdateAppointment && gender) {
      // call the onAddAppointment callback
      const data = {
        patientId: id.length > 0 ? parseInt(id ?? '0') : undefined,
        appointmentId: appointmentData.id,
        patientDetails: {
          name,
          age: parseInt(age),
          gender,
          tags: tag?.length > 0 ? [tag] : [],
          address,
          mobNo,
        },
        vitals: {
          vitalId: appointmentData.vital.id,
          isDaibetic,
          isBP: isBloodPressure,
          isPregnant,
          isOtherDisease,
        },
        departmentId: parseInt(department || '0'),
        doctorId: parseInt(doctor || '0'),
        isPaid: paymentDone,
      };
      onUpdateAppointment(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='w-full space-y-3 bg-white p-3'>
      <div className="space-x-4 w-full flex">
        <div className='flex'>
          <input 
            type="text" 
            id="id" 
            placeholder="Patient Id"
            value={id} 
            disabled={true}
            onChange={(e: any) => setId(e.target.value)} 
            className="mt-1 py-3 px-2 w-full border rounded-md"
          />
        </div>
        <div className='flex-1'>
          <input 
            type="text" 
            id="name" 
            placeholder="Patient Name"
            value={name} 
            onChange={(e: any) => setName(e.target.value)} 
            className="mt-1 py-3 px-2 w-full border rounded-md"
          />
        </div>
        <div className='flex'>
          <input 
            type="text" 
            id="age" 
            placeholder="Age"
            value={age} 
            onChange={(e:any) => setAge(e.target.value)} 
            className="mt-1 py-3 px-2 w-full border rounded-md"
          />
        </div>
        <div className='flex border rounded-md px-3 text-gray-400'>
          <div className="space-x-2 flex items-center">
            <label htmlFor="female" className="text-sm">Gender</label>
            <div className="flex items-center">
              <input 
                type="radio" 
                id="male" 
                name="gender" 
                value="M" 
                checked={gender === 'M'} 
                onChange={(e:any) => setGender(e.target.value)}
                className="mr-2"
              />
              <label htmlFor="male" className="text-sm">Male</label>
            </div>
            <div className="flex items-center">
              <input 
                type="radio" 
                id="female" 
                name="gender" 
                value="F" 
                checked={gender === 'F'}
                onChange={(e:any) => setGender(e.target.value)}
                className="mr-2"
              />
              <label htmlFor="female" className="text-sm">Female</label>
            </div>
          </div>
        </div>
      </div>
      <div className="space-x-4 w-full flex">
        <div className='flex'>
          <input 
            type="text" 
            id="address" 
            placeholder="Address"
            value={address} 
            onChange={(e: any) => setAddress(e.target.value)} 
            className="mt-1 py-3 px-2 w-full border rounded-md"
          />
        </div>
        <div className='flex border rounded-md px-2 text-gray-400'>
          <div className="space-x-8 px-3 flex items-center">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="diabetic" 
                name="diabetic"
                checked={isDaibetic}
                onChange={
                  (e:any) => setIsDaibetic(e.target.checked)
                }
                className="mr-2"
              />
              <label htmlFor="diabetic" className="text-sm">Diabetic</label>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="bp" 
                name="bp"
                checked={isBloodPressure}
                onChange={
                  (e:any) => setIsBloodPressure(e.target.checked)
                }
                className="mr-2"
              />
              <label htmlFor="male" className="text-sm">BP</label>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="pergnent" 
                name="pergnent"
                checked={isPregnant}
                onChange={
                  (e:any) => setIsPregnant(e.target.checked)
                }
                className="mr-2"
              />
              <label htmlFor="male" className="text-sm">Pregnancy</label>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="other_desease" 
                name="other_desease"
                checked={isOtherDisease}
                onChange={
                  (e:any) => setIsOtherDisease(e.target.checked)
                }
                className="mr-2"
              />
              <label htmlFor="male" className="text-sm">Other Desease</label>
            </div>
          </div>
        </div>
        <div className='flex-1'>
          <select 
            id="tag" 
            value={tag} 
            onChange={(e: any) => setTag(e.target.value)} 
            className="mt-1 py-3 px-2 w-full border rounded-md"
          >
            <option value="">Select Tag</option>
            {TagsValues.map(tagV => (
              <option key={tagV} value={tagV}>{tagV}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-x-4 w-full flex">
        <div className='flex'>
          <input 
            type="text" 
            id="mobNo" 
            placeholder="Mobile Number"
            value={mobNo} 
            onChange={(e:any) => setMobNo(e.target.value)} 
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
        <div className='flex-1'>
          <select 
            id="doctor" 
            value={doctor} 
            onChange={(e: any) => setDoctor(e.target.value)}
            className="mt-1 py-3 px-2 w-full border rounded-md"
          >
            <option value="">Select Doctor</option>
            {doctors
            .filter(doc => !department || department?.length === 0 || department == doc.departmentId)
            .map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
        <div className='flex border rounded-md px-2 text-gray-400'>
          <div className="space-x-8 px-3 flex items-center">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="payment" 
                name="payment"  
                checked={paymentDone}
                onChange={
                  (e:any) => setPaymentDone(e.target.checked)
                }
                className="mr-2"
              />
              <label htmlFor="payment" className="text-sm">Paid</label>
            </div>
          </div>
        </div>
      </div>
      <div className='w-full space-x-4 flex'>
        <button 
          type="submit" 
          className="px-4 py-2 mt-3 flex-1 bg-teal-700 text-white rounded hover:bg-teal-600"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Update Appointment'}
        </button>
        <button 
          type="reset" 
          className="px-4 py-2 mt-3 flex-1 bg-red-500 text-white rounded hover:bg-red-600"
          disabled={loading}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditAppointments;
