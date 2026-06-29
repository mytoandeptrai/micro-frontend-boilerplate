import * as bcrypt from "bcryptjs"
import { DataSource } from "typeorm"
import {
  Member,
  MemberRole,
  MemberStatus,
} from "../../../modules/members/member.entity"

export async function seedMembers(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Member)
  const password = bcrypt.hashSync("password123", 10)

  const members: Partial<Member>[] = [
    {
      name: "Alice Johnson",
      email: "alice@ops.dev",
      role: MemberRole.ADMIN,
      status: MemberStatus.ACTIVE,
      avatar: "https://i.pravatar.cc/150?u=alice",
      password,
    },
    {
      name: "Bob Smith",
      email: "bob@ops.dev",
      role: MemberRole.MEMBER,
      status: MemberStatus.ACTIVE,
      avatar: "https://i.pravatar.cc/150?u=bob",
      password,
    },
    {
      name: "Carol White",
      email: "carol@ops.dev",
      role: MemberRole.VIEWER,
      status: MemberStatus.ACTIVE,
      avatar: "https://i.pravatar.cc/150?u=carol",
      password,
    },
    {
      name: "David Kim",
      email: "david@ops.dev",
      role: MemberRole.MEMBER,
      status: MemberStatus.ACTIVE,
      avatar: "https://i.pravatar.cc/150?u=david",
      password,
    },
    {
      name: "Eva Martinez",
      email: "eva@ops.dev",
      role: MemberRole.ADMIN,
      status: MemberStatus.ACTIVE,
      avatar: "https://i.pravatar.cc/150?u=eva",
      password,
    },
    {
      name: "Frank Chen",
      email: "frank@ops.dev",
      role: MemberRole.MEMBER,
      status: MemberStatus.INACTIVE,
      avatar: "https://i.pravatar.cc/150?u=frank",
      password,
    },
    {
      name: "Grace Lee",
      email: "grace@ops.dev",
      role: MemberRole.VIEWER,
      status: MemberStatus.ACTIVE,
      avatar: "https://i.pravatar.cc/150?u=grace",
      password,
    },
    {
      name: "Henry Brown",
      email: "henry@ops.dev",
      role: MemberRole.MEMBER,
      status: MemberStatus.ACTIVE,
      avatar: "https://i.pravatar.cc/150?u=henry",
      password,
    },
    {
      name: "Iris Nguyen",
      email: "iris@ops.dev",
      role: MemberRole.VIEWER,
      status: MemberStatus.INACTIVE,
      avatar: "https://i.pravatar.cc/150?u=iris",
      password,
    },
    {
      name: "Jack Wilson",
      email: "jack@ops.dev",
      role: MemberRole.MEMBER,
      status: MemberStatus.ACTIVE,
      avatar: "https://i.pravatar.cc/150?u=jack",
      password,
    },
    {
      name: "Karen Davis",
      email: "karen@ops.dev",
      role: MemberRole.ADMIN,
      status: MemberStatus.ACTIVE,
      avatar: "https://i.pravatar.cc/150?u=karen",
      password,
    },
    {
      name: "Leo Garcia",
      email: "leo@ops.dev",
      role: MemberRole.VIEWER,
      status: MemberStatus.ACTIVE,
      avatar: "https://i.pravatar.cc/150?u=leo",
      password,
    },
    {
      name: "Mia Taylor",
      email: "mia@ops.dev",
      role: MemberRole.MEMBER,
      status: MemberStatus.INACTIVE,
      avatar: "https://i.pravatar.cc/150?u=mia",
      password,
    },
  ]

  await repo.upsert(members.map((m) => repo.create(m)), { conflictPaths: ["email"], skipUpdateIfNoValuesChanged: false })
  console.log(`Upserted ${members.length} members.`)
}
