import { ContingenciaService } from './contingencia.service';
export declare class ContingenciaScheduler {
    private readonly contingenciaService;
    private readonly logger;
    constructor(contingenciaService: ContingenciaService);
    procesarColaAutomaticamente(): Promise<void>;
}
