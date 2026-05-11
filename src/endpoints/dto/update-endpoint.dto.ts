import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class UpdateEndpointDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(599)
  responseStatus?: number;

  @IsOptional()
  @IsString()
  responseBody?: string;
}
