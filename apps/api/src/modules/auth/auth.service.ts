import { Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcryptjs"
import { Member } from "@/modules/members/member.entity"
import { MembersService } from "@/modules/members/members.service"

@Injectable()
export class AuthService {
  constructor(
    private readonly membersService: MembersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<{ token: string; member: Member }> {
    const member = await this.membersService.findByEmail(email)
    if (!member?.password) throw new UnauthorizedException("Invalid credentials")

    const isValid = await bcrypt.compare(password, member.password)
    if (!isValid) throw new UnauthorizedException("Invalid credentials")

    const token = this.jwtService.sign({ sub: member.id, email: member.email })

    const { password: _, ...memberWithoutPassword } = member
    return { token, member: memberWithoutPassword as Member }
  }

  async getMe(userId: string): Promise<Member> {
    return this.membersService.findOne(userId)
  }
}
