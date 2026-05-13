import { IsUrl, IsOptional } from 'class-validator';

export class ReplayDto {
  @IsUrl({ require_tld: false }) // allow localhost URLs too
  @IsOptional()
  targetUrl?: string;
}
