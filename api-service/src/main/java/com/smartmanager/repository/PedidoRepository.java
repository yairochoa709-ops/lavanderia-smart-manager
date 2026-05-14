package com.smartmanager.repository;

import com.smartmanager.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    Optional<Pedido> findByUuidSeguimiento(UUID uuidSeguimiento);
    Optional<Pedido> findByUuidTicket(UUID uuidTicket);
    Optional<Pedido> findFirstByCliente_CedulaRucOrderByFechaRecepcionDesc(String cedulaRuc);
    List<Pedido> findByEstado_IdEstadoInOrderByFechaRecepcionAsc(List<Integer> estados);
    // Incluye pedidos sin estado asignado (migración desde esquema anterior)
    List<Pedido> findByEstadoIsNullOrderByFechaRecepcionAsc();
}
