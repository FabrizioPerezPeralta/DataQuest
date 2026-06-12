package com.dataquest.infrastructure.persistence.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "puzzles")
public class PuzzleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String enunciado;

    @Column(name = "tablas_inicial", columnDefinition = "TEXT")
    private String tablasInicial;

    @Column(name = "df_inicial", columnDefinition = "TEXT")
    private String dfInicial;

    @Column(name = "solucion_esperada", columnDefinition = "TEXT")
    private String solucionEsperada;

    @Column(name = "nivel_dificultad", length = 10)
    private String nivelDificultad;

    public PuzzleEntity() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEnunciado() { return enunciado; }
    public void setEnunciado(String enunciado) { this.enunciado = enunciado; }
    public String getTablasInicial() { return tablasInicial; }
    public void setTablasInicial(String tablasInicial) { this.tablasInicial = tablasInicial; }
    public String getDfInicial() { return dfInicial; }
    public void setDfInicial(String dfInicial) { this.dfInicial = dfInicial; }
    public String getSolucionEsperada() { return solucionEsperada; }
    public void setSolucionEsperada(String solucionEsperada) { this.solucionEsperada = solucionEsperada; }
    public String getNivelDificultad() { return nivelDificultad; }
    public void setNivelDificultad(String nivelDificultad) { this.nivelDificultad = nivelDificultad; }
}
