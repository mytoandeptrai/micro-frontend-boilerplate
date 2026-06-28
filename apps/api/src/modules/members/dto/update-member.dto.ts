import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator"
import { MemberRole, MemberStatus } from "../member.entity"

export class UpdateMemberDto {
  @ApiProperty({ example: "Alice Johnson" })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: "alice@ops.dev" })
  @IsEmail()
  email: string

  @ApiProperty({ enum: MemberRole, example: MemberRole.MEMBER })
  @IsEnum(MemberRole)
  role: MemberRole

  @ApiPropertyOptional({ example: "https://i.pravatar.cc/150?u=alice" })
  @IsOptional()
  @IsString()
  avatar?: string

  @ApiPropertyOptional({ enum: MemberStatus })
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus
}
