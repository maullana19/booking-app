import { Inject, Injectable, Logger } from '@nestjs/common';
import ImageKit from '@imagekit/nodejs';

@Injectable()
export class ImageKitService {
  private readonly logger = new Logger(ImageKit.name);

  constructor(
    @Inject('IMAGEKIT_CLIENT')
    private readonly imageKit: ImageKit,
  ) { }

  async uploadPoster(fileBuffer: Buffer, fileName: string): Promise<string> {
    try {
      if (!fileBuffer?.length) {
        throw new Error('Poster file is empty');
      }

      if (!fileName?.trim()) {
        throw new Error('Poster file name is required');
      }

      const result = await this.imageKit.files.upload({
        file: fileBuffer.toString('base64'),
        fileName: `poster-${Date.now()}-${fileName.trim()}`,
        folder: '/booking-app/posters',
      });

      if (!result.url) {
        throw new Error('ImageKit did not return a URL');
      }

      return result.url;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`ImageKit upload failed: ${message}`, stack);
      throw new Error('Gagal mengunggah poster. Silakan coba lagi.');
    }
  }
}
