import { IsString, IsOptional, IsArray } from 'class-validator';

export class PermissionsDto {
  @IsString()
  token: string;
}

export class CreateServiceDto extends PermissionsDto {
  @IsString()
  @IsOptional()
  description?: string;
}

export class RequestDto {
  @IsArray()
  data: any[];
}
