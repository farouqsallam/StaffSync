# Stage 1: Build the Grails JAR using Java 21
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Optimize layer caching: copy wrapper and configs first
COPY gradlew gradlew.bat ./
COPY gradle gradle/
COPY build.gradle gradle.properties ./

# Normalize line endings in gradlew and ensure executable
RUN sed -i -e 's/\r$//' ./gradlew && chmod +x ./gradlew
RUN ./gradlew dependencies --no-daemon || true

# Copy source code and build the executable jar
COPY . .
RUN sed -i -e 's/\r$//' ./gradlew && chmod +x ./gradlew
RUN ./gradlew bootJar --no-daemon -x test

# Stage 2: Run the Application on Java 21 JRE
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
# Copy the compiled jar from the build stage
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]