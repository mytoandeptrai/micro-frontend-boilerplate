export const useStore = Object.assign(jest.fn(), {
  use: {
    user: jest.fn(),
    isAuthenticated: jest.fn(),
    isLoading: jest.fn(),
    setUser: jest.fn(),
    setAuthenticated: jest.fn(),
    setLoading: jest.fn(),
  },
})
