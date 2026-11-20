import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  // Create Category
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create({
      slug: createCategoryDto.slug,
      name: createCategoryDto.name,
      description: createCategoryDto.description,
    });

    return this.categoriesRepository.save(category);
  }

  // Show All
  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find();
  }

  // Show By ID
  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOneBy({ id });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} is not found.`);
    }

    return category;
  }

  // Update
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    this.categoriesRepository.merge(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }

  // Delete
  async remove(id: string): Promise<Category> {
    const category = await this.findOne(id);
    return this.categoriesRepository.remove(category);
  }
}
