
import { z } from 'zod';

// Contact form validation schema
export const contactFormSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .max(254, 'Email address is too long'),
  
  projectType: z.string()
    .optional(),
  
  budgetRange: z.string()
    .optional(),
  
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters')
    .regex(/^[^<>]*$/, 'Message contains invalid characters')
});

// Project creation validation schema
export const projectSchema = z.object({
  title: z.string()
    .min(1, 'Project title is required')
    .max(100, 'Title must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_.,!?()]+$/, 'Title contains invalid characters'),
  
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  
  category: z.enum(['fivem', 'roblox', 'web', 'discord'], {
    errorMap: () => ({ message: 'Please select a valid category' })
  })
});

// Input sanitization utility
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
};

// Rate limiting for form submissions
const submissionTimes = new Map<string, number[]>();

export const checkRateLimit = (identifier: string, maxSubmissions = 3, windowMs = 300000): boolean => {
  const now = Date.now();
  const submissions = submissionTimes.get(identifier) || [];
  
  // Remove old submissions outside the window
  const recentSubmissions = submissions.filter(time => now - time < windowMs);
  
  if (recentSubmissions.length >= maxSubmissions) {
    return false; // Rate limit exceeded
  }
  
  recentSubmissions.push(now);
  submissionTimes.set(identifier, recentSubmissions);
  return true;
};

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
