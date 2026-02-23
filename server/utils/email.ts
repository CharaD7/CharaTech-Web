import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

let transporter: Transporter | null = null

export const getEmailTransporter = () => {
  if (transporter) return transporter

  const config = useRuntimeConfig()

  transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: parseInt(config.smtpPort as string),
    secure: false,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
  })

  return transporter
}

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const config = useRuntimeConfig()
    const transporter = getEmailTransporter()

    await transporter.sendMail({
      from: config.emailFrom,
      to,
      subject,
      html,
    })

    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}
