"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PostgresStorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresStorageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stored_file_entity_1 = require("../entities/stored-file.entity");
let PostgresStorageService = PostgresStorageService_1 = class PostgresStorageService {
    constructor(fileRepository) {
        this.fileRepository = fileRepository;
        this.logger = new common_1.Logger(PostgresStorageService_1.name);
    }
    async uploadFile(buffer, filename, mimeType) {
        const newFile = this.fileRepository.create({
            filename,
            mime_type: mimeType,
            data: buffer,
            size: buffer.length,
        });
        const saved = await this.fileRepository.save(newFile);
        this.logger.log(`Archivo guardado en DB: ${filename} (ID: ${saved.id})`);
        return saved.id;
    }
    async getFile(fileId) {
        const cleanId = fileId.replace('db://', '');
        const file = await this.fileRepository.findOne({ where: { id: cleanId } });
        if (!file) {
            throw new common_1.NotFoundException(`Archivo no encontrado: ${cleanId}`);
        }
        return {
            buffer: file.data,
            mimeType: file.mime_type,
            filename: file.filename,
        };
    }
    async deleteFile(fileId) {
        const cleanId = fileId.replace('db://', '');
        await this.fileRepository.delete(cleanId);
        this.logger.log(`Archivo eliminado de DB: ${cleanId}`);
    }
};
exports.PostgresStorageService = PostgresStorageService;
exports.PostgresStorageService = PostgresStorageService = PostgresStorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(stored_file_entity_1.StoredFile)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PostgresStorageService);
//# sourceMappingURL=postgres-storage.service.js.map