import { getHost } from './globalUtils'

type Schema = 'api' | 'production'

// export async function getHost() {
//   const headersList = await headers()
//   // console.log('FULL HEADER LIST', JSON.stringify(headersList))
//   const origin = headersList.get('host')
//   return origin
// }

export async function getSchemaToUse(): Promise<Schema> {
  //   const origin = await getOrigin()
  const host = await getHost()

  console.log('Host: ', host)

  if (host && host.startsWith('localhost')) {
    return 'api'
  }

  if (host && host === 'loan-link-dev.vercel.app') {
    return 'api'
  }

  if (
    host &&
    (host === 'loan-status-hub.vercel.app' ||
      host === 'www.loanstatushub.firstcreditunion.co.nz' ||
      host === 'loanstatushub.firstcreditunion.co.nz' ||
      host === 'https://loanstatushub.firstcreditunion.co.nz')
  ) {
    return 'production'
  }

  return 'api'
}

export async function getFCUApiToUse(): Promise<string> {
  //   const origin = await getOrigin()
  const host = await getHost()

  // console.log('Host: ', host)

  if (host && host.startsWith('localhost')) {
    return process.env.FCU_API_BASE_URL_TEST!
  }

  if (host && host === 'loan-link-dev.vercel.app') {
    return process.env.FCU_API_BASE_URL_TEST!
  }

  if (
    host &&
    (host === 'loan-status-hub.vercel.app' ||
      host === 'www.loanstatushub.firstcreditunion.co.nz' ||
      host === 'loanstatushub.firstcreditunion.co.nz' ||
      host === 'https://loanstatushub.firstcreditunion.co.nz')
  ) {
    return process.env.FCU_API_BASE_URL_PROD!
  }

  return process.env.FCU_API_BASE_URL_TEST!
}

// Git Commit Control 1
