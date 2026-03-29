import { getSupabase } from './supabaseClient';
import { PPMData } from '../types';

export const ppmService = {
  async savePPM(data: PPMData, userId: string) {
    const supabase = getSupabase();
    if (!supabase) {
      console.warn('Supabase not configured. Skipping save.');
      return null;
    }

    // Create a more unique ID using userId, theme, subtheme, and date
    const uniqueId = `${userId}_${data.informasiUmum.tema}_${data.informasiUmum.subTema}_${data.informasiUmum.hariTanggal}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');

    const { data: result, error } = await supabase
      .from('ppm_data')
      .upsert({ 
        id: uniqueId,
        user_id: userId,
        data: data,
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) throw error;
    return result;
  },

  async getLatestPPM(userId: string) {
    const supabase = getSupabase();
    if (!supabase || !userId) return null;

    const { data, error } = await supabase
      .from('ppm_data')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return data?.data as PPMData | null;
  },

  async getAllPPM(userId: string) {
    const supabase = getSupabase();
    if (!supabase || !userId) return [];

    const { data, error } = await supabase
      .from('ppm_data')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data.map(item => item.data as PPMData);
  }
};
