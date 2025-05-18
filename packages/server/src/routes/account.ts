import { Elysia, t } from "elysia";
import auth from "../auth";
import db from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import CryptoJS from 'crypto-js';

export const secretSessionKey = 'your-secret-key';

function hashSession(sessionData: any, secretKey: string | CryptoJS.lib.WordArray) {
  // Convert session data to a string if it's an object
  const sessionString = typeof sessionData === 'object' ? JSON.stringify(sessionData) : sessionData;

  // Create the HMAC using SHA256
  const hash = CryptoJS.HmacSHA256(sessionString, secretKey);

  // Return the hash as a hexadecimal string
  return hash.toString(CryptoJS.enc.Hex);
}

export function verifySessionHash(sessionData: [{ id: any; user: any; timestamp: any; }, { hash: string | undefined; }], secretKey: string | CryptoJS.lib.WordArray) {
  // 1. Generate the hash of the session data
  const generatedHash = CryptoJS.HmacSHA256(JSON.stringify(sessionData[0]), secretKey).toString();

  // 2. Compare the generated hash with the stored hash
  return generatedHash === sessionData[1].hash;
}

export default function () {
  return new Elysia()
    .use(auth())
    .use(db())
    .group("/auth", (app) => {
      return app
        // .get(
        //   "/me",
        //   async ({ auth, set }) => {
        //     // if (!auth.isAuthed) {
        //     //   set.status = 401;
        //     // }
        //     // return user info here
        //     // if (auth.isAuthed)
        //     return JSON.stringify({
        //       name: auth.user.name,
        //       id: auth.user.name,
        //     });
        //   },
        //   // {
        //   //   beforeHandle: ({ auth, set }) => {
        //   //     if (!auth.isAuthed) {
        //   //       set.status = 401;
        //   //       return { message: "Unauthorized" };
        //   //     }
        //   //   },
        //   // },
        // )
        .get(
          "/logout",
          async ({ cookie: { token } }) => {
            token.remove()
            return
          },
        )
        .get(
          "/refresh",
          async ({ jwt, set, store: { db }, cookie: { token } }) => {

            if (token.value) {
              const theUser = await db.select({
                id: users.id,
                name: users.name,
                timestamp: users.timestamp

              }).from(users).where(eq(users.session, token.value));

              if (!users.session) {
                set.status = 401
                return {
                  showAlert: true
                }

              }

              const accessToken = await jwt.sign({
                id: theUser[0].id,
                user: theUser[0].name,
                timestamp: theUser[0].timestamp?.toString(),
              });

              const res = { ...theUser[0], accessToken }

              return res
            }

            return set.status = 401

          },
        )
        .guard(
          {
            body: t.Object({
              name: t.String({ minLength: 3 }),
              password: t.String({ minLength: 6 }),
            }),
          },
          (app) => {
            return app
              .post(
                "/register",
                async ({ jwt, body: { name, password }, set, store: { db }, cookie: { token } }) => {
                  // check if user already exists
                  const user = await db.query.users.findFirst({
                    where: (user, { eq }) => eq(user.name, name),
                  });

                  if (user) {
                    set.status = 409; // conflict
                    return;
                  }

                  // create user
                  const hashedPassword = await Bun.password.hash(password, {
                    algorithm: "bcrypt",
                    cost: 10,
                  });


                  const newUser = await db.insert(users).values({
                    name,
                    passwordHash: hashedPassword,
                  }).returning({ insertedId: users.id });

                  const date = new Date(); // Get the current date and time
                  const longNumber = date.getTime();

                  const sessionData = {
                    id: newUser[0].insertedId,
                    user: name,
                    timestamp: longNumber.toString()
                  }

                  const hashedSessionToken = hashSession(sessionData, secretSessionKey);

                  await db.update(users)
                    .set({
                      timestamp: longNumber.toString(),
                      session: hashedSessionToken
                    })
                    .where(eq(users.id, newUser[0].insertedId));

                  const accessToken = await jwt.sign({
                    id: newUser[0].insertedId,
                    user: name,
                    timestamp: longNumber.toString(),
                  });

                  const today = new Date();
                  const nextWeek = new Date(today);

                  nextWeek.setDate(today.getDate() + 7);

                  token.set({
                    path: "/",
                    value: hashedSessionToken,
                    httpOnly: true,
                    expires: nextWeek
                  })

                  const jsonResponse = { accessToken, name, id: newUser[0].insertedId, timestamp: longNumber };

                  return jsonResponse;
                },
              )
              .post(
                "/login",
                async ({ jwt, body: { name, password }, set, store: { db }, cookie: { token } }) => {
                  const user = (
                    await db
                      .select()
                      .from(users)
                      .where(eq(users.name, name))
                      .limit(1)
                  )[0];

                  const isMatch = await Bun.password.verify(
                    password,
                    user?.passwordHash || "",
                  );

                  if (!user || !isMatch) {
                    set.status = 401;
                    return;
                  }

                  const date = new Date(); // Get the current date and time
                  const longNumber = date.getTime();

                  const sessionData = {
                    id: user.id,
                    user: name,
                    timestamp: longNumber.toString()
                  }

                  const hashedSessionToken = hashSession(sessionData, secretSessionKey);

                  await db.update(users)
                    .set({
                      timestamp: longNumber.toString(),
                      session: hashedSessionToken
                    })
                    .where(eq(users.name, name));

                  const accessToken = await jwt.sign({
                    id: user.id,
                    user: name,
                    timestamp: longNumber.toString(),
                  });

                  const today = new Date();
                  const nextWeek = new Date(today);

                  
                  nextWeek.setDate(today.getDate() + 7);

                  token.set({
                    path: "/",
                    value: hashedSessionToken,
                    httpOnly: true,
                    expires: nextWeek
                  })

                  const jsonResponse = { accessToken, name, id: user.id, timestamp: longNumber };

                  return jsonResponse;

                },
              )

              .delete(
                "/me",
                async ({ body: { password }, auth, set, store: { db } }) => {
                  if (!auth.isAuthed) {
                    return (set.status = 401);
                  }

                  const user = (
                    await db
                      .select()
                      .from(users)
                      .where(eq(users.id, auth.user.id))
                      .limit(1)
                  )[0];

                  if (!user) {
                    set.status = 404;
                    return;
                  }

                  // verify password

                  const isMatch = await Bun.password.verify(
                    password,
                    user.passwordHash,
                  );

                  if (!isMatch) {
                    set.status = 401;
                    return;
                  }

                  const deleted = (
                    await db
                      .delete(users)
                      .where(eq(users.id, user.id))
                      .returning()
                  )[0];

                  if (deleted) {
                    set.status = 200;
                    return;
                  }
                },
                { body: t.Object({ password: t.String() }) },
              );
          },
        );
    });
}
