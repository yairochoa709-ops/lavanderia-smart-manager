package com.smartmanager.service;

import com.smartmanager.dto.FacturacionDTO;
import com.smartmanager.dto.FacturaResponseDTO;
import com.smartmanager.model.DetallePedido;
import com.smartmanager.model.EstadoProceso;
import com.smartmanager.model.Factura;
import com.smartmanager.model.Pedido;
import com.smartmanager.repository.DetallePedidoRepository;
import com.smartmanager.repository.EstadoProcesoRepository;
import com.smartmanager.repository.FacturaRepository;
import com.smartmanager.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacturacionService {

    private static final BigDecimal RECARGO_POR_DIA = new BigDecimal("0.50");
    private static final BigDecimal IVA_RATE = new BigDecimal("0.15");
    private static final int ID_ESTADO_LISTO = 3;
    private static final int ID_ESTADO_ENTREGADO = 4;

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final FacturaRepository facturaRepository;
    private final EstadoProcesoRepository estadoProcesoRepository;
    private final EmailService emailService;

    /**
     * Retorna todos los pedidos en estado "Listo para Retiro" (id_estado = 3)
     * para mostrarlos en la pantalla de Facturación.
     */
    @Transactional(readOnly = true)
    public List<FacturacionDTO> obtenerPedidosListos() {
        List<Pedido> pedidos = pedidoRepository
                .findByEstado_IdEstadoInOrderByFechaRecepcionAsc(List.of(ID_ESTADO_LISTO));

        return pedidos.stream().map(pedido -> {
            List<DetallePedido> detalles = detallePedidoRepository.findByPedido(pedido);

            List<FacturacionDTO.ServicioDetalleDTO> serviciosDTO = detalles.stream()
                    .map(d -> FacturacionDTO.ServicioDetalleDTO.builder()
                            .nombre(d.getServicioLavado().getNombreServicio())
                            .subtotal(d.getSubtotalServicio())
                            .build())
                    .collect(Collectors.toList());

            BigDecimal subtotal = detalles.stream()
                    .map(DetallePedido::getSubtotalServicio)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String uuidTicket = pedido.getUuidTicket() != null
                    ? pedido.getUuidTicket().toString().substring(0, 8).toUpperCase()
                    : "N/A";

            String nombreCompleto = pedido.getCliente().getNombre();
            String cedula = pedido.getCliente().getCedulaRuc();

            return FacturacionDTO.builder()
                    .idPedido(pedido.getIdPedido())
                    .uuidTicket(uuidTicket)
                    .nombreCliente(nombreCompleto)
                    .cedulaCliente(cedula)
                    .fechaEntregaLimite(pedido.getFechaEntregaLimite())
                    .servicios(serviciosDTO)
                    .subtotalServicios(subtotal)
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * Calcula el recargo por permanencia comparando solo fechas (sin hora)
     * para evitar problemas de zona horaria.
     * Regla: $0.50 por cada día de retraso después de la fecha_entrega_limite.
     */
    public BigDecimal calcularRecargo(LocalDateTime fechaLimite) {
        if (fechaLimite == null) return BigDecimal.ZERO;

        LocalDate limiteDate = fechaLimite.toLocalDate();
        LocalDate hoy = LocalDate.now();

        long diasRetraso = ChronoUnit.DAYS.between(limiteDate, hoy);

        if (diasRetraso <= 0) {
            return BigDecimal.ZERO;
        }

        return RECARGO_POR_DIA.multiply(BigDecimal.valueOf(diasRetraso));
    }

    /**
     * Procesa el cobro de un pedido de forma transaccional:
     * 1. Carga el pedido y sus detalles.
     * 2. Calcula subtotal, recargo, IVA y total.
     * 3. Persiste la Factura en la BD.
     * 4. Cambia el estado del pedido a "Entregado" (id_estado = 4).
     */
    @Transactional
    public FacturaResponseDTO procesarPago(Long idPedido) {
        // 1. Cargar pedido
        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado: " + idPedido));

        // 2. Calcular subtotal de servicios
        List<DetallePedido> detalles = detallePedidoRepository.findByPedido(pedido);
        BigDecimal subtotal = detalles.stream()
                .map(DetallePedido::getSubtotalServicio)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Calcular recargo por permanencia
        BigDecimal recargo = calcularRecargo(pedido.getFechaEntregaLimite());

        // 4. Calcular IVA sobre (subtotal + recargo)
        BigDecimal baseImponible = subtotal.add(recargo);
        BigDecimal iva = baseImponible.multiply(IVA_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalPagado = baseImponible.add(iva).setScale(2, RoundingMode.HALF_UP);

        // 5. Persistir la factura
        Factura factura = new Factura();
        factura.setIdPedido(idPedido);
        factura.setFechaEmision(LocalDateTime.now());
        factura.setSubtotalSinImpuestos(subtotal.setScale(2, RoundingMode.HALF_UP));
        factura.setValorRecargoPermanencia(recargo.setScale(2, RoundingMode.HALF_UP));
        factura.setValorPermanenciaExtra(recargo.setScale(2, RoundingMode.HALF_UP)); // mismo valor, campo redundante del esquema
        factura.setTotalIva(iva);
        factura.setTotalPagado(totalPagado);
        Factura facturaGuardada = facturaRepository.save(factura);

        // 6. Cambiar estado del pedido a Entregado (ID = 4)
        EstadoProceso estadoEntregado = estadoProcesoRepository.findById(ID_ESTADO_ENTREGADO)
                .orElseThrow(() -> new IllegalStateException("Estado 'Entregado' no encontrado en la BD"));
        pedido.setEstado(estadoEntregado);
        pedidoRepository.save(pedido);

        // 6.1 Enviar Factura por Correo Electrónico de forma asíncrona (no bloqueante)
        try {
            StringBuilder detalleBuilder = new StringBuilder("<table style='width:100%; border-collapse:collapse;'>");
            for (DetallePedido d : detalles) {
                detalleBuilder.append("<tr style='border-bottom: 1px solid #f1f5f9;'>")
                    .append("<td style='padding: 8px 0; color: #0f172a; font-weight: 500;'>")
                    .append(d.getServicioLavado().getNombreServicio())
                    .append(" (x").append(d.getCantidad()).append(")")
                    .append("</td>")
                    .append("<td style='padding: 8px 0; text-align: right; color: #475569;'>")
                    .append("$").append(d.getSubtotalServicio().setScale(2, RoundingMode.HALF_UP))
                    .append("</td>")
                    .append("</tr>");
            }
            detalleBuilder.append("</table>");

            String uuidTicketStr = pedido.getUuidTicket() != null ? pedido.getUuidTicket().toString() : "N/A";
            String fechaEmisionStr = facturaGuardada.getFechaEmision().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));

            emailService.enviarFacturaHtml(
                pedido.getCliente().getEmail(),
                pedido.getCliente().getNombre(),
                uuidTicketStr,
                fechaEmisionStr,
                subtotal.setScale(2, RoundingMode.HALF_UP).toString(),
                recargo.setScale(2, RoundingMode.HALF_UP).toString(),
                iva.setScale(2, RoundingMode.HALF_UP).toString(),
                totalPagado.setScale(2, RoundingMode.HALF_UP).toString(),
                detalleBuilder.toString()
            );
        } catch (Exception e) {
            System.err.println("Error al intentar disparar el correo de la factura: " + e.getMessage());
        }

        // 7. Devolver respuesta
        return FacturaResponseDTO.builder()
                .idFactura(facturaGuardada.getIdFactura())
                .idPedido(idPedido)
                .nombreCliente(pedido.getCliente().getNombre())
                .fechaEmision(facturaGuardada.getFechaEmision())
                .subtotalSinImpuestos(subtotal)
                .valorRecargoPermanencia(recargo)
                .totalIva(iva)
                .totalPagado(totalPagado)
                .mensaje("Pedido entregado y factura generada correctamente.")
                .build();
    }
}
