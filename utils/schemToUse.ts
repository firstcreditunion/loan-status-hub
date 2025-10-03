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

  if (
    process.env.SCHEMEA_TO_USE === '' &&
    host &&
    host.startsWith('localhost')
  ) {
    return 'api'
  }

  if (host && host === 'firstcreditunion-loans-test.vercel.app') {
    return 'api'
  }

  if (host && host === 'www.statushub.firstcreditunion.co.nz') {
    return 'production'
  }

  return 'api'
}

export async function getFCUApiToUse(): Promise<string> {
  //   const origin = await getOrigin()
  const host = await getHost()

  // console.log('Host: ', host)

  if (
    process.env.SCHEMEA_TO_USE === '' &&
    host &&
    host.startsWith('localhost')
  ) {
    return process.env.FCU_API_BASE_URL_TEST!
  }

  if (host && host === 'firstcreditunion-loans-test.vercel.app') {
    return process.env.FCU_API_BASE_URL_TEST!
  }

  if (host && host === 'www.statushub.firstcreditunion.co.nz') {
    return process.env.FCU_API_BASE_URL_PROD!
  }

  return process.env.FCU_API_BASE_URL_TEST!
}

// Git Commit Control 1
