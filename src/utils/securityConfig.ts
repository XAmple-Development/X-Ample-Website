
// Security configuration for production environment
export const SECURITY_CONFIG = {
  // Rate limiting configuration
  RATE_LIMITS: {
    CONTACT_FORM: {
      maxSubmissions: 3,
      windowMs: 300000, // 5 minutes
    },
    PROJECT_CREATION: {
      maxSubmissions: 10,
      windowMs: 3600000, // 1 hour
    },
  },
  
  // Input validation limits
  INPUT_LIMITS: {
    NAME_MAX_LENGTH: 50,
    EMAIL_MAX_LENGTH: 254,
    MESSAGE_MAX_LENGTH: 2000,
    PROJECT_TITLE_MAX_LENGTH: 100,
    PROJECT_DESCRIPTION_MAX_LENGTH: 1000,
  },
  
  // Content Security Policy headers (for future implementation)
  CSP_DIRECTIVES: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:"],
    scriptSrc: ["'self'"],
    connectSrc: ["'self'", "https://dzcezcoivezflchsewhq.supabase.co"],
  },
  
  // CORS configuration
  CORS_CONFIG: {
    allowedOrigins: ['https://ample-code-forge.lovable.app'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
};

// Security utility functions
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const validateCSRFToken = (token: string): boolean => {
  // In a real implementation, this would validate against a stored token
  // For now, we'll implement basic validation
  return token && token.length >= 32;
};

// Environment-based logging configuration
export const shouldLogSecurityEvents = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export const logSecurityEvent = (event: string, details: any) => {
  if (shouldLogSecurityEvents()) {
    console.log(`[SECURITY] ${event}:`, details);
  }
};
