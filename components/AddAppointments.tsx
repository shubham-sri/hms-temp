import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
const customStyles = {
  content: {
    top: '30%',
    left: '40%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-30%, -30%)',
    width: '80%',
  },
};

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
  onAddAppointment?: (
    data: {
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
  loading?: boolean;
}


const AddAppointments: React.FC<Props> = ({
  onAddAppointment,
  loading = false,
}) => {
  const [id, setId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<'M'|'F'|undefined>(undefined);
  const [isDaibetic, setIsDaibetic] = useState<boolean>(false);
  const [paymentDone, setPaymentDone] = useState<boolean>(false);
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
  const [oldPatientList, setOldPatient] = useState<any[]>([]);
  const [searchMobNo, setSearchMobNo] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const [isErrorMob, setIsErrorMob] = useState(false);

  useEffect(() => {
    if(id?.length === 0) {
      return;
    }
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
        setMobNo(data.mobileNumber);
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

  useEffect(() => {
    console.log('mobNo', mobNo, searchMobNo);
    if(mobNo?.length === 0) {
      setFetchingPatient(false);
      setSearchMobNo(false);
      return;
    }
    if(mobNo.length < 10 || mobNo.length > 10) {
      setFetchingPatient(false);
      setSearchMobNo(false);
      return;
    }

    if(mobNo.length === 10 && !searchMobNo) {
      setFetchingPatient(true);

      const fetchPatientByNumber = async () => {
        try {
          const response = await fetch(`/api/patient?phoneNumber=${mobNo}`);
          const data: any = await response.json();
          console.log('data', data);
          if (response.ok) {
            if(data?.length > 0) {
              console.log('data', data);
              setOldPatient(data);
              setOpenModal(true);
            }
          }
          setFetchingPatient(false);
        } catch (err: any) {
          setFetchingPatient(false);
          console.error('Error fetching patient:', err); 
        }
      }
      fetchPatientByNumber();
      setSearchMobNo(true);
    }
  }, [id, mobNo, searchMobNo]);
  
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
        console.log('app doc', doctors);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setFetchingPatient(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle submission logic here, like making an API call to add the doctor.
    if(id.length > 0 && !fetchedPatient) {
      setId('');
      return;
    }

    if(!name || name.length === 0) {
      toast.error('Invalid Name');
      return;
    }

    try {
      if(!age || age.length === 0 || parseInt(age) < 0 || parseInt(age) > 150) {
        toast.error('Invalid Age');
        return;
      }
    } catch(error) {
      toast.error('Invalid Age');
      return;
    }

    if(!gender) {
      toast.error('Invalid Gender');
      return;
    }

    if(!address || address.length === 0) {
      toast.error('Invalid Address');
      return;
    }

    try {
      const mobNoInt = parseInt(mobNo);
      if(mobNoInt.toString().length !== 10) {
        toast.error('Invalid Mobile Number');
        return;
      }
    } catch(error) {
      toast.error('Invalid Mobile Number');
      return;
    }

    if(!department || department.length === 0) {
      toast.error('Invalid Department');
      return;
    }

    if(!doctor || doctor.length === 0) {
      toast.error('Invalid Doctor');
      return;
    }


    if (onAddAppointment) {
      // call the onAddAppointment callback
      const data = {
        patientId: id.length > 0 ? parseInt(id ?? '0') : undefined,
        patientDetails: {
          name,
          age: parseInt(age),
          gender,
          tags: tag?.length > 0 ? [tag] : [],
          address,
          mobNo,
        },
        vitals: {
          isDaibetic,
          isBP: isBloodPressure,
          isPregnant,
          isOtherDisease,
        },
        departmentId: parseInt(department || '0'),
        doctorId: parseInt(doctor || '0'),
        isPaid: paymentDone,
      };
      onAddAppointment(data);
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
            disabled={fetchingPatient || fetchedPatient}
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
            disabled={fetchingPatient || fetchedPatient}
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
                disabled={fetchingPatient || fetchedPatient}
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
                disabled={fetchingPatient || fetchedPatient}
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
            disabled={fetchingPatient || fetchedPatient}
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
            disabled={fetchingPatient || fetchedPatient}
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
            disabled={fetchingPatient || fetchedPatient}
            className={
              `mt-1 py-3 px-2 w-full border rounded-md  ${isErrorMob ? 'border-red-600' : ''}}`
            }
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
      <button 
        type="submit" 
        className="px-4 py-2 mt-3 w-full bg-teal-700 text-white rounded hover:bg-teal-600"
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Book Appointment'}
      </button>
      <Modal
        isOpen={openModal}
        onRequestClose={() => setOpenModal(false)}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="py-1 border">Select</th>
              <th className="py-1 border">P. Id.</th>
              <th className="py-1 border">Name</th>
              <th className="py-1 border">Age</th>
              <th className="py-1 border">Gender</th>
            </tr>
          </thead>
          <tbody>
            {oldPatientList.map((patient) => {
              return (
                <tr key={patient.id} className="hover:bg-gray-200">
                  <td className="py-2 border flex justify-center">
                    <input 
                      type="radio" 
                      id="old_patient" 
                      name="old_patient" 
                      value={patient.id}
                      onChange={(e:any) => {
                        const id = parseInt(e.target.value);
                        const formattedId = id.toString().padStart(7, '0');
                        setId(formattedId);
                        setOpenModal(false);
                      }}
                      className="mr-2"
                    />
                  </td>
                  <td className="py-1 border">{patient.id}</td>
                  <td className="py-1 border">{patient.name}</td>
                  <td className="py-1 border">{patient.age}</td>
                  <td className="py-1 border">{patient.gender}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <button
          className="px-4 py-2 mt-3 bg-teal-700 text-white rounded hover:bg-teal-600"
          onClick={() => setOpenModal(false)}
        >
          Close
        </button>
      </Modal>
    </form>
  );
};

export default AddAppointments;
