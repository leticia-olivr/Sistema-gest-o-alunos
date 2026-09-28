package com.leticia.gestaoalunos.security;

import com.leticia.gestaoalunos.entity.Usuario;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey signInKey;

    public JwtService(@Value("${jwt.secret}") String secret) {
        this.signInKey = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(Usuario usuario) {

        return Jwts.builder()
                .subject(usuario.getUsuario())
                .claim("role", usuario.getRole())
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis() + 1000 * 60 * 60
                        )
                )
                .signWith(signInKey)
                .compact();
    }

    public String extractUsuario(String token) {

        return Jwts.parser()
                .verifyWith(signInKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

        public String extractRole(String token) {
                return Jwts.parser()
                                .verifyWith(signInKey)
                                .build()
                                .parseSignedClaims(token)
                                .getPayload()
                                .get("role", String.class);
        }

    private Date extractExpiration(String token) {

        return Jwts.parser()
                .verifyWith(signInKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration();
    }
    private boolean isTokenExpired(String token) {

        return extractExpiration(token)
                .before(new Date());
    }
    public boolean isTokenValid(
            String token,
            Usuario usuario
    ) {

        String usuarioLogin = extractUsuario(token);

        return usuarioLogin.equals(usuario.getUsuario())
                && !isTokenExpired(token);
    }
}