package com.smartmanager.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TableroPedidoDTO {
    private Long idPedido;
    private String uuidTicket;
    private String nombreCliente;
    private List<String> servicios;
    private Integer idEstado;
    private LocalDateTime fechaRecepcion;
}
