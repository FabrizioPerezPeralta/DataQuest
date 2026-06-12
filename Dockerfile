# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend-build
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Spring Boot backend
FROM maven:3.9-eclipse-temurin-21 AS backend-builder
WORKDIR /backend-build
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

# Stage 3: Runner
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
# Copy jar from backend-builder
COPY --from=backend-builder /backend-build/target/*.jar app.jar
# Copy the compiled static assets from frontend-builder into /app/frontend
COPY --from=frontend-builder /frontend-build/dist ./frontend

EXPOSE 8080
USER appuser
ENTRYPOINT ["java", "-jar", "app.jar"]
