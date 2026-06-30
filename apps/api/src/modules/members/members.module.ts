import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ActivityModule } from "../activity/activity.module"
import { StatsModule } from "../stats/stats.module"
import { Member } from "./member.entity"
import { MembersController } from "./members.controller"
import { MembersService } from "./members.service"

@Module({
  imports: [TypeOrmModule.forFeature([Member]), ActivityModule, StatsModule],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
