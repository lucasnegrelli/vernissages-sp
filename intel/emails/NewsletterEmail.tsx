import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { NewsletterIssue } from "@/types";

interface NewsletterEmailProps {
  issue: NewsletterIssue;
}

export function NewsletterEmail({ issue }: NewsletterEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{issue.preview_text}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Text style={styles.kicker}>
            VERNISSAGES SP: INTEL — EDIÇÃO Nº {issue.issue_number}
          </Text>
          <Heading style={styles.heading}>{issue.subject}</Heading>
          <Text style={styles.paragraph}>{issue.intro}</Text>

          <Hr style={styles.hr} />

          {issue.sections.map((section, index) => (
            <Section key={index} style={styles.section}>
              <Heading as="h2" style={styles.subheading}>
                {section.heading}
              </Heading>
              <Text style={styles.paragraph}>{section.body}</Text>
            </Section>
          ))}

          <Hr style={styles.hr} />

          <Section style={styles.marketRead}>
            <Text style={styles.kicker}>LEITURA DE MERCADO</Text>
            <Text style={styles.paragraph}>{issue.market_read}</Text>
          </Section>

          <Text style={styles.footer}>
            Você recebe este e-mail porque assina o Vernissages SP: Intel.
            Gerencie ou cancele sua assinatura a qualquer momento pelo
            portal de faturamento enviado no seu e-mail de confirmação.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  main: {
    backgroundColor: "#0a0a0a",
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  container: {
    margin: "0 auto",
    padding: "40px 24px",
    maxWidth: "600px",
  },
  kicker: {
    color: "#c9a227",
    fontSize: "11px",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    fontFamily: "Helvetica, Arial, sans-serif",
  },
  heading: {
    color: "#f5f5f0",
    fontSize: "28px",
    lineHeight: "1.3",
    margin: "8px 0 20px",
  },
  subheading: {
    color: "#f5f5f0",
    fontSize: "18px",
    margin: "0 0 8px",
  },
  paragraph: {
    color: "#c7c7c0",
    fontSize: "15px",
    lineHeight: "1.6",
  },
  section: {
    margin: "24px 0",
  },
  marketRead: {
    backgroundColor: "#141414",
    padding: "20px",
    borderLeft: "3px solid #c9a227",
  },
  hr: {
    borderColor: "#262626",
    margin: "24px 0",
  },
  footer: {
    color: "#5a5a54",
    fontSize: "12px",
    marginTop: "32px",
    fontFamily: "Helvetica, Arial, sans-serif",
  },
};

export default NewsletterEmail;
