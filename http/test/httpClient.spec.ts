import * as nock from 'nock'
import { NockbackHelper } from 'nockback-harder'
import { httpClient } from '../lib/httpClient'

export function initNockbackHelper(dirname: string, passThroughLocalCall = true): NockbackHelper {
  const helper = new NockbackHelper(nock, dirname + '/__nock-fixtures__', {
    passThroughLocalCall
  })
  return helper
}

describe('httpClient', () => {
  let nockbackHelper: NockbackHelper
  beforeAll(() => {
    nockbackHelper = initNockbackHelper(__dirname)
  })

  describe('GET', () => {
    it('should support GET operation', async () => {
      await nockbackHelper.nockBack('GET_happy.json', async () => {
        const response = await httpClient.get('http://jsonplaceholder.typicode.com/todos/1')
        expect(response.body).toEqual({
          completed: false,
          id: 1,
          title: 'delectus aut autem',
          userId: 1
        })
        expect(response.statusCode).toEqual(200)
        expect(response.url).toEqual('http://jsonplaceholder.typicode.com/todos/1')
      })
    })

    it('should support query string params', async () => {
      await nockbackHelper.nockBack('GET_qs.json', async () => {
        const response = await httpClient.get('http://jsonplaceholder.typicode.com/todos', {
          qs: {
            userId: 1
          }
        })
        expect(response.body).toMatchSnapshot()
        expect(response.statusCode).toEqual(200)
        expect(response.url).toEqual('http://jsonplaceholder.typicode.com/todos?userId=1')
      })
    })

    it('should handle 500 for GET operation', async () => {
      await nockbackHelper.nockBack('GET_500.json', async () => {
        expect.assertions(3)
        try {
          await httpClient.get('http://httpstat.us/500')
        } catch (err) {
          const response = err.response
          expect(response.body).toEqual({
            code: 500,
            description: 'Internal Server Error'
          })
          expect(response.statusMessage).toEqual('Internal Server Error')
          expect(response.statusCode).toEqual(500)
        }
      })
    })

    it('should handle 404 for GET operation', async () => {
      await nockbackHelper.nockBack('GET_404.json', async () => {
        expect.assertions(3)
        try {
          await httpClient.get('http://httpstat.us/404')
        } catch (err) {
          const response = err.response
          expect(response.body).toEqual({
            code: 404,
            description: 'Not Found'
          })
          expect(response.statusMessage).toEqual('Not Found')
          expect(response.statusCode).toEqual(404)
        }
      })
    })
  })

  describe('POST', () => {
    it('should support POST operation', async () => {
      await nockbackHelper.nockBack('POST_happy.json', async () => {
        const response = await httpClient.post('http://jsonplaceholder.typicode.com/todos/', {
          title: 'lorem ipsum'
        })
        expect(response.body).toEqual({
          id: 201,
          title: 'lorem ipsum'
        })
        expect((response as any).req!.method).toEqual('POST')
        expect(response.statusCode).toEqual(201)
        expect(response.url).toEqual('http://jsonplaceholder.typicode.com/todos/')
      })
    })
  })

  describe('PUT', () => {
    it('should support PUT operation', async () => {
      await nockbackHelper.nockBack('PUT_happy.json', async () => {
        const response = await httpClient.put('http://jsonplaceholder.typicode.com/posts/1', {
          id: 1,
          title: 'lorem ipsum'
        })
        expect(response.body).toEqual({
          id: 1,
          title: 'lorem ipsum'
        })
        expect((response as any).req!.method).toEqual('PUT')
        expect(response.statusCode).toEqual(200)
        expect(response.url).toEqual('http://jsonplaceholder.typicode.com/posts/1')
      })
    })
  })

  describe('PATCH', () => {
    it('should support PATCH operation', async () => {
      await nockbackHelper.nockBack('PATCH_happy.json', async () => {
        const response = await httpClient.patch('http://jsonplaceholder.typicode.com/todos/5', {
          id: 5,
          title: 'lorem ipsum'
        })
        expect(response.body).toEqual({
          completed: false,
          userId: 1,
          id: 5,
          title: 'lorem ipsum'
        })
        expect(response.statusCode).toEqual(200)
        expect(response.url).toEqual('http://jsonplaceholder.typicode.com/todos/5')
      })
    })
  })

  describe('DELETE', () => {
    it('should support DELETE operation', async () => {
      await nockbackHelper.nockBack('DELETE_happy.json', async () => {
        const response = await httpClient.delete('http://jsonplaceholder.typicode.com/todos/1')
        expect(response.body).toEqual({})
        expect((response as any).req!.method).toEqual('DELETE')
        expect(response.statusCode).toEqual(200)
        expect(response.url).toEqual('http://jsonplaceholder.typicode.com/todos/1')
      })
    })
  })
})
