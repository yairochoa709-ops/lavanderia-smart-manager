package com.smartmanager.controller;

import com.smartmanager.dto.TableroPedidoDTO;
import com.smartmanager.service.OperacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class OperacionController {

    private final OperacionService operacionService;

    @GetMapping("/tablero")
    public ResponseEntity<List<TableroPedidoDTO>> obtenerTablero() {
        return ResponseEntity.ok(operacionService.obtenerTablero());
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Void> actualizarEstado(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Integer nuevoEstadoId = body.get("idEstado");
        if (nuevoEstadoId == null) {
            return ResponseEntity.badRequest().build();
        }
        operacionService.actualizarEstadoPedido(id, nuevoEstadoId);
        return ResponseEntity.ok().build();
    }
}
