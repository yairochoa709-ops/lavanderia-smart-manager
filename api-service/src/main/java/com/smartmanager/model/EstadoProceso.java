package com.smartmanager.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "estado_proceso", schema = "gestion_procesos")
public class EstadoProceso {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estado")
    private Integer idEstado;

    @Column(name = "nombre_estado", length = 50)
    private String nombreEstado;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
}
