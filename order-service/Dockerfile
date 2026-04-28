# syntax=docker/dockerfile:1
FROM gradle:8.7-jdk17 AS build
WORKDIR /app
COPY . .
# Allow both modern TLS versions instead of pinning only TLSv1.2, which can break Maven Central handshakes in Docker Desktop.
ENV GRADLE_OPTS="-Dhttps.protocols=TLSv1.2,TLSv1.3 -Djdk.tls.client.protocols=TLSv1.2,TLSv1.3"
RUN chmod +x ./gradlew && ./gradlew --no-daemon clean bootJar -x test

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java","-jar","/app/app.jar"]
