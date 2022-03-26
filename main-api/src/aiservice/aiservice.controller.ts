import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { PermissionsDto, CreateServiceDto, RequestDto } from './dto/aisecvice.dto';
import { AiserviceService } from './aiservice.service';

import { ResponseFromService } from './types'

@Controller('aiservice')
export class AiserviceController {
  constructor(private aiserviceService: AiserviceService) {}

  @Get('test')
  async test() {
    return this.aiserviceService.test();
  }

  @Post('create')
  @UseInterceptors(FileInterceptor('model'))
  async create(
    @Body() { token, description }: CreateServiceDto,
    @UploadedFile() model: Express.Multer.File,
  ) {
    if (!model) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'add model',
        error: 'Bad Request',
      };
    }

    const modelData = await this.aiserviceService.create(
      token,
      model.buffer,
      description,
    );
    return { ...modelData, status: HttpStatus.CREATED };
  }

  @Get('get_services')
  async getServices(@Body() { token }: PermissionsDto) {
    const services = await this.aiserviceService.getAIServices(token);
    return { services, status: HttpStatus.OK };
  }

  @Get('request/:modelId')
  async request(@Param('modelId') modelId: string, @Body() { data }: RequestDto) {
    const response = await this.aiserviceService.request(modelId, data);

    const element: ResponseFromService = JSON.parse(response.element)
    
    switch (element.status) {
      case 'ok':
        return {
          'response': element.prediclion,
          'time': element.time,
          status: HttpStatus.OK,
        }

      case 'error':
        return {
          'error': element.error,
          'time': element.time,
          status: HttpStatus.BAD_REQUEST,
        }
      
      case 'internal_error':
        return {
          'error': 'internal error',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        }
    
      default:
        throw InternalServerErrorException
    }
  }

  @Post('start/:modelId')
  async start(
    @Param('modelId') modelId: string,
    @Body() { token }: PermissionsDto,
  ) {}

  @Post('stop/:modelId')
  async stop(
    @Param('modelId') modelId: string,
    @Body() { token }: PermissionsDto,
  ) {}

  @Post('delete/:modelId')
  async delete(
    @Param('modelId') modelId: string,
    @Body() { token }: PermissionsDto,
  ) {}
}
