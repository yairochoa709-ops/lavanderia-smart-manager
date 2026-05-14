package com.smartmanager.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "servicios_lavado", schema = "gestion_procesos")
public class ServicioLavado {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_servicio")
    private Long idServicio;

    @Column(name = "nombre_servicio", length = 50)
    private String nombreServicio;

    @Column(name = "precio_unidad")
    private BigDecimal precioUnidad;
}
