import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { Settings, SettingsTheme } from "./settings.entity"
import { SettingsService } from "./settings.service"

const mockSettings = (overrides: Partial<Settings> = {}): Settings => ({
  id: "uuid-1",
  workspaceName: "Ops Dashboard",
  timezone: "Asia/Ho_Chi_Minh",
  theme: SettingsTheme.DARK,
  inAppNotifications: true,
  memberJoinAlert: true,
  updatedAt: new Date(),
  ...overrides,
})

describe("SettingsService", () => {
  let service: SettingsService
  let repo: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock }

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: getRepositoryToken(Settings), useValue: repo },
      ],
    }).compile()

    service = module.get<SettingsService>(SettingsService)
  })

  describe("getSettings", () => {
    it("returns existing record when found", async () => {
      const settings = mockSettings()
      repo.findOne.mockResolvedValue(settings)

      expect(await service.getSettings()).toBe(settings)
      expect(repo.create).not.toHaveBeenCalled()
    })

    it("creates default record when table is empty", async () => {
      const defaults = mockSettings()
      repo.findOne.mockResolvedValue(null)
      repo.create.mockReturnValue(defaults)
      repo.save.mockResolvedValue(defaults)

      const result = await service.getSettings()

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceName: "Ops Dashboard",
          theme: SettingsTheme.DARK,
        }),
      )
      expect(result).toBe(defaults)
    })
  })

  describe("updateSettings", () => {
    it("updates only the fields provided, keeping others unchanged", async () => {
      const existing = mockSettings()
      repo.findOne.mockResolvedValue(existing)
      repo.save.mockImplementation((s: Settings) => Promise.resolve(s))

      const result = await service.updateSettings({
        theme: SettingsTheme.LIGHT,
      })

      expect(result.theme).toBe(SettingsTheme.LIGHT)
      expect(result.workspaceName).toBe("Ops Dashboard")
    })

    it("creates a record first when none exists, then applies the update", async () => {
      const defaults = mockSettings()
      repo.findOne.mockResolvedValue(null)
      repo.create.mockReturnValue(defaults)
      repo.save.mockImplementation((s: Settings) => Promise.resolve(s))

      const result = await service.updateSettings({
        theme: SettingsTheme.LIGHT,
      })

      expect(repo.create).toHaveBeenCalled()
      expect(result.theme).toBe(SettingsTheme.LIGHT)
    })
  })
})
