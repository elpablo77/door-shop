package com.doorshop.auth.service;

import com.doorshop.auth.domain.Role;
import com.doorshop.auth.domain.User;
import com.doorshop.auth.repo.UserRepository;
import com.doorshop.auth.web.ApiException;
import com.doorshop.auth.web.dto.AuthResponse;
import com.doorshop.auth.web.dto.UserDto;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final SecretKey jwtKey;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       @Value("${JWT_SECRET:dev_secret_change_me_dev_secret_change_me_dev_secret}") String secret) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;

        // JJWT validates the secret length for HS256.
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalArgumentException("JWT_SECRET должен быть минимум 32 байта (32 символа ASCII и больше)");
        }
        this.jwtKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public AuthResponse register(String email, String rawPassword) {
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "email_already_exists");
        }
        String hash = passwordEncoder.encode(rawPassword);
        User user = new User(email.toLowerCase(), hash, Role.USER);
        userRepository.save(user);
        return issue(user);
    }

    public AuthResponse login(String email, String rawPassword) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "bad_credentials"));
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "bad_credentials");
        }
        return issue(user);
    }

    private AuthResponse issue(User user) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(60L * 60L * 24L); // 24 hours

        String token = Jwts.builder()
                .setSubject(user.getEmail())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(exp))
                .claim("uid", user.getId())
                .claim("role", user.getRole().name())
                .signWith(jwtKey, SignatureAlgorithm.HS256)
                .compact();

        UserDto dto = new UserDto(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, dto);
    }
}
