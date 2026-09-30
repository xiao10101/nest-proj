import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class BusinessException extends HttpException {
  constructor(
    public readonly code: number,
    message: string,
  ) {
    super(message, HttpStatus.OK);
    this.name = this.constructor.name;
  }
}
