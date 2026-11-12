/**
 * 전역 성공 응답 인터셉터. 모든 정상 응답을 `{ success:true, data }`로 감싼다.
 */
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data: unknown) => ({ success: true, data: data ?? null })));
  }
}
