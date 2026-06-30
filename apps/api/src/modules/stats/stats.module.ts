import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { StatsController } from "./stats.controller"
import { Stats } from "./stats.entity"
import { StatsService } from "./stats.service"

@Module({
  imports: [TypeOrmModule.forFeature([Stats])],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
