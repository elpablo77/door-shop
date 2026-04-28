package com.doorshop.auth.config;

import com.doorshop.auth.domain.Role;
import com.doorshop.auth.domain.User;
import com.doorshop.auth.repo.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner seedUsers(UserRepository repo, PasswordEncoder encoder) {
        return args -> {
            // Accounts for local checks and smoke tests.
            if (!repo.existsByEmailIgnoreCase("admin@test.com")) {
                repo.save(new User("admin@test.com", encoder.encode("password"), Role.ADMIN));
            }
            if (!repo.existsByEmailIgnoreCase("user1@test.com")) {
                repo.save(new User("user1@test.com", encoder.encode("password123"), Role.USER));
            }
        };
    }
}
