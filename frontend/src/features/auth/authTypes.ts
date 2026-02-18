export type AuthTokens = {
  accessToken: string
  accessTokenExpires: string
}

export type AuthState = {
  tokens: AuthTokens | null
  isAuthenticated: boolean
}

export type LoginPayload = {
  email: string
  password: string
}

export type AuthResponse = AuthTokens