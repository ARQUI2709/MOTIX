// utils/authDebug.js - Authentication Debug Utility
// Add this to help debug authentication issues

export const debugAuth = {
  // Log detailed auth state information
  logAuthState: (user, session, context = 'Unknown') => {
    console.group(`🔐 Auth Debug - ${context}`);
    
    console.log('📊 Auth State Summary:', {
      hasUser: !!user,
      hasSession: !!session,
      userID: user?.id || 'N/A',
      email: user?.email || 'N/A',
      sessionExpiry: session?.expires_at || 'N/A'
    });

    if (user) {
      console.log('👤 User Object:', {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata
      });
    }

    if (session) {
      console.log('🎫 Session Object:', {
        access_token: session.access_token ? `${session.access_token.substring(0, 20)}...` : 'N/A',
        refresh_token: session.refresh_token ? `${session.refresh_token.substring(0, 20)}...` : 'N/A',
        expires_at: session.expires_at,
        expires_in: session.expires_in,
        token_type: session.token_type
      });
    }

    console.groupEnd();
  },

  // Test API connection with current auth
  testApiConnection: async (session, endpoint = '/api/inspections') => {
    if (!session?.access_token) {
      console.error('❌ No session token available for API test');
      return { success: false, error: 'No session token' };
    }

    try {
      console.log(`🧪 Testing API connection to ${endpoint}...`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      console.log('📡 API Response:', {
        status: response.status,
        ok: response.ok,
        success: data.success,
        hasData: !!data.data,
        error: data.error
      });

      return {
        success: response.ok,
        status: response.status,
        data: data
      };

    } catch (error) {
      console.error('❌ API test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Validate token format
  validateToken: (token) => {
    if (!token) {
      return { valid: false, reason: 'Token is null or undefined' };
    }

    if (typeof token !== 'string') {
      return { valid: false, reason: 'Token is not a string' };
    }

    if (token.length < 20) {
      return { valid: false, reason: 'Token is too short' };
    }

    // Basic JWT format check (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, reason: 'Token is not in JWT format' };
    }

    try {
      // Try to decode the payload to check if it's valid JSON
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      return {
        valid: true,
        payload: {
          sub: payload.sub,
          email: payload.email,
          exp: payload.exp,
          iat: payload.iat,
          isExpired: payload.exp < now
        }
      };
    } catch (error) {
      return { valid: false, reason: 'Cannot decode token payload' };
    }
  },

  // Check if user needs to re-authenticate
  checkAuthStatus: (user, session) => {
    const issues = [];
    const warnings = [];

    if (!user) {
      issues.push('No user object available');
    }

    if (!session) {
      issues.push('No session object available');
    }

    if (session && !session.access_token) {
      issues.push('Session exists but no access token');
    }

    if (session?.access_token) {
      const tokenValidation = debugAuth.validateToken(session.access_token);
      if (!tokenValidation.valid) {
        issues.push(`Invalid token: ${tokenValidation.reason}`);
      } else if (tokenValidation.payload.isExpired) {
        issues.push('Token is expired');
      } else {
        // Check if token expires soon (within 5 minutes)
        const expiresIn = tokenValidation.payload.exp - Math.floor(Date.now() / 1000);
        if (expiresIn < 300) {
          warnings.push(`Token expires in ${Math.floor(expiresIn / 60)} minutes`);
        }
      }
    }

    if (user && session && user.id !== session.user?.id) {
      warnings.push('User ID mismatch between user object and session');
    }

    return {
      needsReauth: issues.length > 0,
      issues,
      warnings,
      status: issues.length > 0 ? 'ERROR' : warnings.length > 0 ? 'WARNING' : 'OK'
    };
  }
};

// React Hook for debugging auth in components
export const useAuthDebug = () => {
  const debugCurrentAuth = (context) => {
    // This should be used with your auth context
    // Example: const { user, session } = useAuth();
    // debugAuth.logAuthState(user, session, context);
    console.log('Use this with your auth context to debug current state');
  };

  return { debugCurrentAuth };
};

// Environment variables checker
export const checkEnvironmentSetup = () => {
  console.group('🔧 Environment Setup Check');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`${varName}:`, value ? '✅ Set' : '❌ Missing');
    
    if (value && varName.includes('SUPABASE_URL')) {
      console.log(`  URL format: ${value.startsWith('https://') ? '✅ Valid' : '❌ Invalid'}`);
    }
    
    if (value && varName.includes('KEY')) {
      console.log(`  Key length: ${value.length > 100 ? '✅ Valid' : '❌ Too short'}`);
    }
  });

  console.groupEnd();
};

// Database connection tester (for API routes)
export const testDatabaseConnection = async () => {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test connection with a simple query
    const { data, error } = await supabase
      .from('inspections')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return { success: false, error: error.message };
    }

    console.log('✅ Database connection successful');
    return { success: true, count: data };

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    return { success: false, error: error.message };
  }
};

export default debugAuth;