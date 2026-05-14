package com.smartmanager.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class ClienteDTO {
    private String nombre;
    @JsonProperty("cedula_ruc")
    private String cedulaRuc;
    private String telefono;
    private String email;
}
