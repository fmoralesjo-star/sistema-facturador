import { FirestoreService } from '../firebase/firestore.service';
import { EventsGateway } from '../../gateways/events.gateway';
import { CreateClienteDto, UpdateClienteDto } from './clientes.service';
export declare class ClientesFirestoreService {
    private firestoreService;
    private eventsGateway;
    private readonly collectionName;
    constructor(firestoreService: FirestoreService, eventsGateway: EventsGateway);
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    findByRuc(ruc: string): Promise<any>;
    create(createDto: CreateClienteDto): Promise<{
        nombre: string;
        ruc?: string;
        direccion?: string;
        telefono?: string;
        email?: string;
        fechaNacimiento?: string;
        esExtranjero?: boolean;
        id: string;
    }>;
    update(id: string, updateDto: UpdateClienteDto): Promise<any>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
