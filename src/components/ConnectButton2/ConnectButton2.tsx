import { useEthereum } from '@/contexts/EthereumContext';

/**
 * Provides a button for connecting to and disconnecting from an
 * Ethereum-based blockchain. It leverages the useEthereum hook
 * from the EthereumContext for managing blockchain connections.
 */

const ConnectButton: React.FC = () => {
  const { connect, disconnect, account } = useEthereum();
  return (
    <button
    className="m-4 bg-lukso-pink text-white font-bold py-4 px-8 rounded-xl text-xl hover:bg-pink-600 transition-all"

      onClick={account ? disconnect : connect}
    >
      {account ? 'Disconnect' : 'Connect Wallet'}
    </button>
  );
};

export default ConnectButton;
