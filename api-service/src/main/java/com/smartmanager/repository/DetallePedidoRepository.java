package com.smartmanager.repository;

import com.smartmanager.model.DetallePedido;
import com.smartmanager.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Long> {
    List<DetallePedido> findByPedido(Pedido pedido);
}
