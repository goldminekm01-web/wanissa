import { prisma } from '@/lib/prisma';

export default async function AdminDashboard() {
  const categoriesCount = await prisma.category.count();
  const contestantsCount = await prisma.candidate.count();
  const transactionsCount = await prisma.transaction.count({ where: { status: 'success' } });
  const totalRevenueData = await prisma.transaction.aggregate({
    where: { status: 'success' },
    _sum: { amount: true }
  });
  
  const totalRevenue = totalRevenueData._sum.amount || 0;

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', marginBottom: '30px' }}>Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Total Revenue</h3>
          <p style={{ fontSize: '2rem', color: 'var(--success-color)', fontWeight: 'bold' }}>{totalRevenue} Ksh</p>
        </div>
        
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Successful Transactions</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{transactionsCount}</p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Categories</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{categoriesCount}</p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Contestants</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{contestantsCount}</p>
        </div>
      </div>
    </div>
  );
}
