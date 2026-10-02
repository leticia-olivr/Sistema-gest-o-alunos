package com.leticia.gestaoalunos.config;

import com.leticia.gestaoalunos.entity.Aluno;
import com.leticia.gestaoalunos.repository.AlunoRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Component
@Profile("dev")
public class AlunoDevDataInitializer implements ApplicationRunner {

    private static final List<String> NOMES = List.of(
            "Ana Souza", "Bruno Lima", "Carla Mendes", "Daniel Oliveira", "Eduarda Costa",
            "Felipe Martins", "Gabriela Rocha", "Heitor Alves", "Isabela Ferreira", "João Ribeiro",
            "Karen Carvalho", "Lucas Gomes", "Mariana Barros", "Nicolas Castro", "Olivia Nunes",
            "Pedro Azevedo", "Rafaela Dias", "Samuel Teixeira", "Talita Moreira", "Ubirajara Freitas",
            "Valentina Cardoso", "Wesley Correia", "Yasmin Monteiro", "Zeca Duarte", "Beatriz Campos"
    );

    private final AlunoRepository alunoRepository;

    public AlunoDevDataInitializer(AlunoRepository alunoRepository) {
        this.alunoRepository = alunoRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        int ano = Year.now().getValue();
        List<Aluno> alunosFaltantes = new ArrayList<>();

        for (int index = 0; index < NOMES.size(); index++) {
            int numero = index + 1;
            String matricula = String.format(Locale.ROOT, "%04d%04d", ano, numero);
            if (!alunoRepository.existsByMatricula(matricula)) {
                String nome = NOMES.get(index);
                alunosFaltantes.add(new Aluno(
                        matricula,
                        nome,
                        "aluno" + String.format("%02d", numero) + "@example.com",
                        gerarCpf(100_000_000 + index),
                        "11" + "9" + String.format("%08d", numero)
                ));
            }
        }

        alunoRepository.saveAll(alunosFaltantes);
    }

    private String gerarCpf(int baseNumerica) {
        String base = String.format(Locale.ROOT, "%09d", baseNumerica);
        int primeiroDigito = calcularDigito(base, 10);
        int segundoDigito = calcularDigito(base + primeiroDigito, 11);
        return base + primeiroDigito + segundoDigito;
    }

    private int calcularDigito(String base, int pesoInicial) {
        int soma = 0;
        for (int index = 0; index < base.length(); index++) {
            soma += (base.charAt(index) - '0') * (pesoInicial - index);
        }
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }
}