import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { generateCandidateCode } from '@/lib/utils';

async function addContestant(formData: FormData) {
  'use server';
  const name = formData.get('name') as string;
  const categoryId = formData.get('categoryId') as string;
  const bio = formData.get('bio') as string;
  const imageUrl = formData.get('imageUrl') as string;
  
  if (name && categoryId) {
    const code = generateCandidateCode(name);
    await prisma.contestant.create({
      data: { name, categoryId, bio, imageUrl, code }
    });
    revalidatePath('/admin/contestants');
  }
}

export default async function AdminContestants() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  const contestants = await prisma.contestant.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>Manage Contestants</h1>
      
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '40px' }}>
        <h3>Add New Contestant</h3>
        <form action={addContestant} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px', maxWidth: '400px' }}>
          <input name="name" type="text" placeholder="Contestant Name" required style={{ padding: '10px', borderRadius: '5px' }} />
          <select name="categoryId" required style={{ padding: '10px', borderRadius: '5px' }}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <textarea name="bio" placeholder="Bio" rows={3} style={{ padding: '10px', borderRadius: '5px' }}></textarea>
          <input name="imageUrl" type="url" placeholder="Image URL (e.g. https://imgur.com/...)" style={{ padding: '10px', borderRadius: '5px' }} />
          <button type="submit" className="btn-primary">Add Contestant</button>
        </form>
      </div>

      <h3>Existing Contestants</h3>
      <table style={{ width: '100%', textAlign: 'left', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
            <th style={{ padding: '10px 0' }}>Name</th>
            <th>Category</th>
            <th>Vote Code</th>
            <th>Total Votes</th>
          </tr>
        </thead>
        <tbody>
          {contestants.map(c => (
            <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {c.imageUrl && <img src={c.imageUrl} alt={c.name} style={{ width: '30px', height: '30px', borderRadius: '50%' }} />}
                {c.name}
              </td>
              <td>{c.category.name}</td>
              <td style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{c.code}</td>
              <td>{c.votesCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
