package com.doorshop.auth.web;

import com.doorshop.auth.service.AuthService;
import com.doorshop.auth.web.dto.AuthResponse;
import com.doorshop.auth.web.dto.LoginRequest;
import com.doorshop.auth.web.dto.RegisterRequest;
import com.doorshop.auth.web.dto.UserDto;
import jakarta.validation.Valid;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req.getEmail(), req.getPassword());
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req.getEmail(), req.getPassword());
    }

    @GetMapping("/me")
    public UserDto me(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return null;
        Long uid = jwt.getClaim("uid");
        String role = jwt.getClaim("role");
        return new UserDto(uid, jwt.getSubject(), role);
    }
}
