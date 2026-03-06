# BrgyGO REST API

Spring Boot-based REST API for the BrgyGO application.

## Project Information

- **Framework:** Spring Boot 3.5.0
- **Build Tool:** Maven
- **Java Version:** 17
- **Architecture:** REST API

## Maven Configuration

- **Group ID:** edu.cit.ortizano
- **Artifact ID:** BrgyGO
- **Base Package:** edu.cit.ortizano.BrgyGO

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── edu/cit/ortizano/BrgyGO/
│   │   │       ├── controller/    # REST Controllers
│   │   │       ├── service/       # Business Logic
│   │   │       ├── model/         # Entity Models
│   │   │       ├── repository/    # Data Access Layer
│   │   │       └── BrgyGoApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── application-prod.properties
│   └── test/
│       └── java/
│           └── edu/cit/ortizano/BrgyGO/
└── pom.xml
```

## Getting Started

### Prerequisites

- JDK 17 or higher
- Maven 3.6.0 or higher

### Installation

1. Clone or navigate to the backend directory
2. Build the project:
   ```bash
   mvn clean install
   ```

### Running the Application

Development mode:
```bash
mvn spring-boot:run
```

Or with Maven:
```bash
mvn clean package
java -jar target/BrgyGO-1.0.0.jar
```

Production mode:
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=prod"
```

## API Endpoints

### Health Check
- **Endpoint:** `GET /brgygo/api/health`
- **Description:** Check if the API is running
- **Response:** 
  ```json
  {
    "status": "OK",
    "message": "BrgyGO API is running"
  }
  ```

### Version
- **Endpoint:** `GET /brgygo/api/version`
- **Description:** Get API version information
- **Response:**
  ```json
  {
    "version": "1.0.0",
    "name": "BrgyGO API"
  }
  ```

### User Registration
- **Endpoint:** `POST /brgygo/api/auth/register`
- **Description:** Register a new user
- **Request Body:**
  ```json
  {
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "contactNumber": "+1234567890",
    "completeAddress": "123 Main St, City, Country",
    "agreeTerms": true
  }
  ```
- **Response:**
  ```json
  {
    "id": 1,
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "role": "RESIDENT"
  }
  ```

### User Login
- **Endpoint:** `POST /brgygo/api/auth/login`
- **Description:** Authenticate user
- **Request Body:**
  ```json
  {
    "email": "john.doe@example.com",
    "password": "password123",
    "rememberMe": false
  }
  ```
- **Response:**
  ```json
  {
    "token": "dummy-token",
    "type": "Bearer",
    "id": 1,
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "role": "RESIDENT"
  }
  ```

## Database Configuration

### Development
- **Database:** H2 (In-memory)
- **Console:** http://localhost:8080/brgygo/h2-console
- **URL:** jdbc:h2:mem:brgygo

### Production
- **Database:** MySQL
- **Configuration:** Update `application-prod.properties` with your database credentials

## Dependencies

- Spring Boot Web Starter
- Spring Boot Security Starter
- Spring Boot Data JPA
- MySQL Connector
- H2 Database
- Lombok
- Validation
- Spring Boot DevTools
- Spring Boot Test

## Development

### Adding a New Controller

Create a new controller in `src/main/java/edu/cit/ortizano/BrgyGO/controller/`:

```java
@RestController
@RequestMapping("/api/resource")
public class ResourceController {

    @GetMapping
    public ResponseEntity<List<Resource>> getAll() {
        // Implementation
    }
}
```

### Adding a New Entity

Create a new model in `src/main/java/edu/cit/ortizano/BrgyGO/model/`:

```java
@Entity
@Table(name = "resource")
@Getter
@Setter
public class Resource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
}
```

## Build and Deployment

### Build JAR
```bash
mvn clean package
```

### Docker (Optional)
Create a `Dockerfile`:
```dockerfile
FROM eclipse-temurin:17-jre
COPY target/BrgyGO-1.0.0.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

## License

This project is part of BrgyGO application.

## Contact

For questions or support, please contact the development team.