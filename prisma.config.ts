import { defineConfig } from '@prisma/config';
import 'dotenv/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://myuser:mysecret@localhost:5432/hireready_db?schema=public",
  },
});
