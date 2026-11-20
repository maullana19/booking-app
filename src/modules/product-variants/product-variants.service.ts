import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateProductVariantDto } from './dto/create-product-variant.dto.js';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ProductVariant } from './entities/product-variant.entity.js';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
  ) {}

  // Create
  async create(
    createProductVariantDto: CreateProductVariantDto,
  ): Promise<ProductVariant> {
    const productVariant = this.productVariantRepository.create({
      productId: createProductVariantDto.product_id,
      name: createProductVariantDto.name,
      price: createProductVariantDto.price,
      attributes: createProductVariantDto.attributes ?? null,
      quota: createProductVariantDto.quota,
      available: createProductVariantDto.quota,
    });

    return this.productVariantRepository.save(productVariant);
  }

  // Show All
  async findAll(): Promise<ProductVariant[]> {
    return this.productVariantRepository.find();
  }

  // Show by ID
  async findOne(id: string): Promise<ProductVariant> {
    const productVariant = await this.productVariantRepository.findOneBy({
      id,
    });

    if (!productVariant) {
      throw new NotFoundException(
        `Product Variant with id ${id} is not found.`,
      );
    }

    return productVariant;
  }

  // Update By ID
  async update(
    id: string,
    updateProductVariantDto: UpdateProductVariantDto,
  ): Promise<ProductVariant> {
    const productVariant = await this.findOne(id);

    this.productVariantRepository.merge(
      productVariant,
      updateProductVariantDto,
    );

    return this.productVariantRepository.save(productVariant);
  }

  // DELETE by ID
  async remove(id: string): Promise<ProductVariant> {
    const productVariant = await this.findOne(id);
    return this.productVariantRepository.remove(productVariant);
  }

  async decrementStock(
    variantId: string,
    quantity: number,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager
      ? manager.getRepository(ProductVariant)
      : this.productVariantRepository;

    const variant = await repo.findOne({
      where: { id: variantId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!variant) {
      throw new NotFoundException(`Variant ${variantId} tidak ditemukan`);
    }

    if (variant.available < quantity) {
      throw new BadRequestException(
        `Stok "${variant.name}" tidak cukup. Tersisa ${variant.available}, diminta ${quantity}`,
      );
    }

    variant.available -= quantity;
    await repo.save(variant);
  }

  async restoreStock(
    variantId: string,
    quantity: number,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager
      ? manager.getRepository(ProductVariant)
      : this.productVariantRepository;

    const result = await repo.increment(
      { id: variantId },
      'available',
      quantity,
    );

    // Jika tidak ada baris yang ter-update, berarti variantId tidak ada
    if (result.affected === 0) {
      throw new NotFoundException(`Variant ${variantId} tidak ditemukan`);
    }
  }
}
