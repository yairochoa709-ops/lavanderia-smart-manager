package com.smartmanager.service;

import com.smartmanager.dto.RecepcionPedidoDTO;
import com.smartmanager.dto.DetalleServicioDTO;
import com.smartmanager.model.Cliente;
import com.smartmanager.model.DetallePedido;
import com.smartmanager.model.Pedido;
import com.smartmanager.model.ServicioLavado;
import com.smartmanager.model.EstadoProceso;
import com.smartmanager.repository.ClienteRepository;
import com.smartmanager.repository.DetallePedidoRepository;
import com.smartmanager.repository.PedidoRepository;
import com.smartmanager.repository.ServicioLavadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecepcionService {

    private final ClienteRepository clienteRepository;
    private final PedidoRepository pedidoRepository;
    private final ServicioLavadoRepository servicioLavadoRepository;
    private final DetallePedidoRepository detallePedidoRepository;

    @Transactional
    public UUID registrarPedido(RecepcionPedidoDTO dto) {
        // 1. Gestión de Cliente (Busca o Crea/Actualiza)
        Cliente cliente = clienteRepository.findByCedulaRuc(dto.getCliente().getCedulaRuc())
                .orElse(new Cliente());
        
        cliente.setCedulaRuc(dto.getCliente().getCedulaRuc());
        cliente.setNombre(dto.getCliente().getNombre());
        cliente.setTelefono(dto.getCliente().getTelefono());
        cliente.setEmail(dto.getCliente().getEmail());
        
        cliente = clienteRepository.save(cliente);

        // 2. Cabecera del Pedido
        Pedido pedido = new Pedido();
        pedido.setCliente(cliente);
        pedido.setUuidTicket(UUID.randomUUID());
        pedido.setUuidSeguimiento(UUID.randomUUID());
        pedido.setFechaEntregaLimite(dto.getPedido().getFechaEntregaLimite());
        pedido.setObservaciones(dto.getPedido().getObservaciones());
        pedido.setIdUsuario(dto.getPedido().getIdUsuario());
        
        EstadoProceso estadoRecibido = new EstadoProceso();
        estadoRecibido.setIdEstado(1);
        pedido.setEstado(estadoRecibido);
        
        pedido = pedidoRepository.save(pedido);

        // 3. Detalles del Pedido
        for (DetalleServicioDTO detalleDTO : dto.getDetalles()) {
            ServicioLavado servicio = servicioLavadoRepository.findById(detalleDTO.getIdServicio())
                    .orElseThrow(() -> new IllegalArgumentException("El servicio con ID " + detalleDTO.getIdServicio() + " no existe en la base de datos."));

            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedido);
            detalle.setServicioLavado(servicio);
            detalle.setCantidad(detalleDTO.getCantidad());
            
            // Calculamos subtotal en backend por seguridad (cantidad * precio_unidad)
            BigDecimal subtotal = servicio.getPrecioUnidad().multiply(detalleDTO.getCantidad());
            detalle.setSubtotalServicio(subtotal);
            
            detallePedidoRepository.save(detalle);
        }

        return pedido.getUuidTicket();
    }
}
