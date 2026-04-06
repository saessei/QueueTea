import  supabase from '../config/supabaseClient.ts';

export const profileService = {
  // Fetch current barista data
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  // Update name
  async updateName(userId: string, fullName: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', userId);
    if (error) throw error;
  },

  // Change password
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  }
};