import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Factura } from './factura.entity';

/**
 * Tabla: vouchers
 * Propósito: Almacena el XML, la Clave de Acceso, el estado del SRI y el PDF (RIDE)
 * Esta tabla complementa la información de facturas con datos específicos del comprobante electrónico
 */
@Entity('vouchers')
@Index(['clave_acceso'], { unique: true })
export class Voucher {
  @PrimaryGeneratedColumn()
  id: number;

  // Relación con la factura (1:1)
  @ManyToOne(() => Factura, (factura) => factura.vouchers, { nullable: false })
  @JoinColumn({ name: 'factura_id' })
  factura: Factura;

  @Column({ unique: true })
  factura_id: number; // Unique para garantizar relación 1:1

  @Column({ unique: true, length: 49 })
  clave_acceso: string; // Clave de acceso de 49 dígitos

  // XML del comprobante
  @Column({ type: 'text', nullable: true })
  xml_generado: string; // XML generado antes de firmar

  @Column({ type: 'text', nullable: true })
  xml_firmado: string; // XML firmado digitalmente

  @Column({ type: 'text', nullable: true })
  xml_autorizado: string; // XML autorizado por el SRI (respuesta final)

  // Estado del SRI
  @Column({ length: 50, default: 'PENDIENTE' })
  estado_sri: string; // PENDIENTE, RECIBIDA, AUTORIZADO, NO AUTORIZADO, EN PROCESO

  @Column({ type: 'text', nullable: true })
  mensaje_sri: string; // Mensajes del SRI

  @Column({ length: 100, nullable: true })
  numero_autorizacion: string; // Número de autorización del SRI

  @Column({ type: 'date', nullable: true })
  fecha_autorizacion: Date; // Fecha de autorización

  @Column({ length: 10, nullable: true })
  ambiente: string; // '1' = Producción, '2' = Pruebas

  // PDF (RIDE - Representación Impresa de Documento Electrónico)
  // Nota: Para archivos grandes, es mejor almacenar solo la ruta del archivo en el sistema de archivos
  @Column({ type: 'text', nullable: true })
  ruta_pdf: string; // Ruta del archivo PDF en el servidor (recomendado para archivos grandes)

  // Información adicional
  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'json', nullable: true })
  metadata: any; // Datos adicionales en formato JSON

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

