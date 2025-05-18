import { Elysia, t, Static } from "elysia";
import db from "../db";
import auth from "../auth";
import jwt from "@elysiajs/jwt";
import { secretSessionKey, verifySessionHash } from "./account";

const tMessage = t.Object({ message: t.String() });
const tToken = t.Object({ accessToken: t.String() });
const tpayload = t.Union([tMessage, tToken]);

type Token = Static<typeof tToken>;
type Message = Static<typeof tMessage>;

function isToken(payload: Token | Message): payload is Token {
  // message takes precedence
  return (
    (payload as Token).accessToken !== undefined &&
    (payload as Message).message === undefined
  );
}

// one "global" chatroom for now
// TODO: implement chatrooms
export default function () {
  return new Elysia()
    .use(db())
    .use(auth())
    .ws("/chat/ws", {
      // body: tpayload,
      // response: t.Object({ name: t.String(), message: t.String() }),
      open: (ws) => {
     
      },
      message: async (ws, payload: any) => {
        // const { authFromToken } = ws.data.bearer;

        const accessToken = await ws.data.jwt.verify(payload.token); // payload.token 

        if (accessToken) {
          // good access token

          ws.subscribe("global");
          ws.send({ name: payload.user, message: "AUTHENTICATED", userMessage: payload.msg });
          ws.publish("global", {
            name: payload.user,
            message: payload.msg,
          });
          ws.send({ name: payload.user, message: payload.msg });

          //return { message: payload.msg }
        }
        if (!accessToken) {
          // refresh access token if session still valid

          const sessionData = {
            id: payload.id,
            user: payload.user,
            timestamp: payload.timestamp,
          }
          const sessionHash = {
            hash: ws.data.cookie.token.value
          }

          const isVerified = verifySessionHash([sessionData, sessionHash], secretSessionKey)      

          if (isVerified) {

            const newAccessToken = await ws.data.jwt.sign({
              id: payload.id,
              user: payload.user,
              timestamp: payload.timestamp,
            });

            ws.subscribe("global");
            ws.send({ name: payload.user, message: "AUTHENTICATED", userMessage: payload.msg });
            ws.publish("global", {
              name: payload.user,
              message: payload.msg,
            });
            ws.send({ name: payload.user, message: payload.msg, token: newAccessToken });

            return 
          }
        }

        // const auth1 = await authFromToken(payload.accessToken);

        // ws.data.auth = auth1;

        // if (payload.token) {
        //   ws.subscribe("global");
        //   ws.send({ name: "x", message: "AUTHENTICATED" });
        //   ws.publish("global", {
        //     name: payload.user,
        //     message: payload.message,
        //   });
        //   ws.send({ name: payload.user, message: payload.message });
        //   return;
        // } else {
        //   ws.send({ name: "x", message: "TOKEN_INVALID" });
        //   return;
        // }


        // const { auth } = ws.data;

        // if (!auth.isAuthed) {
        //   ws.send({ name: "x", message: "NOT_AUTHENTICATED" });
        //   return;
        // }


        // echo

      },

      close: () => {
        console.log("ws closed");
      },
    });
}
