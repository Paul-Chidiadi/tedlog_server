import { Controller } from '@nestjs/common';
import { ConsignorService } from './consignor.service';

@Controller('consignor')
export class ConsignorController {
  constructor(private readonly consignorService: ConsignorService) {}
}
