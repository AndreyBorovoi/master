import { IsString, IsOptional, IsArray } from 'class-validator';

export class RequestDto {
  @IsArray()
  data: any[];
}
