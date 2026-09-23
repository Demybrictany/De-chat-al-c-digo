import { IsBoolean } from 'class-validator';

export class SetPriorityDto {
  @IsBoolean()
  isPriority: boolean;
}
