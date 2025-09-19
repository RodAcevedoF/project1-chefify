export class AppError extends Error {
  public statusCode: number;
  public isApp: true = true;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}
