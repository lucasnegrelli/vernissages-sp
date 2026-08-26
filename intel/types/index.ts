export type SubscriberStatus = "pending" | "active" | "past_due" | "canceled";

export interface Subscriber {
  id: string;
  email: string;
  status: SubscriberStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  activated_at: string | null;
  canceled_at: string | null;
}

export interface NewsletterSection {
  heading: string;
  body: string;
}

export interface NewsletterIssue {
  id: string;
  issue_number: number;
  subject: string;
  preview_text: string;
  intro: string;
  sections: NewsletterSection[];
  market_read: string;
  scheduled_for: string;
  sent_at: string | null;
}
