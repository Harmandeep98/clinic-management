import { AppError } from "./app-errors";

export function mapPostgresError(error: any): AppError | null {
  if (!error?.code) return null;

  switch (error.code) {
    case "23505":
      return new AppError("Duplicate resource", 409, "UNIQUE_VIOLATION");
    case "23503":
      return new AppError("Invalid refrence", 400, "FK_VIOLATION");
    case "23514":
      return new AppError("Invalid data", 400, "CHECK_VIOLATION");
    case "22P02":
      return new AppError("Invalid input format", 400, "INVALID_INPUT");
    case "40001":
      return new AppError("Please retry request", 400, "SERIALIZATION_FAILURE");
    default:
      return null;
  }
}
