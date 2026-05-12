# Sistema de Gestión de Procesos para una Lavandería en Guayaquil

## Descripción
Este proyecto consiste en un sistema moderno de gestión de procesos diseñado específicamente para una lavandería ubicada en la ciudad de Guayaquil. El sistema busca modernizar la atención al cliente mediante la implementación de tickets electrónicos, portales de seguimiento del estado de las prendas y una política de permanencia automatizada para el cobro de recargos.

## Problemática
Actualmente, la gestión en lavanderías enfrenta problemas de ineficiencia debido al uso de tickets físicos. Esto provoca la pérdida de información, dificultades para que los clientes hagan seguimiento a sus pedidos y una grave falta de control sobre el stock de prendas almacenadas, generando demoras y una gestión inadecuada de los espacios físicos.

## Objetivos

### Objetivo General
Desarrollar e implementar un sistema integral de gestión de procesos para optimizar la atención, facturación y control de inventario en una lavandería en Guayaquil, mejorando la experiencia del cliente y la eficiencia operativa.

### Objetivos Específicos
1. **Recepción:** Agilizar el proceso de recepción de prendas mediante el registro digital y la emisión de tickets electrónicos.
2. **Facturación:** Automatizar el proceso de cobro, incluyendo el cálculo de servicios y la aplicación de políticas de recargo por permanencia prolongada.
3. **Inventario:** Establecer un control riguroso del stock de prendas y los insumos de lavado.
4. **Reportes:** Generar reportes estadísticos y financieros que faciliten la toma de decisiones administrativas.
5. **Usuarios:** Implementar un sistema de gestión de usuarios con roles y permisos específicos para garantizar la seguridad de la información.

## Alcance
El sistema está compuesto por diferentes módulos enfocados en cubrir el flujo de trabajo de la lavandería:
- **Módulo de Recepción y Entrega:** Manejo de tickets electrónicos y estado de prendas.
- **Módulo de Facturación:** Procesamiento de pagos y recargos automáticos.
- **Módulo de Inventario:** Control de prendas almacenadas e insumos.
- **Módulo de Reportes:** Visualización de métricas y estadísticas del negocio.

**Roles del Sistema:**
- **Administrador:** Acceso total al sistema, configuración general, reportes financieros y gestión de usuarios.
- **Operador/Cajero:** Acceso a módulos de recepción, entrega, cobro y consulta de estados de prendas.

## Guía de Ejecución

### Prerrequisitos
- [Node.js](https://nodejs.org/) y npm (para el entorno Frontend en React)
- [Java Development Kit (JDK) 17+](https://www.oracle.com/java/technologies/javase-downloads.html) (para el entorno Backend)
- Maven o Gradle (dependiendo del gestor de dependencias)
- [PostgreSQL](https://www.postgresql.org/) (Motor de Base de Datos)

### Paso 1: Clonar el repositorio
Para obtener una copia local del proyecto para el desarrollo, todos los integrantes del Grupo #4 deben ejecutar los siguientes comandos en su terminal:
```bash
git clone https://github.com/yairochoa709-ops/lavanderia-smart-manager.git
cd lavanderia-smart-manager
```

### Paso 2: Configuración del Frontend (React)
Navega a la carpeta del cliente web e instala las dependencias necesarias:
```bash
cd web-client
npm install
```
Para iniciar el servidor de desarrollo del Frontend:
```bash
npm start
# Nota: Si el proyecto fue inicializado con Vite, utiliza "npm run dev"
```

### Paso 3: Configuración del Backend (Java)
Navega a la carpeta del servicio API:
```bash
cd ../api-service
```
Antes de ejecutar el proyecto, asegúrate de configurar las credenciales de conexión a PostgreSQL en tu archivo de propiedades de Spring Boot (`application.properties` o `application.yml`).

Para compilar y ejecutar el servicio Backend:
```bash
# Ejemplo usando Maven:
mvn clean install
mvn spring-boot:run
```

---
*Documento elaborado como guía de arquitectura y configuración para el Grupo #4.*
