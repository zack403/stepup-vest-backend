import { DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
config();


 
const databaseConfig: DataSourceOptions  = {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl:  process.env.NODE_ENV === 'production' ? {rejectUnauthorized: false} : false,
      entities: [
        __dirname + '/../**/*.entity.ts',
        __dirname + '/../**/*.entity.js',
      ],
      synchronize: true,
      migrations: process.env.NODE_ENV === 'production' ? ["dist/database/migrations/*.js"] : ["dist/database/migrations/*{.ts,.js}"],
      migrationsTableName: "migrations_typeorm",
      migrationsRun: false
};
 
export = databaseConfig;