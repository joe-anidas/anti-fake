import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Fingerprint } from 'lucide-react';
import ConnectButton from '../ConnectButton';

interface NavbarProps {
  className?: string;
}

function Navbar({ 
  className = 'bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200'
}: NavbarProps) {
  return (
    <nav className={className}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
     
            <Link 
              href="/" 
              className="flex items-center group"
            >
              <span className="text-xl font-bold bg-gradient-to-r from-[#8A2BE2] to-[#4B0082] bg-clip-text text-transparent">
                ANTI-FAKE
              </span>
              <ShieldCheck className="ml-2 h-5 w-5 text-[#8A2BE2] group-hover:text-[#4B0082] transition-colors" />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="flex items-center text-sm font-medium text-gray-700 hover:text-[#8A2BE2] transition-colors"
            >
              <Fingerprint className="mr-2 h-4 w-4" />
              Verify Certificates
            </Link>
            <div className="ml-4">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;