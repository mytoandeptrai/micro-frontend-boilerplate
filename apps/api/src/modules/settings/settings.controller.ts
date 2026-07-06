import { Body, Controller, Get, Patch } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { UpdateSettingsDto } from "./dto/update-settings.dto"
import { SettingsService } from "./settings.service"

@ApiTags("settings")
@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: "Get workspace settings" })
  getSettings() {
    return this.settingsService.getSettings()
  }

  @Patch()
  @ApiOperation({ summary: "Update workspace settings (partial)" })
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(dto)
  }
}
