package com.smartmanager.controller;

import com.smartmanager.dto.FacturacionDTO;
import com.smartmanager.dto.FacturaResponseDTO;
import com.smartmanager.service.FacturacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class FacturacionController {

    private final FacturacionService facturacionService;

    /**
     * GET /api/facturacion/pedidos-listos
     * Devuelve todos los pedidos en estado "Listo para Retiro" (id_estado = 3).
     */
    @GetMapping("/api/facturacion/pedidos-listos")
    public ResponseEntity<List<FacturacionDTO>> getPedidosListos() {
        return ResponseEntity.ok(facturacionService.obtenerPedidosListos());
    }

    /**
     * POST /api/facturas/procesar/{idPedido}
     * Procesa el cobro: guarda la factura y marca el pedido como Entregado.
     */
    @PostMapping("/api/facturas/procesar/{idPedido}")
    public ResponseEntity<?> procesarPago(@PathVariable Long idPedido) {
        try {
            FacturaResponseDTO response = facturacionService.procesarPago(idPedido);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error interno al procesar el pago: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
