--
-- PostgreSQL database dump
--

\restrict eSiCiqlK5rVV3kHua0HSUnr64rIlVJSYTC4uhHLs9STUNqgheLHX7Q0yGgPp5bv

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ajustes_inventario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ajustes_inventario (
    id integer NOT NULL,
    numero character varying(50) NOT NULL,
    fecha date NOT NULL,
    producto_id integer NOT NULL,
    cantidad_anterior integer NOT NULL,
    cantidad_nueva integer NOT NULL,
    diferencia integer NOT NULL,
    motivo character varying(50) NOT NULL,
    motivo_detalle text,
    usuario_responsable character varying(100) NOT NULL,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ajustes_inventario OWNER TO postgres;

--
-- Name: ajustes_inventario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ajustes_inventario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ajustes_inventario_id_seq OWNER TO postgres;

--
-- Name: ajustes_inventario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ajustes_inventario_id_seq OWNED BY public.ajustes_inventario.id;


--
-- Name: albaranes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.albaranes (
    id integer NOT NULL,
    numero character varying(50) NOT NULL,
    fecha_recepcion date NOT NULL,
    orden_compra_id integer,
    estado character varying(50) DEFAULT 'PENDIENTE'::character varying NOT NULL,
    observaciones text,
    usuario_recepcion character varying(100),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.albaranes OWNER TO postgres;

--
-- Name: albaranes_detalles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.albaranes_detalles (
    id integer NOT NULL,
    albaran_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad_esperada integer NOT NULL,
    cantidad_recibida integer NOT NULL,
    cantidad_faltante integer DEFAULT 0 NOT NULL,
    cantidad_danada integer DEFAULT 0 NOT NULL,
    estado character varying(50) DEFAULT 'OK'::character varying NOT NULL,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.albaranes_detalles OWNER TO postgres;

--
-- Name: albaranes_detalles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.albaranes_detalles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.albaranes_detalles_id_seq OWNER TO postgres;

--
-- Name: albaranes_detalles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.albaranes_detalles_id_seq OWNED BY public.albaranes_detalles.id;


--
-- Name: albaranes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.albaranes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.albaranes_id_seq OWNER TO postgres;

--
-- Name: albaranes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.albaranes_id_seq OWNED BY public.albaranes.id;


--
-- Name: asientos_contables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asientos_contables (
    id integer NOT NULL,
    numero_asiento character varying(50) NOT NULL,
    fecha date NOT NULL,
    descripcion text NOT NULL,
    tipo character varying(20),
    total_debe numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    total_haber numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    factura_id integer,
    nota_credito_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.asientos_contables OWNER TO postgres;

--
-- Name: asientos_contables_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asientos_contables_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asientos_contables_id_seq OWNER TO postgres;

--
-- Name: asientos_contables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asientos_contables_id_seq OWNED BY public.asientos_contables.id;


--
-- Name: asistencias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asistencias (
    id integer NOT NULL,
    empleado_id integer NOT NULL,
    fecha date NOT NULL,
    hora_entrada time without time zone,
    hora_salida time without time zone,
    tipo character varying(20) DEFAULT 'normal'::character varying NOT NULL,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.asistencias OWNER TO postgres;

--
-- Name: asistencias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asistencias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asistencias_id_seq OWNER TO postgres;

--
-- Name: asistencias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asistencias_id_seq OWNED BY public.asistencias.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    usuario_id integer,
    usuario_nombre character varying(100),
    accion character varying(100) NOT NULL,
    modulo character varying(50) NOT NULL,
    entidad_id character varying(50),
    valor_anterior text,
    valor_nuevo text,
    ip_address character varying(50),
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: autorizaciones_2fa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.autorizaciones_2fa (
    id integer NOT NULL,
    usuario_solicitante_id integer NOT NULL,
    usuario_autorizador_id integer NOT NULL,
    rol_solicitado_id integer NOT NULL,
    codigo_verificacion character varying(6) NOT NULL,
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL,
    fecha_expiracion timestamp without time zone,
    fecha_aprobacion timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.autorizaciones_2fa OWNER TO postgres;

--
-- Name: autorizaciones_2fa_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.autorizaciones_2fa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.autorizaciones_2fa_id_seq OWNER TO postgres;

--
-- Name: autorizaciones_2fa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.autorizaciones_2fa_id_seq OWNED BY public.autorizaciones_2fa.id;


--
-- Name: backup_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.backup_logs (
    id integer NOT NULL,
    archivo character varying(255),
    tamano bigint,
    estado character varying(50) DEFAULT 'PENDING'::character varying,
    mensaje_error text,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.backup_logs OWNER TO postgres;

--
-- Name: backup_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.backup_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.backup_logs_id_seq OWNER TO postgres;

--
-- Name: backup_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.backup_logs_id_seq OWNED BY public.backup_logs.id;


--
-- Name: bancos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bancos (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    codigo character varying(50),
    numero_cuenta character varying(20),
    tipo_cuenta character varying(50),
    saldo_inicial numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    saldo_actual numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    descripcion character varying(200),
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bancos OWNER TO postgres;

--
-- Name: bancos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bancos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bancos_id_seq OWNER TO postgres;

--
-- Name: bancos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bancos_id_seq OWNED BY public.bancos.id;


--
-- Name: caja_chica_movimientos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.caja_chica_movimientos (
    id integer NOT NULL,
    punto_venta_id integer NOT NULL,
    tipo character varying NOT NULL,
    monto numeric(10,2) NOT NULL,
    descripcion character varying NOT NULL,
    referencia character varying,
    fecha timestamp without time zone DEFAULT now() NOT NULL,
    usuario_id integer NOT NULL,
    saldo_resultante numeric(10,2) NOT NULL
);


ALTER TABLE public.caja_chica_movimientos OWNER TO postgres;

--
-- Name: caja_chica_movimientos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.caja_chica_movimientos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.caja_chica_movimientos_id_seq OWNER TO postgres;

--
-- Name: caja_chica_movimientos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.caja_chica_movimientos_id_seq OWNED BY public.caja_chica_movimientos.id;


--
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    ruc character varying(50),
    direccion text,
    telefono character varying(50),
    email character varying(255),
    "fechaNacimiento" date,
    "esExtranjero" boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.clientes OWNER TO postgres;

--
-- Name: clientes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clientes_id_seq OWNER TO postgres;

--
-- Name: clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clientes_id_seq OWNED BY public.clientes.id;


--
-- Name: compra_detalles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compra_detalles (
    id integer NOT NULL,
    compra_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad numeric(10,2) NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL
);


ALTER TABLE public.compra_detalles OWNER TO postgres;

--
-- Name: compra_detalles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.compra_detalles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.compra_detalles_id_seq OWNER TO postgres;

--
-- Name: compra_detalles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.compra_detalles_id_seq OWNED BY public.compra_detalles.id;


--
-- Name: compras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compras (
    id integer NOT NULL,
    numero character varying(50) NOT NULL,
    proveedor_id integer,
    punto_venta_id integer,
    fecha date NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    impuesto numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    total numeric(10,2) NOT NULL,
    estado character varying(20) DEFAULT 'PENDIENTE'::character varying NOT NULL,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.compras OWNER TO postgres;

--
-- Name: compras_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.compras_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.compras_id_seq OWNER TO postgres;

--
-- Name: compras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.compras_id_seq OWNED BY public.compras.id;


--
-- Name: conciliaciones_bancarias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conciliaciones_bancarias (
    id integer NOT NULL,
    banco_id integer NOT NULL,
    factura_id integer,
    fecha date NOT NULL,
    fecha_valor date,
    referencia character varying(200),
    descripcion character varying(500),
    monto numeric(15,2) NOT NULL,
    tipo character varying(20) NOT NULL,
    forma_pago character varying(50),
    metodo_pago character varying(50),
    conciliado boolean DEFAULT false NOT NULL,
    fecha_conciliacion date,
    observaciones character varying(500),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.conciliaciones_bancarias OWNER TO postgres;

--
-- Name: conciliaciones_bancarias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conciliaciones_bancarias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conciliaciones_bancarias_id_seq OWNER TO postgres;

--
-- Name: conciliaciones_bancarias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conciliaciones_bancarias_id_seq OWNED BY public.conciliaciones_bancarias.id;


--
-- Name: conteos_ciclicos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conteos_ciclicos (
    id integer NOT NULL,
    numero character varying(50) NOT NULL,
    fecha date NOT NULL,
    categoria character varying(100),
    ubicacion character varying(100),
    estado character varying(50) DEFAULT 'PENDIENTE'::character varying NOT NULL,
    usuario_responsable character varying(100),
    fecha_inicio timestamp without time zone,
    fecha_completado timestamp without time zone,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.conteos_ciclicos OWNER TO postgres;

--
-- Name: conteos_ciclicos_detalles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conteos_ciclicos_detalles (
    id integer NOT NULL,
    conteo_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad_sistema integer NOT NULL,
    cantidad_fisica integer,
    diferencia integer,
    estado character varying(50) DEFAULT 'PENDIENTE'::character varying NOT NULL,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.conteos_ciclicos_detalles OWNER TO postgres;

--
-- Name: conteos_ciclicos_detalles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conteos_ciclicos_detalles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conteos_ciclicos_detalles_id_seq OWNER TO postgres;

--
-- Name: conteos_ciclicos_detalles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conteos_ciclicos_detalles_id_seq OWNED BY public.conteos_ciclicos_detalles.id;


--
-- Name: conteos_ciclicos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conteos_ciclicos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conteos_ciclicos_id_seq OWNER TO postgres;

--
-- Name: conteos_ciclicos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conteos_ciclicos_id_seq OWNED BY public.conteos_ciclicos.id;


--
-- Name: cuentas_contables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuentas_contables (
    id integer NOT NULL,
    codigo character varying(20) NOT NULL,
    nombre character varying(255) NOT NULL,
    tipo character varying(50) NOT NULL,
    nivel integer DEFAULT 1 NOT NULL,
    padre_id integer,
    activa boolean DEFAULT true NOT NULL,
    permite_movimiento boolean DEFAULT false NOT NULL,
    descripcion text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cuentas_contables OWNER TO postgres;

--
-- Name: cuentas_contables_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cuentas_contables_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cuentas_contables_id_seq OWNER TO postgres;

--
-- Name: cuentas_contables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cuentas_contables_id_seq OWNED BY public.cuentas_contables.id;


--
-- Name: empleados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empleados (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    apellido character varying(255) NOT NULL,
    cedula character varying(20) NOT NULL,
    email character varying(255),
    telefono character varying(50),
    fecha_nacimiento date,
    fecha_ingreso date NOT NULL,
    cargo character varying(255),
    departamento character varying(255),
    salario numeric(10,2),
    estado character varying(20) DEFAULT 'activo'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    rol character varying(255)
);


ALTER TABLE public.empleados OWNER TO postgres;

--
-- Name: empleados_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.empleados_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.empleados_id_seq OWNER TO postgres;

--
-- Name: empleados_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.empleados_id_seq OWNED BY public.empleados.id;


--
-- Name: factura_detalles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.factura_detalles (
    id integer NOT NULL,
    factura_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad numeric(10,2) NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    descuento numeric(10,2) DEFAULT '0'::numeric,
    promocion_id integer
);


ALTER TABLE public.factura_detalles OWNER TO postgres;

--
-- Name: factura_detalles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.factura_detalles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.factura_detalles_id_seq OWNER TO postgres;

--
-- Name: factura_detalles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.factura_detalles_id_seq OWNED BY public.factura_detalles.id;


--
-- Name: facturas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facturas (
    id integer NOT NULL,
    numero character varying(50) NOT NULL,
    cliente_id integer NOT NULL,
    empresa_id integer,
    vendedor_id integer,
    punto_venta_id integer,
    fecha date NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    impuesto numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    total numeric(10,2) NOT NULL,
    estado character varying(20) DEFAULT 'PENDIENTE'::character varying NOT NULL,
    establecimiento character varying(3) DEFAULT '001'::character varying NOT NULL,
    punto_emision character varying(3) DEFAULT '001'::character varying NOT NULL,
    secuencial character varying(9),
    tipo_comprobante character varying(2) DEFAULT '01'::character varying NOT NULL,
    ambiente character varying(1) DEFAULT '2'::character varying NOT NULL,
    clave_acceso character varying(49),
    autorizacion character varying(100),
    fecha_autorizacion date,
    xml_autorizado text,
    forma_pago character varying(100) DEFAULT 'SIN UTILIZACION DEL SISTEMA FINANCIERO'::character varying NOT NULL,
    condicion_pago character varying(20) DEFAULT 'CONTADO'::character varying NOT NULL,
    emisor_ruc character varying(50),
    emisor_razon_social character varying(255),
    emisor_nombre_comercial character varying(255),
    emisor_direccion_matriz text,
    emisor_direccion_establecimiento text,
    emisor_telefono character varying(50),
    emisor_email character varying(255),
    cliente_direccion text,
    cliente_telefono character varying(50),
    cliente_email character varying(255),
    estado_sri character varying(50),
    mensaje_sri text,
    asiento_contable_creado boolean DEFAULT false NOT NULL,
    numero_asiento_contable character varying(50),
    observaciones_contables text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.facturas OWNER TO postgres;

--
-- Name: facturas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.facturas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.facturas_id_seq OWNER TO postgres;

--
-- Name: facturas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.facturas_id_seq OWNED BY public.facturas.id;


--
-- Name: lotes_inventario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lotes_inventario (
    id integer NOT NULL,
    producto_id integer NOT NULL,
    numero_lote character varying(100),
    fecha_entrada date NOT NULL,
    fecha_vencimiento date,
    cantidad_inicial integer NOT NULL,
    cantidad_disponible integer NOT NULL,
    costo_unitario numeric(10,2) NOT NULL,
    precio_venta numeric(10,2),
    proveedor character varying(100),
    referencia_compra character varying(50),
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.lotes_inventario OWNER TO postgres;

--
-- Name: lotes_inventario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lotes_inventario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lotes_inventario_id_seq OWNER TO postgres;

--
-- Name: lotes_inventario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lotes_inventario_id_seq OWNED BY public.lotes_inventario.id;


--
-- Name: movimientos_inventario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movimientos_inventario (
    id integer NOT NULL,
    producto_id integer NOT NULL,
    fecha timestamp without time zone DEFAULT now() NOT NULL,
    tipo character varying(20) NOT NULL,
    cantidad integer NOT NULL,
    motivo text,
    observaciones text,
    factura_id integer,
    compra_id integer,
    punto_venta_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.movimientos_inventario OWNER TO postgres;

--
-- Name: movimientos_inventario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.movimientos_inventario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movimientos_inventario_id_seq OWNER TO postgres;

--
-- Name: movimientos_inventario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.movimientos_inventario_id_seq OWNED BY public.movimientos_inventario.id;


--
-- Name: nota_credito_detalles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nota_credito_detalles (
    id integer NOT NULL,
    nota_credito_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad numeric(10,2) NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    descuento numeric(10,2) DEFAULT '0'::numeric,
    factura_detalle_id integer
);


ALTER TABLE public.nota_credito_detalles OWNER TO postgres;

--
-- Name: nota_credito_detalles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nota_credito_detalles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nota_credito_detalles_id_seq OWNER TO postgres;

--
-- Name: nota_credito_detalles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nota_credito_detalles_id_seq OWNED BY public.nota_credito_detalles.id;


--
-- Name: notas_credito; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notas_credito (
    id integer NOT NULL,
    numero character varying(50) NOT NULL,
    factura_original_id integer NOT NULL,
    cliente_id integer,
    empresa_id integer,
    vendedor_id integer,
    fecha date NOT NULL,
    motivo_ajuste text,
    subtotal numeric(10,2) NOT NULL,
    impuesto numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    total numeric(10,2) NOT NULL,
    estado character varying(20) DEFAULT 'PENDIENTE'::character varying NOT NULL,
    establecimiento character varying(3) DEFAULT '001'::character varying NOT NULL,
    punto_emision character varying(3) DEFAULT '001'::character varying NOT NULL,
    secuencial character varying(9),
    tipo_comprobante character varying(2) DEFAULT '04'::character varying NOT NULL,
    ambiente character varying(1) DEFAULT '2'::character varying NOT NULL,
    clave_acceso character varying(49),
    autorizacion character varying(37),
    fecha_autorizacion timestamp without time zone,
    asiento_contable_creado boolean DEFAULT false NOT NULL,
    numero_asiento_contable character varying(50),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notas_credito OWNER TO postgres;

--
-- Name: notas_credito_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notas_credito_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notas_credito_id_seq OWNER TO postgres;

--
-- Name: notas_credito_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notas_credito_id_seq OWNED BY public.notas_credito.id;


--
-- Name: ordenes_compra; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ordenes_compra (
    id integer NOT NULL,
    numero character varying(50) NOT NULL,
    fecha_orden date NOT NULL,
    fecha_esperada date,
    proveedor character varying(100),
    estado character varying(50) DEFAULT 'PENDIENTE'::character varying NOT NULL,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ordenes_compra OWNER TO postgres;

--
-- Name: ordenes_compra_detalles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ordenes_compra_detalles (
    id integer NOT NULL,
    orden_compra_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad_pedida integer NOT NULL,
    cantidad_recibida integer DEFAULT 0 NOT NULL,
    precio_unitario numeric(10,2),
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ordenes_compra_detalles OWNER TO postgres;

--
-- Name: ordenes_compra_detalles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ordenes_compra_detalles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ordenes_compra_detalles_id_seq OWNER TO postgres;

--
-- Name: ordenes_compra_detalles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ordenes_compra_detalles_id_seq OWNED BY public.ordenes_compra_detalles.id;


--
-- Name: ordenes_compra_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ordenes_compra_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ordenes_compra_id_seq OWNER TO postgres;

--
-- Name: ordenes_compra_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ordenes_compra_id_seq OWNED BY public.ordenes_compra.id;


--
-- Name: partidas_contables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.partidas_contables (
    id integer NOT NULL,
    asiento_id integer NOT NULL,
    cuenta_id integer NOT NULL,
    debe numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    haber numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    descripcion text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.partidas_contables OWNER TO postgres;

--
-- Name: partidas_contables_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.partidas_contables_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.partidas_contables_id_seq OWNER TO postgres;

--
-- Name: partidas_contables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.partidas_contables_id_seq OWNED BY public.partidas_contables.id;


--
-- Name: pickings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pickings (
    id integer NOT NULL,
    numero character varying(50) NOT NULL,
    fecha date NOT NULL,
    orden_venta character varying(50),
    estado character varying(50) DEFAULT 'PENDIENTE'::character varying NOT NULL,
    operario character varying(100),
    fecha_inicio timestamp without time zone,
    fecha_completado timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.pickings OWNER TO postgres;

--
-- Name: pickings_detalles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pickings_detalles (
    id integer NOT NULL,
    picking_id integer NOT NULL,
    producto_id integer NOT NULL,
    ubicacion_id integer,
    cantidad_solicitada integer NOT NULL,
    cantidad_picked integer DEFAULT 0 NOT NULL,
    estado character varying(50) DEFAULT 'PENDIENTE'::character varying NOT NULL,
    orden_picking integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.pickings_detalles OWNER TO postgres;

--
-- Name: pickings_detalles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pickings_detalles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pickings_detalles_id_seq OWNER TO postgres;

--
-- Name: pickings_detalles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pickings_detalles_id_seq OWNED BY public.pickings_detalles.id;


--
-- Name: pickings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pickings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pickings_id_seq OWNER TO postgres;

--
-- Name: pickings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pickings_id_seq OWNED BY public.pickings.id;


--
-- Name: productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos (
    id integer NOT NULL,
    num_movimiento character varying(50),
    fecha_movimiento date,
    codigo character varying(100) NOT NULL,
    grupo_comercial character varying(100),
    referencia character varying(100),
    sku character varying(100),
    nombre character varying(255) NOT NULL,
    descripcion text,
    coleccion character varying(100),
    categoria character varying(100),
    talla character varying(50),
    color character varying(50),
    desc_color character varying(100),
    cod_barras character varying(50),
    precio_costo numeric(10,2),
    precio numeric(10,2) NOT NULL,
    unidad character varying(20),
    stock integer DEFAULT 0 NOT NULL,
    tipo_impuesto character varying(10) DEFAULT '15'::character varying NOT NULL,
    punto_reorden integer,
    stock_seguridad integer,
    tiempo_entrega_dias integer,
    costo_promedio numeric(10,2),
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.productos OWNER TO postgres;

--
-- Name: productos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.productos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.productos_id_seq OWNER TO postgres;

--
-- Name: productos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productos_id_seq OWNED BY public.productos.id;


--
-- Name: productos_puntos_venta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos_puntos_venta (
    id integer NOT NULL,
    producto_id integer NOT NULL,
    punto_venta_id integer NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    stock_minimo integer,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.productos_puntos_venta OWNER TO postgres;

--
-- Name: productos_puntos_venta_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.productos_puntos_venta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.productos_puntos_venta_id_seq OWNER TO postgres;

--
-- Name: productos_puntos_venta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productos_puntos_venta_id_seq OWNED BY public.productos_puntos_venta.id;


--
-- Name: productos_ubicaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos_ubicaciones (
    id integer NOT NULL,
    producto_id integer NOT NULL,
    ubicacion_id integer NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    stock_minimo integer,
    stock_maximo integer,
    estado_stock character varying(20) DEFAULT 'DISPONIBLE'::character varying NOT NULL,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.productos_ubicaciones OWNER TO postgres;

--
-- Name: productos_ubicaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.productos_ubicaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.productos_ubicaciones_id_seq OWNER TO postgres;

--
-- Name: productos_ubicaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productos_ubicaciones_id_seq OWNED BY public.productos_ubicaciones.id;


--
-- Name: promociones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promociones (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    tipo character varying(50) NOT NULL,
    valor numeric(10,2),
    producto_id integer,
    categoria character varying(255),
    fecha_inicio timestamp without time zone NOT NULL,
    fecha_fin timestamp without time zone,
    hora_inicio time without time zone,
    hora_fin time without time zone,
    dias_semana text,
    minimo_compra numeric(10,2),
    maximo_usos integer,
    usos_actuales integer DEFAULT 0 NOT NULL,
    estado character varying(20) DEFAULT 'activa'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.promociones OWNER TO postgres;

--
-- Name: promociones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promociones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.promociones_id_seq OWNER TO postgres;

--
-- Name: promociones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promociones_id_seq OWNED BY public.promociones.id;


--
-- Name: proveedores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proveedores (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    ruc character varying(20),
    direccion text,
    telefono character varying(50),
    email character varying(255),
    estado character varying(20) DEFAULT 'activo'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.proveedores OWNER TO postgres;

--
-- Name: proveedores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.proveedores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.proveedores_id_seq OWNER TO postgres;

--
-- Name: proveedores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.proveedores_id_seq OWNED BY public.proveedores.id;


--
-- Name: puntos_venta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.puntos_venta (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    codigo character varying(10) NOT NULL,
    direccion text NOT NULL,
    telefono character varying(50),
    email character varying(255),
    activo boolean DEFAULT true NOT NULL,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    tipo character varying(50) DEFAULT 'TIENDA'::character varying,
    es_principal boolean DEFAULT false
);


ALTER TABLE public.puntos_venta OWNER TO postgres;

--
-- Name: puntos_venta_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.puntos_venta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.puntos_venta_id_seq OWNER TO postgres;

--
-- Name: puntos_venta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.puntos_venta_id_seq OWNED BY public.puntos_venta.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: transferencias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transferencias (
    id integer NOT NULL,
    tipo character varying(20) NOT NULL,
    producto_id integer,
    cantidad numeric(10,2),
    origen character varying(255) NOT NULL,
    destino character varying(255) NOT NULL,
    motivo text,
    fecha timestamp without time zone DEFAULT now() NOT NULL,
    monto numeric(10,2),
    cuenta_origen character varying(255),
    cuenta_destino character varying(255),
    referencia character varying(255),
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.transferencias OWNER TO postgres;

--
-- Name: transferencias_detalles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transferencias_detalles (
    id integer NOT NULL,
    transferencia_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad integer NOT NULL,
    cantidad_recibida integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.transferencias_detalles OWNER TO postgres;

--
-- Name: transferencias_detalles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transferencias_detalles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transferencias_detalles_id_seq OWNER TO postgres;

--
-- Name: transferencias_detalles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transferencias_detalles_id_seq OWNED BY public.transferencias_detalles.id;


--
-- Name: transferencias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transferencias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transferencias_id_seq OWNER TO postgres;

--
-- Name: transferencias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transferencias_id_seq OWNED BY public.transferencias.id;


--
-- Name: transferencias_inventario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transferencias_inventario (
    id integer NOT NULL,
    numero character varying(50) NOT NULL,
    fecha date NOT NULL,
    origen character varying(100) NOT NULL,
    destino character varying(100) NOT NULL,
    estado character varying(50) DEFAULT 'PENDIENTE'::character varying NOT NULL,
    usuario_envio character varying(100),
    usuario_recepcion character varying(100),
    fecha_envio date,
    fecha_recepcion date,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.transferencias_inventario OWNER TO postgres;

--
-- Name: transferencias_inventario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transferencias_inventario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transferencias_inventario_id_seq OWNER TO postgres;

--
-- Name: transferencias_inventario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transferencias_inventario_id_seq OWNED BY public.transferencias_inventario.id;


--
-- Name: ubicaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ubicaciones (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    codigo character varying(50),
    tipo character varying(50) DEFAULT 'BODEGA'::character varying NOT NULL,
    descripcion text,
    direccion text,
    activa boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ubicaciones OWNER TO postgres;

--
-- Name: ubicaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ubicaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ubicaciones_id_seq OWNER TO postgres;

--
-- Name: ubicaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ubicaciones_id_seq OWNED BY public.ubicaciones.id;


--
-- Name: users_companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users_companies (
    id integer NOT NULL,
    ruc character varying(13) NOT NULL,
    razon_social character varying(255) NOT NULL,
    nombre_comercial character varying(255),
    direccion_matriz text NOT NULL,
    direccion_establecimiento text,
    telefono character varying(50),
    email character varying(255),
    contribuyente_especial text,
    obligado_contabilidad boolean DEFAULT false NOT NULL,
    codigo_establecimiento character varying(3) DEFAULT '001'::character varying NOT NULL,
    punto_emision character varying(255),
    observaciones text,
    activa boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    logotipo character varying(500)
);


ALTER TABLE public.users_companies OWNER TO postgres;

--
-- Name: users_companies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_companies_id_seq OWNER TO postgres;

--
-- Name: users_companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_companies_id_seq OWNED BY public.users_companies.id;


--
-- Name: usuario_permisos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario_permisos (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    modulo character varying(100) NOT NULL,
    tiene_acceso integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.usuario_permisos OWNER TO postgres;

--
-- Name: usuario_permisos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuario_permisos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_permisos_id_seq OWNER TO postgres;

--
-- Name: usuario_permisos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuario_permisos_id_seq OWNED BY public.usuario_permisos.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre_usuario character varying(100) NOT NULL,
    nombre_completo character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    email character varying(255),
    activo integer DEFAULT 1 NOT NULL,
    rol_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    cedula character varying(20),
    foto_cedula character varying(500),
    validado boolean DEFAULT false NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: vouchers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vouchers (
    id integer NOT NULL,
    factura_id integer NOT NULL,
    clave_acceso character varying(49) NOT NULL,
    xml_generado text,
    xml_firmado text,
    xml_autorizado text,
    estado_sri character varying(50) DEFAULT 'PENDIENTE'::character varying NOT NULL,
    mensaje_sri text,
    numero_autorizacion character varying(100),
    fecha_autorizacion date,
    ambiente character varying(10),
    ruta_pdf text,
    observaciones text,
    metadata json,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.vouchers OWNER TO postgres;

--
-- Name: vouchers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vouchers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vouchers_id_seq OWNER TO postgres;

--
-- Name: vouchers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vouchers_id_seq OWNED BY public.vouchers.id;


--
-- Name: ajustes_inventario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ajustes_inventario ALTER COLUMN id SET DEFAULT nextval('public.ajustes_inventario_id_seq'::regclass);


--
-- Name: albaranes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.albaranes ALTER COLUMN id SET DEFAULT nextval('public.albaranes_id_seq'::regclass);


--
-- Name: albaranes_detalles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.albaranes_detalles ALTER COLUMN id SET DEFAULT nextval('public.albaranes_detalles_id_seq'::regclass);


--
-- Name: asientos_contables id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asientos_contables ALTER COLUMN id SET DEFAULT nextval('public.asientos_contables_id_seq'::regclass);


--
-- Name: asistencias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias ALTER COLUMN id SET DEFAULT nextval('public.asistencias_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: autorizaciones_2fa id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.autorizaciones_2fa ALTER COLUMN id SET DEFAULT nextval('public.autorizaciones_2fa_id_seq'::regclass);


--
-- Name: backup_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backup_logs ALTER COLUMN id SET DEFAULT nextval('public.backup_logs_id_seq'::regclass);


--
-- Name: bancos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bancos ALTER COLUMN id SET DEFAULT nextval('public.bancos_id_seq'::regclass);


--
-- Name: caja_chica_movimientos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caja_chica_movimientos ALTER COLUMN id SET DEFAULT nextval('public.caja_chica_movimientos_id_seq'::regclass);


--
-- Name: clientes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes ALTER COLUMN id SET DEFAULT nextval('public.clientes_id_seq'::regclass);


--
-- Name: compra_detalles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_detalles ALTER COLUMN id SET DEFAULT nextval('public.compra_detalles_id_seq'::regclass);


--
-- Name: compras id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compras ALTER COLUMN id SET DEFAULT nextval('public.compras_id_seq'::regclass);


--
-- Name: conciliaciones_bancarias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conciliaciones_bancarias ALTER COLUMN id SET DEFAULT nextval('public.conciliaciones_bancarias_id_seq'::regclass);


--
-- Name: conteos_ciclicos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conteos_ciclicos ALTER COLUMN id SET DEFAULT nextval('public.conteos_ciclicos_id_seq'::regclass);


--
-- Name: conteos_ciclicos_detalles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conteos_ciclicos_detalles ALTER COLUMN id SET DEFAULT nextval('public.conteos_ciclicos_detalles_id_seq'::regclass);


--
-- Name: cuentas_contables id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas_contables ALTER COLUMN id SET DEFAULT nextval('public.cuentas_contables_id_seq'::regclass);


--
-- Name: empleados id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados ALTER COLUMN id SET DEFAULT nextval('public.empleados_id_seq'::regclass);


--
-- Name: factura_detalles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura_detalles ALTER COLUMN id SET DEFAULT nextval('public.factura_detalles_id_seq'::regclass);


--
-- Name: facturas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas ALTER COLUMN id SET DEFAULT nextval('public.facturas_id_seq'::regclass);


--
-- Name: lotes_inventario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lotes_inventario ALTER COLUMN id SET DEFAULT nextval('public.lotes_inventario_id_seq'::regclass);


--
-- Name: movimientos_inventario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario ALTER COLUMN id SET DEFAULT nextval('public.movimientos_inventario_id_seq'::regclass);


--
-- Name: nota_credito_detalles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_credito_detalles ALTER COLUMN id SET DEFAULT nextval('public.nota_credito_detalles_id_seq'::regclass);


--
-- Name: notas_credito id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_credito ALTER COLUMN id SET DEFAULT nextval('public.notas_credito_id_seq'::regclass);


--
-- Name: ordenes_compra id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_compra ALTER COLUMN id SET DEFAULT nextval('public.ordenes_compra_id_seq'::regclass);


--
-- Name: ordenes_compra_detalles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_compra_detalles ALTER COLUMN id SET DEFAULT nextval('public.ordenes_compra_detalles_id_seq'::regclass);


--
-- Name: partidas_contables id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partidas_contables ALTER COLUMN id SET DEFAULT nextval('public.partidas_contables_id_seq'::regclass);


--
-- Name: pickings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pickings ALTER COLUMN id SET DEFAULT nextval('public.pickings_id_seq'::regclass);


--
-- Name: pickings_detalles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pickings_detalles ALTER COLUMN id SET DEFAULT nextval('public.pickings_detalles_id_seq'::regclass);


--
-- Name: productos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos ALTER COLUMN id SET DEFAULT nextval('public.productos_id_seq'::regclass);


--
-- Name: productos_puntos_venta id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos_puntos_venta ALTER COLUMN id SET DEFAULT nextval('public.productos_puntos_venta_id_seq'::regclass);


--
-- Name: productos_ubicaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos_ubicaciones ALTER COLUMN id SET DEFAULT nextval('public.productos_ubicaciones_id_seq'::regclass);


--
-- Name: promociones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promociones ALTER COLUMN id SET DEFAULT nextval('public.promociones_id_seq'::regclass);


--
-- Name: proveedores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedores ALTER COLUMN id SET DEFAULT nextval('public.proveedores_id_seq'::regclass);


--
-- Name: puntos_venta id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntos_venta ALTER COLUMN id SET DEFAULT nextval('public.puntos_venta_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: transferencias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transferencias ALTER COLUMN id SET DEFAULT nextval('public.transferencias_id_seq'::regclass);


--
-- Name: transferencias_detalles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transferencias_detalles ALTER COLUMN id SET DEFAULT nextval('public.transferencias_detalles_id_seq'::regclass);


--
-- Name: transferencias_inventario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transferencias_inventario ALTER COLUMN id SET DEFAULT nextval('public.transferencias_inventario_id_seq'::regclass);


--
-- Name: ubicaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicaciones ALTER COLUMN id SET DEFAULT nextval('public.ubicaciones_id_seq'::regclass);


--
-- Name: users_companies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_companies ALTER COLUMN id SET DEFAULT nextval('public.users_companies_id_seq'::regclass);


--
-- Name: usuario_permisos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_permisos ALTER COLUMN id SET DEFAULT nextval('public.usuario_permisos_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: vouchers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers ALTER COLUMN id SET DEFAULT nextval('public.vouchers_id_seq'::regclass);


--
-- Data for Name: ajustes_inventario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ajustes_inventario (id, numero, fecha, producto_id, cantidad_anterior, cantidad_nueva, diferencia, motivo, motivo_detalle, usuario_responsable, observaciones, created_at) FROM stdin;
\.


--
-- Data for Name: albaranes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.albaranes (id, numero, fecha_recepcion, orden_compra_id, estado, observaciones, usuario_recepcion, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: albaranes_detalles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.albaranes_detalles (id, albaran_id, producto_id, cantidad_esperada, cantidad_recibida, cantidad_faltante, cantidad_danada, estado, observaciones, created_at) FROM stdin;
\.


--
-- Data for Name: asientos_contables; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asientos_contables (id, numero_asiento, fecha, descripcion, tipo, total_debe, total_haber, factura_id, nota_credito_id, created_at) FROM stdin;
\.


--
-- Data for Name: asistencias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asistencias (id, empleado_id, fecha, hora_entrada, hora_salida, tipo, observaciones, created_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, usuario_id, usuario_nombre, accion, modulo, entidad_id, valor_anterior, valor_nuevo, ip_address, user_agent, created_at) FROM stdin;
1	\N	Test Script	TEST_ACTION	TEST_MODULE	\N	\N	\N	127.0.0.1	\N	2026-01-01 17:45:13.332939
\.


--
-- Data for Name: autorizaciones_2fa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.autorizaciones_2fa (id, usuario_solicitante_id, usuario_autorizador_id, rol_solicitado_id, codigo_verificacion, estado, fecha_expiracion, fecha_aprobacion, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: backup_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backup_logs (id, archivo, tamano, estado, mensaje_error, fecha_creacion) FROM stdin;
\.


--
-- Data for Name: bancos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bancos (id, nombre, codigo, numero_cuenta, tipo_cuenta, saldo_inicial, saldo_actual, descripcion, activo, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: caja_chica_movimientos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.caja_chica_movimientos (id, punto_venta_id, tipo, monto, descripcion, referencia, fecha, usuario_id, saldo_resultante) FROM stdin;
\.


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clientes (id, nombre, ruc, direccion, telefono, email, "fechaNacimiento", "esExtranjero", created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: compra_detalles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.compra_detalles (id, compra_id, producto_id, cantidad, precio_unitario, subtotal) FROM stdin;
\.


--
-- Data for Name: compras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.compras (id, numero, proveedor_id, punto_venta_id, fecha, subtotal, impuesto, total, estado, observaciones, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: conciliaciones_bancarias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conciliaciones_bancarias (id, banco_id, factura_id, fecha, fecha_valor, referencia, descripcion, monto, tipo, forma_pago, metodo_pago, conciliado, fecha_conciliacion, observaciones, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: conteos_ciclicos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conteos_ciclicos (id, numero, fecha, categoria, ubicacion, estado, usuario_responsable, fecha_inicio, fecha_completado, observaciones, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: conteos_ciclicos_detalles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conteos_ciclicos_detalles (id, conteo_id, producto_id, cantidad_sistema, cantidad_fisica, diferencia, estado, observaciones, created_at) FROM stdin;
\.


--
-- Data for Name: cuentas_contables; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cuentas_contables (id, codigo, nombre, tipo, nivel, padre_id, activa, permite_movimiento, descripcion, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: empleados; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empleados (id, nombre, apellido, cedula, email, telefono, fecha_nacimiento, fecha_ingreso, cargo, departamento, salario, estado, created_at, updated_at, rol) FROM stdin;
1	DARWIN	MORALES	1718273038	fmoralesjo@hotmail.com	0982885713	\N	2025-12-26	Usuario del Sistema	Sistema	\N	activo	2025-12-26 14:33:07.951728	2025-12-26 14:33:07.951728	vendedor
\.


--
-- Data for Name: factura_detalles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.factura_detalles (id, factura_id, producto_id, cantidad, precio_unitario, subtotal, descuento, promocion_id) FROM stdin;
\.


--
-- Data for Name: facturas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facturas (id, numero, cliente_id, empresa_id, vendedor_id, punto_venta_id, fecha, subtotal, impuesto, total, estado, establecimiento, punto_emision, secuencial, tipo_comprobante, ambiente, clave_acceso, autorizacion, fecha_autorizacion, xml_autorizado, forma_pago, condicion_pago, emisor_ruc, emisor_razon_social, emisor_nombre_comercial, emisor_direccion_matriz, emisor_direccion_establecimiento, emisor_telefono, emisor_email, cliente_direccion, cliente_telefono, cliente_email, estado_sri, mensaje_sri, asiento_contable_creado, numero_asiento_contable, observaciones_contables, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: lotes_inventario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lotes_inventario (id, producto_id, numero_lote, fecha_entrada, fecha_vencimiento, cantidad_inicial, cantidad_disponible, costo_unitario, precio_venta, proveedor, referencia_compra, observaciones, created_at) FROM stdin;
\.


--
-- Data for Name: movimientos_inventario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movimientos_inventario (id, producto_id, fecha, tipo, cantidad, motivo, observaciones, factura_id, compra_id, punto_venta_id, created_at) FROM stdin;
\.


--
-- Data for Name: nota_credito_detalles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nota_credito_detalles (id, nota_credito_id, producto_id, cantidad, precio_unitario, subtotal, descuento, factura_detalle_id) FROM stdin;
\.


--
-- Data for Name: notas_credito; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notas_credito (id, numero, factura_original_id, cliente_id, empresa_id, vendedor_id, fecha, motivo_ajuste, subtotal, impuesto, total, estado, establecimiento, punto_emision, secuencial, tipo_comprobante, ambiente, clave_acceso, autorizacion, fecha_autorizacion, asiento_contable_creado, numero_asiento_contable, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ordenes_compra; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ordenes_compra (id, numero, fecha_orden, fecha_esperada, proveedor, estado, observaciones, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ordenes_compra_detalles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ordenes_compra_detalles (id, orden_compra_id, producto_id, cantidad_pedida, cantidad_recibida, precio_unitario, created_at) FROM stdin;
\.


--
-- Data for Name: partidas_contables; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partidas_contables (id, asiento_id, cuenta_id, debe, haber, descripcion, created_at) FROM stdin;
\.


--
-- Data for Name: pickings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pickings (id, numero, fecha, orden_venta, estado, operario, fecha_inicio, fecha_completado, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: pickings_detalles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pickings_detalles (id, picking_id, producto_id, ubicacion_id, cantidad_solicitada, cantidad_picked, estado, orden_picking, created_at) FROM stdin;
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos (id, num_movimiento, fecha_movimiento, codigo, grupo_comercial, referencia, sku, nombre, descripcion, coleccion, categoria, talla, color, desc_color, cod_barras, precio_costo, precio, unidad, stock, tipo_impuesto, punto_reorden, stock_seguridad, tiempo_entrega_dias, costo_promedio, activo, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: productos_puntos_venta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos_puntos_venta (id, producto_id, punto_venta_id, stock, stock_minimo, observaciones, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: productos_ubicaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos_ubicaciones (id, producto_id, ubicacion_id, stock, stock_minimo, stock_maximo, estado_stock, observaciones, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: promociones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promociones (id, nombre, descripcion, tipo, valor, producto_id, categoria, fecha_inicio, fecha_fin, hora_inicio, hora_fin, dias_semana, minimo_compra, maximo_usos, usos_actuales, estado, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: proveedores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proveedores (id, nombre, ruc, direccion, telefono, email, estado, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: puntos_venta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.puntos_venta (id, nombre, codigo, direccion, telefono, email, activo, observaciones, created_at, updated_at, tipo, es_principal) FROM stdin;
1	MALL EL JARDIN	001	AV REPUBLICA Y AV AMAZONAS	0982885713	fmoralesjo@gmail.com	t	\N	2025-12-26 16:28:55.537034	2025-12-26 16:28:55.537034	TIENDA	f
2	QUICENTRO SHOPPING	002	AV AMAZONAS Y 6 DE DICIEMBRE	0982885713	fmoralesjo@gmail.com	t	\N	2025-12-26 16:34:08.454933	2025-12-26 16:34:08.454933	TIENDA	f
3	SCALA SHOPPING	003	CUMBAYA	0982885713	fmoralesjo@gmail.com	t	\N	2025-12-26 16:36:24.832909	2025-12-26 16:36:24.832909	TIENDA	f
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, nombre, descripcion, created_at, updated_at) FROM stdin;
1	admin	Administrador del sistema con acceso completo a todos los módulos	2025-12-26 13:18:42.243682	2025-12-26 13:18:42.243682
2	gestor de sistema	Gestor de sistema con acceso completo para configuración y mantenimiento	2025-12-26 13:18:42.256559	2025-12-26 13:18:42.256559
3	gerente	Gerente con acceso a módulos operativos y reportes	2025-12-26 13:18:42.260322	2025-12-26 13:18:42.260322
4	vendedor	Vendedor con acceso a facturación, clientes y productos	2025-12-26 13:18:42.265645	2025-12-26 13:18:42.265645
5	contador	Contador con acceso a contabilidad, facturación y reportes	2025-12-26 13:18:42.269012	2025-12-26 13:18:42.269012
6	Administrador de TI	Administrador de TI con acceso exclusivo a operatividad técnica, sin acceso a información financiera	2025-12-26 13:18:42.271825	2025-12-26 13:18:42.271825
7	Dueño	Dueño de la empresa con acceso completo y autorización para aprobar solicitudes de roles	2025-12-26 13:18:42.274318	2025-12-26 13:18:42.274318
\.


--
-- Data for Name: transferencias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transferencias (id, tipo, producto_id, cantidad, origen, destino, motivo, fecha, monto, cuenta_origen, cuenta_destino, referencia, estado, created_at) FROM stdin;
\.


--
-- Data for Name: transferencias_detalles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transferencias_detalles (id, transferencia_id, producto_id, cantidad, cantidad_recibida, created_at) FROM stdin;
\.


--
-- Data for Name: transferencias_inventario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transferencias_inventario (id, numero, fecha, origen, destino, estado, usuario_envio, usuario_recepcion, fecha_envio, fecha_recepcion, observaciones, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ubicaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ubicaciones (id, nombre, codigo, tipo, descripcion, direccion, activa, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users_companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users_companies (id, ruc, razon_social, nombre_comercial, direccion_matriz, direccion_establecimiento, telefono, email, contribuyente_especial, obligado_contabilidad, codigo_establecimiento, punto_emision, observaciones, activa, created_at, updated_at, logotipo) FROM stdin;
1	1718273038001	lubricantes al paso 		juan bautista aguirre 					f	001	001		t	2025-12-26 16:16:57.487076	2025-12-26 16:16:57.537272	uploads/logotipos/logotipo-1766783817511-316286156.png
\.


--
-- Data for Name: usuario_permisos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario_permisos (id, usuario_id, modulo, tiene_acceso, created_at, updated_at) FROM stdin;
1	1	facturacion	1	2025-12-26 13:18:46.239955	2025-12-26 13:18:46.239955
2	1	contabilidad	1	2025-12-26 13:18:46.239955	2025-12-26 13:18:46.239955
3	1	clientes	1	2025-12-26 13:18:46.239955	2025-12-26 13:18:46.239955
4	1	productos	1	2025-12-26 13:18:46.239955	2025-12-26 13:18:46.239955
5	1	inventario	1	2025-12-26 13:18:46.239955	2025-12-26 13:18:46.239955
6	1	compras	1	2025-12-26 13:18:46.239955	2025-12-26 13:18:46.239955
7	1	admin	1	2025-12-26 13:18:46.239955	2025-12-26 13:18:46.239955
8	1	reportes	1	2025-12-26 13:18:46.239955	2025-12-26 13:18:46.239955
9	2	facturacion	1	2025-12-26 13:18:46.251067	2025-12-26 13:18:46.251067
10	2	contabilidad	1	2025-12-26 13:18:46.251067	2025-12-26 13:18:46.251067
11	2	clientes	1	2025-12-26 13:18:46.251067	2025-12-26 13:18:46.251067
12	2	productos	1	2025-12-26 13:18:46.251067	2025-12-26 13:18:46.251067
13	2	inventario	1	2025-12-26 13:18:46.251067	2025-12-26 13:18:46.251067
14	2	compras	1	2025-12-26 13:18:46.251067	2025-12-26 13:18:46.251067
15	2	admin	1	2025-12-26 13:18:46.251067	2025-12-26 13:18:46.251067
16	2	reportes	1	2025-12-26 13:18:46.251067	2025-12-26 13:18:46.251067
17	3	facturacion	1	2025-12-26 13:18:46.258109	2025-12-26 13:18:46.258109
18	3	contabilidad	1	2025-12-26 13:18:46.258109	2025-12-26 13:18:46.258109
19	3	clientes	1	2025-12-26 13:18:46.258109	2025-12-26 13:18:46.258109
20	3	productos	1	2025-12-26 13:18:46.258109	2025-12-26 13:18:46.258109
21	3	inventario	1	2025-12-26 13:18:46.258109	2025-12-26 13:18:46.258109
22	3	compras	1	2025-12-26 13:18:46.258109	2025-12-26 13:18:46.258109
23	3	reportes	1	2025-12-26 13:18:46.258109	2025-12-26 13:18:46.258109
24	4	facturacion	1	2025-12-26 13:18:46.264371	2025-12-26 13:18:46.264371
25	4	clientes	1	2025-12-26 13:18:46.264371	2025-12-26 13:18:46.264371
26	4	productos	1	2025-12-26 13:18:46.264371	2025-12-26 13:18:46.264371
27	5	facturacion	1	2025-12-26 13:18:46.269256	2025-12-26 13:18:46.269256
28	5	clientes	1	2025-12-26 13:18:46.269256	2025-12-26 13:18:46.269256
29	5	productos	1	2025-12-26 13:18:46.269256	2025-12-26 13:18:46.269256
30	6	contabilidad	1	2025-12-26 13:18:46.273912	2025-12-26 13:18:46.273912
31	6	facturacion	1	2025-12-26 13:18:46.273912	2025-12-26 13:18:46.273912
32	6	reportes	1	2025-12-26 13:18:46.273912	2025-12-26 13:18:46.273912
148	11	facturacion	1	2025-12-26 15:48:41.682369	2025-12-26 15:48:41.682369
149	11	clientes	1	2025-12-26 15:48:41.682369	2025-12-26 15:48:41.682369
150	11	productos	1	2025-12-26 15:48:41.682369	2025-12-26 15:48:41.682369
151	10	facturacion	0	2026-01-01 17:25:48.092207	2026-01-01 17:25:48.092207
152	10	contabilidad	0	2026-01-01 17:25:48.092207	2026-01-01 17:25:48.092207
153	10	clientes	0	2026-01-01 17:25:48.092207	2026-01-01 17:25:48.092207
154	10	productos	0	2026-01-01 17:25:48.092207	2026-01-01 17:25:48.092207
155	10	compras	0	2026-01-01 17:25:48.092207	2026-01-01 17:25:48.092207
156	10	admin	0	2026-01-01 17:25:48.092207	2026-01-01 17:25:48.092207
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nombre_usuario, nombre_completo, password, email, activo, rol_id, created_at, updated_at, cedula, foto_cedula, validado) FROM stdin;
1	admin	Administrador del Sistema	admin123	admin@sistema.com	1	1	2025-12-26 13:18:46.225029	2025-12-26 13:18:46.225029	\N	\N	f
2	gestor	Gestor de Sistema	gestor123	gestor@sistema.com	1	2	2025-12-26 13:18:46.247928	2025-12-26 13:18:46.247928	\N	\N	f
3	gerente	Gerente General	gerente123	gerente@sistema.com	1	3	2025-12-26 13:18:46.255884	2025-12-26 13:18:46.255884	\N	\N	f
4	vendedor1	Vendedor Principal	vendedor123	vendedor1@sistema.com	1	4	2025-12-26 13:18:46.26252	2025-12-26 13:18:46.26252	\N	\N	f
5	vendedor2	Vendedor Secundario	vendedor123	vendedor2@sistema.com	1	4	2025-12-26 13:18:46.267046	2025-12-26 13:18:46.267046	\N	\N	f
6	contador	Contador General	contador123	contador@sistema.com	1	5	2025-12-26 13:18:46.272122	2025-12-26 13:18:46.272122	\N	\N	f
10	fmoralesjo	DARWIN MORALES	firebase-user	fmoralesjo@hotmail.com	1	4	2025-12-26 14:33:07.873072	2025-12-26 15:18:16.324374	1718273038	uploads/cedulas/cedula-1766777587833-496607093.png	t
11	prueba	DARWIN MORALES	firebase-user	prueba@ejemplo.com	1	4	2025-12-26 15:48:41.634192	2025-12-26 15:48:41.634192	\N	\N	f
\.


--
-- Data for Name: vouchers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vouchers (id, factura_id, clave_acceso, xml_generado, xml_firmado, xml_autorizado, estado_sri, mensaje_sri, numero_autorizacion, fecha_autorizacion, ambiente, ruta_pdf, observaciones, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Name: ajustes_inventario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ajustes_inventario_id_seq', 1, false);


--
-- Name: albaranes_detalles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.albaranes_detalles_id_seq', 1, false);


--
-- Name: albaranes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.albaranes_id_seq', 1, false);


--
-- Name: asientos_contables_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asientos_contables_id_seq', 1, false);


--
-- Name: asistencias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asistencias_id_seq', 1, false);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, true);


--
-- Name: autorizaciones_2fa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.autorizaciones_2fa_id_seq', 1, false);


--
-- Name: backup_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.backup_logs_id_seq', 1, false);


--
-- Name: bancos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bancos_id_seq', 1, false);


--
-- Name: caja_chica_movimientos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.caja_chica_movimientos_id_seq', 1, false);


--
-- Name: clientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clientes_id_seq', 1, false);


--
-- Name: compra_detalles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.compra_detalles_id_seq', 1, false);


--
-- Name: compras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.compras_id_seq', 1, false);


--
-- Name: conciliaciones_bancarias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conciliaciones_bancarias_id_seq', 1, false);


--
-- Name: conteos_ciclicos_detalles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conteos_ciclicos_detalles_id_seq', 1, false);


--
-- Name: conteos_ciclicos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conteos_ciclicos_id_seq', 1, false);


--
-- Name: cuentas_contables_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cuentas_contables_id_seq', 1, false);


--
-- Name: empleados_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.empleados_id_seq', 1, true);


--
-- Name: factura_detalles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.factura_detalles_id_seq', 1, false);


--
-- Name: facturas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.facturas_id_seq', 1, false);


--
-- Name: lotes_inventario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lotes_inventario_id_seq', 1, false);


--
-- Name: movimientos_inventario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.movimientos_inventario_id_seq', 1, false);


--
-- Name: nota_credito_detalles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nota_credito_detalles_id_seq', 1, false);


--
-- Name: notas_credito_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notas_credito_id_seq', 1, false);


--
-- Name: ordenes_compra_detalles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ordenes_compra_detalles_id_seq', 1, false);


--
-- Name: ordenes_compra_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ordenes_compra_id_seq', 1, false);


--
-- Name: partidas_contables_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.partidas_contables_id_seq', 1, false);


--
-- Name: pickings_detalles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pickings_detalles_id_seq', 1, false);


--
-- Name: pickings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pickings_id_seq', 1, false);


--
-- Name: productos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productos_id_seq', 1, false);


--
-- Name: productos_puntos_venta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productos_puntos_venta_id_seq', 1, false);


--
-- Name: productos_ubicaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productos_ubicaciones_id_seq', 1, false);


--
-- Name: promociones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promociones_id_seq', 1, false);


--
-- Name: proveedores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.proveedores_id_seq', 1, false);


--
-- Name: puntos_venta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.puntos_venta_id_seq', 3, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 7, true);


--
-- Name: transferencias_detalles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transferencias_detalles_id_seq', 1, false);


--
-- Name: transferencias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transferencias_id_seq', 1, false);


--
-- Name: transferencias_inventario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transferencias_inventario_id_seq', 1, false);


--
-- Name: ubicaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ubicaciones_id_seq', 1, false);


--
-- Name: users_companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_companies_id_seq', 1, true);


--
-- Name: usuario_permisos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_permisos_id_seq', 156, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 12, true);


--
-- Name: vouchers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vouchers_id_seq', 1, false);


--
-- Name: productos PK_04f604609a0949a7f3b43400766; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT "PK_04f604609a0949a7f3b43400766" PRIMARY KEY (id);


--
-- Name: pickings PK_136801091eb714e866677c1f4e5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pickings
    ADD CONSTRAINT "PK_136801091eb714e866677c1f4e5" PRIMARY KEY (id);


--
-- Name: ajustes_inventario PK_186ce8481a7cd8dac85a71ddb01; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ajustes_inventario
    ADD CONSTRAINT "PK_186ce8481a7cd8dac85a71ddb01" PRIMARY KEY (id);


--
-- Name: proveedores PK_1dcf121f19f362fb1b4c0a493a9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedores
    ADD CONSTRAINT "PK_1dcf121f19f362fb1b4c0a493a9" PRIMARY KEY (id);


--
-- Name: usuario_permisos PK_245fe30a1b490654d20cdcfb7ce; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_permisos
    ADD CONSTRAINT "PK_245fe30a1b490654d20cdcfb7ce" PRIMARY KEY (id);


--
-- Name: transferencias_inventario PK_24cf8efe959dfd7e20347932434; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transferencias_inventario
    ADD CONSTRAINT "PK_24cf8efe959dfd7e20347932434" PRIMARY KEY (id);


--
-- Name: compra_detalles PK_275e76dd0e6fc62eee69072fbba; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_detalles
    ADD CONSTRAINT "PK_275e76dd0e6fc62eee69072fbba" PRIMARY KEY (id);


--
-- Name: productos_puntos_venta PK_2f4a720cfa9cc8e0dd05042c8bd; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos_puntos_venta
    ADD CONSTRAINT "PK_2f4a720cfa9cc8e0dd05042c8bd" PRIMARY KEY (id);


--
-- Name: bancos PK_396683a88a4f8dd5483ce703c89; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bancos
    ADD CONSTRAINT "PK_396683a88a4f8dd5483ce703c89" PRIMARY KEY (id);


--
-- Name: puntos_venta PK_4bda1eea2af2ece01dc65c0bc51; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntos_venta
    ADD CONSTRAINT "PK_4bda1eea2af2ece01dc65c0bc51" PRIMARY KEY (id);


--
-- Name: ordenes_compra PK_4c80d543ff8c43dd99551a12d35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_compra
    ADD CONSTRAINT "PK_4c80d543ff8c43dd99551a12d35" PRIMARY KEY (id);


--
-- Name: compras PK_63037d5249eefe140e3587ff6f2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT "PK_63037d5249eefe140e3587ff6f2" PRIMARY KEY (id);


--
-- Name: transferencias PK_68d981495936b6bdcfe66cf9047; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transferencias
    ADD CONSTRAINT "PK_68d981495936b6bdcfe66cf9047" PRIMARY KEY (id);


--
-- Name: cuentas_contables PK_6d2003fd5a3029b89852c6c43fd; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas_contables
    ADD CONSTRAINT "PK_6d2003fd5a3029b89852c6c43fd" PRIMARY KEY (id);


--
-- Name: empleados PK_73a63a6fcb4266219be3eb0ce8a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT "PK_73a63a6fcb4266219be3eb0ce8a" PRIMARY KEY (id);


--
-- Name: users_companies PK_73b8247d09e25f36310a1bd67d5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_companies
    ADD CONSTRAINT "PK_73b8247d09e25f36310a1bd67d5" PRIMARY KEY (id);


--
-- Name: transferencias_detalles PK_7490387e3080b18e6a5bc5c2ce9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transferencias_detalles
    ADD CONSTRAINT "PK_7490387e3080b18e6a5bc5c2ce9" PRIMARY KEY (id);


--
-- Name: conteos_ciclicos PK_7ea2dca682444b4eda0969cc912; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conteos_ciclicos
    ADD CONSTRAINT "PK_7ea2dca682444b4eda0969cc912" PRIMARY KEY (id);


--
-- Name: movimientos_inventario PK_812f6e4f95b017981363c4b9ff9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT "PK_812f6e4f95b017981363c4b9ff9" PRIMARY KEY (id);


--
-- Name: autorizaciones_2fa PK_84f8f7c473951c9e382c6df3e54; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.autorizaciones_2fa
    ADD CONSTRAINT "PK_84f8f7c473951c9e382c6df3e54" PRIMARY KEY (id);


--
-- Name: conciliaciones_bancarias PK_95c4bc608bea8c99a08144bcec7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conciliaciones_bancarias
    ADD CONSTRAINT "PK_95c4bc608bea8c99a08144bcec7" PRIMARY KEY (id);


--
-- Name: albaranes_detalles PK_9bfa63ca83d63b6476ac1f4a1ba; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.albaranes_detalles
    ADD CONSTRAINT "PK_9bfa63ca83d63b6476ac1f4a1ba" PRIMARY KEY (id);


--
-- Name: factura_detalles PK_a246936511706b22cf1b1a2474d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura_detalles
    ADD CONSTRAINT "PK_a246936511706b22cf1b1a2474d" PRIMARY KEY (id);


--
-- Name: ubicaciones PK_a9ce0b671142b83ebff02722cf9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicaciones
    ADD CONSTRAINT "PK_a9ce0b671142b83ebff02722cf9" PRIMARY KEY (id);


--
-- Name: notas_credito PK_b2b891a43e393bd403209578ced; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_credito
    ADD CONSTRAINT "PK_b2b891a43e393bd403209578ced" PRIMARY KEY (id);


--
-- Name: partidas_contables PK_be6c0573706057ac58011da67c1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partidas_contables
    ADD CONSTRAINT "PK_be6c0573706057ac58011da67c1" PRIMARY KEY (id);


--
-- Name: roles PK_c1433d71a4838793a49dcad46ab; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY (id);


--
-- Name: nota_credito_detalles PK_c1df7434e442449006ae74917f1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_credito_detalles
    ADD CONSTRAINT "PK_c1df7434e442449006ae74917f1" PRIMARY KEY (id);


--
-- Name: productos_ubicaciones PK_c324de9759d566ec9165b9f78d0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos_ubicaciones
    ADD CONSTRAINT "PK_c324de9759d566ec9165b9f78d0" PRIMARY KEY (id);


--
-- Name: promociones PK_c82363f1aaeada3921a25a9eafa; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promociones
    ADD CONSTRAINT "PK_c82363f1aaeada3921a25a9eafa" PRIMARY KEY (id);


--
-- Name: caja_chica_movimientos PK_caja_chica_movimientos; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caja_chica_movimientos
    ADD CONSTRAINT "PK_caja_chica_movimientos" PRIMARY KEY (id);


--
-- Name: ordenes_compra_detalles PK_cc93986e7ea8ca29faf60b79402; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_compra_detalles
    ADD CONSTRAINT "PK_cc93986e7ea8ca29faf60b79402" PRIMARY KEY (id);


--
-- Name: conteos_ciclicos_detalles PK_ce861c3b793328b1790ff30d40f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conteos_ciclicos_detalles
    ADD CONSTRAINT "PK_ce861c3b793328b1790ff30d40f" PRIMARY KEY (id);


--
-- Name: lotes_inventario PK_d53c42ed86b9c606e6e923e36ee; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lotes_inventario
    ADD CONSTRAINT "PK_d53c42ed86b9c606e6e923e36ee" PRIMARY KEY (id);


--
-- Name: asientos_contables PK_d65d3bfd43da26ef441362c0a35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asientos_contables
    ADD CONSTRAINT "PK_d65d3bfd43da26ef441362c0a35" PRIMARY KEY (id);


--
-- Name: usuarios PK_d7281c63c176e152e4c531594a8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY (id);


--
-- Name: clientes PK_d76bf3571d906e4e86470482c08; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT "PK_d76bf3571d906e4e86470482c08" PRIMARY KEY (id);


--
-- Name: albaranes PK_ec566a481290e45f89c8c7b5140; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.albaranes
    ADD CONSTRAINT "PK_ec566a481290e45f89c8c7b5140" PRIMARY KEY (id);


--
-- Name: vouchers PK_ed1b7dd909a696560763acdbc04; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT "PK_ed1b7dd909a696560763acdbc04" PRIMARY KEY (id);


--
-- Name: facturas PK_f302947c1e4773639b20707a8bc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT "PK_f302947c1e4773639b20707a8bc" PRIMARY KEY (id);


--
-- Name: pickings_detalles PK_f6037345e770fad78370959543b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pickings_detalles
    ADD CONSTRAINT "PK_f6037345e770fad78370959543b" PRIMARY KEY (id);


--
-- Name: asistencias PK_f7eb09d44d6c7dd4ccc6eb29af8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT "PK_f7eb09d44d6c7dd4ccc6eb29af8" PRIMARY KEY (id);


--
-- Name: pickings UQ_0135a649b9bb4d1f71e28226ed4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pickings
    ADD CONSTRAINT "UQ_0135a649b9bb4d1f71e28226ed4" UNIQUE (numero);


--
-- Name: asientos_contables UQ_0f89a7f4e1b7e63178017d4558e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asientos_contables
    ADD CONSTRAINT "UQ_0f89a7f4e1b7e63178017d4558e" UNIQUE (numero_asiento);


--
-- Name: usuarios UQ_1a7a36f3dffef210b4c0ba5c6c0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "UQ_1a7a36f3dffef210b4c0ba5c6c0" UNIQUE (nombre_usuario);


--
-- Name: notas_credito UQ_20eaad8f23a619b28f52e8ef561; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_credito
    ADD CONSTRAINT "UQ_20eaad8f23a619b28f52e8ef561" UNIQUE (numero);


--
-- Name: productos UQ_2da210b34325c2319d784a32d49; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT "UQ_2da210b34325c2319d784a32d49" UNIQUE (codigo);


--
-- Name: albaranes UQ_30985a80a737943ca129d2e78b4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.albaranes
    ADD CONSTRAINT "UQ_30985a80a737943ca129d2e78b4" UNIQUE (numero);


--
-- Name: ordenes_compra UQ_3111d653e42e410f84cb6d4683b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_compra
    ADD CONSTRAINT "UQ_3111d653e42e410f84cb6d4683b" UNIQUE (numero);


--
-- Name: empleados UQ_531b62206ec48fc3ba88593af3a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT "UQ_531b62206ec48fc3ba88593af3a" UNIQUE (cedula);


--
-- Name: compras UQ_6d270a6f25e39f2e8daa4c37666; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT "UQ_6d270a6f25e39f2e8daa4c37666" UNIQUE (numero);


--
-- Name: productos UQ_805687bf24c1411756fbd37b2f3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT "UQ_805687bf24c1411756fbd37b2f3" UNIQUE (sku);


--
-- Name: vouchers UQ_97b152c51bdb1bab5a01006ff4c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT "UQ_97b152c51bdb1bab5a01006ff4c" UNIQUE (clave_acceso);


--
-- Name: users_companies UQ_a31ffd98b67149796d751b9f4b5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_companies
    ADD CONSTRAINT "UQ_a31ffd98b67149796d751b9f4b5" UNIQUE (ruc);


--
-- Name: roles UQ_a5be7aa67e759e347b1c6464e10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "UQ_a5be7aa67e759e347b1c6464e10" UNIQUE (nombre);


--
-- Name: transferencias_inventario UQ_a7ba14c7e95c0c3a31e86360f2e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transferencias_inventario
    ADD CONSTRAINT "UQ_a7ba14c7e95c0c3a31e86360f2e" UNIQUE (numero);


--
-- Name: vouchers UQ_b9a76fd6653e01ccb69172a9ee4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT "UQ_b9a76fd6653e01ccb69172a9ee4" UNIQUE (factura_id);


--
-- Name: ajustes_inventario UQ_c3f2a90fa142fc2106325054928; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ajustes_inventario
    ADD CONSTRAINT "UQ_c3f2a90fa142fc2106325054928" UNIQUE (numero);


--
-- Name: usuarios UQ_d0a04a74cdb68388fa196a5ba51; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "UQ_d0a04a74cdb68388fa196a5ba51" UNIQUE (cedula);


--
-- Name: clientes UQ_d8747b033a4210f1d835e776c58; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT "UQ_d8747b033a4210f1d835e776c58" UNIQUE (ruc);


--
-- Name: puntos_venta UQ_da26b22de26a61563634d6942d5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntos_venta
    ADD CONSTRAINT "UQ_da26b22de26a61563634d6942d5" UNIQUE (codigo);


--
-- Name: facturas UQ_e96e0896b0f2a4319d61fcf9ff7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT "UQ_e96e0896b0f2a4319d61fcf9ff7" UNIQUE (numero);


--
-- Name: conteos_ciclicos UQ_f52f8a8074872a295811563e69d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conteos_ciclicos
    ADD CONSTRAINT "UQ_f52f8a8074872a295811563e69d" UNIQUE (numero);


--
-- Name: cuentas_contables UQ_fad7e044cff19ec01f5b6c0f451; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas_contables
    ADD CONSTRAINT "UQ_fad7e044cff19ec01f5b6c0f451" UNIQUE (codigo);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: backup_logs backup_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backup_logs
    ADD CONSTRAINT backup_logs_pkey PRIMARY KEY (id);


--
-- Name: IDX_0f89a7f4e1b7e63178017d4558; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_0f89a7f4e1b7e63178017d4558" ON public.asientos_contables USING btree (numero_asiento);


--
-- Name: IDX_570ccb989e9124b0ebf84319dd; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_570ccb989e9124b0ebf84319dd" ON public.productos_puntos_venta USING btree (producto_id, punto_venta_id);


--
-- Name: IDX_97b152c51bdb1bab5a01006ff4; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_97b152c51bdb1bab5a01006ff4" ON public.vouchers USING btree (clave_acceso);


--
-- Name: IDX_99bc44d75f52f20176fb4888e6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_99bc44d75f52f20176fb4888e6" ON public.lotes_inventario USING btree (producto_id, fecha_entrada);


--
-- Name: IDX_c1d40eb59352f97c9fbb6601bd; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_c1d40eb59352f97c9fbb6601bd" ON public.productos_ubicaciones USING btree (producto_id, ubicacion_id);


--
-- Name: IDX_fad7e044cff19ec01f5b6c0f45; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_fad7e044cff19ec01f5b6c0f45" ON public.cuentas_contables USING btree (codigo);


--
-- Name: promociones FK_0318319830d1d6cd54d16780572; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promociones
    ADD CONSTRAINT "FK_0318319830d1d6cd54d16780572" FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: ajustes_inventario FK_0aa02bc5d8548bf1df2abb8f978; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ajustes_inventario
    ADD CONSTRAINT "FK_0aa02bc5d8548bf1df2abb8f978" FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: albaranes_detalles FK_0df4ececbbe3dba93120b20261d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.albaranes_detalles
    ADD CONSTRAINT "FK_0df4ececbbe3dba93120b20261d" FOREIGN KEY (albaran_id) REFERENCES public.albaranes(id) ON DELETE CASCADE;


--
-- Name: conteos_ciclicos_detalles FK_1503728d98bd0cd186088edecca; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conteos_ciclicos_detalles
    ADD CONSTRAINT "FK_1503728d98bd0cd186088edecca" FOREIGN KEY (conteo_id) REFERENCES public.conteos_ciclicos(id) ON DELETE CASCADE;


--
-- Name: pickings_detalles FK_187834d04f6318531dcdb752381; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pickings_detalles
    ADD CONSTRAINT "FK_187834d04f6318531dcdb752381" FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: notas_credito FK_1985b8c47429dba370d9e1ed2e0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_credito
    ADD CONSTRAINT "FK_1985b8c47429dba370d9e1ed2e0" FOREIGN KEY (factura_original_id) REFERENCES public.facturas(id);


--
-- Name: lotes_inventario FK_2475d54a38a4343579c1ace2378; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lotes_inventario
    ADD CONSTRAINT "FK_2475d54a38a4343579c1ace2378" FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: facturas FK_2915db0853d572376285b7c271c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT "FK_2915db0853d572376285b7c271c" FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);


--
-- Name: conteos_ciclicos_detalles FK_2b4d05e8e1801bda411858c3f75; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conteos_ciclicos_detalles
    ADD CONSTRAINT "FK_2b4d05e8e1801bda411858c3f75" FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: factura_detalles FK_2e3fe08b50e1ce7f49b866d2536; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura_detalles
    ADD CONSTRAINT "FK_2e3fe08b50e1ce7f49b866d2536" FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: productos_puntos_venta FK_2fec1f766d0e07ccf7a770e4b0e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos_puntos_venta
    ADD CONSTRAINT "FK_2fec1f766d0e07ccf7a770e4b0e" FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: movimientos_inventario FK_3348124e7f82854d88aa726ff88; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT "FK_3348124e7f82854d88aa726ff88" FOREIGN KEY (factura_id) REFERENCES public.facturas(id);


--
-- Name: movimientos_inventario FK_34e722a39e30087fa624b5955d5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT "FK_34e722a39e30087fa624b5955d5" FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: asistencias FK_37a14c1b1fc674a43e56652eb75; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT "FK_37a14c1b1fc674a43e56652eb75" FOREIGN KEY (empleado_id) REFERENCES public.empleados(id);


--
-- Name: partidas_contables FK_37d4a1da6fbb9c169d55f0b999b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partidas_contables
    ADD CONSTRAINT "FK_37d4a1da6fbb9c169d55f0b999b" FOREIGN KEY (cuenta_id) REFERENCES public.cuentas_contables(id);


--
-- Name: asientos_contables FK_452cd190ea1becfbbd74578e5e7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asientos_contables
    ADD CONSTRAINT "FK_452cd190ea1becfbbd74578e5e7" FOREIGN KEY (nota_credito_id) REFERENCES public.notas_credito(id);


--
-- Name: facturas FK_50f9c6692d47ab1989f494c098d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT "FK_50f9c6692d47ab1989f494c098d" FOREIGN KEY (empresa_id) REFERENCES public.users_companies(id);


--
-- Name: ordenes_compra_detalles FK_54b384e3429295619b766fe97fa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_compra_detalles
    ADD CONSTRAINT "FK_54b384e3429295619b766fe97fa" FOREIGN KEY (orden_compra_id) REFERENCES public.ordenes_compra(id) ON DELETE CASCADE;


--
-- Name: autorizaciones_2fa FK_5cf5d11bb0fc18a3bc751a51ae9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.autorizaciones_2fa
    ADD CONSTRAINT "FK_5cf5d11bb0fc18a3bc751a51ae9" FOREIGN KEY (usuario_solicitante_id) REFERENCES public.usuarios(id);


--
-- Name: cuentas_contables FK_5d75cec4f9bc6ddd9d4f53a3624; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas_contables
    ADD CONSTRAINT "FK_5d75cec4f9bc6ddd9d4f53a3624" FOREIGN KEY (padre_id) REFERENCES public.cuentas_contables(id);


--
-- Name: compra_detalles FK_736491d693c1728023c18dcd56c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_detalles
    ADD CONSTRAINT "FK_736491d693c1728023c18dcd56c" FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: factura_detalles FK_78867b0997ef94ce2f38370acba; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura_detalles
    ADD CONSTRAINT "FK_78867b0997ef94ce2f38370acba" FOREIGN KEY (factura_id) REFERENCES public.facturas(id) ON DELETE CASCADE;


--
-- Name: transferencias FK_93feebb7836a9d65ad9e011e8f3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transferencias
    ADD CONSTRAINT "FK_93feebb7836a9d65ad9e011e8f3" FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: usuarios FK_9e519760a660751f4fa21453d3e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "FK_9e519760a660751f4fa21453d3e" FOREIGN KEY (rol_id) REFERENCES public.roles(id);


--
-- Name: albaranes FK_9e800254242d32ff89974a5cbe4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.albaranes
    ADD CONSTRAINT "FK_9e800254242d32ff89974a5cbe4" FOREIGN KEY (orden_compra_id) REFERENCES public.ordenes_compra(id);


--
-- Name: pickings_detalles FK_a25609ed0a35d1fa13a9bf7590e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pickings_detalles
    ADD CONSTRAINT "FK_a25609ed0a35d1fa13a9bf7590e" FOREIGN KEY (ubicacion_id) REFERENCES public.ubicaciones(id);


--
-- Name: compra_detalles FK_a3f5e9f7c9f23f76ef2814b0472; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_detalles
    ADD CONSTRAINT "FK_a3f5e9f7c9f23f76ef2814b0472" FOREIGN KEY (compra_id) REFERENCES public.compras(id) ON DELETE CASCADE;


--
-- Name: albaranes_detalles FK_a7c21b796317e1e4ae6fc58292c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.albaranes_detalles
    ADD CONSTRAINT "FK_a7c21b796317e1e4ae6fc58292c" FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: transferencias_detalles FK_b00c86e60d5b930404a183779cb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transferencias_detalles
    ADD CONSTRAINT "FK_b00c86e60d5b930404a183779cb" FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: vouchers FK_b9a76fd6653e01ccb69172a9ee4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT "FK_b9a76fd6653e01ccb69172a9ee4" FOREIGN KEY (factura_id) REFERENCES public.facturas(id);


--
-- Name: partidas_contables FK_ba7b88b2fe2ffbc8c125d11cc3b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partidas_contables
    ADD CONSTRAINT "FK_ba7b88b2fe2ffbc8c125d11cc3b" FOREIGN KEY (asiento_id) REFERENCES public.asientos_contables(id) ON DELETE CASCADE;


--
-- Name: notas_credito FK_c6fefe33c33d012b3b20c82f4a2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_credito
    ADD CONSTRAINT "FK_c6fefe33c33d012b3b20c82f4a2" FOREIGN KEY (vendedor_id) REFERENCES public.empleados(id);


--
-- Name: conciliaciones_bancarias FK_d2a85a23313f97e7b1003d6ff55; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conciliaciones_bancarias
    ADD CONSTRAINT "FK_d2a85a23313f97e7b1003d6ff55" FOREIGN KEY (factura_id) REFERENCES public.facturas(id);


--
-- Name: nota_credito_detalles FK_d399ec73ec21342c8aaf45ec67a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_credito_detalles
    ADD CONSTRAINT "FK_d399ec73ec21342c8aaf45ec67a" FOREIGN KEY (nota_credito_id) REFERENCES public.notas_credito(id) ON DELETE CASCADE;


--
-- Name: conciliaciones_bancarias FK_d57b90bbe69c0d9248f0a5f3033; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conciliaciones_bancarias
    ADD CONSTRAINT "FK_d57b90bbe69c0d9248f0a5f3033" FOREIGN KEY (banco_id) REFERENCES public.bancos(id);


--
-- Name: nota_credito_detalles FK_d6a550c6d7a7c996581e0432862; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_credito_detalles
    ADD CONSTRAINT "FK_d6a550c6d7a7c996581e0432862" FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: compras FK_d7b3950fea313d15e46e0c59286; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT "FK_d7b3950fea313d15e46e0c59286" FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id);


--
-- Name: notas_credito FK_d8344e2a2af15e1dad9b9d16b46; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_credito
    ADD CONSTRAINT "FK_d8344e2a2af15e1dad9b9d16b46" FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);


--
-- Name: productos_ubicaciones FK_e0c211a87d718e4cbe103d311d2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos_ubicaciones
    ADD CONSTRAINT "FK_e0c211a87d718e4cbe103d311d2" FOREIGN KEY (ubicacion_id) REFERENCES public.ubicaciones(id);


--
-- Name: usuario_permisos FK_e62cb45e771719fa20c9171c4c2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_permisos
    ADD CONSTRAINT "FK_e62cb45e771719fa20c9171c4c2" FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: notas_credito FK_e8430dc8016d2f9ad2ab30f17fc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_credito
    ADD CONSTRAINT "FK_e8430dc8016d2f9ad2ab30f17fc" FOREIGN KEY (empresa_id) REFERENCES public.users_companies(id);


--
-- Name: facturas FK_ed0af47e9ec31fbfa2c0dc765bd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT "FK_ed0af47e9ec31fbfa2c0dc765bd" FOREIGN KEY (vendedor_id) REFERENCES public.empleados(id);


--
-- Name: ordenes_compra_detalles FK_ed296f9b4ded6708f8dac383c96; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_compra_detalles
    ADD CONSTRAINT "FK_ed296f9b4ded6708f8dac383c96" FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: autorizaciones_2fa FK_eda8cf6311a0492c133cddb2eb3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.autorizaciones_2fa
    ADD CONSTRAINT "FK_eda8cf6311a0492c133cddb2eb3" FOREIGN KEY (usuario_autorizador_id) REFERENCES public.usuarios(id);


--
-- Name: asientos_contables FK_efeb24e87376de515082eec7982; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asientos_contables
    ADD CONSTRAINT "FK_efeb24e87376de515082eec7982" FOREIGN KEY (factura_id) REFERENCES public.facturas(id);


--
-- Name: pickings_detalles FK_f2ad4cdd3976d3d0d1bee2fcc0a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pickings_detalles
    ADD CONSTRAINT "FK_f2ad4cdd3976d3d0d1bee2fcc0a" FOREIGN KEY (picking_id) REFERENCES public.pickings(id) ON DELETE CASCADE;


--
-- Name: transferencias_detalles FK_fa0e6e56a85366e6fbb37d3659d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transferencias_detalles
    ADD CONSTRAINT "FK_fa0e6e56a85366e6fbb37d3659d" FOREIGN KEY (transferencia_id) REFERENCES public.transferencias_inventario(id) ON DELETE CASCADE;


--
-- Name: productos_ubicaciones FK_fce36009fc89372dc285b57674e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos_ubicaciones
    ADD CONSTRAINT "FK_fce36009fc89372dc285b57674e" FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: audit_logs fk_audit_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT fk_audit_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict eSiCiqlK5rVV3kHua0HSUnr64rIlVJSYTC4uhHLs9STUNqgheLHX7Q0yGgPp5bv

