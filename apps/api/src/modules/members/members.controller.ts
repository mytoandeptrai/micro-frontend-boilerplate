import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common"
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger"
import { CreateMemberDto } from "./dto/create-member.dto"
import { UpdateMemberDto } from "./dto/update-member.dto"
import { MemberRole, MemberStatus } from "./member.entity"
import { MembersService } from "./members.service"

@ApiTags("members")
@Controller("members")
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @ApiOperation({ summary: "List members with pagination and filters" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "name", required: false })
  @ApiQuery({ name: "role", required: false, enum: MemberRole })
  @ApiQuery({ name: "status", required: false, enum: MemberStatus })
  findAll(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("name") name?: string,
    @Query("role") role?: MemberRole,
    @Query("status") status?: MemberStatus,
  ) {
    return this.membersService.findAll({ page, limit, name, role, status })
  }

  @Get(":id")
  @ApiOperation({ summary: "Get member by id" })
  findOne(@Param("id") id: string) {
    return this.membersService.findOne(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create member" })
  create(@Body() dto: CreateMemberDto) {
    return this.membersService.create(dto)
  }

  @Put(":id")
  @ApiOperation({ summary: "Update member (full replace)" })
  update(@Param("id") id: string, @Body() dto: UpdateMemberDto) {
    return this.membersService.update(id, dto)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft delete member (status → inactive)" })
  softDelete(@Param("id") id: string) {
    return this.membersService.softDelete(id)
  }
}
