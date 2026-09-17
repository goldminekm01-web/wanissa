import { loginForm } from '@/lib/admin-form';

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const errorMessage = searchParams.error || '';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h1 style={{
          textAlign: 'center',
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '10px',
          color: '#fff'
        }}>
          Admin Login
        </h1>
        
        <p style={{
          textAlign: 'center',
          color: '#666',
          fontSize: '0.9rem',
          marginBottom: '30px'
        }}>
          Enter your credentials to access the admin dashboard
        </p>

        <form action={loginForm} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {errorMessage && (
            <div style={{
              background: '#ff4444',
              color: '#fff',
              padding: '10px',
              borderRadius: '5px',
              fontSize: '0.9rem'
            }}>
              {errorMessage}
            </div>
          )}

          <div>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              color: '#aaa',
              fontSize: '0.85rem'
            }}>
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff'
              }}
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              color: '#aaa',
              fontSize: '0.85rem'
            }}>
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff'
              }}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              padding: '12px',
              borderRadius: '5px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
