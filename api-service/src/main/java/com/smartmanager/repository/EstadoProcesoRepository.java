package com.smartmanager.repository;

import com.smartmanager.model.EstadoProceso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstadoProcesoRepository extends JpaRepository<EstadoProceso, Integer> {
}
