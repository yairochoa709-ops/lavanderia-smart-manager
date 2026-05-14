package com.smartmanager.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class SeguimientoDTO {
    private String idTicket;
    private String nombreCliente;
    private String estadoActual;
    private Integer idEstado;
    private LocalDateTime fechaEntregaPactada;
    private BigDecimal totalFinal;
    private List<ServicioSimplificadoDTO> servicios;

    @Data
    @Builder
    public static class ServicioSimplificadoDTO {
        private String nombre;
        private BigDecimal cantidad;
        private BigDecimal subtotal;
    }
}
