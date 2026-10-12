package com.plm;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;

@SpringBootApplication
public class SustainablePlmApplication {

    public static void main(String[] args) {
        // Automatically load .env file from workspace root or current directory if present
        loadEnvIfPresent();

        SpringApplication.run(SustainablePlmApplication.class, args);
    }

    private static void loadEnvIfPresent() {
        try {
            // Check current directory, then parent directory for .env
            File rootEnv = new File(".env");
            File parentEnv = new File("../.env");

            Dotenv dotenv = null;
            if (rootEnv.exists()) {
                dotenv = Dotenv.configure().directory(".").ignoreIfMissing().load();
            } else if (parentEnv.exists()) {
                dotenv = Dotenv.configure().directory("..").ignoreIfMissing().load();
            }

            if (dotenv != null) {
                dotenv.entries().forEach(entry -> {
                    if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                        System.setProperty(entry.getKey(), entry.getValue());
                    }
                });
            }
        } catch (Exception e) {
            System.out.println("Notice: No .env file loaded from disk. Falling back to system environment variables.");
        }
    }
}
