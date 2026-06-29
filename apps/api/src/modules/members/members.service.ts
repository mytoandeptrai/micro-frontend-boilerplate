import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { ILike, type Repository } from "typeorm"
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
    return this.repo.findOne({ where: { email }, select: { id: true, email: true, name: true, role: true, avatar: true, status: true, createdAt: true, updatedAt: true, password: true } })
  }

  async create(dto: CreateMemberDto): Promise<Member> {
    const existing = await this.repo.findOne({ where: { email: dto.email } })
    if (existing) throw new ConflictException("Email already in use")
    const member = this.repo.create(dto)
    return this.repo.save(member)
  }

  async update(id: string, dto: UpdateMemberDto): Promise<Member> {
    const member = await this.findOne(id)
    const emailConflict =
      dto.email !== member.email
        ? await this.repo.findOne({ where: { email: dto.email } })
        : null
    if (emailConflict) throw new ConflictException("Email already in use")
    Object.assign(member, dto)
    return this.repo.save(member)
  }

  async softDelete(id: string): Promise<Member> {
    const member = await this.findOne(id)
    member.status = MemberStatus.INACTIVE
    return this.repo.save(member)
  }
}
