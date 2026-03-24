/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Astrochat"

interface AccountDeletedProps {
  name?: string
  language?: string
}

const AccountDeletedEmail = ({ name, language }: AccountDeletedProps) => {
  const isGeo = language === 'ka'
  const userName = name || (isGeo ? 'მეგობარო' : 'there')

  return (
    <Html lang={isGeo ? 'ka' : 'en'} dir="ltr">
      <Head />
      <Preview>{isGeo ? 'შენი Astrochat ანგარიში წაიშალა' : 'Your Astrochat account has been deleted'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <div style={logoContainer}>
            <Text style={logoText}>✨ {SITE_NAME}</Text>
          </div>
          <Hr style={divider} />
          <Heading style={h1}>
            {isGeo ? `გამარჯობა ${userName}!` : `Hi ${userName}!`}
          </Heading>
          <Text style={text}>
            {isGeo
              ? 'შენი ანგარიში წარმატებით წაიშალა. თუ ეს შენ არ გაგიკეთებია, დაგვიკავშირდი: support@astrochat.ge'
              : 'Your account has been successfully deleted. If you did not do this, please contact us: support@astrochat.ge'
            }
          </Text>
          <Text style={footer}>
            {isGeo ? `– ${SITE_NAME}-ის გუნდი` : `– The ${SITE_NAME} Team`}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: AccountDeletedEmail,
  subject: (data: Record<string, any>) =>
    data?.language === 'ka'
      ? 'შენი Astrochat ანგარიში წაიშალა'
      : 'Your Astrochat account has been deleted',
  displayName: 'Account deleted',
  previewData: { name: 'Luna', language: 'en' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '480px', margin: '0 auto' }
const logoContainer = { textAlign: 'center' as const, marginBottom: '8px' }
const logoText = { fontSize: '20px', fontWeight: '700', color: '#d4a017', margin: '0' }
const divider = { borderColor: '#f0e6cc', margin: '16px 0 24px' }
const h1 = { fontSize: '22px', fontWeight: '600', color: '#1a1a2e', margin: '0 0 16px' }
const text = { fontSize: '16px', color: '#55575d', lineHeight: '1.6', margin: '0 0 24px' }
const footer = { fontSize: '13px', color: '#999999', margin: '32px 0 0' }
