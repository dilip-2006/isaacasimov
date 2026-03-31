// A mocked SMS service since there is no backend or Twilio API key provided

export const smsService = {
  sendSMS: async (mobileNumber: string, message: string) => {
    // In a real application, you would make an API call to your backend
    // which would use Twilio, AWS SNS, or MSG91 to send the actual SMS.
    
    console.log(`[Mock SMS] Sending to ${mobileNumber}: "${message}"`);
    
    // Simulate network delay
    return new Promise((resolve) => setTimeout(resolve, 800));
  }
};
