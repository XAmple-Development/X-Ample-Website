
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { contactFormSchema, sanitizeInput, checkRateLimit, type ContactFormData } from '@/utils/validation';

export const useSecureContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitForm = async (formData: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      // Rate limiting check
      const clientId = 'contact_form'; // In production, use IP or user identifier
      if (!checkRateLimit(clientId, 3, 300000)) { // 3 submissions per 5 minutes
        toast({
          title: "Rate limit exceeded",
          description: "Please wait before submitting another message.",
          variant: "destructive"
        });
        return { success: false };
      }

      // Validate form data
      const validationResult = contactFormSchema.safeParse(formData);
      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive"
        });
        return { success: false };
      }

      // Sanitize inputs
      const sanitizedData = {
        ...validationResult.data,
        firstName: sanitizeInput(validationResult.data.firstName),
        lastName: sanitizeInput(validationResult.data.lastName),
        email: sanitizeInput(validationResult.data.email),
        message: sanitizeInput(validationResult.data.message),
        projectType: validationResult.data.projectType ? sanitizeInput(validationResult.data.projectType) : '',
        budgetRange: validationResult.data.budgetRange ? sanitizeInput(validationResult.data.budgetRange) : ''
      };

      // Submit to Supabase edge function
      const response = await fetch('/api/send-contact-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });

      return { success: true };
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: "Error sending message",
        description: "Please try again later or contact us directly.",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitForm, isSubmitting };
};
