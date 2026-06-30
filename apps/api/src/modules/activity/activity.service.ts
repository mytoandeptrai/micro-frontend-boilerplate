import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { EntityManager, Repository } from "typeorm"
import { Activity, ActivityEventType } from "./activity.entity"

export interface CreateActivityInput {
  eventType: ActivityEventType
  actorId: string
  actorName: string
  targetId?: string
  targetName?: string
  metadata?: Record<string, unknown>
}

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly repo: Repository<Activity>,
  ) {}

  async createActivity(input: CreateActivityInput, manager?: EntityManager): Promise<Activity> {
    const repo = manager ? manager.getRepository(Activity) : this.repo
    return repo.save(repo.create(input))
  }
}
