package com.smartmanager.controller;

import com.smartmanager.dto.RecepcionPedidoDTO;
import com.smartmanager.service.RecepcionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class RecepcionController {

    private final RecepcionService recepcionService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> registrarPedido(@RequestBody RecepcionPedidoDTO dto) {
        try {
            UUID ticketUuid = recepcionService.registrarPedido(dto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("exito", true);
            response.put("mensaje", "Pedido registrado correctamente");
            response.put("uuidTicket", ticketUuid.toString());
            
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("exito", false);
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("exito", false);
            errorResponse.put("error", "Error interno del servidor al registrar el pedido.");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
