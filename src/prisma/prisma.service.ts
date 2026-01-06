/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined');
    }

    super({
      // adapter typing triggers eslint unsafe rules in some setups
      adapter: new PrismaPg({ connectionString }) as any,
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma connected');
  }
}
