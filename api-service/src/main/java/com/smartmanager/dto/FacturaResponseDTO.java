package com.smartmanager.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class FacturaResponseDTO {
    private Integer idFactura;
    private Long idPedido;
    private String nombreCliente;
    private LocalDateTime fechaEmision;
    private BigDecimal subtotalSinImpuestos;
    private BigDecimal valorRecargoPermanencia;
    private BigDecimal totalIva;
    private BigDecimal totalPagado;
    private String mensaje;
}
