package com.smartmanager.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "clientes", schema = "gestion_procesos")
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Long idCliente;

    @Column(name = "cedula_ruc", length = 13)
    private String cedulaRuc;

    @Column(length = 100)
    private String nombre;

    @Column(length = 15)
    private String telefono;

    @Column(length = 100)
    private String email;
}
