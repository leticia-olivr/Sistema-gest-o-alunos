package com.leticia.gestaoalunos.security;

import com.leticia.gestaoalunos.entity.Usuario;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private static final String SECRET_KEY =
            "minha-chave-secreta-para-jwt-do-sistema-gestao-alunos";

    private SecretKey getSignInKey() {
        return Keys.hmacShaKeyFor(
                SECRET_KEY.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(Usuario usuario) {

        return Jwts.builder()
                .subject(usuario.getEmail())
                .claim("role", usuario.getRole())
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis() + 1000 * 60 * 60
                        )
                )
                .signWith(getSignInKey())
                .compact();
    }

    public String extractUsername(String token) {

        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
    private Date extractExpiration(String token) {

        return Jwts.parser()
                .verifyWith(getSignInKey())
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

        String email = extractUsername(token);

        return email.equals(usuario.getEmail())
                && !isTokenExpired(token);
    }
}