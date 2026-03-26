import type { User } from "@/server/api/proto/app/v1/common";
import { TinyRpcError } from "@hiogawa/tiny-rpc";
import { tinyassert } from "@hiogawa/utils";
import { Context } from "hono";
import { tryGetContext } from "hono/context-storage";
import { setCookie } from "hono/cookie";

export const redisClient = () => {
  const context = tryGetContext<any>();
  const redis = context?.get("redis")
  if (!redis) {
    throw new Error("Redis client not found in context");
  }
  return redis;
};

export async function generateAndSetTokens(c: Context, userData: User) {
  const redis = c.get("redis");
  const jwtProvider = c.get("jwtProvider");

  return await jwtProvider
    .generateTokenPair(userData.id!, userData.email!, userData.role!)
    .then((td) => {
      redis.set(
        "refresh_uuid:" + td.refreshUUID,
        userData.id!,
        "EX",
        td.rtExpires - Math.floor(Date.now() / 1000),
      );

      setCookie(c, "access_token", td.accessToken, {
        expires: new Date(td.atExpires * 1000),
        httpOnly: true,
        secure: false,
        path: "/",
      });

      setCookie(c, "refresh_token", td.refreshToken, {
        expires: new Date(td.rtExpires * 1000),
        httpOnly: true,
        secure: false,
        path: "/",
      });

      return td;
    })
    .catch((e: unknown) => {
      console.error("Error generating tokens", e);
      throw e;
    });
}
export const class2Object = <T>(classConvert: T) => {
    const keys = Object.getOwnPropertyNames(
        Object.getPrototypeOf(classConvert)
    ) as Array<keyof T>
    const object = keys.reduce((classAsObj: Record<string, any>, key) => {
        classAsObj[key as string] = (classConvert[key] as any).bind(
            classConvert
        )
        return classAsObj
    }, {})
    return object as T
}
// validator agnostic function guard
// now supports multiple schemas / multiple args
// (it only supports zod for starter)

export function validateFn<Schemas extends readonly unknown[]>(
  ...schemas: Schemas
) {
  return function decorate<Out>(
    fn: (...inputs: InferOutputs<Schemas>) => Out
  ): (...inputRaws: InferInputs<Schemas>) => Out {
    return function wrapper(...inputRaws) {
      if (inputRaws.length !== schemas.length) {
        throw new TinyRpcError(
          `invalid argument count: expected ${schemas.length}, got ${inputRaws.length}`
        ).setStatus(400);
      }

      const inputs = schemas.map((schema, index) => {
        const parser = getParser(schema);
        try {
          return parser(inputRaws[index]);
        } catch (e) {
          throw TinyRpcError.fromUnknown(`Error validating argument at index ${index}: ${e instanceof Error ? e.message : 'Unknown error'}`).setStatus(400);
        }
      }) as InferOutputs<Schemas>;

      return fn(...inputs);
    };
  };
}

// infer input/output from a single parser
type InferIO<Parser> = Parser extends { _input: infer I; _output: infer O }
  ? {
      i: I;
      o: O;
    }
  : {
      i: never;
      o: never;
    };

// infer tuple of raw inputs from tuple of schemas
type InferInputs<Schemas extends readonly unknown[]> = {
  [K in keyof Schemas]: InferIO<Schemas[K]>["i"];
};

// infer tuple of parsed outputs from tuple of schemas
type InferOutputs<Schemas extends readonly unknown[]> = {
  [K in keyof Schemas]: InferIO<Schemas[K]>["o"];
};

function getParser(schema: unknown): (input: unknown) => unknown {
  tinyassert(schema && typeof schema === "object");

  if ("parse" in schema && typeof schema.parse === "function") {
    return schema.parse.bind(schema);
  }

  throw new TinyRpcError("unsupported schema", { cause: schema });
}