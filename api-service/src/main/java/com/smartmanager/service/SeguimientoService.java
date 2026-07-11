package com.smartmanager.service;

import com.smartmanager.dto.SeguimientoDTO;
import com.smartmanager.model.DetallePedido;
import com.smartmanager.model.Pedido;
import com.smartmanager.repository.DetallePedidoRepository;
import com.smartmanager.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeguimientoService {

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;

    @Transactional(readOnly = true)
    public List<SeguimientoDTO> consultarSeguimiento(String criterio) {
        List<Pedido> pedidos;

        try {
            UUID uuid = UUID.fromString(criterio);
            Optional<Pedido> pedidoOpt = pedidoRepository.findByUuidSeguimiento(uuid);
            if (pedidoOpt.isEmpty()) {
                pedidoOpt = pedidoRepository.findByUuidTicket(uuid);
            }
            if (pedidoOpt.isPresent()) {
                pedidos = List.of(pedidoOpt.get());
            } else {
                throw new IllegalArgumentException("No pudimos encontrar un pedido con ese código único.");
            }
        } catch (IllegalArgumentException e) {
            if (e.getMessage() != null && e.getMessage().contains("código único")) {
                throw e; 
            }
            pedidos = pedidoRepository.findByCliente_CedulaRucOrderByFechaRecepcionDesc(criterio);
            if (pedidos.isEmpty()) {
                throw new IllegalArgumentException("No pudimos encontrar pedidos para esta cédula.");
            }
        }

        return pedidos.stream().map(pedido -> {
            List<DetallePedido> detalles = detallePedidoRepository.findByPedido(pedido);

            BigDecimal subtotal = detalles.stream()
                    .map(DetallePedido::getSubtotalServicio)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal iva = subtotal.multiply(new BigDecimal("0.15"));
            BigDecimal totalFinal = subtotal.add(iva);

            String nombreCompleto = pedido.getCliente().getNombre();
            String primerNombre = nombreCompleto != null ? nombreCompleto.split(" ")[0] : "Cliente";

            List<SeguimientoDTO.ServicioSimplificadoDTO> serviciosDTO = detalles.stream()
                    .map(d -> SeguimientoDTO.ServicioSimplificadoDTO.builder()
                            .nombre(d.getServicioLavado().getNombreServicio())
                            .cantidad(d.getCantidad())
                            .subtotal(d.getSubtotalServicio())
                            .build())
                    .collect(Collectors.toList());

            String estadoActualFrontend = (pedido.getEstado() != null && pedido.getEstado().getNombreEstado() != null) 
                    ? pedido.getEstado().getNombreEstado().toUpperCase() 
                    : "RECIBIDO";

            return SeguimientoDTO.builder()
                    .idTicket(pedido.getUuidTicket().toString())
                    .nombreCliente(primerNombre)
                    .estadoActual(estadoActualFrontend)
                    .idEstado(pedido.getEstado() != null ? pedido.getEstado().getIdEstado() : 1)
                    .fechaRecepcion(pedido.getFechaRecepcion())
                    .fechaEntregaPactada(pedido.getFechaEntregaLimite())
                    .totalFinal(totalFinal)
                    .servicios(serviciosDTO)
                    .build();
        }).collect(Collectors.toList());
    }
}
