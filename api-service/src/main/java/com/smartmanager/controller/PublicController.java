package com.smartmanager.controller;

import com.smartmanager.dto.SeguimientoDTO;
import com.smartmanager.service.SeguimientoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final SeguimientoService seguimientoService;

    @GetMapping("/seguimiento/{criterio}")
    public ResponseEntity<?> consultarSeguimiento(@PathVariable String criterio) {
        try {
            SeguimientoDTO dto = seguimientoService.consultarSeguimiento(criterio);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error interno del servidor al procesar el seguimiento.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/server-ip")
    public ResponseEntity<?> obtenerIpServidor() {
        Map<String, String> response = new HashMap<>();
        try {
            String ip = java.net.InetAddress.getLocalHost().getHostAddress();
            response.put("ip", ip);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("ip", "localhost");
            return ResponseEntity.ok(response);
        }
    }
}
