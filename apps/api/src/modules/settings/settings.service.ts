import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { UpdateSettingsDto } from "./dto/update-settings.dto"
import { Settings, SettingsTheme } from "./settings.entity"

const DEFAULT_SETTINGS: Partial<Settings> = {
  workspaceName: "Ops Dashboard",
  timezone: "Asia/Ho_Chi_Minh",
  theme: SettingsTheme.DARK,
  inAppNotifications: true,
  memberJoinAlert: true,
}

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private readonly repo: Repository<Settings>,
  ) {}

  async getSettings(): Promise<Settings> {
    const existing = await this.repo.findOne({ where: {} })
    if (existing) return existing

    return this.repo.save(this.repo.create(DEFAULT_SETTINGS))
  }

  async updateSettings(dto: UpdateSettingsDto): Promise<Settings> {
    const settings = await this.getSettings()
    Object.assign(settings, dto)
    return this.repo.save(settings)
  }
}
