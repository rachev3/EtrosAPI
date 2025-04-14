import { Request, Response, NextFunction } from "express";
import { ParamsDictionary, Query } from "express-serve-static-core";
import { TypedRequest, ControllerFunction } from "../types/express/index.js";

const asyncHandler = <
  B = any,
  P extends ParamsDictionary = ParamsDictionary,
  Q extends Query = Query
>(
  fn: ControllerFunction<B, P, Q>
): ((
  req: TypedRequest<B, P, Q>,
  res: Response,
  next: NextFunction
) => void) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
