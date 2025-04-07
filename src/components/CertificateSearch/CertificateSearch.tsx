import { useState } from 'react';
import { ethers } from 'ethers';
import { useEthereum } from '@/contexts/EthereumContext';
import CertificateNFTABI from '../../../artifacts/contracts/CertificateNFT.sol/CertificateNFT.json';
import { FiSearch, FiAward, FiCalendar, FiUser, FiFileText, FiLink } from 'react-icons/fi';

interface Certificate {
  id: string;
  name: string;
  institute: string;
  issueDate: number;
  certificateType: string;
  student: string;
  tokenURI: string;
  metadata?: any;
}

const CertificateSearch = () => {
  const { provider } = useEthereum();
  const [searchAddress, setSearchAddress] = useState('');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const certificateNFTAddress = process.env.NEXT_PUBLIC_CERTIFICATE_NFT_ADDRESS || '';

  const isValidAddress = (address: string) => ethers.isAddress(address);

  const handleSearch = async () => {
    if (!provider || !isValidAddress(searchAddress)) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setCertificates([]);

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        certificateNFTAddress,
        CertificateNFTABI.abi,
        signer
      );

      // No authorization check — open for all users to view

      const certificateIds: bigint[] = await contract.getStudentCertificates(searchAddress);

      if (certificateIds.length === 0) {
        setCertificates([]);
        return;
      }

      const certificatesData = await Promise.all(
        certificateIds.map(async (id: bigint) => {
          const [name, institute, issueDate, certificateType, student] =
            await contract.getCertificateDetails(id);

          const tokenURI = await contract.tokenURI(id);
          let metadata = null;

          try {
            const metadataHash = tokenURI.replace('ipfs://', '');
            const response = await fetch(`https://ipfs.io/ipfs/${metadataHash}`);
            metadata = await response.json();
          } catch (err) {
            console.error('Metadata fetch error:', err);
          }

          return {
            id: id.toString(),
            name,
            institute,
            issueDate: Number(issueDate),
            certificateType,
            student,
            tokenURI,
            metadata
          };
        })
      );

      setCertificates(certificatesData);
    } catch (err) {
      console.error('Search error:', err);
      setError('Something went wrong while fetching certificates.');
    } finally {
      setIsLoading(false);
    }
  };

  const convertIpfsUrl = (url: string) =>
    url.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${url.split('ipfs://')[1]}` : url;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100 mt-12">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <FiSearch className="mr-2 text-[#8A2BE2]" />
        Certificate Verification
      </h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Verify the authenticity of educational credentials by searching with a wallet address.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUser className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A2BE2] focus:border-transparent"
              placeholder="Enter wallet address (0x...)"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-[#8A2BE2] to-[#4B0082] text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap"
            disabled={isLoading || !searchAddress}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </>
            ) : (
              <>
                <FiSearch className="mr-2" />
                Verify
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
          <svg className="h-5 w-5 text-red-400 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {certificates.length > 0 ? (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FiAward className="mr-2 text-[#8A2BE2]" />
            Found {certificates.length} Certificate{certificates.length !== 1 ? 's' : ''}
          </h3>
          
          {certificates.map((cert) => (
            <div key={cert.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <h3 className="font-bold text-xl text-gray-900">{cert.name}</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#B9FF66] text-[#191A23] mt-2 md:mt-0">
                  {cert.certificateType}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="flex items-center text-gray-700">
                    <FiFileText className="mr-2 text-gray-500" />
                    <span className="font-medium">Institute:</span> 
                    <span className="ml-2">{cert.institute}</span>
                  </p>
                  
                  <p className="flex items-center text-gray-700">
                    <FiCalendar className="mr-2 text-gray-500" />
                    <span className="font-medium">Issued Date:</span>
                    <span className="ml-2">{new Date(cert.issueDate * 1000).toLocaleDateString()}</span>
                  </p>
                  
                  <p className="flex items-start text-gray-700">
                    <FiUser className="mr-2 mt-1 text-gray-500" />
                    <span className="font-medium">Student Address:</span>
                    <span className="ml-2 text-sm text-gray-600 break-all">{cert.student}</span>
                  </p>
                </div>
                
                {cert.metadata && cert.metadata.image && (
                  <div className="flex flex-col items-center justify-center">
                    <img
                      src={convertIpfsUrl(cert.metadata.image)}
                      alt="Certificate preview"
                      className="rounded-lg border border-gray-200 shadow max-h-48 object-contain"
                    />
                  </div>
                )}
              </div>

              {cert.metadata && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <a
                    href={convertIpfsUrl(cert.tokenURI)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[#8A2BE2] hover:underline font-medium"
                  >
                    <FiLink className="mr-2" />
                    View Certificate Metadata
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        !isLoading && searchAddress && (
          <div className="text-center py-12">
            <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiFileText className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No certificates found</h3>
            <p className="mt-2 text-gray-500">
              There are no certificates associated with this wallet address
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default CertificateSearch;