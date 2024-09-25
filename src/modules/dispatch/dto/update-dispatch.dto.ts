import { IsString, IsNotEmpty } from 'class-validator';
import { DISPATCH_STATUS } from 'src/common/enums/dispatch.enum';

export class UpdateDispatchDto {
  @IsString()
  @IsNotEmpty()
  status: DISPATCH_STATUS;
}
