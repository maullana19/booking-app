import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CreateProductEventDto } from './dto/create-product-event.dto.js';
import { UpdateProductEventDto } from './dto/update-product-event.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity.js';
import { ProductEvent } from './entities/product-event.entity.js';
import { Venue } from '../venues/entities/venue.entity.js';

@Injectable()
export class ProductEventsService {
  constructor(
    @InjectRepository(ProductEvent)
    private productEventRepository: Repository<ProductEvent>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
  ) {}

  async create(dto: CreateProductEventDto): Promise<ProductEvent> {
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product ${dto.productId} tidak ditemukan`);
    }

    // 2. Cek apakah produk sudah punya detail event (relasi 1:1)
    const existing = await this.productEventRepository.findOne({
      where: { productId: dto.productId },
    });

    if (existing) {
      throw new ConflictException(`Product ${dto.productId} have detail event`);
    }

    // 3. Validasi venue ada
    const venue = await this.venueRepository.findOne({
      where: { id: dto.venueId },
    });
    if (!venue) {
      throw new NotFoundException(`Venue ${dto.venueId} is not found!`);
    }

    // 4. Validasi endTime > startTime
    if (new Date(dto.endTime) <= new Date(dto.startTime)) {
      throw new BadRequestException('end_time must bigger than start_time');
    }

    // 5. Validasi saleEndTime > saleStartTime (jika diisi)
    if (dto.saleStartTime && dto.saleEndTime) {
      if (new Date(dto.saleEndTime) <= new Date(dto.saleStartTime)) {
        throw new BadRequestException(
          'sale_end_time must bigger than sale_start_time',
        );
      }
    }

    const event = this.productEventRepository.create({
      productId: dto.productId,
      venueId: dto.venueId,
      artistName: dto.artistName ?? null,
      startTime: dto.startTime,
      endTime: dto.endTime,
      saleStartTime: dto.saleStartTime ?? null,
      saleEndTime: dto.saleEndTime ?? null,
    });

    return this.productEventRepository.save(event);
  }

  async findAll(): Promise<ProductEvent[]> {
    return this.productEventRepository.find();
  }

  async findOne(id: string): Promise<ProductEvent> {
    const event = await this.productEventRepository.findOne({
      where: { id },
      relations: {
        venue: true,
        product: { variants: true },
      },
    });
    if (!event) {
      throw new NotFoundException(`Product event ${id} tidak ditemukan`);
    }
    return event;
  }

  async update(id: string, dto: UpdateProductEventDto): Promise<ProductEvent> {
    const event = await this.findOne(id);

    // Validasi venue jika diubah
    if (dto.venueId && dto.venueId !== event.venueId) {
      const venue = await this.venueRepository.findOne({
        where: { id: dto.venueId },
      });
      if (!venue) {
        throw new NotFoundException(`Venue ${dto.venueId} tidak ditemukan`);
      }
    }

    // Validasi waktu jika diubah
    const startTime = dto.startTime ?? event.startTime;
    const endTime = dto.endTime ?? event.endTime;
    if (new Date(endTime) <= new Date(startTime)) {
      throw new BadRequestException(
        'end_time harus lebih besar dari start_time',
      );
    }

    Object.assign(event, {
      venueId: dto.venueId ?? event.venueId,
      artistName: dto.artistName ?? event.artistName,
      startTime,
      endTime,
      saleStartTime: dto.saleStartTime ?? event.saleStartTime,
      saleEndTime: dto.saleEndTime ?? event.saleEndTime,
    });

    return this.productEventRepository.save(event);
  }

  // Delete Event
  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.productEventRepository.remove(event);
  }

  // Is Sales Open?
  async isSaleOpen(productId: string): Promise<boolean> {
    const event = await this.productEventRepository.findOne({
      where: { productId },
    });
    if (!event) return false;

    const now = new Date();

    if (event.saleStartTime && now < event.saleStartTime) return false;
    if (event.saleEndTime && now > event.saleEndTime) return false;

    return true;
  }
}
