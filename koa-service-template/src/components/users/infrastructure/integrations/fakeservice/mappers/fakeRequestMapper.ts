import { GetUsernamesRequest } from '../models/fakeService-types'

export function buildGetUsernamesRequest(country: string): GetUsernamesRequest {
  return {
    countryCode: country
  }
}
