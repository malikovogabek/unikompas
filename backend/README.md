# UniKompas — backend

Spring Boot 4.1 REST API (Java 21, PostgreSQL 17, Flyway).

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local   # http://localhost:8080/swagger-ui.html
./mvnw verify                                              # tests + JaCoCo coverage gate
./mvnw test -Pperf                                         # wall-clock performance tests
```

Production: Docker image (`Dockerfile`) on Render, profile `prod` (`application-prod.yml`).
Rules and structure: [`../CLAUDE.md`](../CLAUDE.md) · deploy: [`../docs/DEPLOY.md`](../docs/DEPLOY.md)
