package com.smartmanager.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "detalle_pedidos", schema = "gestion_procesos")
public class DetallePedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle")
    private Long idDetalle;

    @ManyToOne
    @JoinColumn(name = "id_pedido")
    private Pedido pedido;

    @ManyToOne
    @JoinColumn(name = "id_servicio")
    private ServicioLavado servicioLavado;

    private BigDecimal cantidad;

    @Column(name = "subtotal_servicio")
    private BigDecimal subtotalServicio;
}
