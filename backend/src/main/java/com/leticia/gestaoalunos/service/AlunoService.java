package com.leticia.gestaoalunos.service;

import com.leticia.gestaoalunos.dto.request.AlunoCreateRequest;
import com.leticia.gestaoalunos.dto.request.AlunoUpdateRequest;
import com.leticia.gestaoalunos.dto.response.AlunoPageResponse;
import com.leticia.gestaoalunos.dto.response.AlunoResponse;
import com.leticia.gestaoalunos.entity.Aluno;
import com.leticia.gestaoalunos.exception.AlunoApiException;
import com.leticia.gestaoalunos.repository.AlunoRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Year;
import java.util.Locale;
import java.util.Set;

@Service
public class AlunoService {

    private static final long TAMANHO_MAXIMO_FOTO = 5L * 1024 * 1024;
    private static final Set<String> DDD_VALIDOS = Set.of(
            "11", "12", "13", "14", "15", "16", "17", "18", "19",
            "21", "22", "24", "27", "28", "31", "32", "33", "34", "35", "37", "38",
            "41", "42", "43", "44", "45", "46", "47", "48", "49", "51", "53", "54", "55",
            "61", "62", "63", "64", "65", "66", "67", "68", "69", "71", "73", "74", "75",
            "77", "79", "81", "82", "83", "84", "85", "86", "87", "88", "89", "91", "92",
            "93", "94", "95", "96", "97", "98", "99"
    );

    private final AlunoRepository alunoRepository;

    public AlunoService(AlunoRepository alunoRepository) {
        this.alunoRepository = alunoRepository;
    }

    @Transactional
    public AlunoResponse criar(AlunoCreateRequest request) {
        String email = normalizarEmail(request.getEmail());
        String cpf = validarCpf(request.getCpf());
        String telefone = validarTelefone(request.getTelefone());

        if (alunoRepository.existsByEmail(email)) {
            throw conflito("Já existe um aluno cadastrado com este e-mail.");
        }
        if (alunoRepository.existsByCpf(cpf)) {
            throw conflito("Já existe um aluno cadastrado com este CPF.");
        }

        Aluno aluno = new Aluno(
                gerarMatricula(),
                normalizarNome(request.getNome()),
                email,
                cpf,
                telefone
        );
        aplicarFoto(aluno, request.getFoto());
        return paraResponse(salvar(aluno));
    }

    // TODOS = sem filtro (null); ordena por nome com desempate por id para a paginação ser estável.
    @Transactional(readOnly = true)
    public AlunoPageResponse listar(String busca, String status, int page, int size) {
        if (page < 0 || size < 1 || size > 100) {
            throw new AlunoApiException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Página deve ser maior ou igual a zero e tamanho deve estar entre 1 e 100."
            );
        }

        Boolean ativo = switch (status.strip().toUpperCase(Locale.ROOT)) {
            case "TODOS" -> null;
            case "ATIVOS" -> true;
            case "INATIVOS" -> false;
            default -> throw new AlunoApiException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Status deve ser TODOS, ATIVOS ou INATIVOS."
            );
        };
        String buscaNormalizada = busca == null || busca.isBlank() ? null : busca.strip();
        var alunos = alunoRepository.buscar(
                buscaNormalizada,
                ativo,
                PageRequest.of(page, size, Sort.by(
                        Sort.Order.asc("nome").ignoreCase(),
                        Sort.Order.asc("id")
                ))
        );

        return new AlunoPageResponse(
                alunos.map(this::paraResponse).getContent(),
                alunos.getNumber(),
                alunos.getSize(),
                alunos.getTotalElements(),
                alunos.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public AlunoResponse buscarPorId(Long id) {
        return paraResponse(buscarEntidade(id));
    }

    @Transactional(readOnly = true)
    public FotoAluno buscarFoto(Long id) {
        Aluno aluno = buscarEntidade(id);
        if (aluno.getFoto() == null || aluno.getFotoMimeType() == null) {
            throw naoEncontrado();
        }
        return new FotoAluno(aluno.getFoto(), aluno.getFotoMimeType());
    }

    @Transactional
    public AlunoResponse atualizar(Long id, AlunoUpdateRequest request) {
        Aluno aluno = buscarEntidade(id);
        String email = normalizarEmail(request.getEmail());
        String telefone = validarTelefone(request.getTelefone());

        if (alunoRepository.existsByEmailAndIdNot(email, id)) {
            throw conflito("Já existe um aluno cadastrado com este e-mail.");
        }
        if (request.isRemoverFoto() && request.getFoto() != null && !request.getFoto().isEmpty()) {
            throw new AlunoApiException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Envie uma nova foto ou solicite a remoção, não ambos."
            );
        }

        aluno.setNome(normalizarNome(request.getNome()));
        aluno.setEmail(email);
        aluno.setTelefone(telefone);
        if (request.getAtivo() != null) {
            aluno.setAtivo(request.getAtivo());
        }
        if (request.isRemoverFoto()) {
            aluno.setFoto(null);
            aluno.setFotoMimeType(null);
        } else if (request.getFoto() != null && !request.getFoto().isEmpty()) {
            aplicarFoto(aluno, request.getFoto());
        }

        return paraResponse(salvar(aluno));
    }

    @Transactional
    public void inativar(Long id) {
        Aluno aluno = buscarEntidade(id);
        aluno.setAtivo(false);
        salvar(aluno);
    }

    @Transactional
    public void reativar(Long id) {
        Aluno aluno = buscarEntidade(id);
        aluno.setAtivo(true);
        salvar(aluno);
    }

    private Aluno buscarEntidade(Long id) {
        return alunoRepository.findById(id).orElseThrow(this::naoEncontrado);
    }

    private Aluno salvar(Aluno aluno) {
        try {
            return alunoRepository.saveAndFlush(aluno);
        } catch (DataIntegrityViolationException exception) {
            throw conflito("Já existe um aluno com matrícula, CPF ou e-mail informado.");
        }
    }

    private void aplicarFoto(Aluno aluno, MultipartFile foto) {
        if (foto == null || foto.isEmpty()) {
            return;
        }
        if (foto.getSize() > TAMANHO_MAXIMO_FOTO) {
            throw new AlunoApiException(HttpStatus.UNPROCESSABLE_ENTITY, "A foto deve ter no máximo 5 MB.");
        }

        try {
            byte[] bytes = foto.getBytes();
            String contentType = foto.getContentType();
            boolean png = bytes.length >= 8
                    && (bytes[0] & 0xff) == 0x89
                    && bytes[1] == 0x50
                    && bytes[2] == 0x4e
                    && bytes[3] == 0x47
                    && bytes[4] == 0x0d
                    && bytes[5] == 0x0a
                    && bytes[6] == 0x1a
                    && bytes[7] == 0x0a;
            boolean jpeg = bytes.length >= 3
                    && (bytes[0] & 0xff) == 0xff
                    && (bytes[1] & 0xff) == 0xd8
                    && (bytes[2] & 0xff) == 0xff;

            if ((png && "image/png".equalsIgnoreCase(contentType))
                    || (jpeg && "image/jpeg".equalsIgnoreCase(contentType))) {
                aluno.setFoto(bytes);
                aluno.setFotoMimeType(contentType.toLowerCase(Locale.ROOT));
                return;
            }
            throw new AlunoApiException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "A foto deve ser uma imagem JPEG ou PNG válida."
            );
        } catch (IOException exception) {
            throw new AlunoApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Não foi possível ler a foto enviada.");
        }
    }

    private String validarCpf(String cpfInformado) {
        if (!cpfInformado.matches("[0-9.\\-\\s]+")) {
            throw new AlunoApiException(HttpStatus.UNPROCESSABLE_ENTITY, "CPF inválido.");
        }
        String cpf = cpfInformado.replaceAll("\\D", "");
        if (cpf.length() != 11 || cpf.chars().distinct().count() == 1) {
            throw new AlunoApiException(HttpStatus.UNPROCESSABLE_ENTITY, "CPF inválido.");
        }

        int primeiroDigito = calcularDigitoCpf(cpf.substring(0, 9), 10);
        int segundoDigito = calcularDigitoCpf(cpf.substring(0, 9) + primeiroDigito, 11);
        if (cpf.charAt(9) - '0' != primeiroDigito || cpf.charAt(10) - '0' != segundoDigito) {
            throw new AlunoApiException(HttpStatus.UNPROCESSABLE_ENTITY, "CPF inválido.");
        }
        return cpf;
    }

    private int calcularDigitoCpf(String base, int pesoInicial) {
        int soma = 0;
        for (int index = 0; index < base.length(); index++) {
            soma += (base.charAt(index) - '0') * (pesoInicial - index);
        }
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }

    private String validarTelefone(String telefoneInformado) {
        if (!telefoneInformado.matches("[0-9()\\-\\s]+")) {
            throw new AlunoApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Telefone inválido.");
        }
        String telefone = telefoneInformado.replaceAll("\\D", "");
        if ((telefone.length() != 10 && telefone.length() != 11)
                || !DDD_VALIDOS.contains(telefone.substring(0, 2))) {
            throw new AlunoApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Telefone inválido.");
        }
        boolean celular = telefone.length() == 11 && telefone.charAt(2) == '9';
        boolean fixo = telefone.length() == 10 && telefone.charAt(2) >= '2' && telefone.charAt(2) <= '5';
        if (!celular && !fixo) {
            throw new AlunoApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Telefone inválido.");
        }
        return telefone;
    }

    private String normalizarEmail(String email) {
        return email.strip().toLowerCase(Locale.ROOT);
    }

    private String normalizarNome(String nome) {
        return nome.strip().replaceAll("\\s+", " ");
    }

    private String gerarMatricula() {
        int ano = Year.now().getValue();
        for (int sequencial = 1; sequencial <= 9999; sequencial++) {
            String matricula = String.format(Locale.ROOT, "%04d%04d", ano, sequencial);
            if (!alunoRepository.existsByMatricula(matricula)) {
                return matricula;
            }
        }
        throw conflito("Não há matrículas disponíveis para o ano atual.");
    }

    private AlunoApiException conflito(String mensagem) {
        return new AlunoApiException(HttpStatus.CONFLICT, mensagem);
    }

    private AlunoApiException naoEncontrado() {
        return new AlunoApiException(HttpStatus.NOT_FOUND, "Aluno não encontrado.");
    }

    private AlunoResponse paraResponse(Aluno aluno) {
        return paraResponse(
            aluno.getId(),
            aluno.getMatricula(),
            aluno.getNome(),
            aluno.getEmail(),
            aluno.getCpf(),
            aluno.getTelefone(),
            aluno.getAtivo(),
            aluno.getDataCriacao(),
            aluno.getFotoMimeType()
        );
        }

        private AlunoResponse paraResponse(AlunoRepository.AlunoResumo aluno) {
        return paraResponse(
            aluno.getId(),
            aluno.getMatricula(),
            aluno.getNome(),
            aluno.getEmail(),
            aluno.getCpf(),
            aluno.getTelefone(),
            aluno.getAtivo(),
            aluno.getDataCriacao(),
            aluno.getFotoMimeType()
        );
        }

        private AlunoResponse paraResponse(
            Long id,
            String matricula,
            String nome,
            String email,
            String cpf,
            String telefone,
            Boolean ativo,
            java.time.LocalDateTime dataCriacao,
            String fotoMimeType
        ) {
        // A foto não vai na resposta, apenas a URL para buscá-la.
        String fotoUrl = fotoMimeType == null ? null : "/api/alunos/" + id + "/foto";
        return new AlunoResponse(
            id,
            matricula,
            nome,
            email,
            cpf,
            telefone,
            ativo,
            dataCriacao,
                fotoUrl
        );
    }

    public record FotoAluno(byte[] conteudo, String mimeType) {
    }
}