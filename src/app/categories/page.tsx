import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { activeFlag: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px' }}>
      <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '10px', textAlign: 'center' }}>
        Categories
      </h1>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '40px' }}>
        Select a category to view contestants and cast your vote.
      </p>

      {categories.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No active categories at the moment.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {categories.map((category: any) => (
            <div key={category.id} className="glass-panel" style={{ padding: '24px', transition: 'transform 0.3s ease' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{category.name}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>{category.description}</p>
              <Link href={`/categories/${category.id}`}>
                <button className="btn-primary" style={{ width: '100%' }}>View Contestants</button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
