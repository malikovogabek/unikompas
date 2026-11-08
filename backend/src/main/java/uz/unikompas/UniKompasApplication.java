package uz.unikompas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * Entry point of the UniKompas REST API.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class UniKompasApplication {

    public static void main(String[] args) {
        SpringApplication.run(UniKompasApplication.class, args);
    }
}
