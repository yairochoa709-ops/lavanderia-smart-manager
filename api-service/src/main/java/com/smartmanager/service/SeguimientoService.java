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
    public SeguimientoDTO consultarSeguimiento(String criterio) {
        Optional<Pedido> pedidoOpt;

        // Intentar parsear como UUID, si falla buscar por cédula
        try {
            UUID uuid = UUID.fromString(criterio);
            pedidoOpt = pedidoRepository.findByUuidSeguimiento(uuid);
        } catch (IllegalArgumentException e) {
            pedidoOpt = pedidoRepository.findFirstByCliente_CedulaRucOrderByFechaRecepcionDesc(criterio);
        }

        Pedido pedido = pedidoOpt.orElseThrow(() -> 
            new IllegalArgumentException("No pudimos encontrar un pedido con ese número de seguimiento o cédula.")
        );

        List<DetallePedido> detalles = detallePedidoRepository.findByPedido(pedido);

        // Calcular total con IVA
        BigDecimal subtotal = detalles.stream()
                .map(DetallePedido::getSubtotalServicio)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal iva = subtotal.multiply(new BigDecimal("0.15"));
        BigDecimal totalFinal = subtotal.add(iva);

        // Extraer primer nombre
        String nombreCompleto = pedido.getCliente().getNombre();
        String primerNombre = nombreCompleto != null ? nombreCompleto.split(" ")[0] : "Cliente";

        List<SeguimientoDTO.ServicioSimplificadoDTO> serviciosDTO = detalles.stream()
                .map(d -> SeguimientoDTO.ServicioSimplificadoDTO.builder()
                        .nombre(d.getServicioLavado().getNombreServicio())
                        .cantidad(d.getCantidad())
                        .subtotal(d.getSubtotalServicio())
                        .build())
                .collect(Collectors.toList());

        // Asegurar que el estado esté en MAYÚSCULAS para coincidir con la lógica del Frontend
        String estadoActualFrontend = pedido.getEstadoProceso() != null ? pedido.getEstadoProceso().toUpperCase() : "RECIBIDO";

        return SeguimientoDTO.builder()
                .idTicket(pedido.getUuidTicket().toString()) // Frontend mostrará el ticket visualmente
                .nombreCliente(primerNombre)
                .estadoActual(estadoActualFrontend)
                .fechaEntregaPactada(pedido.getFechaEntregaLimite())
                .totalFinal(totalFinal)
                .servicios(serviciosDTO)
                .build();
    }
}
