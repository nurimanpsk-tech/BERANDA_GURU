import { getSupabase } from './supabaseClient';

export const appSettingsService = {
  async getMaintenanceMode(): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .single();

      if (error) {
        // If table doesn't exist or key not found, default to false
        return false;
      }

      return data.value === 'true';
    } catch (err) {
      console.error('Maintenance mode fetch error:', err);
      return false;
    }
  },

  async setMaintenanceMode(enabled: boolean): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ 
          key: 'maintenance_mode', 
          value: String(enabled),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (error) throw error;
    } catch (err) {
      console.error('Error setting maintenance mode:', err);
      throw err;
    }
  }
};
