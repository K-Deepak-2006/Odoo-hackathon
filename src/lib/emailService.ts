import { supabase } from '@/integrations/supabase/client';

interface EmailNotificationData {
  to: string;
  subject: string;
  type: 'request_sent' | 'request_accepted' | 'request_rejected';
  requestData: {
    fromUserName: string;
    toUserName: string;
    message: string;
  };
}

export const sendEmailNotification = async (data: EmailNotificationData) => {
  try {
    // Call the Supabase Edge Function
    const { data: result, error } = await supabase.functions.invoke('send-email-notification', {
      body: data
    });

    if (error) {
      console.error('Error calling email function:', error);
      return { success: false, error: error.message };
    }

    console.log('Email notification sent:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending email notification:', error);
    return { success: false, error: 'Failed to send email notification' };
  }
};

// Helper function to get user email by ID
export const getUserEmail = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching user email:', error);
      return null;
    }

    return data.email;
  } catch (error) {
    console.error('Error fetching user email:', error);
    return null;
  }
};

// Function to manually trigger email notification (for testing or manual sends)
export const triggerEmailNotification = async (
  requestId: string,
  type: 'request_sent' | 'request_accepted' | 'request_rejected'
) => {
  try {
    // Get request details
    const { data: request, error: requestError } = await supabase
      .from('swap_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      console.error('Error fetching request:', requestError);
      return { success: false, error: 'Request not found' };
    }

    // Determine recipient based on notification type
    const recipientUserId = type === 'request_sent' ? request.to_user_id : request.from_user_id;
    const recipientEmail = await getUserEmail(recipientUserId);

    if (!recipientEmail) {
      return { success: false, error: 'Recipient email not found' };
    }

    // Prepare email data
    const emailData: EmailNotificationData = {
      to: recipientEmail,
      subject: getEmailSubject(type, request.from_user_name),
      type,
      requestData: {
        fromUserName: request.from_user_name,
        toUserName: request.to_user_name,
        message: request.message
      }
    };

    return await sendEmailNotification(emailData);
  } catch (error) {
    console.error('Error triggering email notification:', error);
    return { success: false, error: 'Failed to trigger email notification' };
  }
};

const getEmailSubject = (type: string, fromUserName: string): string => {
  switch (type) {
    case 'request_sent':
      return `New Skill Swap Request from ${fromUserName}`;
    case 'request_accepted':
      return 'Your skill swap request was accepted!';
    case 'request_rejected':
      return 'Update on your skill swap request';
    default:
      return 'SkillSwap Notification';
  }
};