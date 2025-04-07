import React, { useEffect, useState } from 'react';
import { useEthereum } from '@/contexts/EthereumContext';
import { useContractContext } from '@/contexts/ContractContext';
import StudentDashboard from '@/components/StudentDashboard/StudentDashboard';
import ProviderDashboard from '@/components/ProviderDashboard/ProviderDashboard';
import OwnerDashboard from '../ProviderDashboard/OwnerDashboard'; // Import the OwnerDashboard
import SplitRegistrationForm from '@/components/Registeration/SplitRegistrationForm';
import { ethers } from 'ethers';
import CertificateNFTABI from '../../../artifacts/contracts/CertificateNFT.sol/CertificateNFT.json';
import Home from '../Opening/Home';

const ConditionalContent = () => {
  const { account, provider } = useEthereum();
  const { userData, loading } = useContractContext()!;
  const [isOwner, setIsOwner] = useState(false);
  const [checkingOwnership, setCheckingOwnership] = useState(true);

  const certificateNFTAddress = process.env.NEXT_PUBLIC_CERTIFICATE_NFT_ADDRESS || '';

  useEffect(() => {
    const checkOwnership = async () => {
      if (!account || !provider) {
        setCheckingOwnership(false);
        return;
      }

      try {
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          certificateNFTAddress,
          CertificateNFTABI.abi,
          signer
        );
        
        const owner = await contract.owner();
        setIsOwner(owner.toLowerCase() === account.toLowerCase());
      } catch (error) {
        console.error('Error checking ownership:', error);
        setIsOwner(false);
      } finally {
        setCheckingOwnership(false);
      }
    };

    checkOwnership();
  }, [account, provider]);

  if (loading || checkingOwnership) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!account) {
    return (
   <Home/>
    );
  }

  // Check for owner first
  if (isOwner) {
    return <OwnerDashboard />;
  }

  if (userData) {
    if (userData.registered) {
      if (userData.role === 'student') return <StudentDashboard />;
      if (userData.role === 'provider') return <ProviderDashboard />;
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-red-500">Error: Unknown user role detected</div>
        </div>
      );
    }
    return <SplitRegistrationForm />;
  }

  // Fallback in case userData is null (not registered)
  return <SplitRegistrationForm />;
};

export default ConditionalContent;