import { Controller } from '@nestjs/common';
import { KarthlogService } from './karthlog.service';

@Controller('karthlog')
export class KarthlogController {
  constructor(private readonly karthlogService: KarthlogService) {}
}
