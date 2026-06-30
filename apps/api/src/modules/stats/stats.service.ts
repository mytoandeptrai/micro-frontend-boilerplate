import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { EntityManager, Repository } from "typeorm"
import { MemberRole, MemberStatus } from "../members/member.entity"
import { Stats } from "./stats.entity"

export interface StatsAdjustment {
  totalDelta: number
  activeDelta: number
  role: MemberRole
  roleDelta: number
}

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Stats)
    private readonly repo: Repository<Stats>,
  ) {}

  async getStats(): Promise<Stats> {
    const stats = await this.repo.findOne({ where: {} })
    if (!stats) return this.repo.save(this.repo.create())
    return stats
  }

  async adjust(adj: StatsAdjustment, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(Stats) : this.repo
    const stats = await repo.findOne({ where: {} })
    if (!stats) return

    stats.totalMembers += adj.totalDelta
    stats.activeMembers += adj.activeDelta
    if (adj.role === MemberRole.ADMIN) stats.adminCount += adj.roleDelta
    else if (adj.role === MemberRole.MEMBER) stats.memberCount += adj.roleDelta
    else if (adj.role === MemberRole.VIEWER) stats.viewerCount += adj.roleDelta

    await repo.save(stats)
  }
}
