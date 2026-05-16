package com.smartmanager.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void enviarTicketHtml(String emailCliente, String nombreCliente, String uuidTicket, String detalleServicios, String observaciones) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(emailCliente);
            helper.setSubject("Tu Ticket de Lavandería - SmartManager [" + uuidTicket.substring(0, 8) + "]");

            String htmlContent = "<html>" +
                "<body style='font-family: Arial, sans-serif; color: #334155; line-height: 1.6;'>" +
                "  <div style='max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;'>" +
                "    <div style='background-color: #2563eb; padding: 24px; text-align: center; color: white;'>" +
                "      <h1 style='margin: 0; font-size: 24px;'>SmartManager</h1>" +
                "      <p style='margin: 8px 0 0; opacity: 0.9;'>Gestión inteligente para tus prendas.</p>" +
                "    </div>" +
                "    <div style='padding: 32px;'>" +
                "      <h2 style='color: #1e293b; margin-top: 0;'>¡Hola, " + nombreCliente + "!</h2>" +
                "      <p>Hemos recibido tu pedido correctamente. Aquí tienes los detalles de tu ticket digital:</p>" +
                "      <div style='background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #2563eb;'>" +
                "        <p style='margin: 0; font-size: 14px; color: #64748b;'>ID de Seguimiento:</p>" +
                "        <p style='margin: 4px 0 0; font-family: monospace; font-weight: bold; color: #2563eb; font-size: 16px;'>" + uuidTicket + "</p>" +
                "      </div>" +
                "      <h3 style='font-size: 16px; color: #1e293b; border-bottom: 1px solid #e2e8f0; pb: 8px;'>Resumen de la Carga</h3>" +
                "      <p style='font-size: 14px;'>" + detalleServicios + "</p>" +
                "      <p style='font-size: 14px; font-style: italic; color: #64748b;'><strong>Observaciones:</strong> " + observaciones + "</p>" +
                "      <div style='text-align: center; margin-top: 40px;'>" +
                "        <a href='http://localhost:5173/seguimiento?id=" + uuidTicket + "' style='background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;'>Ir al Portal de Seguimiento</a>" +
                "      </div>" +
                "    </div>" +
                "    <div style='background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;'>" +
                "      © 2026 SmartManager Lavandería - Guayaquil, Ecuador" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            logger.info("Correo enviado exitosamente a: {}", emailCliente);

        } catch (MessagingException e) {
            logger.error("Error al construir el correo para {}: {}", emailCliente, e.getMessage());
        } catch (Exception e) {
            logger.error("Fallo inesperado al enviar correo a {}: {}", emailCliente, e.getMessage());
        }
    }
}
