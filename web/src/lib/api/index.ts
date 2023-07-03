import { get } from 'svelte/store'
import { user } from '$lib/stores/user'

export const api_root = '/api'

export class api {
  static async fetchWithToken(
    method: string | undefined,
    input: RequestInfo | URL,
    body?: Record<string, string>,
    init?: RequestInit | undefined
  ) {
    const token = get(user).token
    if (token && token.length > 0) {
      return fetch(input, {
        method,
        headers: {
          Authentication: `Bearer ${token}`,
          ...init?.headers,
        },
        body: JSON.stringify(body),
        ...init,
      })
    } else {
      return fetch(input, {
        method,
        ...init,
      })
    }
  }

  static async GET(input: RequestInfo | URL, body?: Record<string, string>, init?: RequestInit) {
    return this.fetchWithToken('GET', input, body, init)
  }

  static async POST(input: RequestInfo | URL, body?: Record<string, string>, init?: RequestInit) {
    return this.fetchWithToken('POST', input, body, init)
  }

  static async PATCH(input: RequestInfo | URL, body?: Record<string, string>, init?: RequestInit) {
    return this.fetchWithToken('PATCH', input, body, init)
  }

  static async PUT(input: RequestInfo | URL, body?: Record<string, string>, init?: RequestInit) {
    return this.fetchWithToken('PUT', input, body, init)
  }

  static async DELETE(input: RequestInfo | URL, body?: Record<string, string>, init?: RequestInit) {
    return this.fetchWithToken('DELETE', input, body, init)
  }

  static async OPTIONS(input: RequestInfo | URL, body?: Record<string, string>, init?: RequestInit) {
    return this.fetchWithToken('OPTIONS', input, body, init)
  }

  static async HEAD(input: RequestInfo | URL, body?: Record<string, string>, init?: RequestInit) {
    return this.fetchWithToken('HEAD', input, body, init)
  }
}
