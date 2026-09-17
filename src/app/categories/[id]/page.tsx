import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CategoryContestantsPage({ params }: { params: { id: string } }) {
  const category = await prisma.category.findUnique({
    where: { id: params.id },
    include: {
      contestants: {
        orderBy: { name: 'asc' }
      }
    }
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px' }}>
      <Link href="/categories" style={{ display: 'inline-block', marginBottom: '20px', color: 'var(--text-secondary)' }}>
        &larr; Back to Categories
      </Link>
      <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
        {category.name}
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>{category.description}</p>

      {category.contestants.length === 0 ? (
        <p>No contestants found in this category.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {category.contestants.map(contestant => (
            <div key={contestant.id} className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                margin: '0 auto 15px',
                backgroundImage: contestant.imageUrl ? `url(${contestant.imageUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                {!contestant.imageUrl && <span style={{ lineHeight: '120px', color: '#666' }}>No Image</span>}
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{contestant.name}</h3>
              <p style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '10px' }}>
                Code: {contestant.code}
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', minHeight: '40px' }}>
                {contestant.bio || 'No bio available.'}
              </p>
              <Link href={`/vote?code=${contestant.code}`}>
                <button className="btn-primary" style={{ width: '100%', padding: '10px' }}>Vote (10 Ksh)</button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
