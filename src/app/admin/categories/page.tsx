import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function addCategory(formData: FormData) {
  'use server';
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  
  if (name) {
    await prisma.category.create({
      data: { name, description }
    });
    revalidatePath('/admin/categories');
    redirect('/admin/categories');
  }
}

export default async function AdminCategories() {
  const categories: { id: string; name: string; description: string | null; activeFlag: boolean }[] = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>Manage Categories</h1>
      
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '40px' }}>
        <h3>Add New Category</h3>
        <form action={addCategory} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px', maxWidth: '400px' }}>
          <input name="name" type="text" placeholder="Category Name" required style={{ padding: '10px', borderRadius: '5px' }} />
          <textarea name="description" placeholder="Description" rows={3} style={{ padding: '10px', borderRadius: '5px' }}></textarea>
          <button type="submit" className="btn-primary">Add Category</button>
        </form>
      </div>

      <h3>Existing Categories</h3>
      <table style={{ width: '100%', textAlign: 'left', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
            <th style={{ padding: '10px 0' }}>Name</th>
            <th>Description</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '15px 0' }}>{c.name}</td>
              <td>{c.description}</td>
              <td>{c.activeFlag ? 'Active' : 'Inactive'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
