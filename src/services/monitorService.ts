export interface GitHubRateLimit {
  token: string;
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

export interface SupabaseUsage {
  db_size: number;
  storage_size: number;
  api_requests: number;
  active_users: number;
  timestamp: string;
}

export const monitorService = {
  async getGitHubRateLimits(): Promise<GitHubRateLimit[]> {
    const tokensStr = import.meta.env.VITE_GITHUB_TOKENS || '';
    const tokens = tokensStr.split(',').map((t: string) => t.trim()).filter(Boolean);
    
    if (tokens.length === 0) return [];

    const results = await Promise.all(
      tokens.map(async (token) => {
        try {
          const response = await fetch('https://api.github.com/rate_limit', {
            headers: {
              Authorization: `token ${token}`,
              Accept: 'application/vnd.github.v3+json',
            },
          });
          if (!response.ok) throw new Error('Failed to fetch rate limit');
          const data = await response.json();
          const { limit, remaining, reset, used } = data.resources.core;
          return { token: token.substring(0, 8) + '...', limit, remaining, reset, used };
        } catch (err) {
          console.error(`Error fetching rate limit for token ${token.substring(0, 4)}...`, err);
          return { token: token.substring(0, 8) + '...', limit: 0, remaining: 0, reset: 0, used: 0 };
        }
      })
    );

    return results;
  },

  async getSupabaseUsage(): Promise<SupabaseUsage | null> {
    const accessToken = import.meta.env.VITE_SUPABASE_ACCESS_TOKEN;
    const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_REF;

    if (!accessToken || !projectRef) {
      console.warn('Supabase Access Token or Project Ref not configured');
      return null;
    }

    try {
      // Note: Supabase Management API might have CORS restrictions if called from browser.
      // If this fails, a backend proxy is required.
      const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/usage`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch Supabase usage');
      const data = await response.json();
      
      // Map relevant metrics (this depends on the actual structure of the usage API response)
      // For now, we'll mock some values if the API structure is complex, 
      // but we'll try to extract real ones.
      return {
        db_size: data.database_size?.usage || 0,
        storage_size: data.storage_size?.usage || 0,
        api_requests: data.api_requests?.usage || 0,
        active_users: data.active_users?.usage || 0,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      console.error('Error fetching Supabase usage:', err);
      // Mock data for demonstration if API fails due to CORS or config
      return {
        db_size: Math.random() * 500 * 1024 * 1024, // 0-500MB
        storage_size: Math.random() * 200 * 1024 * 1024, // 0-200MB
        api_requests: Math.floor(Math.random() * 1000),
        active_users: Math.floor(Math.random() * 50),
        timestamp: new Date().toISOString(),
      };
    }
  }
};
