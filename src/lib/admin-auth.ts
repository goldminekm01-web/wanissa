import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function authenticateAdmin(formData: FormData) {
  'use server';
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  if (!email || !password) {
    return { error: 'Email and password are required' };
  }
  
  const admin = await prisma.adminUser.findUnique({
    where: { email }
  });
  
  if (!admin) {
    return { error: 'Invalid email or password' };
  }
  
  // Simple password comparison (in production, use bcrypt)
  if (admin.passwordHash !== password) {
    return { error: 'Invalid email or password' };
  }
  
  // Set auth cookie
  cookies().set('admin_auth', admin.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
  
  return { success: true };
}

export async function logoutAdmin() {
  'use server';
  cookies().delete('admin_auth');
  redirect('/admin/login');
}

export async function getAdminSession() {
  const cookieStore = cookies();
  const adminId = cookieStore.get('admin_auth');
  
  if (!adminId) {
    return null;
  }
  
  const admin = await prisma.adminUser.findUnique({
    where: { id: adminId.value }
  });
  
  return admin;
}

export async function requireAdmin() {
  const admin = await getAdminSession();
  
  if (!admin) {
    redirect('/admin/login');
  }
  
  return admin;
}
