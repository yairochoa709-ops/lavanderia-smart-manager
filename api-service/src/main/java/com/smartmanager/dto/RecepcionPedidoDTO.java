package com.smartmanager.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class RecepcionPedidoDTO {
    private ClienteDTO cliente;
    private PedidoDatosDTO pedido;
    private List<DetalleServicioDTO> detalles;
    
    @Data
    public static class PedidoDatosDTO {
        @JsonProperty("fecha_entrega_limite")
        private LocalDateTime fechaEntregaLimite;
        private String observaciones;
        @JsonProperty("id_usuario")
        private Long idUsuario;
    }
}
