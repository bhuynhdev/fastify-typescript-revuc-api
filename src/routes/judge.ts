import { Static as S, Type as t } from '@sinclair/typebox';
import { type FastifyPluginAsync } from 'fastify';
import { prisma } from 'utils/db';
import { parseDevPostProjectsCsv } from 'utils/devPost';
import {
  JudgeCreateDto,
  JudgeReplyDto,
  JudgeUpdateDto,
  UploadProjectCsvDto,
  UploadProjectCsvReplyDto,
} from 'utils/types';

const ParamsWithId = t.Object({ id: t.String() });

const routes: FastifyPluginAsync = async (fastify) => {
  /**
   * Register new judge
   */
  fastify.post<{ Body: S<typeof JudgeCreateDto>; Reply: S<typeof JudgeReplyDto> }>(
    '/',
    {
      schema: {
        description: 'Register new judge',
        tags: ['Judge'],
        body: JudgeCreateDto,
        response: {
          201: JudgeReplyDto,
        },
      },
    },
    async function (request, reply) {
      const newJudge = await prisma.judge.create({
        data: { ...request.body, auth: { create: { email: request.body.email, role: 'JUDGE' } } },
        include: { auth: true },
      });
      return reply.code(201).send(newJudge);
    },
  );

  /**
   * Update judge info. Currently only allow update name and category
   */
  fastify.patch<{
    Params: S<typeof ParamsWithId>;
    Body: S<typeof JudgeCreateDto>;
    Reply: S<typeof JudgeReplyDto>;
  }>(
    '/:id',
    {
      schema: {
        description: 'Register new judge',
        tags: ['Judge'],
        params: ParamsWithId,
        body: JudgeUpdateDto,
        response: {
          200: JudgeReplyDto,
        },
      },
    },
    async function (request, reply) {
      const updatedJudge = await prisma.judge.update({
        where: { id: request.params.id },
        data: { ...request.body },
        include: { auth: true },
      });
      return reply.code(201).send(updatedJudge);
    },
  );

  /**
   * Upload Projects CSV
   */
  fastify.post<{
    Body: S<typeof UploadProjectCsvDto>;
    Reply: { 200: S<typeof UploadProjectCsvReplyDto>; 400: { message: string } };
  }>(
    '/projects',
    {
      schema: {
        description: 'Upload Projects CSV',
        tags: ['Judge'],
        consumes: ['multipart/form-data'],
        body: UploadProjectCsvDto,
        response: {
          200: UploadProjectCsvReplyDto,
          400: t.Object({ message: t.String({ examples: ['No file submitted'] }) }),
        },
      },
    },
    async function (request, reply) {
      // Since using { attachFieldsToBody: 'keyValues' }, the file will get converted to a string
      // https://github.com/fastify/fastify-multipart#parse-all-fields-and-assign-them-to-the-body
      const csvString = request.body.csvFile;

      if (!csvString) {
        return reply.status(400).send({ message: 'No file submitted' });
      }

      try {
        const projects = await parseDevPostProjectsCsv(csvString);
        return reply.status(200).send({ count: projects.length });
      } catch (err) {
        return reply.status(400).send({ message: 'Parse error. Invalid file' });
      }
    },
  );
};

export default routes;
