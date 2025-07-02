import { FastifyReply, FastifyRequest } from 'fastify';
import { userAdminRepository } from '../repositories/userAdmin.repository';
import bcrypt from 'bcrypt';

export async function loginController(request: FastifyRequest, reply: FastifyReply) {
  const { username, password } = request.body as { username: string; password: string };

  const user = await userAdminRepository.findOneBy({ username });
  if (!user) return reply.status(401).send({ message: 'Usuário não encontrado' });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return reply.status(401).send({ message: 'Senha incorreta' });

  const token = await (reply as any).jwtSign(
    { id: user.id, username: user.username },
    { expiresIn: '3h' } // 👈 define expiração de 1 hora
  );
    return reply.send({ token });
}