import { GetUsernamesResponse } from '../models/fakeService-types'

export function mapGetUsernamesResponse(responseBody: GetUsernamesResponse): string[] {
  return responseBody.userNames
}
