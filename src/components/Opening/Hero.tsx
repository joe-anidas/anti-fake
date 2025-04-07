
import Image from "next/image"; 
import ConnectButton from '../ConnectButton2';// Correct import for Next.js Image component

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#8A2BE2]/5 via-white to-white py-24 md:min-h-[80vh]">
      {/* Grid pattern background */}
      <div className="absolute inset-0 opacity-5 [background-image:linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:24px_24px]" />
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center px-4 py-2 bg-[#B9FF66] rounded-full mb-6">
              <span className="text-sm font-medium text-[#191A23]">
                Powered by LUKSO
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#191A23] mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8A2BE2] to-[#4B0082]">
                Blockchain-Verified
              </span>{" "}
              Certificates
            </h1>
            
            <p className="text-lg text-[#191A23]/80 mb-8 max-w-lg">
              Issue, manage, and verify academic credentials as NFTs on Universal Profiles. 
              Tamper-proof diplomas with instant employer verification powered by LUKSO.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
       
              <ConnectButton />
          
            </div>
          </div>
          
          {/* Image section */}
          <div className="relative h-full min-h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8A2BE2]/20 to-[#B9FF66]/20 rounded-3xl" />
            <div className="relative h-full w-full overflow-hidden rounded-3xl shadow-2xl">
              <Image
                src="/images/cover.jpg" // Update this path
                alt="logo"
                fill
                className="object-cover"
                priority
                quality={85}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}