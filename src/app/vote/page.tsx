'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VoteForm() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const initialPhone = searchParams.get('phone') || '';
  const initialVotes = parseInt(searchParams.get('votes') || '1', 10);

  const [code, setCode] = useState(initialCode);
  const [phone, setPhone] = useState(initialPhone);
  const [votes, setVotes] = useState(initialVotes > 0 ? initialVotes : 1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'initiating' | 'pending' | 'success' | 'failed'>('idle');
  const [message, setMessage] = useState('');
  const [requestId, setRequestId] = useState('');

  // Polling logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'pending' && requestId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/vote/status/${requestId}`);
          const data = await res.json();
          if (data.status === 'paid' || data.status === 'success') {
            setStatus('success');
            setMessage('Payment received! Your vote has been counted.');
            clearInterval(interval);
          } else if (data.status === 'failed') {
            setStatus('failed');
            setMessage('Payment failed. Please try again.');
            clearInterval(interval);
          }
        } catch (error: unknown) {
          console.error('Polling error:', error);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [status, requestId]);

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('initiating');
    setMessage('Initiating STK Push...');

    try {
      const res = await fetch('/api/vote/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, candidate_code: code, votes })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initiate vote');
      }

      setRequestId(data.request_id);
      setStatus('pending');
      setMessage(data.message || 'Please check your phone and enter your M-Pesa PIN.');
    } catch (error: unknown) {
      setStatus('failed');
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '30px', maxWidth: '500px', margin: '40px auto' }}>
      <h2 className="gradient-text" style={{ textAlign: 'center', marginBottom: '20px', fontSize: '2rem' }}>
        Cast Your Vote
      </h2>

      {status === 'success' ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--success-color)', fontSize: '4rem', marginBottom: '10px' }}>✓</div>
          <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>{message}</p>
          <Link href="/categories">
            <button className="btn-primary">Back to Categories</button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleVote} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Candidate Code</label>
            <input 
              type="text" 
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. JONOE123"
              disabled={status === 'pending' || status === 'initiating'}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1rem' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>M-Pesa Phone Number</label>
            <input 
              type="tel" 
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07XXXXXXXX or 2547XXXXXXXX"
              disabled={status === 'pending' || status === 'initiating'}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1rem' }}
            />
            <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '5px' }}>
              Airtel Users: Please use a Safaricom number to pay via M-Pesa.
            </small>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Number of Votes (10 Ksh per vote)</label>
            <input 
              type="number" 
              required
              min="1"
              value={votes}
              onChange={(e) => setVotes(parseInt(e.target.value) || 1)}
              disabled={status === 'pending' || status === 'initiating'}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1rem' }}
            />
          </div>

          <div style={{ marginTop: '10px', fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'center' }}>
            Total: {votes * 10} Ksh
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={status === 'pending' || status === 'initiating'}
            style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
          >
            {loading ? <div className="spinner"></div> : null}
            {status === 'pending' || loading ? 'Awaiting Payment...' : 'Pay & Vote'}
          </button>

          {message && (status as string) !== 'success' && (
            <div style={{ 
              marginTop: '15px', 
              padding: '12px', 
              borderRadius: '8px', 
              backgroundColor: status === 'failed' ? 'rgba(242, 139, 130, 0.1)' : 'rgba(0, 229, 255, 0.1)',
              color: status === 'failed' ? 'var(--danger-color)' : 'var(--primary-color)',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}
        </form>
      )}
    </div>
  );
}

export default function VotePage() {
  return (
    <Suspense fallback={<div className="container" style={{ textAlign: 'center', padding: '40px' }}><div className="spinner"></div></div>}>
      <VoteForm />
    </Suspense>
  );
}
