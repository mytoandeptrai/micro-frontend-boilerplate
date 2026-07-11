import { validateEmail, validatePassword } from "../lib/businessRules"
import type { LoginInput, RegisterInput, User } from "../types/task"
import {
  createId,
  findUserByEmail,
  findUserById,
  getSessionUserId,
  insertUserInDb,
  type StoredAuthUser,
  setSessionUserId,
} from "./db"
import { ApiError, DELAY_MS, delay } from "./delay"
import { consumeScenario } from "./scenario"

function toPublicUser(user: StoredAuthUser): User {
  return { id: user.id, name: user.name, email: user.email }
}

export async function login(input: LoginInput): Promise<User> {
  const scenario = consumeScenario("auth.login")
  await delay(scenario === "slow" ? DELAY_MS.slow : DELAY_MS.normal)
  if (scenario === "error") throw new ApiError(500, "Unable to sign in right now")

  const emailCheck = validateEmail(input.email)
  if (!emailCheck.valid) throw new ApiError(422, emailCheck.error ?? "Invalid email")

  const user = findUserByEmail(input.email)
  if (!user || user.password !== input.password) {
    throw new ApiError(401, "Invalid email or password")
  }

  setSessionUserId(user.id)
  return toPublicUser(user)
}

export async function register(input: RegisterInput): Promise<User> {
  const scenario = consumeScenario("auth.register")
  await delay(scenario === "slow" ? DELAY_MS.slow : DELAY_MS.normal)
  if (scenario === "error") throw new ApiError(500, "Unable to register right now")

  const emailCheck = validateEmail(input.email)
  if (!emailCheck.valid) throw new ApiError(422, emailCheck.error ?? "Invalid email")

  const passwordCheck = validatePassword(input.password)
  if (!passwordCheck.valid) throw new ApiError(422, passwordCheck.error ?? "Invalid password")

  if (findUserByEmail(input.email)) {
    throw new ApiError(409, "An account with this email already exists")
  }

  const user: StoredAuthUser = {
    id: createId("user"),
    name: input.name.trim(),
    email: input.email,
    password: input.password,
  }
  insertUserInDb(user)
  setSessionUserId(user.id)
  return toPublicUser(user)
}

export async function logout(): Promise<void> {
  await delay(DELAY_MS.fast)
  setSessionUserId(null)
}

export async function getCurrentUser(): Promise<User | null> {
  const scenario = consumeScenario("auth.getCurrentUser")
  await delay(DELAY_MS.fast)
  if (scenario === "error") throw new ApiError(500, "Unable to verify session")

  const sessionUserId = getSessionUserId()
  if (!sessionUserId) return null

  const user = findUserById(sessionUserId)
  return user ? toPublicUser(user) : null
}
