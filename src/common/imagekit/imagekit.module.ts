import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImageKit from '@imagekit/nodejs';
import { ImageKitService } from './imagekit.service.js';

@Global()
@Module({
  providers: [
    {
      provide: 'IMAGEKIT_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new ImageKit({
          privateKey: configService.getOrThrow<string>('IMAGEKIT_PRIVATE_KEY'),
        });
      },
      inject: [ConfigService],
    },
    ImageKitService,
  ],
  exports: ['IMAGEKIT_CLIENT', ImageKitService],
})
export class ImageKitModule {}
