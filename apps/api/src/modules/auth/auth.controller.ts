import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common"
import { Request, Response } from "express"
import { Member } from "@/modules/members/member.entity"
import { AuthService } from "./auth.service"
import { JwtAuthGuard } from "./jwt-auth.guard"

const COOKIE_NAME = "ops_token"
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, member } = await this.authService.login(body.email, body.password)
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
    })
    return member
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  getMe(@Req() req: Request & { user: Member }) {
    return req.user
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response) {
    res.cookie(COOKIE_NAME, "", { httpOnly: true, maxAge: 0 })
    return { ok: true }
  }
}
