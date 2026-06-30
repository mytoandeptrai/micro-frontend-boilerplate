import { ConflictException, NotFoundException } from "@nestjs/common"
import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { DataSource, ILike } from "typeorm"
import { ActivityEventType } from "../activity/activity.entity"
import { ActivityService } from "../activity/activity.service"
import { StatsService } from "../stats/stats.service"
import { Member, MemberRole, MemberStatus } from "./member.entity"
import { MembersService } from "./members.service"

const mockMember = (overrides: Partial<Member> = {}): Member => ({
  id: "uuid-1",
  name: "Alice",
  email: "alice@ops.dev",
  role: MemberRole.ADMIN,
  password: null,
  avatar: null,
  status: MemberStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

describe("MembersService", () => {
  let service: MembersService
  let repo: { findAndCount: jest.Mock; findOne: jest.Mock; create: jest.Mock; save: jest.Mock }
  let activityService: { createActivity: jest.Mock }
  let statsService: { adjust: jest.Mock; getStats: jest.Mock }
  let mockDataSource: { transaction: jest.Mock }
  let mockManager: { save: jest.Mock; create: jest.Mock }

  beforeEach(async () => {
    repo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    }
    activityService = { createActivity: jest.fn().mockResolvedValue({}) }
    statsService = { adjust: jest.fn().mockResolvedValue(undefined), getStats: jest.fn() }
    mockManager = { save: jest.fn(), create: jest.fn() }
    mockDataSource = {
      transaction: jest.fn().mockImplementation((cb: (m: typeof mockManager) => Promise<unknown>) => cb(mockManager)),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        { provide: getRepositoryToken(Member), useValue: repo },
        { provide: DataSource, useValue: mockDataSource },
        { provide: ActivityService, useValue: activityService },
        { provide: StatsService, useValue: statsService },
      ],
    }).compile()

    service = module.get<MembersService>(MembersService)
  })

  describe("findAll", () => {
    it("returns paginated results without filter", async () => {
      repo.findAndCount.mockResolvedValue([[mockMember()], 1])
      const result = await service.findAll({ page: 1, limit: 10 })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(1)
      expect(result.meta.totalPages).toBe(1)
    })

    it("applies name filter with ILike", async () => {
      repo.findAndCount.mockResolvedValue([[], 0])
      await service.findAll({ name: "alice" })
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { name: ILike("%alice%") } }),
      )
    })

    it("calculates correct pagination meta", async () => {
      repo.findAndCount.mockResolvedValue([[], 12])
      const result = await service.findAll({ page: 2, limit: 5 })
      expect(result.meta.page).toBe(2)
      expect(result.meta.totalPages).toBe(3)
    })
  })

  describe("findOne", () => {
    it("returns member when found", async () => {
      const member = mockMember()
      repo.findOne.mockResolvedValue(member)
      expect(await service.findOne("uuid-1")).toBe(member)
    })

    it("throws NotFoundException when not found", async () => {
      repo.findOne.mockResolvedValue(null)
      await expect(service.findOne("missing")).rejects.toThrow(NotFoundException)
    })
  })

  describe("create", () => {
    it("inserts member, creates activity(CREATED), adjusts stats +1", async () => {
      const member = mockMember()
      repo.findOne.mockResolvedValue(null)
      mockManager.create.mockReturnValue(member)
      mockManager.save.mockResolvedValue(member)

      const result = await service.create({ name: "Alice", email: "alice@ops.dev", role: MemberRole.ADMIN })

      expect(result).toBe(member)
      expect(activityService.createActivity).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: ActivityEventType.CREATED }),
        mockManager,
      )
      expect(statsService.adjust).toHaveBeenCalledWith(
        expect.objectContaining({ totalDelta: 1, activeDelta: 1, roleDelta: 1 }),
        mockManager,
      )
    })

    it("throws ConflictException when email exists", async () => {
      repo.findOne.mockResolvedValue(mockMember())
      await expect(
        service.create({ name: "Alice", email: "alice@ops.dev", role: MemberRole.ADMIN }),
      ).rejects.toThrow(ConflictException)
    })

    it("rolls back if activity creation throws", async () => {
      const member = mockMember()
      repo.findOne.mockResolvedValue(null)
      mockManager.create.mockReturnValue(member)
      mockManager.save.mockResolvedValue(member)
      activityService.createActivity.mockRejectedValueOnce(new Error("DB fail"))

      await expect(
        service.create({ name: "Alice", email: "alice@ops.dev", role: MemberRole.ADMIN }),
      ).rejects.toThrow("DB fail")
    })
  })

  describe("softDelete", () => {
    it("sets status INACTIVE, creates activity(DELETED), adjusts stats -1", async () => {
      const member = mockMember()
      repo.findOne.mockResolvedValue(member)
      mockManager.save.mockImplementation((m: Member) => Promise.resolve(m))

      const result = await service.softDelete("uuid-1")

      expect(result.status).toBe(MemberStatus.INACTIVE)
      expect(activityService.createActivity).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: ActivityEventType.DELETED }),
        mockManager,
      )
      expect(statsService.adjust).toHaveBeenCalledWith(
        expect.objectContaining({ totalDelta: -1, activeDelta: -1, roleDelta: -1 }),
        mockManager,
      )
    })

    it("throws NotFoundException when member not found", async () => {
      repo.findOne.mockResolvedValue(null)
      await expect(service.softDelete("missing")).rejects.toThrow(NotFoundException)
    })
  })
})
