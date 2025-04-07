import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useEthereum } from '@/contexts/EthereumContext';
import UserRegistryABI from '../../../artifacts/contracts/UserRegistry.sol/UserRegistry.json';
import CertificateNFTABI from '../../../artifacts/contracts/CertificateNFT.sol/CertificateNFT.json';
import CertificateSearch from '../CertificateSearch/CertificateSearch';
import { FiUser, FiMail, FiBook, FiAward, FiFileText, FiSend } from 'react-icons/fi';

interface Certificate {
  id: string;
  name: string;
  institute: string;
  issueDate: number;
  certificateType: string;
  student: string;
  tokenURI: string;
  image?: string;
}

const StudentDashboard = () => {
  const { account, provider } = useEthereum();
  const [profile, setProfile] = useState<any>({});
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [providerAddress, setProviderAddress] = useState('');
  const [certificateName, setCertificateName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const userRegistryAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
  const certificateNFTAddress = process.env.NEXT_PUBLIC_CERTIFICATE_NFT_ADDRESS || '';

  useEffect(() => {
    const fetchData = async () => {
      if (!account || !provider) return;

      try {
        setIsLoading(true);
        const signer = await provider.getSigner();
        const userRegistry = new ethers.Contract(userRegistryAddress, UserRegistryABI.abi, signer);
        const certificateNFT = new ethers.Contract(certificateNFTAddress, CertificateNFTABI.abi, signer);

        // Fetch student profile
        const [, ipfsHash] = await userRegistry.getUser(account);
        if (ipfsHash) {
          const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
          const data = await response.json();
          setProfile(data);
        }

        // Fetch certificates
        const certificateIds = await certificateNFT.getStudentCertificates(account);
        const certDetails = await Promise.all(
          certificateIds.map(async (id: any) => {
            const [name, institute, issueDate, certificateType, student] =
              await certificateNFT.getCertificateDetails(id);
            const tokenURI = await certificateNFT.tokenURI(id);

            let image;
            try {
              const metadataCID = tokenURI.replace('ipfs://', '');
              const metadataRes = await fetch(`https://ipfs.io/ipfs/${metadataCID}`);
              const metadata = await metadataRes.json();
              image = metadata.image?.replace('ipfs://', 'https://ipfs.io/ipfs/');
            } catch (e) {
              console.warn('Failed to load image metadata for token:', id);
            }

            return {
              id: id.toString(),
              name,
              institute,
              issueDate,
              certificateType,
              student,
              tokenURI,
              image,
            };
          })
        );
        setCertificates(certDetails);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [account, provider]);

  const handleRequestCertificate = async () => {
    if (!account || !provider) return;

    try {
      const signer = await provider.getSigner();
      const userRegistry = new ethers.Contract(userRegistryAddress, UserRegistryABI.abi, signer);
      const certificateNFT = new ethers.Contract(certificateNFTAddress, CertificateNFTABI.abi, signer);

      const [, metadataHash] = await userRegistry.getUser(account);

      const tx = await certificateNFT.requestCertificate(
        providerAddress,
        certificateName,
        message,
        metadataHash
      );
      await tx.wait();
      alert('Certificate request sent successfully!');

      setProviderAddress('');
      setCertificateName('');
      setMessage('');
    } catch (error) {
      console.error('Certificate request error:', error);
      alert('Failed to send certificate request');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#8A2BE2]/5 via-white to-white p-8">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="animate-pulse flex flex-col items-center justify-center h-64">
            <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
            <div className="w-64 h-4 bg-gray-200 rounded mb-2"></div>
            <div className="w-48 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8A2BE2]/5 via-white to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#191A23]">
            Student Dashboard
          </h1>
          <div className="bg-[#191A23] text-white px-4 py-2 rounded-full text-sm">
            {account ? `${account.substring(0, 6)}...${account.substring(38)}` : 'Not Connected'}
          </div>
        </div>

        {account ? (
          <>
            {/* Profile Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FiUser className="mr-2 text-[#8A2BE2]" />
                Your Profile
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="flex items-center text-gray-700">
                    <span className="font-medium w-24">Name:</span>
                    <span>{profile.name || 'Not available'}</span>
                  </p>
                  <p className="flex items-center text-gray-700">
                    <span className="font-medium w-24">Email:</span>
                    <span>{profile.email || 'Not available'}</span>
                  </p>
                  <p className="flex items-center text-gray-700">
                    <span className="font-medium w-24">Student ID:</span>
                    <span>{profile.studentId || 'Not available'}</span>
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">Wallet Address:</p>
                  <p className="text-sm text-gray-600 break-all bg-gray-50 p-2 rounded">
                    {account}
                  </p>
                </div>
              </div>
            </div>

            {/* Certificate List */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <FiAward className="mr-2 text-[#8A2BE2]" />
                Your Certificates
              </h2>
              
              {certificates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-lg">{cert.name}</h3>
                        <span className="bg-[#B9FF66] text-[#191A23] text-xs px-2 py-1 rounded-full">
                          {cert.certificateType}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <p className="flex items-center">
                          <FiBook className="mr-2 text-gray-500" />
                          <span className="font-medium">Issued by:</span> {cert.institute}
                        </p>
                        <p className="flex items-center">
                          <FiFileText className="mr-2 text-gray-500" />
                          <span className="font-medium">Issued on:</span> {new Date(Number(cert.issueDate) * 1000).toLocaleDateString()}
                        </p>
                      </div>

                      {cert.image && (
                        <img
                          src={cert.image}
                          alt="Certificate"
                          className="mt-4 rounded-lg w-full h-auto border border-gray-200"
                        />
                      )}

                      <a
                        href={`https://ipfs.io/ipfs/${cert.tokenURI.split('ipfs://')[1]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 text-sm text-[#8A2BE2] hover:underline"
                      >
                        View Metadata
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FiAward className="text-3xl text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No certificates yet</h3>
                  <p className="mt-1 text-gray-500">Request certificates from your institution below</p>
                </div>
              )}
            </div>

            {/* Certificate Request Form */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <FiSend className="mr-2 text-[#8A2BE2]" />
                Request New Certificate
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider Wallet Address
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A2BE2] focus:border-transparent"
                    value={providerAddress}
                    onChange={(e) => setProviderAddress(e.target.value)}
                    placeholder="0x..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificate Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A2BE2] focus:border-transparent"
                    value={certificateName}
                    onChange={(e) => setCertificateName(e.target.value)}
                    placeholder="e.g., Bachelor of Science in Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Message
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A2BE2] focus:border-transparent"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Any additional information for the provider..."
                  />
                </div>

                <button
                  onClick={handleRequestCertificate}
                  disabled={!providerAddress || !certificateName}
                  className="w-full bg-gradient-to-r from-[#8A2BE2] to-[#4B0082] text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <FiSend className="mr-2" />
                  Submit Request
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <FiUser className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Wallet not connected</h3>
            <p className="text-gray-500">Please connect your wallet to view your dashboard</p>
          </div>
        )}

        {/* Certificate Search Component */}
        <CertificateSearch />
      </div>
    </div>
  );
};

export default StudentDashboard;