
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  projectType: string;
  budgetRange: string;
  message: string;
}

export const useContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitForm = async (formData: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      console.log("Submitting contact form:", formData);
      
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      if (error) {
        throw error;
      }

      console.log("Form submitted successfully:", data);
      
      toast({
        title: "Message sent successfully!",
        description: "Thank you for your message. We'll get back to you within 24 hours.",
      });

      return { success: true };
      
    } catch (error: any) {
      console.error("Error submitting form:", error);
      
      toast({
        title: "Error sending message",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });

      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitForm,
    isSubmitting
  };
};
