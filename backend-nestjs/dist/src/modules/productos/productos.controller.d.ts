import { CreateProductoDto, UpdateProductoDto } from './productos.service';
export declare class ProductosController {
    private readonly productosService;
    constructor(productosService: any);
    findAll(codigo?: string, codBarras?: string, sku?: string): any;
    crearProductoEjemplo(): any;
    crearProductosMasivos(productosDto: CreateProductoDto[]): any;
    create(createDto: CreateProductoDto): any;
    findOne(id: string | number): any;
    update(id: string | number, updateDto: UpdateProductoDto): any;
    remove(id: string | number): any;
}
