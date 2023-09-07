package com.knetminer.datasource.entities;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;

import java.util.List;
import java.util.Objects;

@Node
public class ConceptEntity {
    @Id
    private List<String> identifier;
    private List<String> prefName;
    private List<String> altName;
    private List<String> description;
    private String abstractHeader;
    private String authors;
    @Property (name = "abstractText")
    private String abstractText;
    private double score;

    public ConceptEntity(List<String> identifier, List<String> prefName, List<String> altName, List<String> description, String abstractHeader, String authors, String abstractText, double score) {
        this.identifier = identifier;
        this.prefName = prefName;
        this.altName = altName;
        this.description = description;
        this.abstractHeader = abstractHeader;
        this.authors = authors;
        this.abstractText = abstractText;
        this.score = score;
    }

    public ConceptEntity() {
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ConceptEntity that = (ConceptEntity) o;
        return Objects.equals(prefName.get(0), that.prefName.get(0)) && Objects.equals(altName.get(0), that.altName.get(0))
                && Objects.equals(description.get(0), that.description.get(0))
                && Objects.equals(abstractHeader, that.abstractHeader) && Objects.equals(authors, that.authors)
                && Objects.equals(abstractText, that.abstractText);
    }

    @Override
    public int hashCode() {
        return Objects.hash(identifier, prefName, altName, description, abstractHeader, authors, abstractText);
    }

    public List<String> getIdentifier() {
        return identifier;
    }

    public List<String> getPrefName() {
        return prefName;
    }

    public List<String> getAltName() {
        return altName;
    }

    public List<String> getDescription() {
        return description;
    }

    public String getAbstractHeader() {
        return abstractHeader;
    }

    public String getAuthors() {
        return authors;
    }

    public String getAbstractText() {
        return abstractText;
    }

    public double getScore() {
        return score;
    }

    public void setIdentifier(List<String> identifier) {
        this.identifier = identifier;
    }

    public void setPrefName(List<String> prefName) {
        this.prefName = prefName;
    }

    public void setAltName(List<String> altName) {
        this.altName = altName;
    }

    public void setDescription(List<String> description) {
        this.description = description;
    }

    public void setAbstractHeader(String abstractHeader) {
        this.abstractHeader = abstractHeader;
    }

    public void setAuthors(String authors) {
        this.authors = authors;
    }

    public void setAbstractText(String abstractText) {
        this.abstractText = abstractText;
    }

    public void setScore(double score) {
        this.score = score;
    }
}
