'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  const handleEmailClick = (e) => {
    e.preventDefault(); // Stops the browser from trying to open a broken mail app
    navigator.clipboard.writeText('officialshrilaxmii@gmail.com');
    setEmailCopied(true);
    
    // Reset the text back to "Email Us" after 2 seconds
    setTimeout(() => {
      setEmailCopied(false);
    }, 2000);
  };

  return (
    <>
      {/* Drawer Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-[60] backdrop-blur-sm transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Slide-out Menu */}
      <div className={`fixed top-0 right-0 h-full w-64 md:w-80 bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 flex flex-col h-full">
          <button onClick={() => setIsMenuOpen(false)} className="self-end text-gray-500 hover:text-black mb-8">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          
          <nav className="flex flex-col gap-6 text-sm font-medium tracking-wide">
            <Link href="/admin/login" className="hover:text-[#C17C6E] transition-colors border-b border-gray-100 pb-4">
              STAFF LOGIN (ADMIN)
            </Link>
            
            <div className="border-b border-gray-100 pb-4">
              <button onClick={() => setIsContactDropdownOpen(!isContactDropdownOpen)} className="w-full flex justify-between items-center hover:text-[#C17C6E] transition-colors uppercase">
                Contact & Reviews
                <svg className={`w-4 h-4 transform transition-transform ${isContactDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              
              {isContactDropdownOpen && (
                <div className="flex flex-col gap-4 mt-4 pl-4 text-gray-500 text-xs">
                  <a href="https://www.instagram.com/officialshrilaxmii/" target="_blank" rel="noopener noreferrer" className="hover:text-[#C17C6E] flex items-center gap-2">
                    <span>IG</span> Instagram
                  </a>
                  
                  {/* Updated Email Button with Copy-to-Clipboard functionality */}
                  <a 
                    href="mailto:officialshrilaxmii@gmail.com" 
                    onClick={handleEmailClick}
                    className="hover:text-[#C17C6E] flex items-center gap-2 cursor-pointer"
                  >
                    <span>✉</span> {emailCopied ? <span className="text-[#C17C6E] font-bold">Email Copied!</span> : 'Email Us'}
                  </a>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#F0EBE1] pt-6 pb-4 px-4 md:px-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="w-8"></div>
          
          {/* Clickable Title & Future Logo Space */}
          <Link href="/" className="flex flex-col items-center cursor-pointer transition-transform hover:scale-[1.02]">
            
            {/* TODO: When your logo is ready, put it in the "public" folder as "logo.png" and uncomment the line below */}
            {/* <img src="/logo.png" alt="Shri Laxmi Logo" className="h-12 w-auto mb-2" /> */}
            
            <h1 className="text-2xl md:text-3xl font-serif text-[#b08968] mb-1">SHRI LAXMI</h1>
            <p className="text-[10px] tracking-[0.3em] text-gray-400">CATALOGUE</p>
          </Link>

          <button onClick={() => setIsMenuOpen(true)} className="w-8 text-[#3A3A3A] hover:text-[#C17C6E] transition-colors">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>
      </header>
    </>
  );
}