import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVenueDto } from './dto/create-venue.dto.js';
import { UpdateVenueDto } from './dto/update-venue.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venue } from './entities/venue.entity.js';

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue)
    private venuesRepository: Repository<Venue>,
  ) {}

  async create(createVenueDto: CreateVenueDto): Promise<Venue> {
    const venue = this.venuesRepository.create({
      name: createVenueDto.name,
      address: createVenueDto.address,
      city: createVenueDto.city,
      province: createVenueDto.province,
      capacity: createVenueDto.capacity,
      description: createVenueDto.description,
    });

    return this.venuesRepository.save(venue);
  }

  async findAll(): Promise<Venue[]> {
    return this.venuesRepository.find();
  }

  async findOne(id: string): Promise<Venue> {
    const venue = await this.venuesRepository.findOneBy({ id });

    if (!venue) {
      throw new NotFoundException(`Venues with id: ${id} is not found!`);
    }

    return venue;
  }

  async update(id: string, updateVenueDto: UpdateVenueDto): Promise<Venue> {
    const venue = await this.findOne(id);

    this.venuesRepository.merge(venue, updateVenueDto);

    return this.venuesRepository.save(venue);
  }

  async remove(id: string): Promise<Venue> {
    const venue = await this.findOne(id);

    return this.venuesRepository.remove(venue);
  }
}
