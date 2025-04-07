import React from 'react';
import { useEthereum } from '@/contexts/EthereumContext';

const AccountDisplay: React.FC = () => {
  const { account } = useEthereum();

  return (
    <div className="m-4 p-2 text-sm text-gray-800">
      {account ? `Connected Account: ${account}` : 'No account connected'}
    </div>
  );
};

export default AccountDisplay;
