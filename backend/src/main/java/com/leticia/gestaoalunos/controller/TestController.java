package com.leticia.gestaoalunos.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/teste")
public class TestController {

    @GetMapping
    public String teste() {
        return "Usuário autenticado";
    }

}
