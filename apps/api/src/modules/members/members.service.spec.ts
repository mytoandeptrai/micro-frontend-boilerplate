import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike } from 'typeorm';
import { Member, MemberRole, MemberStatus } from './member.entity';
import { MembersService } from './members.service';

const mockMember = (overrides: Partial<Member> = {}): Member => ({
  id: 'uuid-1',
  name: 'Alice',
  email: 'alice@ops.dev',
  role: MemberRole.ADMIN,
  avatar: null,
  status: MemberStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('MembersService', () => {
  let service: MembersService;
  let repo: {
    findAndCount: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    repo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        { provide: getRepositoryToken(Member), useValue: repo },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
  });

  describe('findAll', () => {
    it('returns paginated results without filter', async () => {
      const members = [mockMember()];
      repo.findAndCount.mockResolvedValue([members, 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('applies name filter with ILike', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ name: 'alice' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { name: ILike('%alice%') } }),
      );
    });

    it('applies role filter', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ role: MemberRole.ADMIN });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { role: MemberRole.ADMIN } }),
      );
    });

    it('applies status filter', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ status: MemberStatus.INACTIVE });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: MemberStatus.INACTIVE } }),
      );
    });

    it('calculates correct pagination meta', async () => {
      repo.findAndCount.mockResolvedValue([[], 12]);

      const result = await service.findAll({ page: 2, limit: 5 });

      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(5);
      expect(result.meta.total).toBe(12);
      expect(result.meta.totalPages).toBe(3);
    });
  });

  describe('findOne', () => {
    it('returns member when found', async () => {
      const member = mockMember();
      repo.findOne.mockResolvedValue(member);

      const result = await service.findOne('uuid-1');
      expect(result).toBe(member);
    });

    it('throws NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates and returns new member', async () => {
      repo.findOne.mockResolvedValue(null);
      const member = mockMember();
      repo.create.mockReturnValue(member);
      repo.save.mockResolvedValue(member);

      const result = await service.create({
        name: 'Alice',
        email: 'alice@ops.dev',
        role: MemberRole.ADMIN,
      });

      expect(result).toBe(member);
    });

    it('throws ConflictException when email exists', async () => {
      repo.findOne.mockResolvedValue(mockMember());

      await expect(
        service.create({
          name: 'Alice',
          email: 'alice@ops.dev',
          role: MemberRole.ADMIN,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('updates member fields', async () => {
      const member = mockMember();
      repo.findOne.mockResolvedValueOnce(member).mockResolvedValueOnce(null);
      repo.save.mockImplementation((m) => Promise.resolve(m));

      const result = await service.update('uuid-1', {
        name: 'Alice Updated',
        email: 'alice@ops.dev',
        role: MemberRole.MEMBER,
      });

      expect(result.name).toBe('Alice Updated');
    });

    it('throws ConflictException on duplicate email', async () => {
      const member = mockMember();
      const other = mockMember({ id: 'uuid-2', email: 'other@ops.dev' });
      repo.findOne.mockResolvedValueOnce(member).mockResolvedValueOnce(other);

      await expect(
        service.update('uuid-1', {
          name: 'Alice',
          email: 'other@ops.dev',
          role: MemberRole.ADMIN,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('softDelete', () => {
    it('sets status to inactive', async () => {
      const member = mockMember();
      repo.findOne.mockResolvedValue(member);
      repo.save.mockImplementation((m) => Promise.resolve(m));

      const result = await service.softDelete('uuid-1');
      expect(result.status).toBe(MemberStatus.INACTIVE);
    });

    it('throws NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.softDelete('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
