import {
  IsString,
  IsOptional,
  IsInt,
  MinLength,
  Min,
  Max,
} from 'class-validator';

export class CreateEndpointDto {
  @IsString()
  @MinLength(1)
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
