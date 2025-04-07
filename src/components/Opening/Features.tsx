import { User, FileDigit, CheckCircle } from "lucide-react";

export default function Features() {
  const services = [
    {
      title: "Universal Profile Integration",
      icon: User,
      description: "Seamless certificate issuance directly to student UPs with LSP6 access control.",
      bgColor: "bg-[#8A2BE2]", // LUKSO purple
      textColor: "text-white",
      borderColor: "border-[#8A2BE2]/20"
    },
    {
      title: "NFT Certificates",
      icon: FileDigit,
      description: "Tamper-proof diplomas minted as LSP8 NFTs with IPFS metadata storage.",
      bgColor: "bg-[#191A23]", // Dark
      textColor: "text-white",
      borderColor: "border-[#191A23]/20"
    },
    {
      title: "Instant Verification",
      icon: CheckCircle,
      description: "Employers verify credentials in seconds by scanning QR codes linked to UPs.",
      bgColor: "bg-[#B9FF66]", // LUKSO green
      textColor: "text-[#191A23]",
      borderColor: "border-[#B9FF66]/20"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <div className="inline-block px-4 py-2 bg-[#B9FF66] rounded-full mb-4">
            <h2 className="text-[#191A23] font-bold text-sm uppercase tracking-wider">
              Why Choose Us
            </h2>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-[#191A23] mb-4">
            Blockchain-Powered Credentials
          </h3>
          <p className="text-[#191A23]/80 max-w-2xl mx-auto">
            Revolutionizing certificate verification with LUKSO's Universal Profiles and NFT technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className={`${service.bgColor} ${service.borderColor} border-2 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-2`}
            >
              <div className="p-8 h-full">
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <service.icon className={`h-10 w-10 ${service.textColor}`} />
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${service.textColor}`}>
                    {service.title}
                  </h3>
                  <p className={`${service.textColor} opacity-90 mb-6 flex-grow`}>
                    {service.description}
                  </p>
                  <div className={`w-10 h-1 ${service.textColor} opacity-50 mb-6`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
