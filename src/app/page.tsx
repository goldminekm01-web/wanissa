import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const revalidate = 10; // Revalidate this page every 10 seconds for live vote updates

export default async function Home() {
  const contestants = await prisma.contestant.findMany({
    where: {
      votesCount: { gt: 0 }, // Only show contestants who have at least 1 vote
    },
    include: {
      category: { select: { name: true } },
    },
    orderBy: { votesCount: 'desc' },
  });

  const totalVotes = contestants.reduce((sum, c) => sum + c.votesCount, 0);
  
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(0,229,255,0.12) 0%, rgba(177,72,210,0.12) 100%)',
          padding: '80px 20px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow blobs */}
        <div style={{
          position: 'absolute', top: '-100px', left: '20%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,229,255,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', right: '15%',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(177,72,210,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container animate-fade-in" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '50px',
            border: '1px solid rgba(0,229,255,0.4)',
            color: 'var(--primary-color)',
            fontSize: '0.85rem',
            fontWeight: '600',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}>
            🎉 Voting Now Open
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '800', marginBottom: '15px', lineHeight: 1.2 }}>
            <span className="gradient-text">Entertainment Awards</span><br />2026
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '520px', margin: '0 auto 30px' }}>
            Cast your vote for the best Artist, DJ, Photographer, Producer & Dance Crew. Every vote costs just 10 Ksh via M-Pesa.
          </p>
          <Link href="/categories">
            <button className="btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
              Browse Categories & Vote →
            </button>
          </Link>
        </div>
      </div>

      {/* Live Leaderboard */}
      <div className="container animate-fade-in" style={{ padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>
            🏆 Live Leaderboard
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {totalVotes > 0
              ? `${totalVotes.toLocaleString()} total votes cast — updated every 10 seconds`
              : 'No votes cast yet. Be the first to vote!'}
          </p>
        </div>

        {contestants.length === 0 ? (
          /* Empty state */
          <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎤</div>
            <h3 style={{ marginBottom: '10px' }}>No votes yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '25px' }}>
              The leaderboard will appear here as soon as voting begins.
            </p>
            <Link href="/categories">
              <button className="btn-primary">Start Voting Now</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '800px', margin: '0 auto' }}>
            {contestants.map((contestant, index) => {
              const percentage = totalVotes > 0 ? (contestant.votesCount / totalVotes) * 100 : 0;
              const isTop = index === 0;
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;

              return (
                <div
                  key={contestant.id}
                  className="glass-panel"
                  style={{
                    padding: '18px 24px',
                    display: 'grid',
                    gridTemplateColumns: '48px 56px 1fr auto',
                    alignItems: 'center',
                    gap: '16px',
                    border: isTop ? '1px solid rgba(0,229,255,0.4)' : '1px solid rgba(255,255,255,0.05)',
                    boxShadow: isTop ? '0 0 24px rgba(0,229,255,0.08)' : undefined,
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {/* Rank */}
                  <div style={{ fontSize: index < 3 ? '1.5rem' : '1.1rem', fontWeight: '700', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {medal}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: contestant.imageUrl
                      ? `url(${contestant.imageUrl}) center/cover`
                      : 'linear-gradient(135deg, rgba(0,229,255,0.3), rgba(177,72,210,0.3))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    flexShrink: 0,
                    border: isTop ? '2px solid rgba(0,229,255,0.6)' : '2px solid rgba(255,255,255,0.1)',
                  }}>
                    {!contestant.imageUrl && contestant.name.charAt(0)}
                  </div>

                  {/* Name + Progress */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '700', fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {contestant.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '20px', background: 'rgba(255,255,255,0.06)', whiteSpace: 'nowrap' }}>
                        {contestant.category.name}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: '600', letterSpacing: '1px' }}>
                        {contestant.code}
                      </span>
                    </div>
                    {/* Vote bar */}
                    <div style={{ marginTop: '8px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${percentage}%`,
                        background: isTop
                          ? 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))'
                          : 'rgba(0,229,255,0.5)',
                        borderRadius: '3px',
                        transition: 'width 0.8s ease',
                      }} />
                    </div>
                  </div>

                  {/* Votes count */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: '800', fontSize: '1.3rem', color: isTop ? 'var(--primary-color)' : 'var(--text-primary)' }}>
                      {contestant.votesCount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA below leaderboard */}
        {contestants.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link href="/categories">
              <button className="btn-primary">
                Vote Now — 10 Ksh per vote
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
