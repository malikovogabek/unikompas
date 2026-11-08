# syntax=docker/dockerfile:1
# ---------- build ----------
FROM eclipse-temurin:21-jdk AS build
WORKDIR /src
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -q -B dependency:go-offline
COPY src src
# Tests need PostgreSQL and run in the regular build (./mvnw verify), not in the image build.
RUN ./mvnw -q -B -DskipTests package && cp target/unikompas-backend-*.jar /app.jar

# ---------- run ----------
FROM eclipse-temurin:21-jre
RUN useradd --system --uid 10001 app
USER app
COPY --from=build /app.jar /app/app.jar
# Tuned for small free instances (512 MB, ~0.1 vCPU): bounded heap, serial GC, faster JIT start.
ENV JAVA_OPTS="-XX:MaxRAMPercentage=70 -XX:+UseSerialGC -XX:TieredStopAtLevel=1 -Xss512k" \
    SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
