import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useEthereum } from '@/contexts/EthereumContext';
import CertificateNFTABI from '../../../artifacts/contracts/CertificateNFT.sol/CertificateNFT.json';

const OwnerDashboard = () => {
  const { account, provider } = useEthereum();
  const [instituteAddress, setInstituteAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const certificateNFTAddress = process.env.NEXT_PUBLIC_CERTIFICATE_NFT_ADDRESS || '';

  const authorizeInstitute = async () => {
    if (!provider || !account) return;
    
    try {
      setIsLoading(true);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        certificateNFTAddress,
        CertificateNFTABI.abi,
        signer
      );
      // Verify ownership
      const owner = await contract.owner();
      if (owner.toLowerCase() !== account.toLowerCase()) {
        throw new Error("You are not the contract owner");
      }
      const tx = await contract.authorizeInstitute(instituteAddress);
      await tx.wait();
      setMessage(`Successfully authorized ${instituteAddress}`);
      setInstituteAddress('');
    } catch (error) {
      console.error("Authorization error:", error);
      setMessage(error instanceof Error ? error.message : "Authorization failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Owner Dashboard
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Manage credential provider authorizations
            </p>
          </div>
          
          {/* Connected Account Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900">Connected Account</h2>
              <div className="mt-3 max-w-xl text-sm text-gray-500">
                <p>
                  {account ? (
                    <>
                      <span className="font-medium text-gray-900">Address: </span>
                      <span className="font-mono">{account}</span>
                    </>
                  ) : (
                    "No wallet connected"
                  )}
                </p>
              </div>
            </div>
          </div>
          
          {/* Main Card */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg leading-6 font-medium text-gray-900">
                Authorize New Provider
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Add a new institution that can issue certificates
              </p>
            </div>
            
            <div className="px-4 py-5 sm:p-6 space-y-6">
              <div>
                <label htmlFor="institute-address" className="block text-sm font-medium text-gray-700">
                  Provider Wallet Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="institute-address"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                    value={instituteAddress}
                    onChange={(e) => setInstituteAddress(e.target.value)}
                    placeholder="0x..."
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Enter the Ethereum address of the provider you want to authorize
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={authorizeInstitute}
                  disabled={!instituteAddress || isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authorizing...
                    </>
                  ) : (
                    "Authorize Provider"
                  )}
                </button>
              </div>
              
              {message && (
                <div className={`p-4 rounded-md ${
                  message.includes("Success") ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                }`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {message.includes("Success") ? (
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${message.includes("Success") ? "text-green-800" : "text-red-800"}`}>
                        {message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Contract Info Card */}
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Contract Information
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Contract Address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 break-all font-mono">
                    {certificateNFTAddress || "Not configured"}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Your Role
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    Contract Owner
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;