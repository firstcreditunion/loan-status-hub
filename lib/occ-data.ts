'use server'

import { lambdaClient } from '@/utils/aws/config'
import { InvokeCommand } from '@aws-sdk/client-lambda'

import { getSchemaToUse } from '@/utils/schemToUse'

export async function fetchMediumApplicationData(
  applicationExternalNumber: string
): Promise<ApplicationMedium> {
  const schema = await getSchemaToUse()

  const functionToUse =
    schema === 'production'
      ? process.env.LAMBDA_FUNCTION_APPLICATIONS_MAIN_PROD!
      : process.env.LAMBDA_FUNCTION_APPLICATIONS_MAIN_TEST!

  const params = {
    FunctionName: functionToUse,
    Payload: JSON.stringify({
      functionName: process.env.LAMBDA_FUNCTION_APPLICTION_MEDIUM,
      applicationExternalNumber: applicationExternalNumber,
      clientId: process.env.SOV_AWS_CLIENT_NUMBER!,
    }),
  }

  try {
    const command = new InvokeCommand(params)
    const { Payload } = await lambdaClient.send(command)

    if (!Payload) {
      throw new Error('Empty response from Lambda function')
    }

    const result = JSON.parse(Buffer.from(Payload).toString())

    if (result.statusCode !== 200) {
      throw new Error(`Lambda function returned an error: ${result.body}`)
    }

    const applicationDetail: ApplicationMedium = JSON.parse(result.body)

    return applicationDetail
  } catch (error) {
    // console.error('Error calling Lambda function:', error)
    throw error
  }
}

export interface ApplicationDateSince {
  type: string
  id: string
  attributes: {
    lastSavedDateTime: string
  }
  links: {
    self: string
  }
}
export interface ApplicationMedium {
  type: string
  id: string
  attributes: {
    applicationInternalNumber: string
    applicationName: string
    clientApplication: string
    loadedByClientNumber: string
    owner: string
    applicationTitle: string
    tradingBranch: string
    salesChannel: string
    subPrime: string
    comparisonRatesSupplied: string
    paymentMethod: string
    type: string
    appStatusDesc: string
    appStatusCode: string
    currentTaskWith: string
    lastSavedDateTime: string // Added this field
  }
  relationships: {
    originator: RelationshipApplicationMedium
    associatedClients: RelationshipApplicationMedium
  }
}

interface RelationshipApplicationMedium {
  links: LinkApplicationMedium
  data: unknown
}

interface LinkApplicationMedium {
  related: string
  self: string
}
