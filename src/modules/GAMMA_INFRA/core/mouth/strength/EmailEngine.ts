/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum Prime v28.1 - SENDGRID EMAIL ENGINE                               ║
 * ║  "Офертите заминават" - Automated Sales Email System                      ║
 * ║                                                                           ║
 * ║  📧 Automated outreach for Revenue Reaper protocol                        ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { EventEmitter } from 'events';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

export interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  trackOpens: boolean;
  trackClicks: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

export interface EmailRecipient {
  email: string;
  name?: string;
  company?: string;
  variables?: Record<string, string>;
}

export interface EmailCampaign {
  id: string;
  name: string;
  templateId: string;
  recipients: EmailRecipient[];
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  scheduledAt?: number;
  sentAt?: number;
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  recipient: string;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// SENDGRID ADAPTER
// ═══════════════════════════════════════════════════════════════════════════

class SendGridAdapter {
  private apiKey: string;
  private baseUrl = 'https://api.sendgrid.com/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Complexity: O(N)
  private async request(endpoint: string, method: string, body?: any): Promise<any> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    // SendGrid returns 202 for successful email send
    if (response.status === 202) {
      return { success: true, messageId: response.headers.get('X-Message-Id') };
    }

    if (!response.ok) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const error = await response.json().catch(() => ({}));
      throw new Error(error.errors?.[0]?.message || `SendGrid error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Send a single email
   */
  // Complexity: O(1)
  async sendEmail(
    to: EmailRecipient,
    from: { email: string; name: string },
    subject: string,
    htmlContent: string,
    textContent?: string,
    options?: {
      replyTo?: string;
      trackOpens?: boolean;
      trackClicks?: boolean;
      categories?: string[];
      customArgs?: Record<string, string>;
    }
  ): Promise<EmailResult> {
    const payload: any = {
      personalizations: [
        {
          to: [{ email: to.email, name: to.name }],
          ...(to.variables && { dynamic_template_data: to.variables }),
        },
      ],
      from: { email: from.email, name: from.name },
      subject,
      content: [
        ...(textContent ? [{ type: 'text/plain', value: textContent }] : []),
        { type: 'text/html', value: htmlContent },
      ],
      tracking_settings: {
        click_tracking: { enable: options?.trackClicks ?? true },
        open_tracking: { enable: options?.trackOpens ?? true },
      },
    };

    if (options?.replyTo) {
      payload.reply_to = { email: options.replyTo };
    }

    if (options?.categories) {
      payload.categories = options.categories;
    }

    if (options?.customArgs) {
      payload.personalizations[0].custom_args = options.customArgs;
    }

    try {
      const result = await this.request('/mail/send', 'POST', payload);
      return {
        success: true,
        messageId: result.messageId,
        recipient: to.email,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
        recipient: to.email,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Send bulk emails
   */
  // Complexity: O(1)
  async sendBulk(
    recipients: EmailRecipient[],
    from: { email: string; name: string },
    subject: string,
    htmlContent: string,
    textContent?: string
  ): Promise<EmailResult[]> {
    // SendGrid supports up to 1000 recipients per request
    const batchSize = 1000;
    const results: EmailResult[] = [];

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      const payload = {
        personalizations: batch.map((r) => ({
          to: [{ email: r.email, name: r.name }],
          ...(r.variables && { dynamic_template_data: r.variables }),
        })),
        from: { email: from.email, name: from.name },
        subject,
        content: [
          ...(textContent ? [{ type: 'text/plain', value: textContent }] : []),
          { type: 'text/html', value: htmlContent },
        ],
      };

      try {
        await this.request('/mail/send', 'POST', payload);
        batch.forEach((r) =>
          results.push({
            success: true,
            recipient: r.email,
            timestamp: Date.now(),
          })
        );
      } catch (error) {
        batch.forEach((r) =>
          results.push({
            success: false,
            error: String(error),
            recipient: r.email,
            timestamp: Date.now(),
          })
        );
      }

      // Rate limiting: wait between batches
      if (i + batchSize < recipients.length) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Send using a dynamic template
   */
  // Complexity: O(1)
  async sendWithTemplate(
    to: EmailRecipient,
    from: { email: string; name: string },
    templateId: string,
    dynamicData: Record<string, any>
  ): Promise<EmailResult> {
    const payload = {
      personalizations: [
        {
          to: [{ email: to.email, name: to.name }],
          dynamic_template_data: { ...dynamicData, ...to.variables },
        },
      ],
      from: { email: from.email, name: from.name },
      template_id: templateId,
    };

    try {
      const result = await this.request('/mail/send', 'POST', payload);
      return {
        success: true,
        messageId: result.messageId,
        recipient: to.email,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
        recipient: to.email,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Add contact to list
   */
  // Complexity: O(1)
  async addContact(
    email: string,
    firstName?: string,
    lastName?: string,
    customFields?: Record<string, string>
  ): Promise<void> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.request('/marketing/contacts', 'PUT', {
      contacts: [
        {
          email,
          first_name: firstName,
          last_name: lastName,
          custom_fields: customFields,
        },
      ],
    });
  }

  /**
   * Get email activity stats
   */
  // Complexity: O(N) — potential recursive descent
  async getStats(startDate: string, endDate: string): Promise<any> {
    return this.request(`/stats?start_date=${startDate}&end_date=${endDate}`, 'GET');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL ENGINE - SALES AUTOMATION
// ═══════════════════════════════════════════════════════════════════════════

export class EmailEngine extends EventEmitter {
  private sendgrid?: SendGridAdapter;
  private config?: EmailConfig;

  private templates: Map<string, EmailTemplate> = new Map();
  private campaigns: Map<string, EmailCampaign> = new Map();
  private sendQueue: Array<{ recipient: EmailRecipient; templateId: string; delay: number }> = [];

  // Stats
  private totalSent: number = 0;
  private totalDelivered: number = 0;
  private totalOpened: number = 0;
  private totalClicked: number = 0;

  // Rate limiting
  private lastSendTime: number = 0;
  private minSendInterval: number = 1000; // 1 second between emails

  constructor() {
    super();
    this.initializeDefaultTemplates();
    console.log('[EmailEngine] 📧 Initialized');
  }

  /**
   * Configure SendGrid
   */
  // Complexity: O(1) — hash/map lookup
  configure(config: EmailConfig): void {
    this.config = config;
    this.sendgrid = new SendGridAdapter(config.apiKey);
    console.log('[EmailEngine] ✅ SendGrid configured');
  }

  /**
   * Initialize default sales templates
   */
  // Complexity: O(1) — hash/map lookup
  private initializeDefaultTemplates(): void {
    // Bug Discovery Template
    this.templates.set('bug-discovery', {
      id: 'bug-discovery',
      name: 'Bug Discovery Outreach',
      subject: '🐛 Намерих критичен бъг на {{company_name}} - безплатен доклад',
      htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .bug-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚛️ QAntum Prime</h1>
      <p>Automated Quality Intelligence</p>
    </div>
    <div class="content">
      <p>Здравейте {{first_name}},</p>

      <p>Използвам AI-базирана QA платформа, която автоматично сканира уебсайтове за проблеми. Днес системата ми откри критичен бъг на <strong>{{company_name}}</strong>:</p>

      <div class="bug-box">
        <strong>🐛 Открит проблем:</strong><br>
        {{bug_description}}
        <br><br>
        <strong>📍 Локация:</strong> {{bug_location}}<br>
        <strong>⚠️ Severity:</strong> {{bug_severity}}
      </div>

      <p>Прикачам безплатен видео репорт, показващ проблема и неговото решение.</p>

      <p>Ако искате да обсъдим как QAntum може да предотврати подобни проблеми в бъдеще, с удоволствие ще ви покажа демо.</p>

      <a href="{{calendar_link}}" class="cta-button">📅 Запазете 15-минутно демо</a>

      <p>Приятен ден,<br>
      <strong>Димитър Продромов</strong><br>
      Founder, QAntum Prime</p>
    </div>
    <div class="footer">
      <p>© 2025 QAntum Prime | <a href="{{unsubscribe_link}}">Отписване</a></p>
    </div>
  </div>
</body>
</html>
      `,
      textContent: `Здравейте {{first_name}},

Използвам AI-базирана QA платформа, която автоматично сканира уебсайтове за проблеми.

Днес системата ми откри критичен бъг на {{company_name}}:

🐛 Проблем: {{bug_description}}
📍 Локация: {{bug_location}}
⚠️ Severity: {{bug_severity}}

Прикачам безплатен видео репорт. Ако искате демо на QAntum, пишете ми.

Приятен ден,
Димитър Продромов
Founder, QAntum Prime`,
      variables: [
        'first_name',
        'company_name',
        'bug_description',
        'bug_location',
        'bug_severity',
        'calendar_link',
        'unsubscribe_link',
      ],
    });

    // Follow-up Template
    this.templates.set('follow-up', {
      id: 'follow-up',
      name: 'Follow-up Email',
      subject: 'Re: 🐛 Бъгът на {{company_name}} - успяхте ли да го видите?',
      htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <p>Здравейте {{first_name}},</p>

    <p>Пиша отново относно бъга, който открих на {{company_name}} миналата седмица.</p>

    <p>Успяхте ли да прегледате видео репорта? Ако имате нужда от помощ с решението, мога да ви покажа как QAntum автоматизира целия процес.</p>

    <p>Кога ви е удобно за 15-минутен разговор?</p>

    <p>Поздрави,<br>
    Димитър</p>
  </div>
</body>
</html>
      `,
      textContent: `Здравейте {{first_name}},

Пиша отново относно бъга на {{company_name}}. Успяхте ли да видите видео репорта?

Кога ви е удобно за 15-минутен разговор?

Поздрави,
Димитър`,
      variables: ['first_name', 'company_name'],
    });

    // Pricing Template
    this.templates.set('pricing-offer', {
      id: 'pricing-offer',
      name: 'Pricing Offer',
      subject: '💎 Специална оферта за {{company_name}} - 50% отстъпка',
      htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .pricing-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0; }
    .price { font-size: 48px; font-weight: bold; }
    .original { text-decoration: line-through; opacity: 0.7; }
    .cta-button { display: inline-block; background: white; color: #667eea; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <p>Здравейте {{first_name}},</p>

    <p>Благодаря за интереса към QAntum! Като благодарност за отделеното време, ви предлагам ексклузивна оферта:</p>

    <div class="pricing-box">
      <p class="original">$199/месец</p>
      <p class="price">$99/месец</p>
      <p>Enterprise Plan - първите 3 месеца</p>
      <br>
      <a href="{{checkout_link}}" class="cta-button">🚀 Активирай сега</a>
    </div>

    <p><strong>Включено:</strong></p>
    <ul>
      <li>✅ Неограничени QA сканирания</li>
      <li>✅ AI-генерирани репорти</li>
      <li>✅ Автоматизирана регресия</li>
      <li>✅ 24/7 мониторинг</li>
      <li>✅ Приоритетна поддръжка</li>
    </ul>

    <p>Офертата е валидна до {{expiry_date}}.</p>

    <p>Поздрави,<br>
    Димитър</p>
  </div>
</body>
</html>
      `,
      textContent: `Здравейте {{first_name}},

Ексклузивна оферта за {{company_name}}:

Enterprise Plan: $99/месец (вместо $199)

Включено:
- Неограничени QA сканирания
- AI-генерирани репорти
- Автоматизирана регресия
- 24/7 мониторинг

Линк: {{checkout_link}}

Офертата е валидна до {{expiry_date}}.

Поздрави,
Димитър`,
      variables: ['first_name', 'company_name', 'checkout_link', 'expiry_date'],
    });
  }

  /**
   * Send a single email using template
   */
  // Complexity: O(1)
  async sendEmail(
    templateId: string,
    recipient: EmailRecipient,
    variables: Record<string, string> = {}
  ): Promise<EmailResult> {
    if (!this.sendgrid || !this.config) {
      throw new Error('SendGrid not configured');
    }

    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Rate limiting
    const now = Date.now();
    const timeSinceLastSend = now - this.lastSendTime;
    if (timeSinceLastSend < this.minSendInterval) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await new Promise((resolve) => setTimeout(resolve, this.minSendInterval - timeSinceLastSend));
    }
    this.lastSendTime = Date.now();

    // Merge variables
    const allVariables = { ...recipient.variables, ...variables };

    // Replace variables in template
    let subject = template.subject;
    let htmlContent = template.htmlContent;
    let textContent = template.textContent;

    for (const [key, value] of Object.entries(allVariables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      htmlContent = htmlContent.replace(regex, value);
      textContent = textContent.replace(regex, value);
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await this.sendgrid.sendEmail(
      recipient,
      { email: this.config.fromEmail, name: this.config.fromName },
      subject,
      htmlContent,
      textContent,
      {
        replyTo: this.config.replyTo,
        trackOpens: this.config.trackOpens,
        trackClicks: this.config.trackClicks,
        categories: ['QAntum', templateId],
      }
    );

    if (result.success) {
      this.totalSent++;
      console.log(`[EmailEngine] ✅ Email sent to ${recipient.email}`);
    } else {
      console.error(`[EmailEngine] ❌ Failed to send to ${recipient.email}: ${result.error}`);
    }

    this.emit('email-sent', result);
    return result;
  }

  /**
   * Create a campaign
   */
  // Complexity: O(1) — hash/map lookup
  createCampaign(name: string, templateId: string, recipients: EmailRecipient[]): EmailCampaign {
    const campaign: EmailCampaign = {
      id: `CAMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      templateId,
      recipients,
      status: 'draft',
      stats: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
      },
    };

    this.campaigns.set(campaign.id, campaign);
    console.log(`[EmailEngine] 📋 Campaign created: ${name} (${recipients.length} recipients)`);

    return campaign;
  }

  /**
   * Run a campaign
   */
  // Complexity: O(N) — linear iteration
  async runCampaign(campaignId: string, delayBetweenEmails: number = 5000): Promise<EmailResult[]> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    campaign.status = 'sending';
    campaign.sentAt = Date.now();

    const results: EmailResult[] = [];

    console.log(`[EmailEngine] 🚀 Starting campaign: ${campaign.name}`);

    for (const recipient of campaign.recipients) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const result = await this.sendEmail(campaign.templateId, recipient);
      results.push(result);
      campaign.stats.sent++;

      if (result.success) {
        campaign.stats.delivered++;
      } else {
        campaign.stats.bounced++;
      }

      // Delay between emails to avoid rate limits
      // SAFETY: async operation — wrap in try-catch for production resilience
      await new Promise((resolve) => setTimeout(resolve, delayBetweenEmails));
    }

    campaign.status = 'sent';
    console.log(
      `[EmailEngine] ✅ Campaign completed: ${campaign.stats.sent} sent, ${campaign.stats.delivered} delivered`
    );

    this.emit('campaign-completed', { campaign, results });
    return results;
  }

  /**
   * Send bug discovery email to a lead
   */
  // Complexity: O(1)
  async sendBugDiscoveryEmail(
    email: string,
    firstName: string,
    companyName: string,
    bugDescription: string,
    bugLocation: string,
    bugSeverity: 'Critical' | 'High' | 'Medium' | 'Low'
  ): Promise<EmailResult> {
    return this.sendEmail(
      'bug-discovery',
      { email, name: firstName, company: companyName },
      {
        first_name: firstName,
        company_name: companyName,
        bug_description: bugDescription,
        bug_location: bugLocation,
        bug_severity: bugSeverity,
        calendar_link: 'https://calendly.com/QAntum-demo/15min',
        unsubscribe_link: `https://QAntum.pro/unsubscribe?email=${encodeURIComponent(email)}`,
      }
    );
  }

  /**
   * Add custom template
   */
  // Complexity: O(1) — hash/map lookup
  addTemplate(template: EmailTemplate): void {
    this.templates.set(template.id, template);
    console.log(`[EmailEngine] 📝 Template added: ${template.name}`);
  }

  /**
   * Get stats
   */
  // Complexity: O(1) — amortized
  getStats(): {
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    openRate: number;
    clickRate: number;
    campaigns: number;
    templates: number;
  } {
    return {
      totalSent: this.totalSent,
      totalDelivered: this.totalDelivered,
      totalOpened: this.totalOpened,
      totalClicked: this.totalClicked,
      openRate: this.totalDelivered > 0 ? (this.totalOpened / this.totalDelivered) * 100 : 0,
      clickRate: this.totalOpened > 0 ? (this.totalClicked / this.totalOpened) * 100 : 0,
      campaigns: this.campaigns.size,
      templates: this.templates.size,
    };
  }

  /**
   * Update stats from webhook
   */
  // Complexity: O(N) — linear iteration
  handleWebhook(events: Array<{ event: string; email: string; timestamp: number }>): void {
    for (const event of events) {
      switch (event.event) {
        case 'delivered':
          this.totalDelivered++;
          break;
        case 'open':
          this.totalOpened++;
          break;
        case 'click':
          this.totalClicked++;
          break;
      }
    }

    this.emit('webhook-processed', events);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const emailEngine = new EmailEngine();

export default EmailEngine;
