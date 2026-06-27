import { DataSource } from 'typeorm';
import { Member, MemberRole, MemberStatus } from '../../../modules/members/member.entity';

export async function seedMembers(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Member);
  const count = await repo.count();
  if (count > 0) {
    console.log(`Members already seeded (${count} rows). Skipping.`);
    return;
  }

  const members: Partial<Member>[] = [
    { name: 'Alice Johnson', email: 'alice@ops.dev', role: MemberRole.ADMIN, status: MemberStatus.ACTIVE, avatar: 'https://i.pravatar.cc/150?u=alice' },
    { name: 'Bob Smith', email: 'bob@ops.dev', role: MemberRole.MEMBER, status: MemberStatus.ACTIVE, avatar: 'https://i.pravatar.cc/150?u=bob' },
    { name: 'Carol White', email: 'carol@ops.dev', role: MemberRole.VIEWER, status: MemberStatus.ACTIVE, avatar: 'https://i.pravatar.cc/150?u=carol' },
    { name: 'David Kim', email: 'david@ops.dev', role: MemberRole.MEMBER, status: MemberStatus.ACTIVE, avatar: 'https://i.pravatar.cc/150?u=david' },
    { name: 'Eva Martinez', email: 'eva@ops.dev', role: MemberRole.ADMIN, status: MemberStatus.ACTIVE, avatar: 'https://i.pravatar.cc/150?u=eva' },
    { name: 'Frank Chen', email: 'frank@ops.dev', role: MemberRole.MEMBER, status: MemberStatus.INACTIVE, avatar: 'https://i.pravatar.cc/150?u=frank' },
    { name: 'Grace Lee', email: 'grace@ops.dev', role: MemberRole.VIEWER, status: MemberStatus.ACTIVE, avatar: 'https://i.pravatar.cc/150?u=grace' },
    { name: 'Henry Brown', email: 'henry@ops.dev', role: MemberRole.MEMBER, status: MemberStatus.ACTIVE, avatar: 'https://i.pravatar.cc/150?u=henry' },
    { name: 'Iris Nguyen', email: 'iris@ops.dev', role: MemberRole.VIEWER, status: MemberStatus.INACTIVE, avatar: 'https://i.pravatar.cc/150?u=iris' },
    { name: 'Jack Wilson', email: 'jack@ops.dev', role: MemberRole.MEMBER, status: MemberStatus.ACTIVE, avatar: 'https://i.pravatar.cc/150?u=jack' },
    { name: 'Karen Davis', email: 'karen@ops.dev', role: MemberRole.ADMIN, status: MemberStatus.ACTIVE, avatar: 'https://i.pravatar.cc/150?u=karen' },
    { name: 'Leo Garcia', email: 'leo@ops.dev', role: MemberRole.VIEWER, status: MemberStatus.ACTIVE, avatar: 'https://i.pravatar.cc/150?u=leo' },
    { name: 'Mia Taylor', email: 'mia@ops.dev', role: MemberRole.MEMBER, status: MemberStatus.INACTIVE, avatar: 'https://i.pravatar.cc/150?u=mia' },
  ];

  await repo.save(members.map((m) => repo.create(m)));
  console.log(`Seeded ${members.length} members.`);
}
