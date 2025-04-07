import { useState,useEffect } from 'react';
import { FiUser, FiHome, FiUpload, FiCalendar } from 'react-icons/fi';
import { useEthereum } from '@/contexts/EthereumContext';
import { ethers } from 'ethers';
import { uploadFileToIPFS, uploadJSONToIPFS } from '../../../utils/ipfs';
import UserRegistryABI from '../../../artifacts/contracts/UserRegistry.sol/UserRegistry.json';
import dotenv from 'dotenv';
dotenv.config();

interface FormState {
  name: string;
  email: string;
  studentId: string;
  dateOfBirth: string;
  institutionName: string;
  accreditationNumber: string;
  document: File | null;
}

const initialFormState: FormState = {
  name: '',
  email: '',
  studentId: '',
  dateOfBirth: '',
  institutionName: '',
  accreditationNumber: '',
  document: null,
};

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

interface SplitRegistrationFormProps {
  onRegistrationSuccess: () => void;
}

export default function SplitRegistrationForm(){
  const { account, provider } = useEthereum();
  const [role, setRole] = useState<'student' | 'provider'>('student');
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when role changes
  useEffect(() => {
    setFormData(initialFormState);
  }, [role]);

  const validateForm = () => {
    if (role === 'student') {
      if (!formData.name.trim()) throw new Error('Name is required');
      if (!formData.email.trim()) throw new Error('Email is required');
      if (!formData.studentId.trim()) throw new Error('Student ID is required');
      if (!formData.dateOfBirth) throw new Error('Date of birth is required');
      return;
    }
    
    if (!formData.institutionName.trim()) throw new Error('Institution name is required');
    if (!formData.accreditationNumber.trim()) throw new Error('Accreditation number is required');
    if (!formData.email.trim()) throw new Error('Email is required');
    if (!formData.document) throw new Error('Document upload is required');
  };

  const handleRegister = async () => {
    try {
      setError(null);
      setIsSubmitting(true);

      if (!account || !provider) {
        throw new Error('Please connect your wallet first');
      }

      validateForm();

      const signer = await provider.getSigner();
      
      // Handle document upload
      let documentCid = '';
      if (role === 'provider' && formData.document) {
        const docResponse = await uploadFileToIPFS(formData.document);
        documentCid = docResponse.cid;
      }

      // Prepare metadata
      const metadata = role === 'student' ? {
        role,
        name: formData.name,
        email: formData.email,
        studentId: formData.studentId,
        dateOfBirth: formData.dateOfBirth
      } : {
        role,
        institutionName: formData.institutionName,
        accreditationNumber: formData.accreditationNumber,
        email: formData.email,
        documentCid
      };

      // Upload metadata
      const { cid } = await uploadJSONToIPFS(metadata);

      // Contract interaction
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error('Contract address not configured');
      }

      const contract = new ethers.Contract(
        contractAddress,
        UserRegistryABI.abi,
        signer
      );

      const tx = await contract.registerUser(role, cid);
      await tx.wait();
      // onRegistrationSuccess();
      alert('Registration successful!');
      setFormData(initialFormState); // Reset form after success

    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormData(prev => ({ ...prev, document: file || null }));
  };

  // Updated UI with form tag and accessibility improvements
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Role Selection */}
      <div className="w-full md:w-1/3 bg-gradient-to-b from-blue-600 to-blue-700 text-white p-8">
        <h1 className="text-2xl font-bold mb-8">Join as...</h1>
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`w-full p-4 rounded-lg flex items-center transition-all ${
              role === 'student' 
                ? 'bg-white text-blue-600 shadow-lg'
                : 'bg-blue-500 hover:bg-blue-400'
            }`}
          >
            <FiUser className="text-xl mr-3" />
            <span className="text-lg font-semibold">Student</span>
          </button>
          
          <button
            type="button"
            onClick={() => setRole('provider')}
            className={`w-full p-4 rounded-lg flex items-center transition-all ${
              role === 'provider' 
                ? 'bg-white text-blue-600 shadow-lg'
                : 'bg-blue-500 hover:bg-blue-400'
            }`}
          >
            <FiHome className="text-xl mr-3" />
            <span className="text-lg font-semibold">Provider</span>
          </button>
        </div>
      </div>

      {/* Registration Form */}
      <div className="w-full md:w-2/3 p-8 bg-white">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {role === 'student' ? 'Student Registration' : 'Provider Registration'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
            <div className="space-y-4">
              {role === 'student' ? (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Student ID</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.studentId}
                      onChange={e => setFormData({...formData, studentId: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <div className="relative">
                      <input
                        type="date"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        value={formData.dateOfBirth}
                        onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                        max={new Date().toISOString().split('T')[0]} // Prevent future dates
                      />
                      <FiCalendar className="absolute right-3 top-3 text-gray-400" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Institution Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.institutionName}
                      onChange={e => setFormData({...formData, institutionName: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Accreditation Number</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.accreditationNumber}
                      onChange={e => setFormData({...formData, accreditationNumber: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Accreditation Document
                    </label>
                    <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.png"
                      />
                      <FiUpload className="mr-2 text-gray-500" />
                      <span className="text-gray-600">
                        {formData.document?.name || 'Click to upload document'}
                      </span>
                    </label>
                  </div>
                </>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Spinner />
                    Processing...
                  </div>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}