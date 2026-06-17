import "reflect-metadata";
import { promises as fs } from "fs";
import path from "path";
import util from "util";
import childProcess from "child_process";
import { buildSchema } from "type-graphql";
import { graphql } from "graphql";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import generateArtifactsDirPath from "../helpers/artifacts-dir";
import { getDirectoryStructureString } from "../helpers/structure";

const exec = util.promisify(childProcess.exec);

describe("generator integration", () => {
  let cwdDirPath: string;
  let schema: string;

  beforeEach(async () => {
    cwdDirPath = generateArtifactsDirPath("functional-integration");
    await fs.mkdir(cwdDirPath, { recursive: true });

    schema = /* prisma */ `
      datasource db {
        provider = "postgresql"
      }

      generator client {
        provider = "prisma-client"
        output   = "./generated/client"
      }

      generator typegraphql {
        provider = "node ../../../src/cli/dev.ts"
        output   = "./generated/type-graphql"
        emitTranspiledCode = true
      }

      enum Color {
        RED
        GREEN
        BLUE
      }

      model User {
        id     Int      @id @default(autoincrement())
        name   String?
        posts  Post[]
      }

      model Post {
        uuid      String  @id @default(cuid())
        content   String
        author    User    @relation(fields: [authorId], references: [id])
        authorId  Int
        color     Color
      }
    `;
    await fs.writeFile(path.join(cwdDirPath, "schema.prisma"), schema);
    await fs.writeFile(
      path.join(cwdDirPath, ".env"),
      `DATABASE_URL=${process.env.TEST_DATABASE_URL}`,
    );
  });

  it("should generates TypeGraphQL classes files to output folder by running `prisma generate`", async () => {
    const prismaGenerateResult = await exec("npx prisma generate", {
      cwd: cwdDirPath,
    });
    // console.log(prismaGenerateResult);

    const directoryStructureString = getDirectoryStructureString(
      cwdDirPath + "/generated/type-graphql",
    );

    expect(prismaGenerateResult.stdout).toContain("Generated");
    expect(directoryStructureString).toMatchSnapshot("files structure");
  }, 60000);

  it("should be able to use generate TypeGraphQL classes files to generate GraphQL schema", async () => {
    const prismaGenerateResult = await exec("npx prisma generate", {
      cwd: cwdDirPath,
    });
    // console.log(prismaGenerateResult);

    // Prisma v7's prisma-client generates client.ts (not index.ts),
    // so we add a package.json with proper entry point and register
    // ts-node to enable require() of TypeScript files.
    await fs.writeFile(
      path.join(cwdDirPath, "generated", "client", "package.json"),
      JSON.stringify({ main: "client", types: "client.d.ts" }),
    );
    require("ts-node/register/transpile-only");

    const {
      UserCrudResolver,
      PostCrudResolver,
      UserRelationsResolver,
      PostRelationsResolver,
    } = require(cwdDirPath + "/generated/type-graphql");
    await buildSchema({
      resolvers: [
        UserCrudResolver,
        PostCrudResolver,
        UserRelationsResolver,
        PostRelationsResolver,
      ],
      validate: false,
      emitSchemaFile: cwdDirPath + "/schema.graphql",
    });
    const graphQLSchemaSDL = await fs.readFile(cwdDirPath + "/schema.graphql", {
      encoding: "utf8",
    });

    expect(prismaGenerateResult.stdout).toContain("Generated");
    expect(graphQLSchemaSDL).toMatchSnapshot("graphQLSchemaSDL");
  }, 60000);

  it("should be able to generate TypeGraphQL classes files without any type errors", async () => {
    const tsconfigContent = {
      compilerOptions: {
        target: "ES2021",
        module: "commonjs",
        lib: ["ES2021"],
        strict: true,
        skipLibCheck: true,
        esModuleInterop: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        forceConsistentCasingInFileNames: true,
      },
    };
    const typegraphqlfolderPath = path.join(
      cwdDirPath,
      "generated",
      "type-graphql",
    );

    const prismaGenerateResult = await exec("npx prisma generate", {
      cwd: cwdDirPath,
    });
    // console.log(prismaGenerateResult);
    // Prisma v7's prisma-client outputs client.ts instead of index.ts,
    // so we add a package.json to make the directory import resolvable.
    await fs.writeFile(
      path.join(cwdDirPath, "generated", "client", "package.json"),
      JSON.stringify({ main: "client.js", types: "client.d.ts" }),
    );
    await fs.writeFile(
      path.join(typegraphqlfolderPath, "tsconfig.json"),
      JSON.stringify(tsconfigContent),
    );
    const tscResult = await exec("npx tsc --noEmit", {
      cwd: typegraphqlfolderPath,
    });

    expect(prismaGenerateResult.stdout).toContain("Generated");
    expect(tscResult.stdout).toHaveLength(0);
    expect(tscResult.stderr).toHaveLength(0);
  }, 60000);

  it("should properly fetch the data from DB using PrismaClient while queried by GraphQL schema", async () => {
    const prismaGenerateResult = await exec("npx prisma generate", {
      cwd: cwdDirPath,
    });
    // console.log(prismaGenerateResult);
    expect(prismaGenerateResult.stdout).toContain("Generated");

    // drop database before migrate
    const originalDatabaseUrl = process.env.TEST_DATABASE_URL;
    const [dbName, ...databaseUrlParts] = (originalDatabaseUrl ?? "")
      .split("/")
      .reverse();
    const databaseUrl = databaseUrlParts.reverse().join("/") + "/postgres";
    const pgClient = new pg.Client({
      connectionString: databaseUrl,
    });
    await pgClient.connect();
    await pgClient.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    await pgClient.end();

    const prismaMigrateResult = await exec(
      `npx prisma migrate dev --name init --url "${process.env.TEST_DATABASE_URL}"`,
      { cwd: cwdDirPath },
    );
    // console.log(prismaMigrateResult);
    expect(prismaMigrateResult.stdout).toContain(
      "Your database is now in sync with your schema",
    );

    // Prisma v7's prisma-client generates client.ts (not index.ts),
    // so we add a package.json with proper entry point and register
    // ts-node to enable require() of TypeScript files.
    // Must be done after prisma migrate dev (which also runs generators)
    // to avoid being overwritten.
    await fs.writeFile(
      path.join(cwdDirPath, "generated", "client", "package.json"),
      JSON.stringify({ main: "client", types: "client.d.ts" }),
    );
    require("ts-node/register/transpile-only");

    const { PrismaClient } = require(cwdDirPath + "/generated/client");
    const prisma = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: process.env.TEST_DATABASE_URL,
      }),
    });

    await prisma.user.create({ data: { name: "test1" } });
    await prisma.user.create({
      data: {
        name: "test2",
        posts: {
          create: [
            {
              color: "RED",
              content: "post content",
            },
          ],
        },
      },
    });
    await prisma.user.create({ data: { name: "not test" } });

    const {
      UserCrudResolver,
      PostCrudResolver,
      UserRelationsResolver,
      PostRelationsResolver,
    } = require(cwdDirPath + "/generated/type-graphql");
    const graphQLSchema = await buildSchema({
      resolvers: [
        UserCrudResolver,
        PostCrudResolver,
        UserRelationsResolver,
        PostRelationsResolver,
      ],
      validate: false,
    });

    const query = /* graphql */ `
      query {
        users(where: {
          name: {
            startsWith: "test"
          }
        }) {
          id
          name
          posts {
            content
            color
            author {
              name
            }
          }
        }
      }
    `;
    const { data, errors } = await graphql({
      schema: graphQLSchema,
      source: query,
      contextValue: { prisma },
    });
    await prisma.$disconnect();

    expect(errors).toBeUndefined();
    expect(data).toMatchSnapshot("graphql data");
  }, 100000);
});
