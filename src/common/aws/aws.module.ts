import { S3Client } from '@aws-sdk/client-s3';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'S3_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const region = config.get<string>('AWS_REGION');

        if (!region) {
          throw new Error('AWS_REGION is not defined in the configuration');
        }

        return new S3Client({
          region,
        });
      },
    },
  ],
  exports: ['S3_CLIENT'],
})
export class AwsModule {}
