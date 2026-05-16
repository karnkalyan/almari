/**
 * SMS Service to handle multiple providers
 */
class SmsService {
  constructor(config) {
    this.config = config;
  }

  async sendSms(to, message) {
    if (!this.config || !this.config.enabled) {
      console.log('SMS Service is disabled.');
      return { success: false, message: 'SMS Service is disabled.' };
    }

    const { provider } = this.config;

    try {
      switch (provider) {
        case 'aakash':
          return await this.sendAakashSms(to, message);
        case 'twilio':
          return await this.sendTwilioSms(to, message);
        case 'nexmo':
          return await this.sendNexmoSms(to, message);
        default:
          throw new Error(`Unsupported SMS provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Failed to send SMS via ${provider}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Aakash SMS (Nepal)
   * Documentation: https://sms.aakashsms.com/sms/v3/send
   */
  async sendAakashSms(to, message) {
    const { aakashToken } = this.config;
    if (!aakashToken) throw new Error('Aakash SMS Token is missing.');

    const response = await fetch('https://sms.aakashsms.com/sms/v3/send/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        auth_token: aakashToken,
        to: to,
        text: message
      })
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.message || 'Aakash SMS API error');
    }

    return { success: true, data };
  }

  async sendTwilioSms(to, message) {
    // Placeholder for Twilio integration
    console.log(`[Twilio Simulation] Sending to ${to}: ${message}`);
    return { success: true, simulation: true };
  }

  async sendNexmoSms(to, message) {
    // Placeholder for Nexmo integration
    console.log(`[Nexmo Simulation] Sending to ${to}: ${message}`);
    return { success: true, simulation: true };
  }
}

module.exports = SmsService;
