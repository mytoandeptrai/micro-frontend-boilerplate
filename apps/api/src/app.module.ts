import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AppController } from "@/app.controller"
import { AppService } from "@/app.service"
import databaseConfig from "@/config/database.config"
import redisConfig from "@/config/redis.config"
import { ActivityModule } from "@/modules/activity/activity.module"
import { AuthModule } from "@/modules/auth/auth.module"
import { MembersModule } from "@/modules/members/members.module"
import { SettingsModule } from "@/modules/settings/settings.module"
import { StatsModule } from "@/modules/stats/stats.module"
import { UsersModule } from "@/modules/users/users.module"
import { CachingModule } from "@/shared/caching/caching.module"
import { LoggingMiddleware } from "@/shared/middleware/logging.middleware"
import { SharedRedisModule } from "@/shared/redis/shared-redis.module"

@Module({
  imports: [
    // Configuration module - must be first
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig],
      envFilePath: [".env.local", ".env"],
    }),

    // TypeORM Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres" as const,
        host: configService.get<string>("database.host"),
        port: configService.get<number>("database.port"),
        username: configService.get<string>("database.username"),
        password: configService.get<string>("database.password"),
        database: configService.get<string>("database.database"),
        schema: configService.get<string>("database.schema"),
        autoLoadEntities: true,
        migrations: [`${__dirname}/shared/database/migrations/*{.ts,.js}`],
        synchronize: configService.get<boolean>("database.synchronize", false),
        logging: configService.get<boolean>("database.logging", false),
        ssl: process.env.NODE_ENV === "production",
        migrationsTableName: "migrations_api",
        extra: {
          max: 20,
          connectionTimeoutMillis: 5000,
        },
      }),
    }),

    // Shared Module
    SharedRedisModule,
    CachingModule,

    // Features Modules
    UsersModule,
    MembersModule,
    ActivityModule,
    StatsModule,
    SettingsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  /**
   * Configure middleware for all routes
   * @param consumer - Middleware consumer to apply middleware
   */
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes("*path")
  }
}
