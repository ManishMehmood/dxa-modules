package com.sdl.dxa.modules.test;

import com.sdl.dxa.modules.test.model.CustomPageModelImpl;
import com.sdl.dxa.modules.test.model.CustomRegionModelImpl;
import com.sdl.dxa.modules.test.model.ExternalContentLibraryStubSchemaflickr;
import com.sdl.dxa.modules.test.model.VimeoVideo;
import com.sdl.webapp.common.api.model.entity.Article;
import com.sdl.webapp.common.api.model.entity.EclItemImpl;
import com.sdl.webapp.common.api.model.region.RegionModelImpl;
import com.sdl.webapp.common.impl.AbstractInitializer;
import org.springframework.stereotype.Component;

@Component
public class TestModuleInitializer extends AbstractInitializer {

    @Override
    protected boolean registerModule() {
        this.registerViewModel("VimeoVideo", VimeoVideo.class);
        this.registerViewModel("ShowClaims", Article.class);
        this.registerViewModel("ShowClaims", Article.class);
        this.registerViewModel("GeneralPageCustomRegion", CustomPageModelImpl.class);
        this.registerViewModel("CustomPageMetadata", CustomPageModelImpl.class);
        this.registerViewModel("CustomRegion", CustomRegionModelImpl.class);
        this.registerViewModel("TestRegionView", RegionModelImpl.class);
        this.registerViewModel("ExternalContentLibraryStubSchemaflickr", ExternalContentLibraryStubSchemaflickr.class);
        this.registerViewModel("TestEclEntity", EclItemImpl.class);
        return true;
    }

    @Override
    protected String getAreaName() {
        return "Test";
    }
}