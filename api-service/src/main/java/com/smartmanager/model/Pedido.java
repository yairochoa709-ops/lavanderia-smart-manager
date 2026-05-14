package com.smartmanager.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "pedidos", schema = "gestion_procesos")
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    private Long idPedido;

    @Column(name = "uuid_ticket")
    private UUID uuidTicket;
    
    @Column(name = "uuid_seguimiento")
    private UUID uuidSeguimiento;

    @Column(name = "fecha_recepcion")
    private LocalDateTime fechaRecepcion = LocalDateTime.now();

    @Column(name = "fecha_entrega_limite")
    private LocalDateTime fechaEntregaLimite;
    
    @Column(name = "id_usuario")
    private Long idUsuario;
    
    @ManyToOne
    @JoinColumn(name = "id_cliente")
    private Cliente cliente;

    @Column(name = "estado_proceso", length = 20)
    private String estadoProceso = "Recibido";

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
