import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TiendaConfig } from './entities/tienda-config.entity';
import { CreateTiendaConfigDto } from './dto/create-tienda-config.dto';
import { UpdateTiendaConfigDto } from './dto/update-tienda-config.dto';

@Injectable()
export class TiendaConfigService {
    constructor(
        @InjectRepository(TiendaConfig)
        private configRepo: Repository<TiendaConfig>,
    ) { }

    async findConfig() {
        const config = await this.configRepo.findOne({ where: { id: 1 } });
        if (!config) {
            // Create default if not exists
            const newConfig = this.configRepo.create({ id: 1 });
            return this.configRepo.save(newConfig);
        }
        return config;
    }

    async updateConfig(updateDto: UpdateTiendaConfigDto) {
        const config = await this.findConfig();
        this.configRepo.merge(config, updateDto);
        return this.configRepo.save(config);
    }

    // Métodos estándar (placeholders)
    create(createDto: CreateTiendaConfigDto) { return this.updateConfig(createDto as any); }
    findAll() { return this.findConfig(); }
    findOne(id: number) { return this.findConfig(); }
    update(id: number, updateDto: UpdateTiendaConfigDto) { return this.updateConfig(updateDto); }
    remove(id: number) { return `This action removes a #${id} tiendaConfig`; }
}
