import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#F0EBE1] pt-16 pb-8 mt-12 w-full">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Top Section: Links & Directions */}
        {/* Changed back to justify-between to push to extreme corners */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12 mb-12">
          
          {/* Left: Contact & Socials */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <h4 className="text-sm font-serif text-[#b08968] tracking-widest mb-2 uppercase">Connect with us</h4>
            <div className="flex flex-col gap-2.5 text-sm text-gray-500 text-center md:text-left">
              <a href="https://www.instagram.com/officialshrilaxmii/" target="_blank" className="hover:text-[#C17C6E] transition-colors flex items-center justify-center md:justify-start gap-2">
                <span>Instagram</span>
              </a>
            
              <a href="mailto:officialshrilaxmii@gmail.com" className="hover:text-[#C17C6E] transition-colors flex items-center justify-center md:justify-start gap-2">
                <span>Email Us: officialshrilaxmii@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Right: Store Directions */}
          {/* Right-aligned text and button on desktop to anchor it to the corner */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <h4 className="text-sm font-serif text-[#b08968] tracking-widest mb-2 uppercase text-center md:text-right">Visit our store</h4>
            <p className="text-sm text-gray-500 max-w-[280px] text-center md:text-right leading-relaxed">
              Want to see our collection in person? Drop by our shop to explore the fabrics!
            </p>
            <a href="https://www.google.com/maps/dir//Shree+Laxmi,+11,+Station+Rd,+Jawahar+Nagar,+Goregaon+West,+Mumbai,+Maharashtra+400104/@19.1619313,72.8397314,15z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3be7b65275cfffd9:0x7557fcf684823ff5!2m2!1d72.8476572!2d19.1628586?entry=ttu&g_ep=EgoyMDI2MDgxMi4wIKXMDSoASAFQAw%3D%3D" className="mt-3 flex items-center gap-2 bg-[#FDFBF7] border border-[#b08968] text-[#b08968] px-6 py-2.5 rounded-full text-xs font-medium hover:bg-[#b08968] hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              GET DIRECTIONS
            </a>
          </div>

        </div>

        {/* Bottom Section: Copyright & Creator */}
        <div className="text-center border-t border-[#F0EBE1] pt-8 flex flex-col items-center">
          <p className="text-xs text-gray-400 mb-2">© {new Date().getFullYear()} Shri Laxmi. All rights reserved.</p>
          <p className="text-xs text-gray-500">
            Designed & Developed by <a href="https://novustech.vercel.app/" target="_blank" className="font-bold text-[#b08968] hover:text-[#C17C6E] transition-colors uppercase tracking-widest ml-1">NovusTech</a>
          </p>
        </div>
      </div>
    </footer>
  );
}