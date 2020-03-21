import request, { Response } from 'superagent'
import { GetUsernamesRequest, GetUsernamesResponse } from './models/fakeService-types'

export async function getUsernames(
  requestParams: GetUsernamesRequest
): Promise<GetUsernamesResponse> {
  const response: Response = await request.get('www.fakeservice.com').query(requestParams)
  return response.body as GetUsernamesResponse
}
