/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Astrochat"

interface WelcomeEmailProps {
  name?: string
  language?: string
}

const WelcomeEmailComponent = ({ name, language }: WelcomeEmailProps) => {
  const isGeo = language === 'ka'
  const userName = name || (isGeo ? 'მეგობარო' : 'there')

  return (
    <Html lang={isGeo ? 'ka' : 'en'} dir="ltr">
      <Head />
      <Preview>{isGeo ? `მოგესალმები ${SITE_NAME}-ში! ✨` : `Welcome to ${SITE_NAME}! ✨`}</Preview>
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
              ? `მოხარული ვართ, რომ შეგვიერთდი! 🌟 ${SITE_NAME} დაგეხმარება შენი კოსმიური ბედისწერის აღმოჩენაში.`
              : `Welcome to ${SITE_NAME}! 🌟 Your cosmic journey starts now.`
            }
          </Text>
          <Button style={button} href="https://astrochat.ge">
            {isGeo ? 'დაიწყე ახლავე' : 'Get Started'}
          </Button>
          <Text style={footer}>
            {isGeo
              ? `– ${SITE_NAME}-ის გუნდი`
              : `– The ${SITE_NAME} Team`
            }
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: WelcomeEmailComponent,
  subject: (data: Record<string, any>) =>
    data?.language === 'ka'
      ? `მოგესალმები ${SITE_NAME}-ში! ✨`
      : `Welcome to ${SITE_NAME}! ✨`,
  displayName: 'Welcome email',
  previewData: { name: 'Luna', language: 'en' },
} satisfies TemplateEntry

// Styles — gold (#d4a017) accent on white background
const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '480px', margin: '0 auto' }
const logoContainer = { textAlign: 'center' as const, marginBottom: '8px' }
const logoText = { fontSize: '20px', fontWeight: '700', color: '#d4a017', margin: '0' }
const divider = { borderColor: '#f0e6cc', margin: '16px 0 24px' }
const h1 = { fontSize: '22px', fontWeight: '600', color: '#1a1a2e', margin: '0 0 16px' }
const text = { fontSize: '16px', color: '#55575d', lineHeight: '1.6', margin: '0 0 24px' }
const button = {
  backgroundColor: '#d4a017',
  color: '#1a1a2e',
  padding: '12px 28px',
  borderRadius: '12px',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
}
const footer = { fontSize: '13px', color: '#999999', margin: '32px 0 0' }
