// src/main.ts
import 'reflect-metadata';
import { config } from 'dotenv';
import { AppDataSource } from './config/database';
import { buildServer } from './server';

config(); // carregar variáveis do .env



const start = async () => {
  try {
    await AppDataSource.initialize();
    const app = await buildServer();

    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Servidor rodando em http://localhost:3000');
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

start();
