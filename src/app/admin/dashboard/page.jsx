import Link from 'next/link';
import { logout } from '../action';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3A3A3A] p-6">
      
      {/* Brand Header on Top */}
      <header className="max-w-4xl mx-auto flex flex-col items-center border-b border-[#F0EBE1] pb-6 mb-8">
        <Link href="/" className="flex flex-col items-center cursor-pointer mb-4">
          <h1 className="text-3xl font-serif text-[#b08968] tracking-wide">SHRI LAXMI</h1>
          <p className="text-[10px] tracking-[0.3em] text-gray-400">ADMINISTRATION PORTAL</p>
        </Link>
        
        <div className="w-full flex justify-between items-center px-2">
          <div>
            <h2 className="text-lg font-medium text-[#3A3A3A]">Dashboard Overview</h2>
            <p className="text-xs text-gray-500">Manage your catalogue and inventory seamlessly.</p>
          </div>
          
          <form action={logout}>
            <button type="submit" className="text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-md border border-red-100 transition-colors">
              LOGOUT
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/add" className="group block bg-white p-8 rounded-xl border border-[#F0EBE1] hover:shadow-md hover:border-[#E5E0D8] transition-all">
            <div className="w-12 h-12 bg-[#FDFBF7] text-[#C17C6E] rounded-full flex items-center justify-center mb-6 border border-[#F0EBE1] group-hover:bg-[#C17C6E] group-hover:text-white transition-colors">
              <span className="text-2xl font-light">+</span>
            </div>
            <h2 className="text-lg font-medium mb-2">Add New Product</h2>
            <p className="text-sm text-gray-500 mb-6">Upload images, set categories, and define available sizes.</p>
            <div className="inline-block bg-[#C17C6E] text-white text-sm font-medium px-6 py-2 rounded-md">
              ADD NEW
            </div>
          </Link>

          <Link href="/admin/manage" className="group block bg-white p-8 rounded-xl border border-[#F0EBE1] hover:shadow-md hover:border-[#E5E0D8] transition-all">
            <div className="w-12 h-12 bg-[#FDFBF7] text-[#C17C6E] rounded-full flex items-center justify-center mb-6 border border-[#F0EBE1] group-hover:bg-[#C17C6E] group-hover:text-white transition-colors">
              <span className="text-xl">☰</span>
            </div>
            <h2 className="text-lg font-medium mb-2">Manage Products</h2>
            <p className="text-sm text-gray-500 mb-6">Change size availability, update tags, or remove products.</p>
            <div className="inline-block bg-[#b08968] text-white text-sm font-medium px-6 py-2 rounded-md">
              MANAGE
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}