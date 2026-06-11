FROM eclipse-temurin:17-jdk

EXPOSE 8080

ADD target/orgacaregateway-0.0.1-SNAPSHOT.jar application.jar

ENTRYPOINT ["java", "-jar", "/application.jar"]
