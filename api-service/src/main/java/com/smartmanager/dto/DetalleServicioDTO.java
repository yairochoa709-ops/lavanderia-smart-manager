package com.smartmanager.dto;

import lombok.Data;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class DetalleServicioDTO {
    @JsonProperty("id_servicio")
    private Long idServicio;
    private BigDecimal cantidad;
    @JsonProperty("subtotal_servicio")
    private BigDecimal subtotalServicio;
}
