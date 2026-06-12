package com.dataquest.domain.entity;

import com.dataquest.domain.MedalConditionType;

public class Medal {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private MedalConditionType conditionType;
    private int conditionValue;

    public Medal(Long id, String name, String description, String icon,
                 MedalConditionType conditionType, int conditionValue) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.conditionType = conditionType;
        this.conditionValue = conditionValue;
    }

    public boolean isEarned(int userValue) {
        return userValue >= conditionValue;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getIcon() { return icon; }
    public MedalConditionType getConditionType() { return conditionType; }
    public int getConditionValue() { return conditionValue; }
}
