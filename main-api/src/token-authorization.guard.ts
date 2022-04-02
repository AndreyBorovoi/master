import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserService } from './user/user.service';

@Injectable()
export class TokenAuthorizationGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = await this.userService.getUserByToken(request.params.token);
    request.user = user;
    if (!user) {
      return false;
    }

    return true;
  }
}
