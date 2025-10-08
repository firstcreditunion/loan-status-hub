import { LambdaClient } from '@aws-sdk/client-lambda'
import { defaultProvider } from '@aws-sdk/credential-provider-node'

export const lambdaClient = new LambdaClient({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: defaultProvider(),
})
