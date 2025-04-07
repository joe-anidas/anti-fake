import React, { useState, useEffect } from 'react';
import { AppProps } from 'next/app';
import { useEthereum } from '@/contexts/EthereumContext';
import '@/app/globals.css';
import RootLayout from '@/app/layout';
import { EthereumProvider } from '@/contexts/EthereumContext';
import { NetworkProvider } from '@/contexts/NetworkContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import Home from '../components/Opening/NavBar';
import ConditionalContent from '../components/ConditionalContent/ConditionalContent';
import { ContractContextProvider } from '@/contexts/ContractContext';
import Navbar from '../components/Opening/NavBar';


function LUKSOproject({ Component, pageProps }: AppProps) {
  return (
    <EthereumProvider>
      <NetworkProvider>
        <ProfileProvider>
          <ContractContextProvider>
            <RootLayout>
              <Navbar/>
              <ConditionalContent />
            </RootLayout>
          </ContractContextProvider>
        </ProfileProvider>
      </NetworkProvider>
    </EthereumProvider>
  );
}

export default LUKSOproject;
