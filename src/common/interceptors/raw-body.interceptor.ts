import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class RawBodyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();

    if (request.headers['content-type'] === 'application/json') {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        if (typeof data === 'object' && data !== null) {
          return { ...data, rawBody: request.rawBody };
        }
        return data;
      }),
    );
  }
}
