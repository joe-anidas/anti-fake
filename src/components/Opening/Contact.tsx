export default function ContactSection() {
  return (
    <section className="py-16 md:py-24 bg-[#F3F3F3]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-[#191A23] mb-4">Get in Touch with Us</h2>
              <p className="text-[#191A23]/80 mb-6">
                Reach out to learn more about our decentralized certificate verification system.
              </p>
              <button className="bg-[#191A23] text-white hover:bg-[#B9FF66] hover:text-[#191A23] transition-colors px-6 py-3 rounded-md font-medium">
                Contact Support
              </button>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 rounded-full bg-[#191A23] flex items-center justify-center">
                  <div className="text-white text-4xl">✦</div>
                </div>
                <div className="absolute inset-0 border-2 border-[#B9FF66] rounded-full animate-[spin_20s_linear_infinite]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}