# SmartManager Backend API

Este es el módulo backend del ecosistema SmartManager, construido sobre **Java Spring Boot 3.2** e integrado con **PostgreSQL**.

## 🚀 Arquitectura y Conexión a Base de Datos

La arquitectura de persistencia de este proyecto sigue un enfoque **Database-First**. La estructura de datos reside en el esquema `gestion_procesos` dentro de la base de datos `lavanderia_guayaquil`.

### 1. Configuración de Acceso a Datos
Toda la configuración de conexión se encuentra en `src/main/resources/application.properties`. 

**Puntos Clave:**
*   **Enrutamiento de Esquema:** La conexión JDBC incluye `?currentSchema=gestion_procesos` para asegurar que todas las entidades apunten automáticamente al esquema correcto sin necesidad de especificarlo tabla por tabla.
*   **Protección de Estructura:** Se utiliza la directiva `spring.jpa.hibernate.ddl-auto=update`. Esta es una medida de seguridad crítica que le prohíbe a Hibernate ejecutar comandos destructivos (`DROP` / `CREATE`) sobre las tablas existentes en pgAdmin. Solo actualizará o añadirá nuevas columnas si el modelo Java cambia.

### 2. Ecosistema de Dependencias (`pom.xml`)
El servidor fue inicializado utilizando las siguientes tecnologías Core:
*   **Spring Data JPA:** Maneja el ORM mediante repositorios e interfaces.
*   **Spring Web:** Expone la capa REST (`@RestController`).
*   **PostgreSQL Driver (`org.postgresql`):** Habilita la comunicación a bajo nivel mediante el puerto 5432.
*   **Lombok:** Automatiza la inyección de dependencias (`@RequiredArgsConstructor`) y la encapsulación (`@Data`), reduciendo el código repetitivo en Entidades y DTOs.

### 3. Integración y Seguridad (CORS)
Para que el Frontend en **React (Vite)** pudiera interactuar de forma fluida con el Backend, se estableció una configuración global de acceso.

*   **Archivo:** `src/main/java/com/smartmanager/config/WebConfig.java`
*   **Propósito:** Habilitar CORS (Cross-Origin Resource Sharing) para permitir que el cliente HTTP (`fetch`/`axios`) operando en el puerto local `5173` pueda enviar *payloads* JSON al puerto `8080` sin ser bloqueado por las políticas de seguridad del navegador.

## 🛠️ Ejecución
Para iniciar el proyecto de forma local utilizando **Maven**:

```bash
# Compilar y descargar dependencias
mvn clean install

# Ejecutar el servidor
mvn spring-boot:run
```
*(También puede ser iniciado directamente desde entornos de desarrollo como NetBeans, IntelliJ IDEA o VS Code configurando la clase principal `SmartManagerApplication`).*
