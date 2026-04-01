import { getSupabase } from './supabaseClient';

export type AssessmentType = 'ceklis' | 'anekdot' | 'hasil_karya' | 'foto_berseri';

export interface AssessmentData {
  id?: string;
  user_id: string;
  type: AssessmentType;
  data: any;
  created_at?: string;
  updated_at?: string;
}

export const assessmentService = {
  async saveAssessment(userId: string, type: AssessmentType, data: any, id?: string) {
    const supabase = getSupabase();
    if (!supabase) return null;

    const payload: any = {
      user_id: userId,
      type,
      data,
      updated_at: new Date().toISOString()
    };

    if (id) {
      payload.id = id;
    }

    const { data: result, error } = await supabase
      .from('assessments')
      .upsert(payload)
      .select();

    if (error) throw error;
    return result;
  },

  async getAssessments(userId: string, type?: AssessmentType) {
    const supabase = getSupabase();
    if (!supabase) return [];

    let query = supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as AssessmentData[];
  },

  async deleteAssessment(id: string) {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { error } = await supabase
      .from('assessments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};
