// scripts/run-migrations.ts
import { AppDataSource } from '../src/config/database';

AppDataSource.initialize()
  .then(async () => {
    console.log('📦 Executando migrations...');
    await AppDataSource.runMigrations();
    console.log('✅ Migrations aplicadas com sucesso!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Erro ao rodar migration:', err);
    process.exit(1);
  });
