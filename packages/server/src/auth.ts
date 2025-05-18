import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import bearer from "@elysiajs/bearer";
import db from "./db";
//import cookie from '@elysiajs/cookie'


export default () => {
  return new Elysia({ name: "auth" })
    .use(
      jwt({
        name: "jwt",
        secret: Bun.env.JWT_SECRET || "secret", // TODO: type-check env
        // schema: t.Object({
        //   name: t.String(),
        //   id: t.String(),
        // }),
        exp: "5m",
      }),
    )
    .use(bearer())
    .use(db())
    .derive(async ({ jwt }) => {
      return {
        authFromToken: async function (token?: string) {
          const decoded = await jwt.verify(token);

          if (decoded) {
            return {
              isAuthed: true as true,
              user: { name: decoded.name, id: decoded.id },
            };
          }

          return { isAuthed: false as false };
        },
      };
    })
    .derive(async ({ bearer, authFromToken }) => {
      // automaically authenticate from bearer token (if exists)
      return { auth: await authFromToken(bearer) };
    });
};
