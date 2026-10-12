# Build Stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn -q dependency:go-offline

# Copy source code and package application
COPY src ./src
RUN mvn -q clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/sustainable-plm-backend-0.0.1-SNAPSHOT.jar app.jar

# JVM optimization flags for Render Free Tier (512 MB RAM limit)
ENV JAVA_OPTS="-XX:MaxRAMPercentage=70 -Xss512k"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
