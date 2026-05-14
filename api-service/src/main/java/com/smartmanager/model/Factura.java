package com.smartmanager.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "facturas", schema = "gestion_procesos")
public class Factura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_factura")
    private Integer idFactura;

    @Column(name = "id_pedido")
    private Long idPedido;

    @Column(name = "fecha_emision")
    private LocalDateTime fechaEmision = LocalDateTime.now();

    @Column(name = "subtotal_sin_impuestos", precision = 10, scale = 2)
    private BigDecimal subtotalSinImpuestos;

    @Column(name = "valor_recargo_permanencia", precision = 10, scale = 2)
    private BigDecimal valorRecargoPermanencia;

    @Column(name = "valor_permanencia_extra", precision = 10, scale = 2)
    private BigDecimal valorPermanenciaExtra;

    @Column(name = "total_iva", precision = 10, scale = 2)
    private BigDecimal totalIva;

    @Column(name = "total_pagado", precision = 10, scale = 2)
    private BigDecimal totalPagado;
}
