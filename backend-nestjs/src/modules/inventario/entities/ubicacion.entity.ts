import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductoUbicacion } from './producto-ubicacion.entity';

@Entity('ubicaciones')
export class Ubicacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string; // Ejemplo: "Bodega Principal", "Pasillo A", "Estante 3"

  @Column({ length: 50, nullable: true })
  codigo: string; // Código único de la ubicación (ej: "BOD-001", "PAS-A", "EST-3")

  @Column({ length: 50, default: 'BODEGA' })
  tipo: string; // BODEGA, PASILLO, ESTANTE, EXTERNA, OTRO

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'text', nullable: true })
  direccion: string; // Para bodegas externas

  @Column({ default: true })
  activa: boolean;

  @OneToMany(() => ProductoUbicacion, (productoUbicacion) => productoUbicacion.ubicacion)
  productosUbicacion: ProductoUbicacion[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
















