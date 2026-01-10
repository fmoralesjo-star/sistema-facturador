
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private usuariosService: UsuariosService,
        private jwtService: JwtService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usuariosService.findByUsername(username);
        if (user && (await bcrypt.compare(pass, user.password))) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.username, loginDto.password);

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const payload = {
            username: user.nombre_usuario,
            sub: user.id,
            role: user.rol?.nombre,
            rol_id: user.rol_id
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                nombre_usuario: user.nombre_usuario,
                nombre_completo: user.nombre_completo,
                email: user.email,
                rol: user.rol?.nombre
            }
        };
    }

    async register(registerDto: RegisterDto) {
        // Buscar el rol de 'cliente'
        let clienteRol = await this.usuariosService.findRolByName('cliente');

        // Fallback: si no existe el rol 'cliente', buscar 'vendedor' o usar el primer rol disponible, o null
        // Lo ideal es asegurar que 'cliente' exista (ya lo agregamos en el script)

        const createUsuarioDto = {
            nombre_usuario: registerDto.username,
            password: registerDto.password,
            email: registerDto.email,
            nombre_completo: registerDto.nombre_completo || registerDto.username,
            rol_id: clienteRol ? clienteRol.id : undefined,
            activo: 1
        };

        const newUser = await this.usuariosService.create(createUsuarioDto);

        // Loguear automáticamente
        const payload = {
            username: newUser.nombre_usuario,
            sub: newUser.id,
            role: clienteRol?.nombre,
            rol_id: clienteRol?.id
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: newUser.id,
                nombre_usuario: newUser.nombre_usuario,
                nombre_completo: newUser.nombre_completo,
                email: newUser.email,
                rol: clienteRol?.nombre
            }
        };
    }
}
