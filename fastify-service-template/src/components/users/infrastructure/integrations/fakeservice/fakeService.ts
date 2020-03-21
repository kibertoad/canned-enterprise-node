import { buildGetUsernamesRequest } from './mappers/fakeRequestMapper'
import * as requests from './fakeServiceRequests'
import { mapGetUsernamesResponse } from './mappers/fakeResponseMapper'

export async function getUsernames(countries: string): Promise<string[]> {
  const requestParams = buildGetUsernamesRequest(countries)
  const responseBody = await requests.getUsernames(requestParams)
  return mapGetUsernamesResponse(responseBody)
}
