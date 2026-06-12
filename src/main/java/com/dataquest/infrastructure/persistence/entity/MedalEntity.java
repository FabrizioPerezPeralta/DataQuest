package com.dataquest.infrastructure.persistence.entity;

import com.dataquest.domain.MedalConditionType;
import jakarta.persistence.*;

@Entity
@Table(name = "medals")
public class MedalEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(length = 50)
    private String icono;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_condicion", nullable = false, length = 30)
    private MedalConditionType tipoCondicion;

    @Column(name = "valor_condicion", nullable = false)
    private int valorCondicion;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getIcono() { return icono; }
    public void setIcono(String icono) { this.icono = icono; }
    public MedalConditionType getTipoCondicion() { return tipoCondicion; }
    public void setTipoCondicion(MedalConditionType tipoCondicion) { this.tipoCondicion = tipoCondicion; }
    public int getValorCondicion() { return valorCondicion; }
    public void setValorCondicion(int valorCondicion) { this.valorCondicion = valorCondicion; }
}
