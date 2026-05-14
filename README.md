# 🧺 Lavandería SmartManager

Sistema integral de gestión de procesos para una lavandería en Guayaquil. Incluye recepción digital de pedidos con tickets QR, portal de seguimiento para clientes, panel operativo Kanban y módulos de facturación, inventario y reportes.

---

## 📋 Tabla de Contenidos

- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Prerrequisitos de Instalación](#prerrequisitos-de-instalación)
- [Configuración de la Base de Datos](#configuración-de-la-base-de-datos)
- [Ejecución del Backend](#ejecución-del-backend)
- [Ejecución del Frontend](#ejecución-del-frontend)
- [Restricciones Conocidas y Soluciones](#restricciones-conocidas-y-soluciones)
- [Endpoints de la API](#endpoints-de-la-api)

---

## 🏗️ Arquitectura del Proyecto

```
lavanderia-smart-manager/
├── api-service/          # Backend: Spring Boot 3.2 + Java 17
│   └── src/main/java/com/smartmanager/
│       ├── controller/   # Controladores REST
│       ├── service/      # Lógica de negocio
│       ├── model/        # Entidades JPA
│       ├── repository/   # Repositorios Spring Data
│       ├── dto/          # Objetos de Transferencia
│       └── config/       # Configuración CORS
└── web-client/           # Frontend: React 19 + Vite + Tailwind CSS
    └── src/
        ├── pages/        # Vistas principales
        └── components/   # Componentes reutilizables
```

**Stack Tecnológico:**

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | React + Vite | React 19 / Vite 8 |
| Estilos | Tailwind CSS | 3.x |
| Backend | Spring Boot | 3.2.3 |
| Lenguaje | Java | 17 (mínimo) |
| Base de Datos | PostgreSQL | 14+ |
| ORM | Hibernate / Spring Data JPA | - |

---

## ⚙️ Prerrequisitos de Instalación

Asegúrate de tener instalado lo siguiente **antes** de clonar el proyecto:

### 1. Node.js (Frontend)
- **Versión mínima recomendada:** Node.js 18 LTS o superior
- Descarga: https://nodejs.org/
- Verificar instalación:
  ```bash
  node -v
  npm -v
  ```

### 2. Java JDK 17 o superior (Backend)
- **Versión usada en producción:** JDK 21
- Descarga JDK 21: https://www.oracle.com/java/technologies/downloads/#java21
- Verificar instalación:
  ```bash
  java -version
  ```

### 3. Apache Maven (Backend)
- Maven ya está incluido en **NetBeans** y en muchos IDEs. Si usas terminal:
- Descarga: https://maven.apache.org/download.cgi
- Verificar instalación:
  ```bash
  mvn -v
  ```

### 4. PostgreSQL 14 o superior (Base de Datos)
- Descarga: https://www.postgresql.org/download/
- **Nombre de la base de datos requerida:** `lavanderia_guayaquil`
- **Schema requerido:** `gestion_procesos`

### 5. IDE Recomendado
- **Backend:** [Apache NetBeans 25](https://netbeans.apache.org/) o IntelliJ IDEA
- **Frontend:** [VS Code](https://code.visualstudio.com/) con extensión ES7+ React/Redux/React-Native

---

## 🗄️ Configuración de la Base de Datos

### Paso 1: Crear la base de datos y el schema

Conéctate a PostgreSQL (con `psql` o pgAdmin) y ejecuta:

```sql
-- 1. Crear la base de datos
CREATE DATABASE lavanderia_guayaquil;

-- 2. Conectarse a ella
\c lavanderia_guayaquil

-- 3. Crear el schema
CREATE SCHEMA gestion_procesos;
```

### Paso 2: Crear las tablas del sistema

```sql
SET search_path TO gestion_procesos;

-- Tabla de roles
CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(20)
);

-- Tabla de estados de proceso (IMPORTANTE: necesita datos semilla)
CREATE TABLE estado_proceso (
    id_estado SERIAL PRIMARY KEY,
    nombre_estado VARCHAR(50),
    descripcion TEXT
);

-- Datos semilla OBLIGATORIOS para estado_proceso
INSERT INTO estado_proceso (nombre_estado, descripcion) VALUES
    ('Recibido', 'El pedido ha sido ingresado al sistema'),
    ('En Proceso', 'El pedido está siendo lavado o procesado'),
    ('Listo para Retiro', 'El pedido está listo para que el cliente lo retire'),
    ('Entregado', 'El pedido fue entregado al cliente');

-- Tabla de usuarios
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(100),
    email VARCHAR(100),
    password_hash VARCHAR(255),
    id_rol INTEGER REFERENCES roles(id_rol),
    estado BOOLEAN DEFAULT TRUE
);

-- Tabla de clientes
CREATE TABLE clientes (
    id_cliente BIGSERIAL PRIMARY KEY,
    cedula_ruc VARCHAR(13) UNIQUE,
    nombre VARCHAR(100),
    telefono VARCHAR(15),
    email VARCHAR(100)
);

-- Tabla de inventario
CREATE TABLE inventario (
    id_producto SERIAL PRIMARY KEY,
    nombre_producto VARCHAR(100),
    cantidad_actual NUMERIC(10,2),
    punto_reorden NUMERIC(10,2)
);

-- Tabla de servicios de lavado
CREATE TABLE servicios_lavado (
    id_servicio BIGSERIAL PRIMARY KEY,
    nombre_servicio VARCHAR(50),
    precio_unidad NUMERIC(38,2)
);

-- Tabla de pedidos
CREATE TABLE pedidos (
    id_pedido BIGSERIAL PRIMARY KEY,
    uuid_ticket UUID,
    id_cliente BIGINT REFERENCES clientes(id_cliente),
    fecha_recepcion TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    fecha_entrega_limite TIMESTAMP WITHOUT TIME ZONE,
    uuid_seguimiento UUID,
    id_usuario BIGINT,
    observaciones TEXT,
    id_estado INTEGER REFERENCES estado_proceso(id_estado)
);

-- Tabla de detalle de pedidos
CREATE TABLE detalle_pedidos (
    id_detalle BIGSERIAL PRIMARY KEY,
    id_pedido BIGINT REFERENCES pedidos(id_pedido),
    id_servicio BIGINT REFERENCES servicios_lavado(id_servicio),
    cantidad NUMERIC(38,2),
    subtotal_servicio NUMERIC(38,2)
);

-- Tabla de movimientos de inventario
CREATE TABLE movimientos_inventario (
    id_movimiento SERIAL PRIMARY KEY,
    id_producto INTEGER REFERENCES inventario(id_producto),
    id_usuario INTEGER,
    tipo_movimiento VARCHAR(10),
    cantidad NUMERIC(10,2),
    fecha_movimiento TIMESTAMP WITHOUT TIME ZONE
);

-- Tabla de facturas
CREATE TABLE facturas (
    id_factura SERIAL PRIMARY KEY,
    id_pedido INTEGER,
    fecha_emision TIMESTAMP WITHOUT TIME ZONE,
    valor_permanencia_extra NUMERIC(10,2),
    total_pagado NUMERIC(10,2),
    valor_recargo_permanencia NUMERIC(10,2),
    subtotal_sin_impuestos NUMERIC(10,2),
    total_iva NUMERIC(10,2)
);
```

### Paso 3: Configurar las credenciales en el Backend

Edita el archivo `api-service/src/main/resources/application.properties` con tus credenciales locales:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/lavanderia_guayaquil?currentSchema=gestion_procesos
spring.datasource.username=TU_USUARIO_POSTGRES
spring.datasource.password=TU_CONTRASEÑA_POSTGRES
```

> ⚠️ **IMPORTANTE:** No subas tus credenciales al repositorio. El archivo `application.properties` está en `.gitignore` por seguridad.

---

## 🚀 Ejecución del Backend

### Opción A: Con NetBeans (Recomendado para el equipo)

1. Abre NetBeans 25.
2. Ve a `File → Open Project` y selecciona la carpeta `api-service/`.
3. NetBeans detectará automáticamente que es un proyecto Maven.
4. Haz clic en el botón **Run** (▶) o presiona `F6`.
5. Espera a ver en la consola:
   ```
   Tomcat started on port 8080 (http)
   Started SmartManagerApplication in X seconds
   ```

### Opción B: Con terminal (Maven)

```bash
cd api-service
mvn clean install -DskipTests
mvn spring-boot:run
```

---

## 💻 Ejecución del Frontend

```bash
# 1. Navegar a la carpeta del cliente
cd web-client

# 2. Instalar dependencias (solo la primera vez)
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

El servidor quedará disponible en:
- **Local:** http://localhost:5173/
- **En red (para móviles/compañeros):** http://TU_IP_LOCAL:5173/

> 💡 Vite con `--host` expone el servidor en tu red local. Puedes encontrar tu IP con `ipconfig` (Windows) o `ifconfig` (Linux/Mac).

---

## ⚠️ Restricciones Conocidas y Soluciones

### 🔴 Restricción 1: La base de datos es local (no compartida)
**Problema:** Cada compañero debe tener su propia instancia de PostgreSQL en su máquina. No existe aún una BD en la nube compartida.

**Solución:**
1. Instalar PostgreSQL localmente siguiendo la sección [Configuración de la Base de Datos](#configuración-de-la-base-de-datos).
2. Ejecutar los scripts SQL provistos en este README.
3. Cambiar las credenciales en `application.properties`.

---

### 🔴 Restricción 2: Credenciales hardcodeadas en `application.properties`
**Problema:** El archivo `application.properties` contiene la contraseña de la BD y está actualmente trackeado por Git (problema de seguridad).

**Solución inmediata para el equipo:**
1. Agregar `application.properties` al `.gitignore`.
2. Cada desarrollador crea su propio archivo local con sus credenciales.
3. Se provee un archivo de ejemplo `application.properties.example` con las variables sin valores sensibles.

---

### 🟡 Restricción 3: CORS configurado para IPs específicas
**Problema:** El backend en `WebConfig.java` solo acepta peticiones de `http://localhost:5173` y `http://192.168.100.23:5173`. Si un compañero tiene una IP diferente, el browser bloqueará las peticiones.

**Solución:** Editar `api-service/src/main/java/com/smartmanager/config/WebConfig.java` y añadir tu IP:

```java
.allowedOrigins(
    "http://localhost:5173",
    "http://192.168.100.23:5173",
    "http://TU_IP_LOCAL:5173"   // <-- agregar aquí tu IP
)
```

Puedes encontrar tu IP con:
```bash
# Windows
ipconfig

# Linux / Mac
ifconfig | grep "inet "
```

---

### 🟡 Restricción 4: El estado inicial de pedidos en BD
**Problema:** Si se importan pedidos de una BD antigua (antes de la normalización), estos no tendrán `id_estado`. El sistema los trata como "Recibidos" automáticamente, pero si se quiere que sean consistentes:

**Solución SQL:**
```sql
UPDATE gestion_procesos.pedidos
SET id_estado = 1
WHERE id_estado IS NULL;
```

---

### 🟢 Restricción 5: Puerto 5173 ya en uso
**Problema:** Si ya tienes otro proceso corriendo en el puerto 5173, Vite levantará en el siguiente disponible (5174, 5175...).

**Solución:**
```bash
# Ver qué proceso usa el puerto en Windows
netstat -ano | findstr ":5173"
# Terminar el proceso (reemplaza PID por el número encontrado)
taskkill /PID <PID> /F
```

---

## 📡 Endpoints de la API

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/recepcion/pedido` | Registrar nuevo pedido con detalles |
| `GET` | `/api/pedidos/tablero` | Obtener todos los pedidos activos para Kanban |
| `PATCH` | `/api/pedidos/{id}/estado` | Actualizar el estado de un pedido |
| `GET` | `/api/public/seguimiento/{criterio}` | Consulta pública por UUID o cédula |

---

## 👥 Equipo de Desarrollo — Grupo #4

| Rol | Responsabilidad |
|---|---|
| Desarrollador Full-Stack | Backend Spring Boot + Frontend React |
| Base de Datos | Diseño y mantenimiento del schema PostgreSQL |

---

*Sistema desarrollado como proyecto académico — Guayaquil, 2026.*
