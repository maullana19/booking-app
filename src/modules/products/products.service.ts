import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity.js';
import { ProductVariant } from '../product-variants/entities/product-variant.entity.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private variantRepository: Repository<ProductVariant>,
  ) {}

  // CREATE
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create({
      slug: createProductDto.slug,
      title: createProductDto.title,
      description: createProductDto.description,
      categoryId: createProductDto.category_id,
      posterUrl: createProductDto.posterUrl ?? null,
    });

    return this.productRepository.save(product);
  }

  // Create Variant

  // SHOW ALL
  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  // SHOW BY ID
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException(`Product with id: ${id} is not found!`);
    }

    return product;
  }

  // UPDATE
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    this.productRepository.merge(product, updateProductDto);
    return this.productRepository.save(product);
  }

  // DELETE
  async remove(id: string): Promise<Product> {
    const product = await this.findOne(id);
    return this.productRepository.remove(product);
  }
}
