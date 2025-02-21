import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo() {
    return {
      name: 'UNMSM LMS API',
      version: '1.0.0',
      status: 'running'
    };
  }
}
