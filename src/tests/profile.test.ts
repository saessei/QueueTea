import { it, expect, describe, afterAll } from 'vitest';
import { profileService } from '../services/profileService';
import { supabaseTest, supabaseAdmin } from '../lib/supabaseTestClient';

describe('Password Management (Happy Path)', () => {
  const tempEmail = `barista-${Date.now()}@test.com`; // Unique email every time
  const tempPassword = 'OldPassword123!';
  const newPassword = 'NewSecurePassword456!';
  let userId: string | undefined;

  it('should successfully update password for an authenticated user', async () => {
    // 
    const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email: tempEmail,
      password: tempPassword,
      email_confirm: true 
    });

    if (adminError) throw adminError;
    userId = adminData.user?.id;

    // Sign in
    const { error: signInError } = await supabaseTest.auth.signInWithPassword({
      email: tempEmail,
      password: tempPassword,
    });
    
    if (signInError) throw signInError;

    // Update password via servic
    await profileService.updatePassword(newPassword, supabaseTest);

    // verify update password
    const { data: verifyData, error: verifyError } = await supabaseTest.auth.signInWithPassword({
      email: tempEmail,
      password: newPassword,
    });

    expect(verifyError).toBeNull();
    expect(verifyData.user?.email).toBe(tempEmail);
  });

  afterAll(async () => {
    if (userId) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    }
  });
});