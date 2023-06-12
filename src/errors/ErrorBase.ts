class ErrorBase extends Error {
  private readonly httpStatusCode;
  constructor(message: string, httpStatusCode: number) {
    super(message);

    this.httpStatusCode = httpStatusCode;
  }

  getMessage(): string {
    return this.message;
  }

  getHttpStatusCode(): number {
    return this.httpStatusCode;
  }
}

export default ErrorBase;
