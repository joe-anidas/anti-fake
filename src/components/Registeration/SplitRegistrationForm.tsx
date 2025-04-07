import { useState } from 'react';
import { FiUser, FiHome, FiUpload, FiFileText, FiShield } from 'react-icons/fi';
import { useEthereum } from '@/contexts/EthereumContext';
import { ethers } from 'ethers';
import { uploadFileToIPFS, uploadJSONToIPFS } from '../../../utils/ipfs';
import UserRegistryABI from '../../../artifacts/contracts/UserRegistry.sol/UserRegistry.json';
import StudentDashboard from '../StudentDashboard/StudentDashboard';
import ProviderDashboard from '../ProviderDashboard/ProviderDashboard';

// Types
interface StudentFormData {
  name: string;
  email: string;
  studentId: string;
}

interface ProviderFormData {
  institutionName: string;
  accreditationNumber: string;
  document: File | null;
}

interface FormState extends StudentFormData, ProviderFormData {
  role: 'student' | 'provider';
}

const initialFormState: FormState = {
  role: 'student',
  name: '',
  email: '',
  studentId: '',
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

export default function SplitRegistrationForm() {
  const { account, provider } = useEthereum();
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'provider' | null>(null);

  const validateForm = () => {
    if (formData.role === 'student') {
      if (!formData.name.trim()) throw new Error('Name is required');
      if (!formData.email.trim()) throw new Error('Email is required');
      if (!formData.studentId.trim()) throw new Error('Student ID is required');
    } else {
      if (!formData.institutionName.trim()) throw new Error('Institution name is required');
      if (!formData.accreditationNumber.trim()) throw new Error('Accreditation number is required');
      if (!formData.document) throw new Error('Document upload is required');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setIsSubmitting(true);

      if (!account || !provider) {
        throw new Error('Please connect your wallet first');
      }

      validateForm();

      // Prepare metadata without role (role is stored separately in contract)
      let metadata: any;
      let documentCid = '';

      if (formData.role === 'student') {
        metadata = {
          name: formData.name,
          email: formData.email,
          studentId: formData.studentId
        };
      } else {
        // Upload provider document first
        if (!formData.document) throw new Error('Document is required');
        const docResponse = await uploadFileToIPFS(formData.document);
        documentCid = docResponse.cid;
        
        metadata = {
          institutionName: formData.institutionName,
          accreditationNumber: formData.accreditationNumber,
          documentCid
        };
      }

      // Verify metadata upload
      const { cid } = await uploadJSONToIPFS(metadata);
      if (!cid) throw new Error('Failed to upload metadata to IPFS');

      // Contract interaction
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error('Contract address not configured');
      }

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        UserRegistryABI.abi,
        signer
      );

      const tx = await contract.registerUser(formData.role, cid);
      await tx.wait();

      setRegistrationComplete(true);
      setUserRole(formData.role);
      setFormData(initialFormState);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, document: file }));
  };

  const setRole = (role: 'student' | 'provider') => {
    setFormData({
      ...initialFormState,
      role
    });
  };

  // After successful registration, show the appropriate dashboard
  if (registrationComplete && userRole) {
    return userRole === 'student' ? <StudentDashboard /> : <ProviderDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8A2BE2]/5 via-white to-white">
      {/* Grid pattern background */}
      <div className="absolute inset-0 opacity-5 [background-image:linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:24px_24px] -z-10" />
      
      <div className="container mx-auto px-4 md:px-6 py-12 relative z-10">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Role Selection */}
            <div className="w-full md:w-1/3 bg-[#191A23] p-8 text-white">
              <div className="flex items-center space-x-2 mb-8">
                <FiShield className="text-2xl text-[#B9FF66]" />
                <span className="text-xl font-bold">ANTI-FAKE</span>
              </div>
              
              <h1 className="text-2xl font-bold mb-6">Join as ..</h1>
              
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`w-full p-5 rounded-xl flex items-start transition-all ${
                    formData.role === 'student' 
                      ? 'bg-[#B9FF66] text-[#191A23] shadow-lg'
                      : 'bg-[#191A23] hover:bg-[#191A23]/90 border border-[#B9FF66]/30'
                  }`}
                >
                  <div className="bg-[#191A23] p-2 rounded-lg mr-4">
                    <FiUser className={`text-xl ${formData.role === 'student' ? 'text-[#B9FF66]' : 'text-white'}`} />
                  </div>
                  <div className="text-left">
                    <span className="block font-semibold">Student</span>
                    <span className="block text-sm opacity-80">Register your credentials</span>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setRole('provider')}
                  className={`w-full p-5 rounded-xl flex items-start transition-all ${
                    formData.role === 'provider' 
                      ? 'bg-[#B9FF66] text-[#191A23] shadow-lg'
                      : 'bg-[#191A23] hover:bg-[#191A23]/90 border border-[#B9FF66]/30'
                  }`}
                >
                  <div className="bg-[#191A23] p-2 rounded-lg mr-4">
                    <FiHome className={`text-xl ${formData.role === 'provider' ? 'text-[#B9FF66]' : 'text-white'}`} />
                  </div>
                  <div className="text-left">
                    <span className="block font-semibold">Institution</span>
                    <span className="block text-sm opacity-80">Issue verifiable certificates</span>
                  </div>
                </button>
              </div>
              
              <div className="mt-12 pt-6 border-t border-[#B9FF66]/20">
                <p className="text-sm opacity-80">
                  Powered by blockchain technology for secure, tamper-proof credentials.
                </p>
              </div>
            </div>

            {/* Registration Form */}
            <div className="w-full md:w-2/3 p-8 bg-white relative z-10">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-[#191A23] mb-2">
                  {formData.role === 'student' ? 'Student Registration' : 'Institution Registration'}
                </h2>
                <p className="text-[#191A23]/80">
                  {formData.role === 'student' 
                    ? 'Register to receive blockchain-verified credentials'
                    : 'Register your institution to issue credentials'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start">
                  <FiShield className="flex-shrink-0 mr-3 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Registration Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-6">
                {formData.role === 'student' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#191A23] mb-2">Full Name*</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A2BE2] focus:border-transparent"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="Your full name as it appears on ID"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#191A23] mb-2">Email*</label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A2BE2] focus:border-transparent"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        placeholder="example@university.edu"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#191A23] mb-2">Student ID*</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A2BE2] focus:border-transparent"
                        value={formData.studentId}
                        onChange={e => setFormData({...formData, studentId: e.target.value})}
                        placeholder="University-issued student ID"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#191A23] mb-2">Institution Name*</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A2BE2] focus:border-transparent"
                        value={formData.institutionName}
                        onChange={e => setFormData({...formData, institutionName: e.target.value})}
                        placeholder="Official institution name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#191A23] mb-2">Accreditation Number*</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A2BE2] focus:border-transparent"
                        value={formData.accreditationNumber}
                        onChange={e => setFormData({...formData, accreditationNumber: e.target.value})}
                        placeholder="Government-issued accreditation ID"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#191A23] mb-2">
                        Accreditation Document*
                      </label>
                      <label className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#8A2BE2] transition-colors bg-gray-50">
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.jpg,.png"
                          required
                        />
                        {formData.document ? (
                          <div className="flex flex-col items-center text-center">
                            <FiFileText className="text-3xl text-[#8A2BE2] mb-2" />
                            <span className="font-medium text-[#191A23]">
                              {formData.document.name}
                            </span>
                            <span className="text-sm text-gray-500 mt-1">Click to change file</span>
                          </div>
                        ) : (
                          <>
                            <FiUpload className="text-3xl text-[#8A2BE2] mb-3" />
                            <span className="text-sm text-[#191A23]/80 text-center">
                              Drag and drop your accreditation document here<br />
                              or click to browse files
                            </span>
                            <span className="text-xs text-gray-500 mt-2">Supports: PDF, DOC, JPG, PNG (max 5MB)</span>
                          </>
                        )}
                      </label>
                    </div>
                  </>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#8A2BE2] to-[#4B0082] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner />
                      Securing your registration...
                    </>
                  ) : (
                    <>
                      <FiShield className="mr-2" />
                      {formData.role === 'student' ? 'Register as Student' : 'Register Institution'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}