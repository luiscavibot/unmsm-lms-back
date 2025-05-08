import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserToken = createParamDecorator((_data: unknown | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;
  return user;
});
