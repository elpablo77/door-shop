package com.doorshop.catalog.web.dto;

public class FinderRequest {

    private String roomType;
    private String style;
    private Boolean needInsulation;
    private Boolean hasKidsPets;
    private String lightNeed;
    private Integer budget;

    public String getRoomType() { return roomType; }
    public String getStyle() { return style; }
    public Boolean getNeedInsulation() { return needInsulation; }
    public Boolean getHasKidsPets() { return hasKidsPets; }
    public String getLightNeed() { return lightNeed; }
    public Integer getBudget() { return budget; }

    public void setRoomType(String roomType) { this.roomType = roomType; }
    public void setStyle(String style) { this.style = style; }
    public void setNeedInsulation(Boolean needInsulation) { this.needInsulation = needInsulation; }
    public void setHasKidsPets(Boolean hasKidsPets) { this.hasKidsPets = hasKidsPets; }
    public void setLightNeed(String lightNeed) { this.lightNeed = lightNeed; }
    public void setBudget(Integer budget) { this.budget = budget; }
}
