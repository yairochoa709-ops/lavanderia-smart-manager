package com.smartmanager.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class FacturacionDTO {

    private Long idPedido;
    private String uuidTicket;
    private String nombreCliente;
    private String cedulaCliente;
    private LocalDateTime fechaEntregaLimite;
    private List<ServicioDetalleDTO> servicios;
    private BigDecimal subtotalServicios;

    @Data
    @Builder
    public static class ServicioDetalleDTO {
        private String nombre;
        private BigDecimal subtotal;
    }
}
