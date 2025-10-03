'use server'

import { headers } from 'next/headers'

export async function getHost() {
  const headersList = await headers()
  // console.log('FULL HEADER LIST', JSON.stringify(headersList))
  const origin = headersList.get('host')
  return origin
}

export async function getEnvironemnt() {
  const host = await getHost()

  if (
    process.env.SCHEMEA_TO_USE === '' &&
    host &&
    host.startsWith('localhost')
  ) {
    return 'test'
  }

  if (host && host === 'loan-link-dev.vercel.app') {
    return 'test'
  }

  if (
    host &&
    (host === 'loan-status-hub.vercel.app' ||
      host === 'www.loanstatushub.firstcreditunion.co.nz' ||
      host === 'loanstatushub.firstcreditunion.co.nz' ||
      host === 'https://loanstatushub.firstcreditunion.co.nz')
  ) {
    return 'prod'
  }

  return 'test'
}

export async function getCreditSenseStoreCode() {
  const host = await getHost()

  if (
    process.env.SCHEMEA_TO_USE === '' &&
    host &&
    host.startsWith('localhost')
  ) {
    return process.env.CREDIT_SENSE_TEST_STORE!
  }

  if (host && host === 'loan-link-dev.vercel.app') {
    return process.env.CREDIT_SENSE_TEST_STORE!
  }

  if (
    host &&
    (host === 'loan-status-hub.vercel.app' ||
      host === 'www.loanstatushub.firstcreditunion.co.nz' ||
      host === 'loanstatushub.firstcreditunion.co.nz' ||
      host === 'https://loanstatushub.firstcreditunion.co.nz')
  ) {
    return process.env.CREDIT_SENSE_PROD_STORE!
  }

  return process.env.CREDIT_SENSE_TEST_STORE!
}

export async function getCreditSenseDebugBanks() {
  const host = await getHost()

  if (
    process.env.SCHEMEA_TO_USE === '' &&
    host &&
    host.startsWith('localhost')
  ) {
    return true
  }

  if (host && host === 'loan-link-dev.vercel.app') {
    return true
  }

  if (
    host &&
    (host === 'loan-status-hub.vercel.app' ||
      host === 'www.loanstatushub.firstcreditunion.co.nz' ||
      host === 'loanstatushub.firstcreditunion.co.nz' ||
      host === 'https://loanstatushub.firstcreditunion.co.nz')
  ) {
    return false
  }

  return true
}
