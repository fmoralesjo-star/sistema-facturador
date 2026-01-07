"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XsdValidationService = void 0;
const common_1 = require("@nestjs/common");
let XsdValidationService = class XsdValidationService {
    validarFactura(factura) {
        const errores = [];
        if (!factura.secuencial || factura.secuencial.length !== 9) {
            errores.push('El secuencial debe tener exactamente 9 dígitos');
        }
        if (!factura.cliente_id) {
            errores.push('La factura debe tener un cliente asignado');
        }
        if (factura.cliente) {
            if (factura.cliente.ruc && !this.validarIdentificacion(factura.cliente.ruc, '')) {
                errores.push(`La identificación del cliente (${factura.cliente.ruc}) no es válida según el algoritmo del SRI`);
            }
            if (factura.cliente.email && !this.validarEmail(factura.cliente.email)) {
                errores.push('El email del cliente tiene un formato inválido');
            }
            if (factura.cliente.direccion && factura.cliente.direccion.length > 300) {
                errores.push('La dirección del cliente supera los 300 caracteres permitidos');
            }
            if (factura.cliente.nombre && factura.cliente.nombre.length > 300) {
                errores.push('La razón social del cliente supera los 300 caracteres permitidos');
            }
        }
        if (!factura.detalles || factura.detalles.length === 0) {
            errores.push('La factura debe tener al menos un detalle (item)');
        }
        else {
            factura.detalles.forEach((item, index) => {
                if (item.cantidad <= 0) {
                    errores.push(`Item #${index + 1}: La cantidad debe ser mayor a 0`);
                }
                if (item.precio_unitario < 0) {
                    errores.push(`Item #${index + 1}: El precio unitario no puede ser negativo`);
                }
                if (item.producto?.nombre && item.producto.nombre.length > 300) {
                    errores.push(`Item #${index + 1}: El nombre del producto es demasiado largo (>300 caracteres)`);
                }
            });
        }
        if (factura.total < 0) {
            errores.push('El total de la factura no puede ser negativo');
        }
        if (errores.length > 0) {
            throw new common_1.BadRequestException({
                message: 'Error de Validación XSD (Local)',
                errors: errores
            });
        }
        return true;
    }
    validarIdentificacion(identificacion, tipo) {
        if (!identificacion)
            return false;
        if (identificacion === '9999999999999')
            return true;
        if (identificacion.length !== 10 && identificacion.length !== 13)
            return false;
        if (!/^\d+$/.test(identificacion))
            return false;
        const digitoRegion = parseInt(identificacion.substring(0, 2), 10);
        if (digitoRegion < 1 || digitoRegion > 24)
            return false;
        const tercerDigito = parseInt(identificacion.charAt(2), 10);
        if (tercerDigito < 6) {
            return this.validarCedula(identificacion.substring(0, 10));
        }
        return true;
    }
    validarCedula(cedula) {
        if (cedula.length !== 10)
            return false;
        const digitos = cedula.split('').map(Number);
        const verificador = digitos.pop();
        let suma = 0;
        for (let i = 0; i < 9; i++) {
            let valor = digitos[i];
            if (i % 2 === 0) {
                valor = valor * 2;
                if (valor > 9)
                    valor -= 9;
            }
            suma += valor;
        }
        const decenaSuperior = Math.ceil(suma / 10) * 10;
        let calculado = decenaSuperior - suma;
        if (calculado === 10)
            calculado = 0;
        return calculado === verificador;
    }
    validarEmail(email) {
        return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email);
    }
};
exports.XsdValidationService = XsdValidationService;
exports.XsdValidationService = XsdValidationService = __decorate([
    (0, common_1.Injectable)()
], XsdValidationService);
//# sourceMappingURL=xsd-validation.service.js.map