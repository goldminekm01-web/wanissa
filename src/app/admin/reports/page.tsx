import { prisma } from '@/lib/prisma';

export default async function AdminReports() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50 // Limit to recent 50 for MVP
  });

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>Transaction Reports</h1>
      
      <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
              <th style={{ padding: '10px 0' }}>Date</th>
              <th>Phone</th>
              <th>Receipt / Tx ID</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '15px 0' }}>{new Date(t.createdAt).toLocaleString()}</td>
                <td>{t.phone}</td>
                <td>{t.mpesaTransactionId}</td>
                <td>{t.amount} Ksh</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.8rem',
                    backgroundColor: t.status === 'success' ? 'rgba(129, 201, 149, 0.2)' : 'rgba(242, 139, 130, 0.2)',
                    color: t.status === 'success' ? 'var(--success-color)' : 'var(--danger-color)'
                  }}>
                    {t.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
