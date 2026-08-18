import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }) {
  // Await the cookies store to comply with Next.js 15+ asynchronous headers
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  // If the session cookie is missing or invalid, redirect immediately to login
  if (!session?.value) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3A3A3A] font-sans">
      {children}
    </div>
  );
}