package com.smartmanager.controller;

import com.smartmanager.model.Cliente;
import com.smartmanager.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteRepository clienteRepository;

    @GetMapping("/{cedula}")
    public ResponseEntity<Cliente> obtenerClientePorCedula(@PathVariable String cedula) {
        Optional<Cliente> clienteOpt = clienteRepository.findByCedulaRuc(cedula);
        
        if (clienteOpt.isPresent()) {
            return ResponseEntity.ok(clienteOpt.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
