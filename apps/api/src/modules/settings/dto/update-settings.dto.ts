import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator"
import { SettingsTheme } from "../settings.entity"

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: "Ops Dashboard" })
  @IsOptional()
  @IsString()
  workspaceName?: string

  @ApiPropertyOptional({ example: "Asia/Ho_Chi_Minh" })
  @IsOptional()
  @IsString()
  timezone?: string

  @ApiPropertyOptional({ enum: SettingsTheme, example: SettingsTheme.DARK })
  @IsOptional()
  @IsEnum(SettingsTheme)
  theme?: SettingsTheme

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  inAppNotifications?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  memberJoinAlert?: boolean
}
