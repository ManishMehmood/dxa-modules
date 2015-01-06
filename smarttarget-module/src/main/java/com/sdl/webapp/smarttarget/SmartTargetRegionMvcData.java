package com.sdl.webapp.smarttarget;

import com.sdl.webapp.common.api.model.MvcData;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * SmartTargetRegionMvcData
 *
 * @author nic
 */
public class SmartTargetRegionMvcData implements MvcData {

    // TODO: Should the controller area data be configurable???
    private String controllerAreaName = "Core";
    private String controllerName = "Region";
    private String actionName = "Region";
    private String areaName = "Core";
    private String viewName;
    private Map<String,String> metadata = Collections.emptyMap();
    private Map<String,String> routeValues = Collections.emptyMap();

    public SmartTargetRegionMvcData(String regionName) {
        this.viewName = regionName;
    }

    @Override
    public String getControllerAreaName() {
        return controllerAreaName;
    }

    @Override
    public String getControllerName() {
        return controllerName;
    }

    @Override
    public String getActionName() {
        return actionName;
    }

    @Override
    public String getAreaName() {
        return areaName;
    }

    @Override
    public String getViewName() {
        return this.viewName;
    }

    @Override
    public String getRegionAreaName() {
        return null;
    }

    @Override
    public String getRegionName() {
        return null;
    }

    @Override
    public Map<String, String> getRouteValues() {
        return this.routeValues;
    }

    @Override
    public Map<String, String> getMetadata() {
        return metadata;
    }
}
