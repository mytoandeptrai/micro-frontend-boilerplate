import { Controller, Get, Query } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Activity } from "./activity.entity"

@Controller("activity")
export class ActivityController {
  constructor(
    @InjectRepository(Activity)
    private readonly repo: Repository<Activity>,
  ) {}

  @Get()
  async getActivity(
    @Query("page") page = 1,
    @Query("limit") limit = 20,
  ) {
    const p = Number(page)
    const l = Number(limit)

    const [data, total] = await this.repo.findAndCount({
      order: { createdAt: "DESC" },
      skip: (p - 1) * l,
      take: l,
    })

    return {
      data,
      meta: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
    }
  }
}
