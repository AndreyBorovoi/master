import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserService } from './user/user.service';
import { AiserviceService } from './aiservice/aiservice.service';

@Injectable()
export class TokenWithModelIDGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private aiserviceService: AiserviceService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = await this.userService.getUserByToken(request.params.token);
    const service = await this.aiserviceService.getAIServiceByModelId(
      request.params.modelId,
    );

    if (!user || !service || user._id.toString() !== service.owner.toString()) {
      return false;
    }
    request.user = user;
    request.service = service;
    return true;
  }
}
