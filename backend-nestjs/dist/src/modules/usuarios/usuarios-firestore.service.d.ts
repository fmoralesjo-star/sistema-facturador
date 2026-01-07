import { FirestoreService } from '../firebase/firestore.service';
import { EventsGateway } from '../../gateways/events.gateway';
export declare class UsuariosFirestoreService {
    private firestoreService;
    private eventsGateway;
    private readonly usuariosCollection;
    private readonly rolesCollection;
    private readonly permisosCollection;
    constructor(firestoreService: FirestoreService, eventsGateway: EventsGateway);
    findAllRoles(): Promise<any[]>;
    findOneRol(id: string): Promise<any>;
    private getRolesDefault;
    private crearRolesDefault;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    findByEmail(email: string): Promise<any>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    remove(id: string): Promise<{
        id: string;
    }>;
    getPermisos(usuarioId: string): Promise<any[]>;
    updatePermisos(usuarioId: string, permisos: any[]): Promise<any[]>;
    syncFirebaseUser(firebase_uid: string, email: string, nombre_completo: string): Promise<any>;
    getPermisosPorRol(nombreRol: string): string[];
}
