import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InvoicesModule } from './invoices/invoices.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().uri().required(),
        SUSPICIOUS_VARIATION_PERCENTAGE: Joi.number(),
        INVOICES_HISTORY_COUNT: Joi.number(),
        SUSPICIOUS_INVOICES_COUNT: Joi.number(),
        SUSPICIOUS_TIMEFRAME_HOURS: Joi.number(),
      }),
    }),
    EventEmitterModule.forRoot(),
    InvoicesModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}