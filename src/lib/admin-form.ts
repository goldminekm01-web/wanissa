'use server';

import { authenticateAdmin } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';

export async function loginForm(formData: FormData) {
  'use server';
  
  const result = await authenticateAdmin(formData);
  
  if (result.error) {
    redirect(`/admin/login?error=${encodeURIComponent(result.error)}`);
  }
  
  redirect('/admin');
}
