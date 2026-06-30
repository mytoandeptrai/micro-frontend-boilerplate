import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { DataSource, ILike, type Repository } from "typeorm"
import { ActivityEventType } from "../activity/activity.entity"
import { ActivityService } from "../activity/activity.service"
import { StatsService } from "../stats/stats.service"
import { CreateMemberDto } from "./dto/create-member.dto"
import { UpdateMemberDto } from "./dto/update-member.dto"
import { Member, type MemberRole, MemberStatus } from "./member.entity"

export interface MemberQuery {
  page?: number
  limit?: number
  name?: string
  role?: MemberRole
  status?: MemberStatus
}

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly repo: Repository<Member>,
    private readonly dataSource: DataSource,
    private readonly activityService: ActivityService,
    private readonly statsService: StatsService,
  ) {}

  async findAll(query: MemberQuery) {
    const { page = 1, limit = 10, name, role, status } = query
    const where: Record<string, unknown> = {}

    if (name) where.name = ILike(`%${name}%`)
    if (role) where.role = role
    if (status) where.status = status

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    })

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string): Promise<Member> {
    const member = await this.repo.findOne({ where: { id } })
    if (!member) throw new NotFoundException(`Member ${id} not found`)
    return member
  }

  async findByEmail(email: string): Promise<Member | null> {
    return this.repo.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        password: true,
      },
    })
  }

  async create(dto: CreateMemberDto): Promise<Member> {
    const existing = await this.repo.findOne({ where: { email: dto.email } })
    if (existing) throw new ConflictException("Email already in use")

    return this.dataSource.transaction(async (manager) => {
      const member = await manager.save(manager.create(Member, dto))

      await this.activityService.createActivity(
        {
          eventType: ActivityEventType.CREATED,
          actorId: member.id,
          actorName: member.name,
          targetId: member.id,
          targetName: member.name,
        },
        manager,
      )

      await this.statsService.adjust(
        {
          totalDelta: 1,
          activeDelta: member.status === MemberStatus.ACTIVE ? 1 : 0,
          role: member.role,
          roleDelta: 1,
        },
        manager,
      )

      return member
    })
  }

  async update(id: string, dto: UpdateMemberDto): Promise<Member> {
    const member = await this.findOne(id)
    const emailConflict =
      dto.email && dto.email !== member.email
        ? await this.repo.findOne({ where: { email: dto.email } })
        : null
    if (emailConflict) throw new ConflictException("Email already in use")

    return this.dataSource.transaction(async (manager) => {
      const oldRole = member.role
      const oldStatus = member.status
      Object.assign(member, dto)
      const updated = await manager.save(member)

      await this.activityService.createActivity(
        {
          eventType: ActivityEventType.UPDATED,
          actorId: updated.id,
          actorName: updated.name,
          targetId: updated.id,
          targetName: updated.name,
        },
        manager,
      )

      const roleChanged = oldRole !== updated.role
      const statusChanged = oldStatus !== updated.status

      if (roleChanged || statusChanged) {
        const wasActive = oldStatus === MemberStatus.ACTIVE
        const isActive = updated.status === MemberStatus.ACTIVE
        const activeDelta = wasActive === isActive ? 0 : isActive ? 1 : -1

        if (roleChanged) {
          await this.statsService.adjust(
            { totalDelta: 0, activeDelta, role: oldRole, roleDelta: -1 },
            manager,
          )
          await this.statsService.adjust(
            { totalDelta: 0, activeDelta: 0, role: updated.role, roleDelta: 1 },
            manager,
          )
        } else if (statusChanged) {
          await this.statsService.adjust(
            { totalDelta: 0, activeDelta, role: updated.role, roleDelta: 0 },
            manager,
          )
        }
      }

      return updated
    })
  }

  async softDelete(id: string): Promise<Member> {
    const member = await this.findOne(id)

    return this.dataSource.transaction(async (manager) => {
      member.status = MemberStatus.INACTIVE
      const deleted = await manager.save(member)

      await this.activityService.createActivity(
        {
          eventType: ActivityEventType.DELETED,
          actorId: deleted.id,
          actorName: deleted.name,
          targetId: deleted.id,
          targetName: deleted.name,
        },
        manager,
      )

      await this.statsService.adjust(
        {
          totalDelta: -1,
          activeDelta: -1,
          role: deleted.role,
          roleDelta: -1,
        },
        manager,
      )

      return deleted
    })
  }
}
