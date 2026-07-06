export const useStore = Object.assign(jest.fn(), {
  use: {
    user: jest.fn(),
    setUser: jest.fn(),
  },
})
