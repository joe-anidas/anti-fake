import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import UserRegistryABI from '../../artifacts/contracts/UserRegistry.sol/UserRegistry.json';
import { useEthereum } from '@/contexts/EthereumContext';

interface UserData {
  role: string;
  registered: boolean;
}

interface ContractContextType {
  getContract: (provider: any) => any;
  userData: UserData | null;
  loading: boolean;
  refetchUserData: () => void;
}

interface ContractContextProviderProps {
  children: ReactNode;
}

const ContractContext = createContext<ContractContextType | null>(null);

export const ContractContextProvider = ({ children }: ContractContextProviderProps) => {
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const { account, provider } = useEthereum(); // Get account and provider from EthereumContext

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getContract = (provider: any) => {
    if (!provider || !contractAddress) return null;
    return new ethers.Contract(contractAddress, UserRegistryABI.abi, provider);
  };

  const fetchUserData = async () => {
    if (account && provider) {
      setLoading(true);
      try {
        const contract = getContract(provider);
        if (!contract) {
          setUserData(null);
          return;
        }
        const [role] = await contract.getUser(account);
        const registered = await contract.isUserRegistered(account);
        setUserData({ role: role.toLowerCase(), registered });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    }
  };

  // Fetch user data when account or provider changes
  useEffect(() => {
    fetchUserData();
  }, [account, provider]);

  const refetchUserData = () => {
    fetchUserData();
  };

  return (
    <ContractContext.Provider value={{ getContract, userData, loading, refetchUserData }}>
      {children}
    </ContractContext.Provider>
  );
};

export const useContractContext = () => useContext(ContractContext);
