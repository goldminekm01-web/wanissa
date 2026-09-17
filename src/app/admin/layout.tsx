import { redirect } from 'next/navigation';

// Define a type for the children prop
type Children = React.ReactNode;

export default async function AdminLayout({ children }: { children: Children }) {
  // Check if admin is authenticated
  try {
    const { getAdminSession } = await import('@/lib/admin-auth');
    const admin = await getAdminSession();
    
    if (!admin) {
      redirect('/admin/login');
    }
  } catch (error) {
    redirect('/admin/login');
  }
  return (
    <div className="container" style={{ display: 'flex', minHeight: '80vh', padding: '20px 0' }}>
      <aside style={{ width: '250px', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '20px' }}>
        <h2 style={{ marginBottom: '20px' }} className="gradient-text">Admin Panel</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <a href="/admin" style={{ color: 'var(--text-primary)' }}>Dashboard</a>
          <a href="/admin/categories" style={{ color: 'var(--text-primary)' }}>Categories</a>
          <a href="/admin/contestants" style={{ color: 'var(--text-primary)' }}>Contestants</a>
          <a href="/admin/reports" style={{ color: 'var(--text-primary)' }}>Reports (Transactions)</a>
        </nav>
      </aside>
      <section style={{ flex: 1, paddingLeft: '40px' }}>
        {children}
      </section>
    </div>
  );
}
