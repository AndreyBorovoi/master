import { IsString, IsOptional } from 'class-validator';

export class PermissionsDto {
  @IsString()
  token: string;
}

export class CreateServiceDto extends PermissionsDto {
  @IsString()
  @IsOptional()
  description?: string;
}
