import { UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Test } from "@nestjs/testing"
import * as bcrypt from "bcryptjs"
import { MembersService } from "@/modules/members/members.service"
import { MemberRole, MemberStatus } from "@/modules/members/member.entity"
import { AuthService } from "./auth.service"

const mockMember = {
  id: "uuid-1",
  name: "Alice Johnson",
  email: "alice@ops.dev",
  role: MemberRole.ADMIN,
  status: MemberStatus.ACTIVE,
  avatar: null,
  password: bcrypt.hashSync("password123", 10),
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockMembersService = {
  findByEmail: jest.fn(),
  findOne: jest.fn(),
}

const mockJwtService = {
  sign: jest.fn().mockReturnValue("mock-token"),
}

describe("AuthService", () => {
  let service: AuthService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: MembersService, useValue: mockMembersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile()

    service = module.get(AuthService)
    jest.clearAllMocks()
  })

  describe("login", () => {
    it("returns token and member on valid credentials", async () => {
      mockMembersService.findByEmail.mockResolvedValue(mockMember)

      const result = await service.login("alice@ops.dev", "password123")

      expect(result.token).toBe("mock-token")
      expect(result.member.email).toBe("alice@ops.dev")
      expect((result.member as any).password).toBeUndefined()
    })

    it("throws UnauthorizedException on wrong password", async () => {
      mockMembersService.findByEmail.mockResolvedValue(mockMember)

      await expect(service.login("alice@ops.dev", "wrong")).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it("throws UnauthorizedException when email not found", async () => {
      mockMembersService.findByEmail.mockResolvedValue(null)

      await expect(service.login("nobody@ops.dev", "password123")).rejects.toThrow(
        UnauthorizedException,
      )
    })
  })

  describe("getMe", () => {
    it("returns member by userId", async () => {
      mockMembersService.findOne.mockResolvedValue(mockMember)

      const result = await service.getMe("uuid-1")

      expect(result.id).toBe("uuid-1")
      expect(mockMembersService.findOne).toHaveBeenCalledWith("uuid-1")
    })
  })
})
