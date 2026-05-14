package com.smartmanager.service;

import com.smartmanager.dto.TableroPedidoDTO;
import com.smartmanager.model.DetallePedido;
import com.smartmanager.model.EstadoProceso;
import com.smartmanager.model.Pedido;
import com.smartmanager.repository.DetallePedidoRepository;
import com.smartmanager.repository.EstadoProcesoRepository;
import com.smartmanager.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OperacionService {

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final EstadoProcesoRepository estadoProcesoRepository;

    @Transactional(readOnly = true)
    public List<TableroPedidoDTO> obtenerTablero() {
        // Pedidos con estado asignado (1, 2, 3)
        List<Pedido> pedidosConEstado = pedidoRepository.findByEstado_IdEstadoInOrderByFechaRecepcionAsc(Arrays.asList(1, 2, 3));
        // Pedidos sin estado asignado (migracion desde esquema anterior) → tratarlos como Pendientes
        List<Pedido> pedidosSinEstado = pedidoRepository.findByEstadoIsNullOrderByFechaRecepcionAsc();

        List<Pedido> todos = new java.util.ArrayList<>(pedidosConEstado);
        todos.addAll(pedidosSinEstado);

        return todos.stream().map(pedido -> {
            List<DetallePedido> detalles = detallePedidoRepository.findByPedido(pedido);
            List<String> servicios = detalles.stream()
                    .map(d -> d.getServicioLavado().getNombreServicio())
                    .collect(Collectors.toList());

            String nombreCompleto = pedido.getCliente().getNombre();
            String primerNombre = nombreCompleto != null ? nombreCompleto.split(" ")[0] : "Cliente";

            Integer idEstado = (pedido.getEstado() != null) ? pedido.getEstado().getIdEstado() : 1;

            return TableroPedidoDTO.builder()
                    .idPedido(pedido.getIdPedido())
                    .uuidTicket(pedido.getUuidTicket().toString().substring(0, 8).toUpperCase())
                    .nombreCliente(primerNombre)
                    .servicios(servicios)
                    .idEstado(idEstado)
                    .fechaRecepcion(pedido.getFechaRecepcion())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public void actualizarEstadoPedido(Long idPedido, Integer nuevoIdEstado) {
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));
                
        EstadoProceso estado = estadoProcesoRepository.findById(nuevoIdEstado)
                .orElseThrow(() -> new IllegalArgumentException("Estado no encontrado"));

        pedido.setEstado(estado);
        pedidoRepository.save(pedido);
    }
}
