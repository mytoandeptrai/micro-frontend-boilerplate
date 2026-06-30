import type { DataSource } from "typeorm"
import { MemberRole, MemberStatus } from "@/modules/members/member.entity"
import { Member } from "@/modules/members/member.entity"
import { Stats } from "@/modules/stats/stats.entity"

export async function seedStats(dataSource: DataSource): Promise<void> {
  const statsRepo = dataSource.getRepository(Stats)
  const memberRepo = dataSource.getRepository(Member)

  const existing = await statsRepo.count()
  if (existing > 0) {
    console.log("Stats already seeded, skipping.")
    return
  }

  const [totalMembers, activeMembers, adminCount, memberCount, viewerCount] = await Promise.all([
    memberRepo.count(),
    memberRepo.count({ where: { status: MemberStatus.ACTIVE } }),
    memberRepo.count({ where: { role: MemberRole.ADMIN } }),
    memberRepo.count({ where: { role: MemberRole.MEMBER } }),
    memberRepo.count({ where: { role: MemberRole.VIEWER } }),
  ])

  await statsRepo.save(
    statsRepo.create({ totalMembers, activeMembers, adminCount, memberCount, viewerCount }),
  )

  console.log(`Stats seeded: ${totalMembers} members total, ${activeMembers} active.`)
}
