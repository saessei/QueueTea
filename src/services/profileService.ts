import defaultSupabase from "../lib/supabaseClient.ts";

export const profileService = {
  // Fetch current barista data
  async getProfile(userId: string, supabase = defaultSupabase) {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();
    
    if (error) {
      if (error.code === "PGRST116") return { full_name: "" };
      throw error;
    }
    return data || { full_name: "" };
  },

  // Update name
  async updateName(userId: string, name: string, supabase = defaultSupabase) {
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, full_name: name });
    if (error) throw error;
  },

  // Change password
  async updatePassword(newPassword: string, supabase = defaultSupabase) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  },
};