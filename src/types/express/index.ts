import { Request, Response } from "express";
import { ParamsDictionary, Query } from "express-serve-static-core";
import { UserDocument } from "../models/User.js";

export interface AuthRequest extends Request {
  user?: UserDocument;
  file?: Express.Multer.File;
  files?:
    | {
        [fieldname: string]: Express.Multer.File[];
      }
    | Express.Multer.File[];
}

export interface RequestParams {
  [key: string]: string;
}

export interface RequestQuery {
  [key: string]: string | string[] | undefined;
}

export interface TypedRequest<
  T = any,
  P extends ParamsDictionary = ParamsDictionary,
  Q extends Query = Query
> extends AuthRequest {
  body: T;
  params: P;
  query: Q;
}

export interface TypedResponse<T = any> extends Response {
  json(body: T): this;
}

export type NextFunction = (err?: any) => void;

export type ControllerFunction<
  B = any,
  P extends ParamsDictionary = ParamsDictionary,
  Q extends Query = Query
> = (
  req: TypedRequest<B, P, Q>,
  res: Response,
  next: NextFunction
) => Promise<any> | void;

export type ControllerHandler<
  B = any,
  P extends ParamsDictionary = ParamsDictionary,
  Q extends Query = Query
> = (
  req: TypedRequest<B, P, Q>,
  res: Response,
  next?: NextFunction
) => Promise<any> | void;

export interface IdParam extends ParamsDictionary {
  id: string;
}

export interface PlayerIdParam extends ParamsDictionary {
  playerId: string;
}

export interface MatchIdParam extends ParamsDictionary {
  matchId: string;
}

export interface ArticleIdParam extends ParamsDictionary {
  articleId: string;
}

export interface UserIdParam extends ParamsDictionary {
  userId: string;
}
